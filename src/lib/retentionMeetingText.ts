import {
  MeetingConcernHit,
  scanMeetingTranscriptForConcerns,
} from "@/lib/meetingConcernScan";

export interface RetentionMeetingEntry {
  id: string;
  title: string;
  meeting_date: string;
  transcript_link: string;
  transcript_text?: string | null;
  generated_text?: string | null;
  concern_keywords?: string[];
  concern_flags?: string[];
  concern_hits?: MeetingConcernHit[];
  has_client_concerns?: boolean;
  keyword_scan_at?: string | null;
}

export function createEmptyRetentionMeeting(): RetentionMeetingEntry {
  return {
    id: crypto.randomUUID(),
    title: "",
    meeting_date: new Date().toISOString().slice(0, 10),
    transcript_link: "",
    transcript_text: "",
    generated_text: null,
    concern_keywords: [],
    concern_flags: [],
    concern_hits: [],
    has_client_concerns: false,
    keyword_scan_at: null,
  };
}

export function parseRetentionMeetings(value: unknown): RetentionMeetingEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const link = String(item.transcript_link || "").trim();
      const date = String(item.meeting_date || "").trim();
      if (!link && !date && !item.transcript_text) return null;

      const concernHits = Array.isArray(item.concern_hits)
        ? item.concern_hits
            .map((hit) => {
              if (!hit || typeof hit !== "object") return null;
              const rowHit = hit as Record<string, unknown>;
              const keyword = String(rowHit.keyword || "").trim();
              const excerpt = String(rowHit.excerpt || "").trim();
              if (!keyword) return null;
              return { keyword, excerpt };
            })
            .filter((hit): hit is MeetingConcernHit => hit !== null)
        : [];

      return {
        id: String(item.id || crypto.randomUUID()),
        title: String(item.title || "").trim(),
        meeting_date: date || new Date().toISOString().slice(0, 10),
        transcript_link: link,
        transcript_text: String(item.transcript_text || "").trim() || null,
        generated_text: String(item.generated_text || "").trim() || null,
        concern_keywords: Array.isArray(item.concern_keywords)
          ? item.concern_keywords.map((kw) => String(kw))
          : [],
        concern_flags: Array.isArray(item.concern_flags)
          ? item.concern_flags.map((flag) => String(flag))
          : [],
        concern_hits: concernHits,
        has_client_concerns: Boolean(item.has_client_concerns),
        keyword_scan_at: item.keyword_scan_at ? String(item.keyword_scan_at) : null,
      } satisfies RetentionMeetingEntry;
    })
    .filter((row): row is RetentionMeetingEntry => row !== null);
}

export function applyConcernScanToMeeting(
  entry: RetentionMeetingEntry,
  scanAt = new Date().toISOString(),
): RetentionMeetingEntry {
  const sourceText =
    entry.transcript_text?.trim() ||
    entry.generated_text?.trim() ||
    "";

  if (!sourceText) {
    return {
      ...entry,
      concern_keywords: [],
      concern_flags: [],
      concern_hits: [],
      has_client_concerns: false,
      keyword_scan_at: scanAt,
    };
  }

  const scan = scanMeetingTranscriptForConcerns(sourceText);
  return {
    ...entry,
    concern_keywords: scan.keywords,
    concern_flags: scan.flags,
    concern_hits: scan.hits,
    has_client_concerns: scan.has_concerns,
    keyword_scan_at: scanAt,
  };
}

export function buildMeetingConcernSummary(entry: RetentionMeetingEntry): string | null {
  if (!entry.has_client_concerns || !entry.concern_flags?.length) return null;

  const lines = [
    "Client concern keywords detected:",
    ...entry.concern_flags.map((flag) => `- ${flag}`),
  ];
  return lines.join("\n");
}

export function buildMeetingGeneratedText(entry: RetentionMeetingEntry): string {
  const dateLabel = entry.meeting_date
    ? new Date(entry.meeting_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  const title = entry.title.trim() || "Client meeting";
  const body =
    entry.transcript_text?.trim() ||
    `Transcript reference: ${entry.transcript_link.trim()}`;
  const concernSummary = buildMeetingConcernSummary(entry);

  return [ `${title} (${dateLabel})`, body, concernSummary ]
    .filter(Boolean)
    .join("\n");
}

export function buildRetentionMeetingSignalText(entries: RetentionMeetingEntry[]): string {
  if (entries.length === 0) return "";

  const withGenerated = entries.map((entry) => ({
    ...entry,
    generated_text: buildMeetingGeneratedText(entry),
  }));

  const sorted = [...withGenerated].sort(
    (a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime(),
  );

  const concernCount = sorted.filter((entry) => entry.has_client_concerns).length;
  const header = [
    "Project meeting transcripts for retention analysis:",
    concernCount > 0
      ? `${concernCount} meeting(s) flagged with client concern keywords.`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const body = sorted
    .map((entry, index) => {
      const dateLabel = new Date(entry.meeting_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return [
        `Meeting ${index + 1}: ${entry.title.trim() || "Client meeting"}`,
        `Date: ${dateLabel}`,
        entry.has_client_concerns ? "Status: client concerns detected" : null,
        entry.concern_keywords?.length
          ? `Concern keywords: ${entry.concern_keywords.join(", ")}`
          : null,
        entry.transcript_link.trim() ? `Link: ${entry.transcript_link.trim()}` : null,
        entry.generated_text || buildMeetingGeneratedText(entry),
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return `${header}\n${body}`.trim();
}

export function applyGeneratedTextToMeetings(
  entries: RetentionMeetingEntry[],
): RetentionMeetingEntry[] {
  return entries.map((entry) => ({
    ...entry,
    generated_text: buildMeetingGeneratedText(entry),
  }));
}

export function collectMeetingConcernFlags(entries: RetentionMeetingEntry[]): string[] {
  return entries.flatMap((entry) => entry.concern_flags || []);
}
