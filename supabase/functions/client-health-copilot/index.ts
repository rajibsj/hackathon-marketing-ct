import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireRole } from "../_shared/auth-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  client_id?: string;
  client_ids?: string[];
}

interface RootCause {
  cause: string;
  evidence: string;
  confidence?: number;
  severity?: string;
}

interface RecoveryStep {
  priority: number;
  action: string;
  rationale?: string;
  owner_hint?: string;
  due_in_days?: number;
}

interface RecommendedAction {
  type: "create_task" | "draft_email" | "slack_notify";
  title?: string;
  description?: string;
  priority?: string;
  subject?: string;
  body?: string;
  message?: string;
}

interface HealthAnalysis {
  health_score: number;
  churn_probability: number;
  churn_window_days?: number;
  risk_band: "healthy" | "stable" | "watch" | "critical" | "immediate";
  headline: string;
  explanation: string;
  root_causes: RootCause[];
  recovery_plan: RecoveryStep[];
  recommended_actions: RecommendedAction[];
}

const NEGATIVE_KEYWORDS = [
  "unhappy", "disappointed", "frustrated", "concerned", "issue", "problem",
  "delay", "late", "missed", "complaint", "cancel", "churn", "refund",
  "escalate", "unacceptable", "poor", "worst", "angry",
];

const DONE_STATUSES = ["completed", "done", "closed"];

const SYSTEM_PROMPT = `You are an expert account manager and client retention specialist for a marketing agency.
Analyze the provided client profile and aggregated signals JSON. Produce a churn risk assessment.

Return JSON with this exact structure:
{
  "health_score": <integer 0-100>,
  "churn_probability": <decimal 0.0-1.0>,
  "churn_window_days": <integer, estimated days until likely churn if no action>,
  "risk_band": "<healthy|stable|watch|critical|immediate>",
  "headline": "<one-line executive summary>",
  "explanation": "<2-4 sentences explaining why the score changed and key risks>",
  "root_causes": [{"cause": "...", "evidence": "...", "confidence": 0.0-1.0, "severity": "high|medium|low"}],
  "recovery_plan": [{"priority": 1, "action": "...", "rationale": "...", "owner_hint": "PM|Account Manager|Team Lead", "due_in_days": 1}],
  "recommended_actions": [
    {"type": "create_task", "title": "...", "description": "...", "priority": "high|medium|low"},
    {"type": "draft_email", "subject": "...", "body": "..."}
  ]
}

Risk band guidelines:
- healthy: score 85-100, churn_probability < 0.15
- stable: score 70-84, churn_probability 0.15-0.35
- watch: score 50-69, churn_probability 0.35-0.60
- critical: score 30-49, churn_probability 0.60-0.80
- immediate: score 0-29, churn_probability > 0.80

Weight combined signals — a single yellow flag may be fine, but multiple signals compound risk.
Be specific with evidence from the signals. Include 2-4 recovery plan items and 2-3 recommended_actions.`;

function isTaskDone(status: string | null): boolean {
  if (!status) return false;
  return DONE_STATUSES.includes(status.toLowerCase());
}

function computeRiskBand(score: number, churnProb: number): HealthAnalysis["risk_band"] {
  if (score < 30 || churnProb > 0.8) return "immediate";
  if (score < 50 || churnProb > 0.6) return "critical";
  if (score < 70 || churnProb > 0.35) return "watch";
  if (score < 85 || churnProb > 0.15) return "stable";
  return "healthy";
}

function flagNegativeComments(comments: string[]): string[] {
  const flags: string[] = [];
  for (const text of comments) {
    const lower = text.toLowerCase();
    for (const kw of NEGATIVE_KEYWORDS) {
      if (lower.includes(kw)) {
        flags.push(`Keyword "${kw}" in comment: "${text.slice(0, 120)}..."`);
        break;
      }
    }
  }
  return flags;
}

async function collectSignals(supabase: ReturnType<typeof createClient>, clientId: string) {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, company, status, satisfaction_score, total_revenue, monthly_billing, industry, email")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("client_id", clientId);

  const projectIds = (projects || []).map((p) => p.id);

  let tasks: Array<Record<string, unknown>> = [];
  if (projectIds.length > 0) {
    const { data: projectTasks } = await supabase
      .from("project_tasks")
      .select("id, title, status, priority, due_date, updated_at, created_at, project_id, brand_id")
      .in("project_id", projectIds);

    tasks = projectTasks || [];
  }

  const { data: clientTasks } = await supabase
    .from("project_tasks")
    .select("id, title, status, priority, due_date, updated_at, created_at, project_id, brand_id")
    .eq("client_id", clientId);

  const taskMap = new Map<string, Record<string, unknown>>();
  for (const t of [...tasks, ...(clientTasks || [])]) {
    taskMap.set(t.id as string, t);
  }
  const allTasks = Array.from(taskMap.values());

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const openTasks = allTasks.filter((t) => !isTaskDone(t.status as string));
  const overdueTasks = openTasks.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date as string) < now;
  });

  const staleTasks = openTasks.filter((t) => {
    const updated = new Date((t.updated_at || t.created_at) as string);
    return updated < fourteenDaysAgo;
  });

  const taskIds = allTasks.map((t) => t.id as string);
  let recentComments: Array<{ text: string; created_at: string | null; author: string | null }> = [];

  if (taskIds.length > 0) {
    const { data: comments } = await supabase
      .from("project_task_comments")
      .select("comment, comment_body, created_at, created_by_name, is_deleted")
      .in("task_id", taskIds)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(15);

    recentComments = (comments || []).map((c) => ({
      text: (c.comment_body || c.comment || "").trim(),
      created_at: c.created_at,
      author: c.created_by_name,
    })).filter((c) => c.text.length > 0);
  }

  const negativeFlags = flagNegativeComments(recentComments.map((c) => c.text));

  let daysSinceLastMeeting: number | null = null;
  let lastMeetingDate: string | null = null;

  if (projectIds.length > 0) {
    const { data: meetings } = await supabase
      .from("project_meetings")
      .select("start_time")
      .in("project_id", projectIds)
      .order("start_time", { ascending: false })
      .limit(1);

    if (meetings && meetings.length > 0 && meetings[0].start_time) {
      lastMeetingDate = meetings[0].start_time;
      const meetingDate = new Date(meetings[0].start_time);
      daysSinceLastMeeting = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const brandIds = [...new Set(
    allTasks.map((t) => t.brand_id as string).filter(Boolean),
  )];

  let trafficSignal: Record<string, unknown> = { available: false };

  if (brandIds.length > 0) {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: analytics } = await supabase
      .from("brand_analytics_data")
      .select("brand_id, metrics, date_range_start, date_range_end")
      .in("brand_id", brandIds)
      .gte("date_range_end", twoWeeksAgo.toISOString().split("T")[0])
      .order("date_range_end", { ascending: false });

    if (analytics && analytics.length > 0) {
      const extractSessions = (metrics: Record<string, unknown> | null): number => {
        if (!metrics) return 0;
        const m = metrics as Record<string, number>;
        return m.sessions || m.totalSessions || m.users || m.pageviews || 0;
      };

      const currentPeriod = analytics.filter((a) =>
        new Date(a.date_range_end) >= oneWeekAgo,
      );
      const previousPeriod = analytics.filter((a) =>
        new Date(a.date_range_end) < oneWeekAgo &&
        new Date(a.date_range_end) >= twoWeeksAgo,
      );

      const currentSessions = currentPeriod.reduce(
        (sum, a) => sum + extractSessions(a.metrics as Record<string, unknown>),
        0,
      );
      const previousSessions = previousPeriod.reduce(
        (sum, a) => sum + extractSessions(a.metrics as Record<string, unknown>),
        0,
      );

      if (previousSessions > 0) {
        const wowChange = ((currentSessions - previousSessions) / previousSessions) * 100;
        trafficSignal = {
          available: true,
          wow_change_pct: Math.round(wowChange * 10) / 10,
          current_sessions: currentSessions,
          previous_sessions: previousSessions,
        };
      }
    }
  }

  let heuristicScore = client.satisfaction_score ?? 85;
  heuristicScore -= Math.min(overdueTasks.length * 5, 25);
  heuristicScore -= Math.min(staleTasks.length * 10, 20);
  if (daysSinceLastMeeting !== null && daysSinceLastMeeting > 21) {
    heuristicScore -= 15;
  }
  if (negativeFlags.length > 0) {
    heuristicScore -= Math.min(negativeFlags.length * 5, 15);
  }
  const traffic = trafficSignal as { available?: boolean; wow_change_pct?: number };
  if (traffic.available && traffic.wow_change_pct !== undefined && traffic.wow_change_pct < -25) {
    heuristicScore -= 20;
  }
  heuristicScore = Math.max(0, Math.min(100, heuristicScore));

  const primaryProjectId = projectIds[0] || null;

  return {
    client,
    signals: {
      client_id: clientId,
      client_name: client.name,
      company: client.company,
      status: client.status,
      heuristic_score: heuristicScore,
      satisfaction_score: client.satisfaction_score,
      total_revenue: client.total_revenue,
      monthly_billing: client.monthly_billing,
      project_count: projectIds.length,
      primary_project_id: primaryProjectId,
      open_task_count: openTasks.length,
      overdue_tasks: {
        count: overdueTasks.length,
        tasks: overdueTasks.slice(0, 5).map((t) => ({
          title: t.title,
          due_date: t.due_date,
          priority: t.priority,
        })),
      },
      stale_tasks: {
        count: staleTasks.length,
        tasks: staleTasks.slice(0, 3).map((t) => ({
          title: t.title,
          last_updated: t.updated_at || t.created_at,
        })),
      },
      recent_comments: recentComments.slice(0, 10),
      negative_comment_flags: negativeFlags,
      meeting: {
        days_since_last: daysSinceLastMeeting,
        last_meeting_date: lastMeetingDate,
      },
      traffic: trafficSignal,
    },
    heuristicScore,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRiskBand(raw: unknown, score: number, churnProb: number): HealthAnalysis["risk_band"] {
  const band = String(raw || "").toLowerCase().trim();
  const valid: HealthAnalysis["risk_band"][] = ["healthy", "stable", "watch", "critical", "immediate"];
  if (valid.includes(band as HealthAnalysis["risk_band"])) {
    return band as HealthAnalysis["risk_band"];
  }
  return computeRiskBand(score, churnProb);
}

function normalizeChurnProbability(raw: unknown, score: number): number {
  let value = Number(raw);
  if (!Number.isFinite(value)) {
    return Math.max(0, Math.min(1, (100 - score) / 100));
  }
  if (value > 1) value = value / 100;
  return Math.max(0, Math.min(1, value));
}

function buildFallbackAnalysis(
  client: Record<string, unknown>,
  signals: Record<string, unknown>,
  heuristicScore: number,
): HealthAnalysis {
  const overdue = (signals.overdue_tasks as { count?: number })?.count ?? 0;
  const stale = (signals.stale_tasks as { count?: number })?.count ?? 0;
  const negativeFlags = (signals.negative_comment_flags as string[]) ?? [];
  const traffic = signals.traffic as { wow_change_pct?: number; available?: boolean };
  const meetingDays = (signals.meeting as { days_since_last?: number | null })?.days_since_last;

  const score = heuristicScore;
  const churnProb = normalizeChurnProbability(null, score);
  const riskBand = computeRiskBand(score, churnProb);

  const rootCauses: RootCause[] = [];
  if (overdue > 0) {
    rootCauses.push({
      cause: "Overdue deliverables",
      evidence: `${overdue} open task(s) past due date`,
      confidence: 0.9,
      severity: overdue >= 3 ? "high" : "medium",
    });
  }
  if (stale > 0) {
    rootCauses.push({
      cause: "Stalled work",
      evidence: `${stale} task(s) unchanged for 14+ days`,
      confidence: 0.85,
      severity: "medium",
    });
  }
  if (negativeFlags.length > 0) {
    rootCauses.push({
      cause: "Client dissatisfaction signals",
      evidence: negativeFlags[0],
      confidence: 0.8,
      severity: "high",
    });
  }
  if (traffic?.available && (traffic.wow_change_pct ?? 0) < -25) {
    rootCauses.push({
      cause: "Traffic decline",
      evidence: `Week-over-week sessions down ${Math.abs(traffic.wow_change_pct ?? 0)}%`,
      confidence: 0.85,
      severity: "high",
    });
  }
  if (meetingDays != null && meetingDays > 21) {
    rootCauses.push({
      cause: "Engagement gap",
      evidence: `No client meeting in ${meetingDays} days`,
      confidence: 0.75,
      severity: "medium",
    });
  }

  const recoveryPlan: RecoveryStep[] = [
    {
      priority: 1,
      action: overdue > 0 ? "Clear overdue deliverables this week" : "Schedule client check-in",
      rationale: "Address the highest-risk delivery or engagement gap first",
      owner_hint: "Account Manager",
      due_in_days: 2,
    },
    {
      priority: 2,
      action: "Review open tasks and re-prioritize with the delivery team",
      rationale: "Align internal capacity with client expectations",
      owner_hint: "PM",
      due_in_days: 5,
    },
  ];

  const recommendedActions: RecommendedAction[] = [
    {
      type: "create_task",
      title: overdue > 0 ? "Recovery: clear overdue client deliverables" : "Schedule client health check-in call",
      description: `Automated recovery action for ${client.name}`,
      priority: riskBand === "critical" || riskBand === "immediate" ? "high" : "medium",
    },
  ];

  return {
    health_score: score,
    churn_probability: churnProb,
    churn_window_days: riskBand === "immediate" ? 30 : riskBand === "critical" ? 45 : 90,
    risk_band: riskBand,
    headline: `${client.name}: ${riskBand} account health (${score}/100)`,
    explanation: `Heuristic assessment: ${overdue} overdue, ${stale} stale, ${negativeFlags.length} negative comment flag(s)${
      traffic?.available ? `, traffic ${traffic.wow_change_pct}% WoW` : ""
    }.`,
    root_causes: rootCauses,
    recovery_plan: recoveryPlan,
    recommended_actions: recommendedActions,
  };
}

function normalizeAnalysis(
  raw: Record<string, unknown>,
  heuristicScore: number,
): HealthAnalysis {
  const healthScore = Math.max(0, Math.min(100, Math.round(Number(raw.health_score ?? heuristicScore))));
  const churnProb = normalizeChurnProbability(raw.churn_probability, healthScore);
  const riskBand = normalizeRiskBand(raw.risk_band, healthScore, churnProb);

  return {
    health_score: healthScore,
    churn_probability: churnProb,
    churn_window_days: raw.churn_window_days != null ? Number(raw.churn_window_days) : undefined,
    risk_band: riskBand,
    headline: String(raw.headline || raw.summary || "Client health assessment"),
    explanation: String(raw.explanation || ""),
    root_causes: Array.isArray(raw.root_causes) ? raw.root_causes as RootCause[] : [],
    recovery_plan: Array.isArray(raw.recovery_plan) ? raw.recovery_plan as RecoveryStep[] : [],
    recommended_actions: Array.isArray(raw.recommended_actions)
      ? raw.recommended_actions as RecommendedAction[]
      : [],
  };
}

async function callGemini(
  geminiKey: string,
  userPrompt: string,
  heuristicScore: number,
  attempt = 1,
): Promise<HealthAnalysis> {
  const model = "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (response.status === 429 && attempt < 4) {
    const waitMs = attempt * 2000;
    console.log(`Gemini rate limited, retry ${attempt + 1} after ${waitMs}ms`);
    await sleep(waitMs);
    return callGemini(geminiKey, userPrompt, heuristicScore, attempt + 1);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const aiData = await response.json();
  const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawContent) {
    const blockReason = aiData.candidates?.[0]?.finishReason;
    throw new Error(`No content from Gemini${blockReason ? ` (${blockReason})` : ""}`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Gemini response as JSON");
    parsed = JSON.parse(jsonMatch[0]);
  }

  return normalizeAnalysis(parsed, heuristicScore);
}

async function runLLMAnalysis(
  client: Record<string, unknown>,
  signals: Record<string, unknown>,
  heuristicScore: number,
): Promise<HealthAnalysis> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    console.warn("GEMINI_API_KEY missing — using heuristic fallback");
    return buildFallbackAnalysis(client, signals, heuristicScore);
  }

  const userPrompt = `Client profile:
${JSON.stringify({
  name: client.name,
  company: client.company,
  industry: client.industry,
  status: client.status,
  satisfaction_score: client.satisfaction_score,
  total_revenue: client.total_revenue,
  monthly_billing: client.monthly_billing,
}, null, 2)}

Heuristic base score (pre-LLM): ${heuristicScore}/100

Aggregated signals:
${JSON.stringify(signals, null, 2)}

Analyze this client and return the structured JSON assessment.
IMPORTANT: churn_probability must be a decimal between 0.0 and 1.0 (e.g. 0.84 not 84).
risk_band must be exactly one of: healthy, stable, watch, critical, immediate.`;

  try {
    const analysis = await callGemini(geminiKey, userPrompt, heuristicScore);
    if (!analysis.health_score) analysis.health_score = heuristicScore;
    analysis.health_score = Math.max(0, Math.min(100, Math.round(analysis.health_score)));
    analysis.churn_probability = normalizeChurnProbability(analysis.churn_probability, analysis.health_score);
    analysis.risk_band = normalizeRiskBand(analysis.risk_band, analysis.health_score, analysis.churn_probability);
    return analysis;
  } catch (err) {
    console.error("Gemini analysis failed, using heuristic fallback:", err);
    return buildFallbackAnalysis(client, signals, heuristicScore);
  }
}

async function analyzeClient(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
) {
  const { client, signals, heuristicScore } = await collectSignals(supabase, clientId);
  const analysis = await runLLMAnalysis(client, signals, heuristicScore);

  const analyzedAt = new Date().toISOString();

  const { data: snapshot, error: insertError } = await supabase
    .from("client_health_snapshots")
    .insert({
      client_id: clientId,
      health_score: analysis.health_score,
      churn_probability: analysis.churn_probability,
      churn_window_days: analysis.churn_window_days,
      risk_band: analysis.risk_band,
      summary: analysis.headline,
      explanation: analysis.explanation,
      root_causes: analysis.root_causes,
      recovery_plan: analysis.recovery_plan,
      signals,
      recommended_actions: analysis.recommended_actions,
      heuristic_score: heuristicScore,
      analyzed_at: analyzedAt,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to save snapshot: ${insertError.message}`);
  }

  await supabase
    .from("clients")
    .update({
      health_score: analysis.health_score,
      churn_risk_band: analysis.risk_band,
      last_health_analysis_at: analyzedAt,
    })
    .eq("id", clientId);

  return { client_id: clientId, client_name: client.name, snapshot, analysis };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const authResult = await requireRole(req, supabase, ["super_admin", "pm", "manager"]);
    if (authResult instanceof Response) return authResult;

    const body: AnalyzeRequest = await req.json().catch(() => ({}));
    let clientIds: string[] = [];

    if (body.client_id) {
      clientIds = [body.client_id];
    } else if (body.client_ids && body.client_ids.length > 0) {
      clientIds = body.client_ids;
    } else {
      const { data: activeClients, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("status", "active");

      if (clientsError) {
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }
      clientIds = (activeClients || []).map((c) => c.id);
    }

    if (clientIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No clients to analyze", results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = [];
    const errors = [];

    const { data: clientNames } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);
    const nameById = new Map((clientNames || []).map((c) => [c.id, c.name]));

    for (let i = 0; i < clientIds.length; i++) {
      const clientId = clientIds[i];
      if (i > 0) await sleep(2000);

      try {
        const result = await analyzeClient(supabase, clientId);
        results.push(result);
      } catch (err) {
        console.error(`Error analyzing client ${clientId}:`, err);
        errors.push({
          client_id: clientId,
          client_name: nameById.get(clientId) || clientId,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        analyzed_count: results.length,
        error_count: errors.length,
        results,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("client-health-copilot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
