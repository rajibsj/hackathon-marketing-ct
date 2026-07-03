import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Link as LinkIcon, Plus, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RetentionMeetingEntry,
  applyConcernScanToMeeting,
  applyGeneratedTextToMeetings,
  buildRetentionMeetingSignalText,
  createEmptyRetentionMeeting,
  parseRetentionMeetings,
} from "@/lib/retentionMeetingText";
import { scanMeetingTranscriptForConcerns } from "@/lib/meetingConcernScan";

interface ScanResponse {
  transcript_text?: string | null;
  fetch_error?: string | null;
  concern_keywords?: string[];
  concern_flags?: string[];
  concern_hits?: RetentionMeetingEntry["concern_hits"];
  has_client_concerns?: boolean;
  keyword_scan_at?: string;
  error?: string;
}

interface ProjectRetentionMeetingsProps {
  projectId: string;
  meetings?: unknown;
  signalText?: string | null;
  onSaved?: (payload: {
    meetings: RetentionMeetingEntry[];
    signalText: string | null;
  }) => void;
}

async function scanMeetingRow(row: RetentionMeetingEntry): Promise<RetentionMeetingEntry> {
  const trimmedText = row.transcript_text?.trim() || "";
  const trimmedLink = row.transcript_link.trim();

  if (trimmedText) {
    return applyConcernScanToMeeting({
      ...row,
      transcript_text: trimmedText,
    });
  }

  if (!trimmedLink) {
    return applyConcernScanToMeeting(row);
  }

  const { data, error } = await supabase.functions.invoke<ScanResponse>("meeting-transcript-scan", {
    body: { url: trimmedLink },
  });

  if (error) {
    throw new Error(error.message || "Failed to scan transcript link");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const scanAt = data?.keyword_scan_at || new Date().toISOString();
  const fetchedText = data?.transcript_text?.trim() || null;

  if (fetchedText) {
    const localScan = scanMeetingTranscriptForConcerns(fetchedText);
    return {
      ...row,
      transcript_text: fetchedText,
      concern_keywords: localScan.keywords,
      concern_flags: localScan.flags,
      concern_hits: localScan.hits,
      has_client_concerns: localScan.has_concerns,
      keyword_scan_at: scanAt,
    };
  }

  return {
    ...row,
    concern_keywords: data?.concern_keywords || [],
    concern_flags: data?.concern_flags || [],
    concern_hits: data?.concern_hits || [],
    has_client_concerns: Boolean(data?.has_client_concerns),
    keyword_scan_at: scanAt,
  };
}

async function enrichMeetingsWithConcernScan(
  rows: RetentionMeetingEntry[],
): Promise<RetentionMeetingEntry[]> {
  const enriched: RetentionMeetingEntry[] = [];

  for (const row of rows) {
    try {
      enriched.push(await scanMeetingRow(row));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scan failed";
      toast.error(`${row.title.trim() || "Meeting"}: ${message}`);
      enriched.push(applyConcernScanToMeeting(row));
    }
  }

  return enriched;
}

function normalizeMeetingRow(row: RetentionMeetingEntry): RetentionMeetingEntry {
  return {
    ...row,
    title: row.title.trim(),
    transcript_link: row.transcript_link.trim(),
    transcript_text: row.transcript_text?.trim() || null,
  };
}

export function ProjectRetentionMeetings({
  projectId,
  meetings,
  signalText,
  onSaved,
}: ProjectRetentionMeetingsProps) {
  const [rows, setRows] = useState<RetentionMeetingEntry[]>([]);
  const rowsRef = useRef<RetentionMeetingEntry[]>([]);
  const [generatedPreview, setGeneratedPreview] = useState(signalText ?? "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scanningRowId, setScanningRowId] = useState<string | null>(null);
  const scanTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastScannedRef = useRef<Map<string, string>>(new Map());

  const getScanKey = (row: RetentionMeetingEntry) =>
    `${row.transcript_link.trim()}|${row.transcript_text?.trim() || ""}`;

  const clearScanTimer = useCallback((rowId: string) => {
    const timer = scanTimersRef.current.get(rowId);
    if (timer) {
      clearTimeout(timer);
      scanTimersRef.current.delete(rowId);
    }
  }, []);

  const applyScannedRow = useCallback((rowId: string, scanned: RetentionMeetingEntry) => {
    setRows((current) => current.map((item) => (item.id === rowId ? scanned : item)));
  }, []);

  const runRowScan = useCallback(
    async (rowId: string, options?: { silent?: boolean; force?: boolean }) => {
      const row = rowsRef.current.find((item) => item.id === rowId);
      if (!row) return;

      const trimmedLink = row.transcript_link.trim();
      const trimmedText = row.transcript_text?.trim() || "";

      if (!trimmedLink && !trimmedText) {
        lastScannedRef.current.delete(rowId);
        applyScannedRow(rowId, {
          ...row,
          concern_keywords: [],
          concern_flags: [],
          concern_hits: [],
          has_client_concerns: false,
          keyword_scan_at: null,
        });
        return;
      }

      const scanKey = getScanKey(row);
      if (!options?.force && lastScannedRef.current.get(rowId) === scanKey) {
        return;
      }

      setScanningRowId(rowId);
      try {
        const scanned = await scanMeetingRow(normalizeMeetingRow(row));
        lastScannedRef.current.set(rowId, scanKey);
        applyScannedRow(rowId, scanned);

        if (!options?.silent && scanned.has_client_concerns) {
          toast.warning(
            `Found ${scanned.concern_keywords?.length || 0} concern keyword(s) in this meeting`,
          );
        }
      } catch (error) {
        if (trimmedText) {
          const localScanned = applyConcernScanToMeeting(normalizeMeetingRow(row));
          lastScannedRef.current.set(rowId, scanKey);
          applyScannedRow(rowId, localScanned);
        } else if (!options?.silent) {
          const message = error instanceof Error ? error.message : "Failed to scan transcript link";
          toast.error(message);
        }
      } finally {
        setScanningRowId((current) => (current === rowId ? null : current));
      }
    },
    [applyScannedRow],
  );

  const scheduleAutoScan = useCallback(
    (rowId: string, delayMs = 700) => {
      clearScanTimer(rowId);
      const timer = setTimeout(() => {
        void runRowScan(rowId, { silent: true });
      }, delayMs);
      scanTimersRef.current.set(rowId, timer);
    },
    [clearScanTimer, runRowScan],
  );

  useEffect(() => {
    const timers = scanTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    const parsed = parseRetentionMeetings(meetings);
    setRows(parsed.length > 0 ? parsed : [createEmptyRetentionMeeting()]);
    setGeneratedPreview(signalText ?? "");
  }, [meetings, signalText]);

  const updateRow = (id: string, patch: Partial<RetentionMeetingEntry>) => {
    setRows((current) => {
      const next = current.map((row) => (row.id === id ? { ...row, ...patch } : row));
      rowsRef.current = next;
      return next;
    });
  };

  const addRow = () => {
    setRows((current) => [...current, createEmptyRetentionMeeting()]);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      return next.length > 0 ? next : [createEmptyRetentionMeeting()];
    });
  };

  const validRows = rows.filter(
    (row) => row.transcript_link.trim() || row.transcript_text?.trim(),
  );

  const persist = async (
    nextMeetings: RetentionMeetingEntry[],
    nextSignalText: string | null,
  ) => {
    const { error } = await (supabase as any)
      .from("projects")
      .update({
        retention_meeting_transcripts: nextMeetings,
        retention_meeting_signal_text: nextSignalText,
        zoom_transcript_link: nextMeetings[0]?.transcript_link?.trim() || null,
      })
      .eq("id", projectId);

    if (error) throw error;

    onSaved?.({ meetings: nextMeetings, signalText: nextSignalText });
  };

  const normalizeRows = (input: RetentionMeetingEntry[]) => input.map(normalizeMeetingRow);

  const handleScanRow = async (rowId: string) => {
    await runRowScan(rowId, { force: true });
  };

  const handleLinkChange = (rowId: string, value: string) => {
    updateRow(rowId, { transcript_link: value });
    lastScannedRef.current.delete(rowId);
    if (value.trim()) {
      scheduleAutoScan(rowId);
    }
  };

  const handleLinkBlur = (rowId: string) => {
    clearScanTimer(rowId);
    const row = rowsRef.current.find((item) => item.id === rowId);
    if (row?.transcript_link.trim()) {
      void runRowScan(rowId, { silent: true, force: true });
    }
  };

  const handleTextChange = (rowId: string, value: string) => {
    updateRow(rowId, { transcript_text: value });
    lastScannedRef.current.delete(rowId);
    if (value.trim()) {
      scheduleAutoScan(rowId, 500);
    } else {
      const row = rowsRef.current.find((item) => item.id === rowId);
      if (row && !row.transcript_link.trim()) {
        lastScannedRef.current.delete(rowId);
        applyScannedRow(rowId, {
          ...row,
          transcript_text: "",
          concern_keywords: [],
          concern_flags: [],
          concern_hits: [],
          has_client_concerns: false,
          keyword_scan_at: null,
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeRows(validRows);
      const scanned = await enrichMeetingsWithConcernScan(normalized);
      await persist(scanned, generatedPreview.trim() || null);
      setRows(scanned.length > 0 ? scanned : rows);
      toast.success("Meetings saved with concern keyword scan");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save meeting links";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (validRows.length === 0) {
      toast.error("Add at least one meeting link or transcript text");
      return;
    }

    setGenerating(true);
    try {
      const normalized = normalizeRows(validRows);
      const scanned = await enrichMeetingsWithConcernScan(normalized);
      const withGenerated = applyGeneratedTextToMeetings(scanned);
      const signal = buildRetentionMeetingSignalText(withGenerated);

      setRows(withGenerated);
      setGeneratedPreview(signal);
      await persist(withGenerated, signal);

      const concernMeetings = withGenerated.filter((entry) => entry.has_client_concerns).length;
      toast.success(
        concernMeetings > 0
          ? `Retention text generated — ${concernMeetings} meeting(s) flagged with client concerns`
          : "Retention copilot text generated",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate retention text";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const isBusy = saving || generating || scanningRowId !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Retention meeting transcripts
        </CardTitle>
        <CardDescription>
          Meeting links and transcript text are scanned for client concern keywords (e.g. disappointed,
          frustrating, overdue, missed deadline, sue) and saved for future retention scoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">Meeting {index + 1}</p>
                {row.has_client_concerns && (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Client concerns
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.id)}
                className="text-destructive hover:text-destructive"
                disabled={isBusy}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`meeting-title-${row.id}`}>Title</Label>
                <Input
                  id={`meeting-title-${row.id}`}
                  placeholder="Bi-weekly check-in"
                  value={row.title}
                  onChange={(e) => updateRow(row.id, { title: e.target.value })}
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`meeting-date-${row.id}`}>Meeting date</Label>
                <Input
                  id={`meeting-date-${row.id}`}
                  type="date"
                  value={row.meeting_date?.slice(0, 10) || ""}
                  onChange={(e) => updateRow(row.id, { meeting_date: e.target.value })}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`meeting-link-${row.id}`}>Transcript link</Label>
              <Input
                id={`meeting-link-${row.id}`}
                type="url"
                placeholder="https://..."
                value={row.transcript_link}
                onChange={(e) => handleLinkChange(row.id, e.target.value)}
                onBlur={() => handleLinkBlur(row.id)}
                disabled={isBusy}
              />
              {scanningRowId === row.id && row.transcript_link.trim() && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scanning link for concern keywords…
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`meeting-text-${row.id}`}>Transcript text (optional)</Label>
              <Textarea
                id={`meeting-text-${row.id}`}
                placeholder="Paste transcript text — keywords appear automatically after you stop typing"
                value={row.transcript_text || ""}
                onChange={(e) => handleTextChange(row.id, e.target.value)}
                disabled={isBusy}
                rows={3}
              />
            </div>

            {scanningRowId === row.id && row.transcript_text?.trim() && !row.transcript_link.trim() && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Scanning text for concern keywords…
              </p>
            )}

            {(row.concern_keywords?.length || 0) > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Detected concern keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {row.concern_keywords?.map((keyword) => (
                    <Badge key={`${row.id}-${keyword}`} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                {row.concern_hits?.[0] && (
                  <p className="text-xs text-muted-foreground italic">
                    "{row.concern_hits[0].excerpt}"
                  </p>
                )}
                {row.keyword_scan_at && (
                  <p className="text-[10px] text-muted-foreground">
                    Scanned {new Date(row.keyword_scan_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleScanRow(row.id)}
              disabled={isBusy || (!row.transcript_link.trim() && !row.transcript_text?.trim())}
            >
              {scanningRowId === row.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : (
                "Scan for concern keywords"
              )}
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addRow} disabled={isBusy}>
          <Plus className="mr-2 h-4 w-4" />
          Add meeting
        </Button>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Keywords tracked include: disappointing, frustrating, overdue, missed deadline, sue,
            lawsuit, complaint, cancel, refund, and similar client-risk phrases. Results are stored on
            each meeting and used by the retention copilot on the next analysis run.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={isBusy}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save meetings"
            )}
          </Button>
          <Button variant="secondary" onClick={handleGenerate} disabled={isBusy}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate retention text
              </>
            )}
          </Button>
        </div>

        {generatedPreview && (
          <div className="space-y-2">
            <Label>Generated text for retention copilot</Label>
            <Textarea value={generatedPreview} readOnly rows={8} className="font-mono text-xs" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
