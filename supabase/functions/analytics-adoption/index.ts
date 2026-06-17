/**
 * Marketing CT — Adoption Stats Export API (provider)
 *
 * Endpoints (base URL = .../functions/v1/analytics-adoption):
 *   GET /analytics/ping
 *   GET /health
 *   GET /analytics/users/{email}
 *
 * Spec: CONTROL-TOWER-ADOPTION-STATS-EXPORT-API.md v1.0.0
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { computeLocalAdoptionMetrics, isUserManager } from "../_shared/ct-local-metrics.ts";

const apiCorsHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Headers":
    corsHeaders["Access-Control-Allow-Headers"] + ", x-api-key",
};

const SERVICE_NAME = "sj-marketing-control-tower-analytics";
const ADOPTION_ACTION = "adoption-export";

interface ApiKeyRecord {
  id: string;
  key_name: string;
  is_active: boolean;
  rate_limit_per_minute: number;
  allowed_actions: string[];
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...apiCorsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, error: string, message: string): Response {
  return jsonResponse({ error, message }, status);
}

async function hashApiKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function extractApiKey(req: Request): string | null {
  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return req.headers.get("x-api-key") ?? (bearer || null);
}

function normalizeRoutePath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const fnIndex = parts.findIndex((p) => p === "analytics-adoption");
  const suffix = fnIndex >= 0 ? parts.slice(fnIndex + 1) : parts;
  return "/" + suffix.join("/");
}

function extractUserEmail(pathname: string): string | null {
  const route = normalizeRoutePath(pathname);
  const match = route.match(/^\/analytics\/users\/(.+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).toLowerCase().trim();
  } catch {
    return null;
  }
}

function isPingRoute(pathname: string): boolean {
  const route = normalizeRoutePath(pathname);
  return route === "/analytics/ping" || route.endsWith("/analytics/ping");
}

function isHealthRoute(pathname: string): boolean {
  const route = normalizeRoutePath(pathname);
  return route === "/health" || route.endsWith("/health");
}

async function validateApiKey(
  req: Request,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<{ ok: true; keyRecord?: ApiKeyRecord; hashHex?: string } | { ok: false; status: number }> {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return { ok: false, status: 401 };
  }

  const envKey = Deno.env.get("ANALYTICS_EXPORT_API_KEY") ??
    Deno.env.get("CONTROL_TOWER_ANALYTICS_KEY");
  if (envKey && apiKey === envKey) {
    return { ok: true };
  }

  try {
    const hashHex = await hashApiKey(apiKey);
    const { data, error } = await supabase
      .from("analytics_api_keys")
      .select("id, key_name, is_active, rate_limit_per_minute, allowed_actions")
      .eq("key_hash", hashHex)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return { ok: false, status: 401 };
    }

    const keyRecord = data as ApiKeyRecord;
    const allowed = keyRecord.allowed_actions ?? [];
    if (allowed.length > 0 && !allowed.includes(ADOPTION_ACTION)) {
      return { ok: false, status: 403 };
    }

    return { ok: true, keyRecord, hashHex };
  } catch {
    return { ok: false, status: 401 };
  }
}

async function checkRateLimit(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  hashHex: string,
  maxRequests: number,
): Promise<boolean> {
  try {
    const { data } = await supabase.rpc("check_analytics_api_rate_limit", {
      p_api_key_hash: hashHex,
      p_max_requests: maxRequests,
    });
    if (data?.[0] && data[0].allowed === false) return false;
  } catch {
    // fail open
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: apiCorsHeaders });
  }

  if (req.method !== "GET") {
    return errorResponse(405, "method_not_allowed", "GET only");
  }

  const url = new URL(req.url);
  const ping = isPingRoute(url.pathname);
  const health = isHealthRoute(url.pathname);
  const email = extractUserEmail(url.pathname);

  if (!ping && !health && !email) {
    return errorResponse(404, "not_found", "Unknown analytics route");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return errorResponse(500, "server_error", "Server configuration error");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const authResult = await validateApiKey(req, supabase);
  if (!authResult.ok) {
    return errorResponse(
      authResult.status,
      authResult.status === 403 ? "forbidden" : "unauthorized",
      authResult.status === 403
        ? "API key not authorized for adoption export"
        : "Invalid API key",
    );
  }

  if (authResult.keyRecord && authResult.hashHex) {
    const allowed = await checkRateLimit(
      supabase,
      authResult.hashHex,
      authResult.keyRecord.rate_limit_per_minute ?? 60,
    );
    if (!allowed) {
      return errorResponse(429, "rate_limited", "Rate limit exceeded");
    }

    supabase
      .from("analytics_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", authResult.keyRecord.id)
      .then(() => {})
      .catch(() => {});
  }

  if (ping || health) {
    return jsonResponse({ ok: true, service: SERVICE_NAME });
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id, email, status")
    .ilike("email", email!)
    .maybeSingle();

  if (userError) {
    return errorResponse(500, "server_error", userError.message);
  }

  let userId = userRow?.id ?? null;

  if (!userId) {
    const { data: employeeRow } = await supabase
      .from("employees")
      .select("email, department, is_active")
      .ilike("email", email!)
      .eq("is_active", true)
      .maybeSingle();

    if (!employeeRow) {
      return errorResponse(404, "not_found", "User not found");
    }

    const metrics = await computeLocalAdoptionMetrics(supabase, "00000000-0000-0000-0000-000000000000", {
      email,
      department: employeeRow.department ?? null,
      isManager: await isUserManager(supabase, email!),
    });

    return jsonResponse({
      lastActiveAt: metrics.lastActiveAt,
      summary: {
        ...metrics.summary,
        employeeEmail: email,
        department: employeeRow.department ?? metrics.summary.department,
      },
      details: metrics.details,
    });
  }

  if (userRow?.status === "inactive" || userRow?.status === "deleted") {
    return errorResponse(404, "not_found", "User not found");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("department")
    .ilike("email", email!)
    .eq("is_active", true)
    .maybeSingle();

  const manager = await isUserManager(supabase, email!);
  const metrics = await computeLocalAdoptionMetrics(supabase, userId, {
    email,
    department: employee?.department ?? null,
    isManager: manager,
  });

  return jsonResponse({
    lastActiveAt: metrics.lastActiveAt,
    summary: metrics.summary,
    details: metrics.details,
  });
});
