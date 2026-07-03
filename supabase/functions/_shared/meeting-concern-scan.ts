export const MEETING_CONCERN_PHRASES = [
  "missed deadline",
  "missed deadlines",
  "past due",
  "legal action",
  "going to sue",
  "will sue",
];

export const MEETING_CONCERN_KEYWORDS = [
  "disappointing",
  "disappointed",
  "frustrating",
  "frustrated",
  "frustration",
  "overdue",
  "unhappy",
  "concerned",
  "complaint",
  "complain",
  "cancel",
  "cancellation",
  "churn",
  "refund",
  "escalate",
  "unacceptable",
  "angry",
  "worst",
  "poor",
  "delay",
  "delayed",
  "late",
  "missed",
  "issue",
  "problem",
  "sue",
  "lawsuit",
  "litigation",
  "attorney",
  "lawyer",
];

export interface MeetingConcernHit {
  keyword: string;
  excerpt: string;
}

export interface MeetingConcernScan {
  keywords: string[];
  flags: string[];
  hits: MeetingConcernHit[];
  has_concerns: boolean;
}

function excerptAround(text: string, index: number, radius = 90): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  const slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

export function scanMeetingTranscriptForConcerns(text: string): MeetingConcernScan {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { keywords: [], flags: [], hits: [], has_concerns: false };
  }

  const lower = normalized.toLowerCase();
  const hits: MeetingConcernHit[] = [];
  const keywords = new Set<string>();

  const addHit = (keyword: string, index: number) => {
    if (keywords.has(keyword)) return;
    keywords.add(keyword);
    hits.push({
      keyword,
      excerpt: excerptAround(normalized, index),
    });
  };

  for (const phrase of MEETING_CONCERN_PHRASES) {
    let from = 0;
    while (from < lower.length) {
      const index = lower.indexOf(phrase, from);
      if (index === -1) break;
      addHit(phrase, index);
      from = index + phrase.length;
    }
  }

  for (const keyword of MEETING_CONCERN_KEYWORDS) {
    let from = 0;
    while (from < lower.length) {
      const index = lower.indexOf(keyword, from);
      if (index === -1) break;
      const before = index > 0 ? lower[index - 1] : " ";
      const after = index + keyword.length < lower.length ? lower[index + keyword.length] : " ";
      const isWordBoundary =
        !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
      if (isWordBoundary) {
        addHit(keyword, index);
      }
      from = index + keyword.length;
    }
  }

  const flags = hits.map(
    (hit) => `Keyword "${hit.keyword}" in meeting: "${hit.excerpt}"`,
  );

  return {
    keywords: Array.from(keywords),
    flags,
    hits,
    has_concerns: hits.length > 0,
  };
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
