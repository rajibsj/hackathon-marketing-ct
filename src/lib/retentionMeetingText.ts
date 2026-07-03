export interface RetentionMeetingEntry {
  id: string;
  title: string;
  meeting_date: string;
  transcript_link: string;
  transcript_text?: string | null;
  generated_text?: string | null;
}

export function createEmptyRetentionMeeting(): RetentionMeetingEntry {
  return {
    id: crypto.randomUUID(),
    title: "",
    meeting_date: new Date().toISOString().slice(0, 10),
    transcript_link: "",
    transcript_text: "",
    generated_text: null,
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
      if (!link && !date) return null;

      return {
        id: String(item.id || crypto.randomUUID()),
        title: String(item.title || "").trim(),
        meeting_date: date || new Date().toISOString().slice(0, 10),
        transcript_link: link,
        transcript_text: String(item.transcript_text || "").trim() || null,
        generated_text: String(item.generated_text || "").trim() || null,
      } satisfies RetentionMeetingEntry;
    })
    .filter((row): row is RetentionMeetingEntry => row !== null);
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

  return `${title} (${dateLabel})\n${body}`;
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

  const header = "Project meeting transcripts for retention analysis:\n";
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
