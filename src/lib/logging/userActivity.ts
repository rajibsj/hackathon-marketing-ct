import { supabase } from "@/integrations/supabase/client";

export interface LogUserActivityParams {
  userId: string;
  activityType: "login" | "page_view" | "action";
  moduleName?: string | null;
  pagePath?: string | null;
  actionName?: string | null;
  actionDetails?: Record<string, unknown>;
  sessionId?: string | null;
}

export async function logUserActivity(params: LogUserActivityParams): Promise<string | null> {
  const result = await supabase.rpc("log_user_activity", {
    p_user_id: params.userId,
    p_activity_type: params.activityType,
    p_module_name: params.moduleName ?? null,
    p_page_path: params.pagePath ?? null,
    p_action_name: params.actionName ?? null,
    p_action_details: params.actionDetails ?? {},
    p_session_id: params.sessionId ?? null,
  });

  if (result.error) {
    console.debug("[logUserActivity]", result.error.message);
    return null;
  }
  return (result.data as string | null) ?? null;
}

export function logUserActivityFireAndForget(params: LogUserActivityParams): void {
  void logUserActivity(params).catch(() => {
    /* intentionally silent */
  });
}

export async function trackUserAction(params: {
  userId: string;
  actionName: string;
  moduleName?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const sessionKey = "mct_session_id";
  let sessionId = typeof window !== "undefined" ? sessionStorage.getItem(sessionKey) : null;
  if (!sessionId && typeof window !== "undefined") {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  await logUserActivity({
    userId: params.userId,
    activityType: "action",
    moduleName: params.moduleName ?? null,
    pagePath: typeof window !== "undefined" ? window.location.pathname : null,
    actionName: params.actionName,
    actionDetails: {
      ...params.details,
      timestamp: new Date().toISOString(),
    },
    sessionId,
  });
}
