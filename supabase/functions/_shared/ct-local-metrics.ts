/**
 * Compute Marketing CT adoption metrics from user_activity_logs.
 * Spec: CONTROL-TOWER-ADOPTION-STATS-EXPORT-API.md v1.0.0
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  type CtAdoptionMetrics,
  parseAdoptionMetrics,
} from "./ct-adoption-schema.ts";

const CONTROL_TOWER_NAME = "SJ Marketing Control Tower";
const CONTROL_TOWER_VERSION = "1.0.0";

type WindowKey = "d7" | "d30" | "d60" | "d90";

type ActivityRow = {
  activity_type: string;
  module_name: string | null;
  page_path: string | null;
  action_name: string | null;
  created_at: string;
};

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfIsoWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff),
  );
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

async function fetchUserLogs(supabase: SupabaseClient, userId: string, sinceIso: string) {
  const rows: ActivityRow[] = [];
  let from = 0;
  const pageSize = 1000;

  for (;;) {
    const { data, error } = await supabase
      .from("user_activity_logs")
      .select("activity_type, module_name, page_path, action_name, created_at")
      .eq("user_id", userId)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as ActivityRow[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function countByWindow(
  rows: Array<{ created_at: string }>,
  predicate: (row: ActivityRow) => boolean,
): Record<WindowKey, number> {
  const now = Date.now();
  const counts: Record<WindowKey, number> = { d7: 0, d30: 0, d60: 0, d90: 0 };

  for (const row of rows) {
    if (!predicate(row as ActivityRow)) continue;
    const ts = Date.parse(row.created_at);
    if (Number.isNaN(ts)) continue;
    const days = (now - ts) / (1000 * 60 * 60 * 24);
    if (days <= 7) counts.d7 += 1;
    if (days <= 30) counts.d30 += 1;
    if (days <= 60) counts.d60 += 1;
    if (days <= 90) counts.d90 += 1;
  }

  return counts;
}

async function fetchTaskCompliance(
  supabase: SupabaseClient,
  userId: string,
  weekStartIso: string,
): Promise<{ weeklyTaskUpdate: boolean; lastTaskUpdateAt: string | null }> {
  const { data, error } = await supabase
    .from("project_tasks")
    .select("updated_at, completed_at, created_at")
    .eq("assigned_to", userId)
    .gte("updated_at", weekStartIso)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !data?.length) {
    const { data: recent } = await supabase
      .from("project_tasks")
      .select("updated_at, completed_at, created_at")
      .eq("assigned_to", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    const last = recent?.[0];
    const lastTaskUpdateAt = last?.updated_at ?? last?.completed_at ?? last?.created_at ?? null;
    return { weeklyTaskUpdate: false, lastTaskUpdateAt };
  }

  const lastTaskUpdateAt = data[0]?.updated_at ?? data[0]?.completed_at ?? data[0]?.created_at ?? null;
  return { weeklyTaskUpdate: true, lastTaskUpdateAt };
}

export async function isUserManager(supabase: SupabaseClient, email: string): Promise<boolean> {
  const { count: reportCount } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .ilike("reporting_manager_email", email)
    .eq("is_active", true);

  if ((reportCount ?? 0) > 0) return true;

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (!userRow?.id) return false;

  const { count: roleCount } = await supabase
    .from("user_roles")
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userRow.id)
    .in("role", ["manager", "super_admin"]);

  return (roleCount ?? 0) > 0;
}

export async function computeLocalAdoptionMetrics(
  supabase: SupabaseClient,
  userId: string,
  options?: { email?: string | null; department?: string | null; isManager?: boolean },
): Promise<CtAdoptionMetrics> {
  const since90 = isoDaysAgo(90);
  const rows = await fetchUserLogs(supabase, userId, since90);

  const loginRows = rows.filter((r) => r.activity_type === "login");
  const pageRows = rows.filter((r) => r.activity_type === "page_view");
  const actionRows = rows.filter((r) => r.activity_type === "action");

  const logins = countByWindow(loginRows, () => true);
  const pageViews = countByWindow(pageRows, () => true);
  const actions = countByWindow(actionRows, () => true);

  const moduleMap = new Map<string, { pageViews: number; actions: number; lastUsedAt: string | null }>();
  for (const row of rows) {
    if (row.activity_type !== "page_view" && row.activity_type !== "action") continue;
    const name = row.module_name || "Unknown";
    const existing = moduleMap.get(name) ?? { pageViews: 0, actions: 0, lastUsedAt: null };
    if (row.activity_type === "page_view") existing.pageViews += 1;
    if (row.activity_type === "action") existing.actions += 1;
    if (!existing.lastUsedAt || row.created_at > existing.lastUsedAt) {
      existing.lastUsedAt = row.created_at;
    }
    moduleMap.set(name, existing);
  }

  const modules = Array.from(moduleMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.pageViews + b.actions - (a.pageViews + a.actions));

  let lastActiveAt: string | null = null;
  for (const row of rows) {
    if (!lastActiveAt || row.created_at > lastActiveAt) lastActiveAt = row.created_at;
  }

  const weekStart = startOfIsoWeek().toISOString();
  const taskActions = ["task_created", "task_updated", "task_completed"];
  const weeklyTaskRows = actionRows.filter(
    (r) => r.created_at >= weekStart && r.action_name && taskActions.includes(r.action_name),
  );

  let lastTaskUpdateAt: string | null = weeklyTaskRows.length
    ? weeklyTaskRows.reduce(
      (max, r) => (r.created_at > max ? r.created_at : max),
      weeklyTaskRows[0].created_at,
    )
    : actionRows
      .filter((r) => r.action_name && taskActions.includes(r.action_name))
      .reduce<string | null>((max, r) => (!max || r.created_at > max ? r.created_at : max), null);

  const isManager = options?.isManager ?? false;
  let weeklyTaskUpdate: boolean | null = isManager ? weeklyTaskRows.length > 0 : null;

  if (isManager && !weeklyTaskRows.length) {
    const taskCompliance = await fetchTaskCompliance(supabase, userId, weekStart);
    weeklyTaskUpdate = taskCompliance.weeklyTaskUpdate;
    if (!lastTaskUpdateAt) lastTaskUpdateAt = taskCompliance.lastTaskUpdateAt;
  }

  const pageViewCounts = pageRows.reduce<Record<string, number>>((acc, r) => {
    if (!r.page_path) return acc;
    acc[r.page_path] = (acc[r.page_path] ?? 0) + 1;
    return acc;
  }, {});

  const payload = {
    lastActiveAt,
    summary: {
      controlTowerName: CONTROL_TOWER_NAME,
      controlTowerVersion: CONTROL_TOWER_VERSION,
      employeeEmail: options?.email ?? null,
      department: options?.department ?? null,
      logins,
      pageViews,
      actions,
      modules,
      managerCompliance: {
        isManager,
        weeklyTaskUpdate,
        lastTaskUpdateAt: isManager ? lastTaskUpdateAt : null,
      },
    },
    details: {
      recentLogins: loginRows
        .map((r) => r.created_at)
        .slice(0, 50),
      topPages: Object.entries(pageViewCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 50),
      topActions: Object.entries(
        actionRows.reduce<Record<string, number>>((acc, r) => {
          if (!r.action_name) return acc;
          acc[r.action_name] = (acc[r.action_name] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50),
    },
  };

  return parseAdoptionMetrics(payload as Record<string, unknown>);
}
