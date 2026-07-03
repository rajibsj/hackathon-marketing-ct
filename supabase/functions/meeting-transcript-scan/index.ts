import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  scanMeetingTranscriptForConcerns,
  stripHtmlToText,
} from "../_shared/meeting-concern-scan.ts";

const MAX_BYTES = 200_000;

async function readResponseText(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let received = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BYTES) {
      text += decoder.decode(value.slice(0, Math.max(0, MAX_BYTES - (received - value.byteLength))), {
        stream: true,
      });
      break;
    }
    text += decoder.decode(value, { stream: true });
  }

  return text;
}

async function fetchTranscriptFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SJ-Marketing-Control-Tower/1.0",
      Accept: "text/plain,text/html,application/json,*/*",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch transcript (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  const raw = await readResponseText(response);

  if (contentType.includes("application/json")) {
    try {
      const json = JSON.parse(raw) as Record<string, unknown>;
      const text = String(
        json.transcript ||
          json.text ||
          json.content ||
          json.body ||
          "",
      ).trim();
      if (text) return text;
    } catch {
      // fall through to plain text handling
    }
  }

  if (contentType.includes("text/html") || raw.includes("<html")) {
    return stripHtmlToText(raw);
  }

  return raw.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, text } = await req.json() as { url?: string; text?: string };

    let transcriptText = String(text || "").trim();
    let fetchError: string | null = null;

    if (!transcriptText && url) {
      try {
        transcriptText = await fetchTranscriptFromUrl(String(url).trim());
      } catch (error) {
        fetchError = error instanceof Error ? error.message : "Failed to fetch transcript link";
      }
    }

    const scan = scanMeetingTranscriptForConcerns(transcriptText);

    return new Response(
      JSON.stringify({
        transcript_text: transcriptText || null,
        fetch_error: fetchError,
        concern_keywords: scan.keywords,
        concern_flags: scan.flags,
        concern_hits: scan.hits,
        has_client_concerns: scan.has_concerns,
        keyword_scan_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcript scan failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
