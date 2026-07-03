import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireRole } from "../_shared/auth-guard.ts";
import { scanMeetingTranscriptForConcerns } from "../_shared/meeting-concern-scan.ts";

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
  type: "create_task" | "draft_email";
  title?: string;
  description?: string;
  priority?: string;
  subject?: string;
  body?: string;
}

interface MeetingSignal {
  channel: string;
  subject: string;
  content_excerpt: string;
  date: string;
  source: "project_meeting" | "project_retention";
  transcript_link?: string;
  project_id?: string;
  project_name?: string;
  concern_keywords?: string[];
  concern_flags?: string[];
  has_client_concerns?: boolean;
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

Signals focus on delivery from ActiveCollab and Control Tower: project tasks, task comments, and due dates/deadlines.
Meetings are only included when mapped to a client project.
Use project_breakdown in signals to address concerns project-by-project, including meeting_concern_keywords from saved transcript scans.
Weight meeting transcript concern keywords (disappointed, frustrating, overdue, missed deadline, sue, etc.) heavily when scoring churn risk.
Do not infer risk from HubSpot, Slack, Teams, website traffic, search console, or invoice data.

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
Be specific with evidence from the signals. Address risks per project when multiple projects exist.
Include 2-4 recovery plan items and 2-3 recommended_actions.`;

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

function extractTranscriptText(
  meeting: Record<string, unknown>,
): string {
  const description = String(meeting.meeting_description || "").trim();
  if (description) return description;

  const meetingData = meeting.meeting_data;
  if (!meetingData || typeof meetingData !== "object") return "";

  const data = meetingData as Record<string, unknown>;
  return String(
    data.transcript_summary ||
      data.summary_overview ||
      data.transcript ||
      "",
  ).trim();
}

function parseProjectRetentionMeetings(
  value: unknown,
): Array<{
  title: string;
  meeting_date: string;
  transcript_link: string;
  generated_text: string;
  concern_keywords: string[];
  concern_flags: string[];
  has_client_concerns: boolean;
}> {
  if (!Array.isArray(value)) return [];

  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const generated = String(item.generated_text || item.transcript_text || "").trim();
      const link = String(item.transcript_link || "").trim();
      const date = String(item.meeting_date || "").trim();
      if (!generated && !link) return null;

      const storedFlags = Array.isArray(item.concern_flags)
        ? item.concern_flags.map((flag) => String(flag))
        : [];
      const storedKeywords = Array.isArray(item.concern_keywords)
        ? item.concern_keywords.map((kw) => String(kw))
        : [];
      const scanSource = generated || String(item.transcript_text || "").trim();
      const liveScan = scanSource ? scanMeetingTranscriptForConcerns(scanSource) : null;
      const concern_flags = storedFlags.length > 0 ? storedFlags : (liveScan?.flags || []);
      const concern_keywords = storedKeywords.length > 0
        ? storedKeywords
        : (liveScan?.keywords || []);

      return {
        title: String(item.title || "Client meeting").trim(),
        meeting_date: date,
        transcript_link: link,
        generated_text: generated || `Transcript reference: ${link}`,
        concern_keywords,
        concern_flags,
        has_client_concerns: Boolean(item.has_client_concerns) || concern_flags.length > 0,
      };
    })
    .filter((row): row is {
      title: string;
      meeting_date: string;
      transcript_link: string;
      generated_text: string;
      concern_keywords: string[];
      concern_flags: string[];
      has_client_concerns: boolean;
    } => row !== null);
}

function getTaskSource(task: Record<string, unknown>): "activecollab" | "control_tower" {
  return task.activecollab_task_id ? "activecollab" : "control_tower";
}

function collectProjectMeetingConcerns(
  meetings: MeetingSignal[],
  retentionTranscripts: unknown,
): {
  keywords: string[];
  flags: string[];
  meetingsWithConcerns: number;
} {
  const keywords = new Set<string>();
  const flags: string[] = [];

  for (const meeting of meetings) {
    for (const keyword of meeting.concern_keywords || []) {
      keywords.add(keyword);
    }
    for (const flag of meeting.concern_flags || []) {
      flags.push(flag);
    }
  }

  const retentionRows = parseProjectRetentionMeetings(retentionTranscripts);
  let meetingsWithConcerns = 0;

  for (const row of retentionRows) {
    if (row.has_client_concerns || row.concern_keywords.length > 0) {
      meetingsWithConcerns += 1;
    }
    for (const keyword of row.concern_keywords) {
      keywords.add(keyword);
    }
    for (const flag of row.concern_flags) {
      flags.push(flag);
    }
  }

  return {
    keywords: Array.from(keywords),
    flags,
    meetingsWithConcerns: Math.max(meetingsWithConcerns, meetings.filter(
      (m) => m.has_client_concerns || (m.concern_keywords?.length || 0) > 0,
    ).length),
  };
}

function buildProjectBreakdown(
  projects: Array<Record<string, unknown>>,
  allTasks: Array<Record<string, unknown>>,
  recentComments: Array<{
    text: string;
    task_id: string | null;
    task_title: string | null;
    task_due_date: string | null;
    project_name: string | null;
  }>,
  allProjectMeetings: MeetingSignal[],
  taskById: Map<string, Record<string, unknown>>,
  now: Date,
  fourteenDaysAgo: Date,
  sevenDaysAhead: Date,
  formatTask: (task: Record<string, unknown>) => Record<string, unknown>,
) {
  const buildForTasks = (
    projectId: string,
    projectName: string,
    meta: { activecollab_linked?: boolean; control_tower_linked?: boolean },
    projectTasks: Array<Record<string, unknown>>,
    retentionTranscripts?: unknown,
  ) => {
    const open = projectTasks.filter((t) => !isTaskDone(t.status as string));
    const overdue = open.filter((t) => {
      if (!t.due_date) return false;
      return new Date(t.due_date as string) < now;
    });
    const approaching = open.filter((t) => {
      if (!t.due_date) return false;
      const due = new Date(t.due_date as string);
      return due >= now && due <= sevenDaysAhead;
    });
    const stale = open.filter((t) => {
      const updated = new Date((t.updated_at || t.created_at) as string);
      return updated < fourteenDaysAgo;
    });
    const comments = recentComments.filter((c) => {
      if (!c.task_id) return false;
      const task = taskById.get(c.task_id);
      return task?.project_id === projectId;
    });
    const meetings = allProjectMeetings.filter((m) => m.project_id === projectId);
    const concerns: string[] = [];
    if (overdue.length > 0) {
      concerns.push(`${overdue.length} overdue task(s) — e.g. "${String(overdue[0].title || "Task")}"`);
    }
    if (approaching.length > 0) {
      concerns.push(`${approaching.length} deadline(s) within 7 days`);
    }
    if (stale.length > 0) {
      concerns.push(`${stale.length} stale task(s) with no updates in 14+ days`);
    }
    const negativeComment = comments.find((c) =>
      flagNegativeComments([c.text]).length > 0,
    );
    if (negativeComment) {
      concerns.push(`Negative comment on "${negativeComment.task_title || "task"}"`);
    }

    const meetingConcerns = collectProjectMeetingConcerns(meetings, retentionTranscripts);
    if (meetingConcerns.keywords.length > 0) {
      concerns.push(
        `Meeting transcript concern keywords: ${meetingConcerns.keywords.join(", ")}`,
      );
    }
    for (const flag of meetingConcerns.flags.slice(0, 3)) {
      const normalized = flag.startsWith("Keyword") ? flag : `Meeting concern: ${flag}`;
      if (!concerns.includes(normalized)) {
        concerns.push(normalized);
      }
    }
    if (meetingConcerns.meetingsWithConcerns > 1) {
      concerns.push(`${meetingConcerns.meetingsWithConcerns} meetings flagged with client concerns`);
    }

    if (meetings.length === 0 &&
      parseProjectRetentionMeetings(retentionTranscripts).length === 0 &&
      projectTasks.length > 0
    ) {
      concerns.push("No recent project-mapped meeting transcripts");
    }

    return {
      project_id: projectId,
      project_name: projectName,
      activecollab_linked: meta.activecollab_linked ?? false,
      control_tower_linked: meta.control_tower_linked ?? false,
      open_tasks: open.length,
      overdue_count: overdue.length,
      approaching_deadline_count: approaching.length,
      stale_count: stale.length,
      overdue_tasks: overdue.slice(0, 5).map(formatTask),
      approaching_deadlines: approaching.slice(0, 5).map(formatTask),
      recent_comments: comments.slice(0, 5).map((c) => ({
        text: c.text.slice(0, 200),
        task_title: c.task_title,
        task_due_date: c.task_due_date,
      })),
      meetings: meetings.slice(0, 3).map((m) => ({
        subject: m.subject,
        date: m.date,
        concern_keywords: m.concern_keywords || [],
        has_client_concerns: Boolean(m.has_client_concerns),
      })),
      meeting_concern_keywords: meetingConcerns.keywords,
      meeting_concern_count: meetingConcerns.keywords.length,
      meeting_concern_flags: meetingConcerns.flags.slice(0, 5),
      concerns,
    };
  };

  const breakdown = (projects || []).map((project) => {
    const projectId = String(project.id);
    const projectTasks = allTasks.filter((t) => t.project_id === projectId);
    return buildForTasks(projectId, String(project.name), {
      activecollab_linked: Boolean(project.activecollab_project_id),
      control_tower_linked: Boolean(project.control_tower_project_id),
    }, projectTasks, project.retention_meeting_transcripts);
  });

  const projectIdSet = new Set((projects || []).map((p) => String(p.id)));
  const unassignedTasks = allTasks.filter(
    (t) => !t.project_id || !projectIdSet.has(String(t.project_id)),
  );
  if (unassignedTasks.length > 0) {
    breakdown.push(
      buildForTasks("unassigned", "Client-level / unassigned tasks", {}, unassignedTasks),
    );
  }

  return breakdown;
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
    .select("id, name, status, control_tower_project_id, activecollab_project_id, retention_meeting_transcripts, retention_meeting_signal_text")
    .eq("client_id", clientId);

  const projectIds = (projects || []).map((p) => p.id);
  const projectNameById = new Map((projects || []).map((p) => [p.id, p.name]));

  const formatTask = (task: Record<string, unknown>) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    project_id: task.project_id,
    project_name: projectNameById.get(task.project_id as string) || null,
    source: getTaskSource(task),
    activecollab_task_id: task.activecollab_task_id || null,
  });

  let tasks: Array<Record<string, unknown>> = [];
  if (projectIds.length > 0) {
    const { data: projectTasks } = await supabase
      .from("project_tasks")
      .select("id, title, status, priority, due_date, updated_at, created_at, project_id, brand_id, activecollab_task_id")
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
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const taskById = new Map(allTasks.map((t) => [t.id as string, t]));

  const openTasks = allTasks.filter((t) => !isTaskDone(t.status as string));
  const overdueTasks = openTasks.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date as string) < now;
  });

  const staleTasks = openTasks.filter((t) => {
    const updated = new Date((t.updated_at || t.created_at) as string);
    return updated < fourteenDaysAgo;
  });

  const approachingDeadlineTasks = openTasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date as string);
    return due >= now && due <= sevenDaysAhead;
  });

  const taskIds = allTasks.map((t) => t.id as string);
  let recentComments: Array<{
    text: string;
    created_at: string | null;
    author: string | null;
    task_id: string | null;
    task_title: string | null;
    task_due_date: string | null;
    project_name: string | null;
  }> = [];

  if (taskIds.length > 0) {
    const { data: comments } = await supabase
      .from("project_task_comments")
      .select("comment, comment_body, created_at, created_by_name, is_deleted, task_id")
      .in("task_id", taskIds)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(15);

    recentComments = (comments || []).map((c) => {
      const task = c.task_id ? taskById.get(c.task_id) : undefined;
      return {
        text: (c.comment_body || c.comment || "").trim(),
        created_at: c.created_at,
        author: c.created_by_name,
        task_id: c.task_id,
        task_title: task ? String(task.title || "") : null,
        task_due_date: task?.due_date ? String(task.due_date) : null,
        project_name: task?.project_id
          ? projectNameById.get(task.project_id as string) || null
          : null,
      };
    }).filter((c) => c.text.length > 0);
  }

  const negativeFlags = flagNegativeComments(recentComments.map((c) => c.text));

  let daysSinceLastTouch: number | null = null;
  let lastTouchDate: string | null = null;
  let projectMeetings: MeetingSignal[] = [];

  if (projectIds.length > 0) {
    const { data: meetings } = await supabase
      .from("project_meetings")
      .select("project_id, meeting_title, start_time, meeting_description, meeting_data, meeting_type")
      .in("project_id", projectIds)
      .order("start_time", { ascending: false })
      .limit(8);

    projectMeetings = (meetings || []).map((meeting) => ({
      channel: String(meeting.meeting_type || "zoom"),
      subject: String(meeting.meeting_title || "Client meeting"),
      content_excerpt: extractTranscriptText(meeting).slice(0, 500),
      date: String(meeting.start_time || ""),
      source: "project_meeting" as const,
      project_id: String(meeting.project_id || ""),
      project_name: projectNameById.get(String(meeting.project_id || "")) || undefined,
    })).filter((meeting) => meeting.date);
  }

  const projectRetentionMeetings = (projects || []).flatMap((project) => {
    const rows = parseProjectRetentionMeetings(project.retention_meeting_transcripts);
    return rows.map((row) => ({
      channel: "zoom",
      subject: `${row.title} (${project.name})`,
      content_excerpt: row.generated_text.slice(0, 500),
      date: row.meeting_date || "",
      source: "project_retention" as const,
      transcript_link: row.transcript_link,
      project_id: project.id,
      project_name: project.name,
      concern_keywords: row.concern_keywords,
      concern_flags: row.concern_flags,
      has_client_concerns: row.has_client_concerns,
    }));
  });

  const allProjectMeetings = [...projectRetentionMeetings, ...projectMeetings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const retentionMeetingSignalText = (projects || [])
    .map((project) => {
      const signal = String(project.retention_meeting_signal_text || "").trim();
      if (!signal) return null;
      return `Project: ${project.name}\n${signal}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const touchDates = [
    ...allProjectMeetings.map((m) => m.date),
  ].filter(Boolean);

  if (touchDates.length > 0) {
    const latest = Math.max(...touchDates.map((d) => new Date(d).getTime()));
    lastTouchDate = new Date(latest).toISOString();
    daysSinceLastTouch = Math.floor((now.getTime() - latest) / (1000 * 60 * 60 * 24));
  }

  const meetingTexts = [
    ...allProjectMeetings.map((m) => m.content_excerpt),
    ...(retentionMeetingSignalText ? [retentionMeetingSignalText] : []),
  ].filter((text) => text.length > 0);
  const storedMeetingFlags = allProjectMeetings.flatMap((m) => m.concern_flags || []);
  const meetingFlags = storedMeetingFlags.length > 0
    ? storedMeetingFlags
    : flagNegativeComments(meetingTexts);

  const projectBreakdown = buildProjectBreakdown(
    projects || [],
    allTasks,
    recentComments,
    allProjectMeetings,
    taskById,
    now,
    fourteenDaysAgo,
    sevenDaysAhead,
    formatTask,
  );

  const meetingConcernKeywordCount = projectBreakdown.reduce(
    (sum, project) => sum + (Number(project.meeting_concern_count) || 0),
    0,
  );

  let heuristicScore = client.satisfaction_score ?? 85;
  heuristicScore -= Math.min(overdueTasks.length * 5, 25);
  heuristicScore -= Math.min(staleTasks.length * 10, 20);
  if (daysSinceLastTouch !== null && daysSinceLastTouch > 21) {
    heuristicScore -= 15;
  }
  if (negativeFlags.length > 0) {
    heuristicScore -= Math.min(negativeFlags.length * 5, 15);
  }
  if (meetingFlags.length > 0) {
    heuristicScore -= Math.min(meetingFlags.length * 5, 15);
  }
  if (meetingConcernKeywordCount > 0) {
    heuristicScore -= Math.min(meetingConcernKeywordCount * 4, 20);
  }
  if (approachingDeadlineTasks.length >= 3) {
    heuristicScore -= 5;
  }
  heuristicScore = Math.max(0, Math.min(100, heuristicScore));

  const primaryProjectId = projectIds[0] || null;
  const activecollabTaskCount = allTasks.filter((t) => t.activecollab_task_id).length;
  const controlTowerTaskCount = allTasks.length - activecollabTaskCount;

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
      activecollab_task_count: activecollabTaskCount,
      control_tower_task_count: controlTowerTaskCount,
      project_breakdown: projectBreakdown,
      delivery: {
        activecollab_task_count: activecollabTaskCount,
        control_tower_task_count: controlTowerTaskCount,
        overdue_tasks: {
          count: overdueTasks.length,
          tasks: overdueTasks.slice(0, 5).map(formatTask),
        },
        approaching_deadlines: {
          count: approachingDeadlineTasks.length,
          tasks: approachingDeadlineTasks.slice(0, 5).map(formatTask),
        },
        stale_tasks: {
          count: staleTasks.length,
          tasks: staleTasks.slice(0, 3).map((t) => ({
            ...formatTask(t),
            last_updated: t.updated_at || t.created_at,
          })),
        },
      },
      control_tower_delivery: {
        overdue_tasks: {
          count: overdueTasks.length,
          tasks: overdueTasks.slice(0, 5).map(formatTask),
        },
        approaching_deadlines: {
          count: approachingDeadlineTasks.length,
          tasks: approachingDeadlineTasks.slice(0, 5).map(formatTask),
        },
        stale_tasks: {
          count: staleTasks.length,
          tasks: staleTasks.slice(0, 3).map((t) => ({
            ...formatTask(t),
            last_updated: t.updated_at || t.created_at,
          })),
        },
      },
      overdue_tasks: {
        count: overdueTasks.length,
        tasks: overdueTasks.slice(0, 5).map(formatTask),
      },
      stale_tasks: {
        count: staleTasks.length,
        tasks: staleTasks.slice(0, 3).map((t) => ({
          ...formatTask(t),
          last_updated: t.updated_at || t.created_at,
        })),
      },
      recent_comments: recentComments.slice(0, 10),
      negative_comment_flags: negativeFlags,
      meetings: {
        days_since_last_touch: daysSinceLastTouch,
        last_touch_date: lastTouchDate,
        project_meetings: allProjectMeetings,
        retention_meeting_signal_text: retentionMeetingSignalText || null,
        negative_flags: meetingFlags,
        concern_keyword_count: allProjectMeetings.reduce(
          (sum, meeting) => sum + (meeting.concern_keywords?.length || 0),
          0,
        ),
        project_meeting_concern_keywords: meetingConcernKeywordCount,
      },
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
  const comms = signals.meetings as {
    days_since_last_touch?: number | null;
    negative_flags?: string[];
  } | undefined;
  const legacyComms = signals.communications as {
    days_since_last_touch?: number | null;
    negative_flags?: string[];
  } | undefined;
  const meetingDays = comms?.days_since_last_touch ?? legacyComms?.days_since_last_touch ??
    (signals.meeting as { days_since_last?: number | null })?.days_since_last;
  const meetingFlags = comms?.negative_flags ?? legacyComms?.negative_flags ??
    (signals.meeting as { transcript_negative_flags?: string[] })?.transcript_negative_flags ?? [];
  const approaching = (signals.delivery as {
    approaching_deadlines?: { count?: number };
  } | undefined)?.approaching_deadlines?.count ??
    (signals.control_tower_delivery as {
      approaching_deadlines?: { count?: number };
    } | undefined)?.approaching_deadlines?.count ?? 0;
  const projectBreakdown = (signals.project_breakdown as Array<{
    project_name?: string;
    concerns?: string[];
  }>) || [];

  const score = heuristicScore;
  const churnProb = normalizeChurnProbability(null, score);
  const riskBand = computeRiskBand(score, churnProb);

  const rootCauses: RootCause[] = [];
  for (const project of projectBreakdown) {
    for (const concern of project.concerns || []) {
      const lower = concern.toLowerCase();
      rootCauses.push({
        cause: `${project.project_name || "Project"}: delivery concern`,
        evidence: concern,
        confidence: 0.8,
        severity: lower.includes("overdue") ||
            lower.includes("negative") ||
            lower.includes("meeting") ||
            lower.includes("transcript") ||
            lower.includes("sue") ||
            lower.includes("disappoint") ||
            lower.includes("frustrat")
          ? "high"
          : "medium",
      });
    }
  }

  if (rootCauses.length === 0 && overdue > 0) {
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
  if (meetingFlags.length > 0) {
    rootCauses.push({
      cause: "Negative sentiment in project meeting transcripts",
      evidence: meetingFlags[0],
      confidence: 0.8,
      severity: "high",
    });
  }
  if (approaching >= 3) {
    rootCauses.push({
      cause: "Upcoming deadline pressure",
      evidence: `${approaching} tasks due within 7 days`,
      confidence: 0.75,
      severity: "medium",
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
    explanation: `Heuristic assessment: ${overdue} overdue, ${stale} stale, ${approaching} approaching deadlines, ${negativeFlags.length} negative comment flag(s), ${meetingFlags.length} meeting concern(s).`,
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
      ? (raw.recommended_actions as RecommendedAction[]).filter((action) =>
        action.type === "create_task" || action.type === "draft_email"
      )
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
risk_band must be exactly one of: healthy, stable, watch, critical, immediate.
When project_breakdown is present, tie root_causes and recovery_plan to specific projects where possible.`;

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
      const { data: allClients, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .order("name");

      if (clientsError) {
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }
      clientIds = (allClients || []).map((c) => c.id);
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
