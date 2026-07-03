import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RECOVERY_TASK_SOURCE = "client-retention-copilot";
export const RECOVERY_TITLE_PREFIX = "[Recovery]";

export type RecoveryTaskFilter = "pending" | "ongoing" | "completed" | "all";

export interface RecoveryTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  client_id: string | null;
  created_at: string;
  completed_at: string | null;
  client?: { id: string; name: string; company: string | null } | null;
}

export interface RecoveryTaskClientSummary {
  pending: number;
  ongoing: number;
  completed: number;
  total: number;
}

function statusesForFilter(filter: RecoveryTaskFilter): string[] | null {
  switch (filter) {
    case "pending":
      return ["todo"];
    case "ongoing":
      return ["in_progress", "review", "blocked"];
    case "completed":
      return ["completed"];
    default:
      return null;
  }
}

export function formatRecoveryTitle(title: string) {
  const trimmed = title.trim();
  if (trimmed.startsWith(RECOVERY_TITLE_PREFIX)) return trimmed;
  return `${RECOVERY_TITLE_PREFIX} ${trimmed}`;
}

export function buildRecoveryDescription(description?: string, concernText?: string) {
  const parts: string[] = [];
  const concern = concernText?.trim();
  if (concern) {
    parts.push(`Concern: ${concern}`);
  }
  const details = description?.trim();
  if (details && details !== concern) {
    parts.push(details);
  } else if (!concern && details) {
    parts.push(details);
  }
  const base = parts.join("\n\n") || "AI-generated recovery action";
  if (base.includes(RECOVERY_TASK_SOURCE)) return base;
  return `${base}\n\n---\nSource: ${RECOVERY_TASK_SOURCE}`;
}

export function isRecoveryTask(task: { description?: string | null; title?: string | null }) {
  return (
    task.description?.includes(RECOVERY_TASK_SOURCE) ||
    task.title?.startsWith(RECOVERY_TITLE_PREFIX)
  );
}

function mapRecoveryTask(row: Record<string, unknown>): RecoveryTask {
  const client = row.client as RecoveryTask["client"];
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    status: row.status as string,
    priority: row.priority as string,
    due_date: row.due_date as string | null,
    client_id: row.client_id as string | null,
    created_at: row.created_at as string,
    completed_at: row.completed_at as string | null,
    client: Array.isArray(client) ? client[0] : client,
  };
}

async function fetchRecoveryTasks(clientId?: string, filter: RecoveryTaskFilter = "all") {
  let query = supabase
    .from("project_tasks")
    .select(
      "id, title, description, status, priority, due_date, client_id, created_at, completed_at, client:clients(id, name, company)",
    )
    .ilike("description", `%${RECOVERY_TASK_SOURCE}%`)
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const statuses = statusesForFilter(filter);
  if (statuses) {
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || [])
    .map((row) => mapRecoveryTask(row as Record<string, unknown>))
    .filter(isRecoveryTask);
}

export function useRecoveryTasks(
  clientId?: string,
  filter: RecoveryTaskFilter = "all",
  enabled = true,
) {
  return useQuery({
    queryKey: ["recovery-tasks", clientId ?? "all", filter],
    queryFn: () => fetchRecoveryTasks(clientId, filter),
    staleTime: 5000,
    enabled,
  });
}

function buildRecoveryMaps(tasks: RecoveryTask[]) {
  const byClient = new Map<string, RecoveryTask[]>();
  const summary = new Map<string, RecoveryTaskClientSummary>();

  for (const task of tasks) {
    if (!task.client_id) continue;

    const list = byClient.get(task.client_id) ?? [];
    list.push(task);
    byClient.set(task.client_id, list);

    const current = summary.get(task.client_id) ?? {
      pending: 0,
      ongoing: 0,
      completed: 0,
      total: 0,
    };

    current.total += 1;
    if (task.status === "completed") current.completed += 1;
    else if (task.status === "todo") current.pending += 1;
    else current.ongoing += 1;

    summary.set(task.client_id, current);
  }

  return { byClient, summary };
}

/** Single portfolio-wide fetch — use on Retention Copilot cards to avoid N+1 queries. */
export function useRecoveryTasksPortfolio() {
  const query = useRecoveryTasks(undefined, "all");

  const { byClient, summary } = useMemo(
    () => buildRecoveryMaps(query.data ?? []),
    [query.data],
  );

  return {
    ...query,
    byClient,
    summary,
  };
}

export function useRecoveryTaskSummary() {
  const { summary, isLoading, isError, error, refetch } = useRecoveryTasksPortfolio();

  return {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export async function reanalyzeClientPortfolio(clientId: string) {
  const { data, error } = await supabase.functions.invoke("client-health-copilot", {
    body: { client_id: clientId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useCompleteRecoveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      clientId,
    }: {
      taskId: string;
      clientId?: string | null;
    }) => {
      const { data, error } = await (supabase as any).rpc("update_project_task", {
        p_task_id: taskId,
        p_updates: { status: "completed", completed_at: new Date().toISOString() },
      });
      if (error) throw error;
      return { data, clientId };
    },
    onSuccess: async (result) => {
      const clientId = result.clientId;
      queryClient.invalidateQueries({ queryKey: ["recovery-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recovery-tasks-summary"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-project-tasks"] });

      if (clientId) {
        try {
          await reanalyzeClientPortfolio(clientId);
          queryClient.invalidateQueries({ queryKey: ["client-health-snapshots"] });
          toast.success("Recovery task complete — client score re-analyzed");
        } catch (err) {
          const message = err instanceof Error ? err.message : "Re-analysis failed";
          toast.warning(`Task completed, but re-analysis failed: ${message}`);
        }
      } else {
        toast.success("Recovery task marked complete");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to complete recovery task");
    },
  });
}

export function useStartRecoveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await (supabase as any).rpc("update_project_task", {
        p_task_id: taskId,
        p_updates: { status: "in_progress", completed_at: null },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recovery-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recovery-tasks-summary"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-project-tasks"] });
      toast.success("Recovery task started");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start recovery task");
    },
  });
}

export type RiskBand = "healthy" | "stable" | "watch" | "critical" | "immediate";

export interface RootCause {
  cause: string;
  evidence: string;
  confidence?: number;
  severity?: string;
}

export interface RecoveryStep {
  priority: number;
  action: string;
  rationale?: string;
  owner_hint?: string;
  due_in_days?: number;
}

export interface RecommendedAction {
  type: "create_task" | "draft_email";
  title?: string;
  description?: string;
  priority?: string;
  subject?: string;
  body?: string;
}

export interface ClientHealthSnapshot {
  id: string;
  client_id: string;
  health_score: number;
  churn_probability: number;
  churn_window_days: number | null;
  risk_band: RiskBand;
  summary: string | null;
  explanation: string | null;
  root_causes: RootCause[];
  recovery_plan: RecoveryStep[];
  signals: Record<string, unknown>;
  recommended_actions: RecommendedAction[];
  heuristic_score: number | null;
  analyzed_at: string;
  created_at: string;
  client?: {
    id: string;
    name: string;
    company: string | null;
    status: string;
    email: string | null;
    health_score: number | null;
    churn_risk_band: string | null;
    last_health_analysis_at: string | null;
  };
}

function parseSnapshot(row: Record<string, unknown>): ClientHealthSnapshot {
  return {
    ...row,
    root_causes: (row.root_causes as RootCause[]) || [],
    recovery_plan: (row.recovery_plan as RecoveryStep[]) || [],
    recommended_actions: (row.recommended_actions as RecommendedAction[]) || [],
    signals: (row.signals as Record<string, unknown>) || {},
  } as ClientHealthSnapshot;
}

export function useClientHealth() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["client-health-snapshots"],
    queryFn: async () => {
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, company, status, email, health_score, churn_risk_band, last_health_analysis_at")
        .order("name");

      if (clientsError) {
        throw new Error(`Failed to load clients: ${clientsError.message}`);
      }

      const clientIds = (clients || []).map((c) => c.id);
      if (clientIds.length === 0) {
        return { snapshots: [], clientsError: null, snapshotsError: null };
      }

      const { data: allSnapshots, error: snapshotsError } = await supabase
        .from("client_health_snapshots")
        .select("*")
        .in("client_id", clientIds)
        .order("analyzed_at", { ascending: false });

      if (snapshotsError) {
        console.error("client_health_snapshots read error:", snapshotsError);
      }

      const latestByClient = new Map<string, ClientHealthSnapshot>();
      for (const row of allSnapshots || []) {
        if (!latestByClient.has(row.client_id)) {
          const client = clients?.find((c) => c.id === row.client_id);
          latestByClient.set(row.client_id, parseSnapshot({
            ...row,
            client,
          }));
        }
      }

      const snapshots: ClientHealthSnapshot[] = [];
      for (const client of clients || []) {
        const snapshot = latestByClient.get(client.id);
        if (snapshot) {
          snapshots.push(snapshot);
        } else {
          snapshots.push({
            id: `pending-${client.id}`,
            client_id: client.id,
            health_score: client.health_score ?? 0,
            churn_probability: 0,
            churn_window_days: null,
            risk_band: (client.churn_risk_band as RiskBand) || "stable",
            summary: null,
            explanation: null,
            root_causes: [],
            recovery_plan: [],
            signals: {},
            recommended_actions: [],
            heuristic_score: null,
            analyzed_at: client.last_health_analysis_at || "",
            created_at: "",
            client,
          });
        }
      }

      return {
        snapshots: snapshots.sort((a, b) => b.churn_probability - a.churn_probability),
        clientsError: null,
        snapshotsError: snapshotsError?.message ?? null,
      };
    },
    staleTime: 30000,
  });

  const snapshots = data?.snapshots ?? [];
  const snapshotsError = data?.snapshotsError ?? null;

  const analyzePortfolio = useMutation({
    mutationFn: async (clientId?: string) => {
      const { data: result, error } = await supabase.functions.invoke("client-health-copilot", {
        body: clientId ? { client_id: clientId } : {},
      });

      if (error) {
        const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
        if (context?.json) {
          try {
            const body = await context.json() as { error?: string };
            if (body?.error) throw new Error(body.error);
          } catch {
            // fall through to generic error
          }
        }
        throw error;
      }

      if (result?.error) throw new Error(result.error);

      const analyzedCount = result?.analyzed_count ?? 0;
      const errorCount = result?.error_count ?? 0;
      const firstError = result?.errors?.[0]?.error as string | undefined;

      if (analyzedCount === 0 && errorCount > 0) {
        throw new Error(firstError || `Analysis failed for all ${errorCount} client(s)`);
      }

      return result;
    },
    onSuccess: (result, clientId) => {
      queryClient.invalidateQueries({ queryKey: ["client-health-snapshots"] });
      const count = result?.analyzed_count ?? 0;
      const errorCount = result?.error_count ?? 0;
      if (errorCount > 0) {
        const failedNames = (result?.errors as Array<{ client_name?: string; error?: string }> | undefined)
          ?.map((e) => e.client_name)
          .filter(Boolean)
          .join(", ");
        const scope = clientId ? "Client analysis" : `Analyzed ${count} client(s)`;
        toast.warning(
          `${scope}, ${errorCount} failed${failedNames ? `: ${failedNames}` : ""}`,
        );
      } else if (clientId) {
        toast.success("Client analysis complete");
      } else {
        toast.success(`Portfolio analysis complete — ${count} client${count === 1 ? "" : "s"} analyzed`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to analyze portfolio");
    },
  });

  const bandCounts = snapshots.reduce(
    (acc, s) => {
      const band = s.risk_band || "stable";
      acc[band] = (acc[band] || 0) + 1;
      return acc;
    },
    {} as Record<RiskBand, number>,
  );

  const lastScanAt = snapshots
    .map((s) => s.analyzed_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const analyzingClientId = analyzePortfolio.isPending
    ? (analyzePortfolio.variables as string | undefined)
    : undefined;

  return {
    snapshots,
    isLoading,
    error,
    snapshotsError,
    refetch,
    analyzePortfolio: analyzePortfolio.mutate,
    analyzePortfolioAsync: analyzePortfolio.mutateAsync,
    isAnalyzing: analyzePortfolio.isPending,
    isAnalyzingAll: analyzePortfolio.isPending && !analyzePortfolio.variables,
    analyzingClientId,
    bandCounts,
    lastScanAt,
    monitoredCount: snapshots.length,
  };
}

async function resolveClientProjectId(clientId: string, projectId?: string | null) {
  if (projectId) return projectId;

  const { data: projects, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1);

  if (projectError) throw projectError;
  return projects?.[0]?.id;
}

function invalidateRecoveryTaskQueries(queryClient: ReturnType<typeof useQueryClient>, clientId: string) {
  queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
  queryClient.invalidateQueries({ queryKey: ["all-project-tasks"] });
  queryClient.invalidateQueries({ queryKey: ["recovery-tasks"] });
  queryClient.invalidateQueries({ queryKey: ["recovery-tasks-summary"] });
  queryClient.invalidateQueries({ queryKey: ["recovery-tasks", clientId] });
}

export function useCreateRecoveryTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      actions,
      projectId,
    }: {
      clientId: string;
      actions: RecommendedAction[];
      projectId?: string | null;
    }) => {
      const taskActions = actions.filter((a) => a.type === "create_task");
      if (taskActions.length === 0) {
        throw new Error("No task actions to create");
      }

      const targetProjectId = await resolveClientProjectId(clientId, projectId);

      const inserts = taskActions.map((action) => ({
        client_id: clientId,
        project_id: targetProjectId || undefined,
        title: formatRecoveryTitle(action.title || "Recovery action"),
        description: buildRecoveryDescription(action.description),
        priority: (action.priority || "high") as "low" | "medium" | "high" | "urgent",
        status: "todo" as const,
        category: "clients" as const,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }));

      const { data, error } = await supabase
        .from("project_tasks")
        .insert(inserts)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      invalidateRecoveryTaskQueries(queryClient, variables.clientId);
      toast.success(`Created ${data?.length ?? 0} recovery task${(data?.length ?? 0) === 1 ? "" : "s"}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create recovery tasks");
    },
  });
}

export function useCreateManualRecoveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      title,
      description,
      concernText,
      projectId,
      priority = "high",
    }: {
      clientId: string;
      title: string;
      description?: string;
      concernText?: string;
      projectId?: string | null;
      priority?: "low" | "medium" | "high" | "urgent";
    }) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        throw new Error("Task title is required");
      }

      const targetProjectId = await resolveClientProjectId(clientId, projectId);

      const { data, error } = await supabase
        .from("project_tasks")
        .insert({
          client_id: clientId,
          project_id: targetProjectId || undefined,
          title: formatRecoveryTitle(trimmedTitle),
          description: buildRecoveryDescription(description, concernText),
          priority,
          status: "todo" as const,
          category: "clients" as const,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateRecoveryTaskQueries(queryClient, variables.clientId);
      toast.success("Recovery task created");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create recovery task");
    },
  });
}
