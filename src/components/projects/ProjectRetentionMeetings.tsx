import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Link as LinkIcon, Plus, Sparkles, Trash2, AlertTriangle, Upload, RefreshCw, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { getClientRetentionCopilotUrl } from "@/lib/clientSlugUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RetentionMeetingEntry,
  applyConcernScanToMeeting,
  applyGeneratedTextToMeetings,
  buildRetentionMeetingSignalText,
  createEmptyRetentionMeeting,
  hydrateRetentionMeetingRow,
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

const MAX_UPLOAD_BYTES = 200_000;
const ACCEPTED_TRANSCRIPT_TYPES = ".txt,.md,.vtt,.srt,text/plain,text/markdown";

interface ProjectRetentionMeetingsProps {
  projectId: string;
  clientId?: string | null;
  meetings?: unknown;
  signalText?: string | null;
  onSaved?: (payload: {
    meetings: RetentionMeetingEntry[];
    signalText: string | null;
  }) => void;
}

function rowHasTranscriptSource(row: RetentionMeetingEntry) {
  return Boolean(row.transcript_link.trim() || row.transcript_text?.trim());
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

  if (data?.fetch_error && !data?.transcript_text?.trim()) {
    throw new Error(data.fetch_error);
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

function ConcernKeywordTags({ row }: { row: RetentionMeetingEntry }) {
  const keywords = row.concern_keywords || [];
  const hasStoredScan = Boolean(row.keyword_scan_at) || keywords.length > 0;

  if (!hasStoredScan) {
    return (
      <p className="text-xs text-muted-foreground">
        No scan yet — add a link or upload a file, then click Scan for concern keywords.
      </p>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="space-y-1">
        <Badge variant="secondary" className="text-xs">
          No concern keywords detected
        </Badge>
        {row.keyword_scan_at && (
          <p className="text-[10px] text-muted-foreground">
            Scanned {new Date(row.keyword_scan_at).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((keyword) => (
          <Badge
            key={`${row.id}-${keyword}`}
            variant="destructive"
            className="text-xs capitalize"
          >
            {keyword}
          </Badge>
        ))}
      </div>
      {row.concern_hits?.[0] && (
        <p className="text-xs text-muted-foreground italic">
          &ldquo;{row.concern_hits[0].excerpt}&rdquo;
        </p>
      )}
      {row.keyword_scan_at && (
        <p className="text-[10px] text-muted-foreground">
          Scanned {new Date(row.keyword_scan_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function ProjectRetentionMeetings({
  projectId,
  clientId,
  meetings,
  signalText,
  onSaved,
}: ProjectRetentionMeetingsProps) {
  const [rows, setRows] = useState<RetentionMeetingEntry[]>([]);
  const rowsRef = useRef<RetentionMeetingEntry[]>([]);
  const [generatedPreview, setGeneratedPreview] = useState(signalText ?? "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [scanningRowId, setScanningRowId] = useState<string | null>(null);
  const lastScannedRef = useRef<Map<string, string>>(new Map());

  const getScanKey = (row: RetentionMeetingEntry) =>
    `${row.transcript_link.trim()}|${row.transcript_text?.trim() || ""}`;

  const replaceRows = useCallback((next: RetentionMeetingEntry[]) => {
    rowsRef.current = next;
    setRows(next);
  }, []);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    const parsed = parseRetentionMeetings(meetings).map(hydrateRetentionMeetingRow);
    replaceRows(parsed.length > 0 ? parsed : [createEmptyRetentionMeeting()]);
  }, [meetings, replaceRows]);

  const updateRow = (id: string, patch: Partial<RetentionMeetingEntry>) => {
    setRows((current) => {
      const next = current.map((row) => (row.id === id ? { ...row, ...patch } : row));
      rowsRef.current = next;
      return next;
    });
  };

  const addRow = () => {
    setRows((current) => {
      const next = [...current, createEmptyRetentionMeeting()];
      rowsRef.current = next;
      return next;
    });
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      const resolved = next.length > 0 ? next : [createEmptyRetentionMeeting()];
      rowsRef.current = resolved;
      return resolved;
    });
  };

  const validRows = rows.filter(rowHasTranscriptSource);

  const normalizeRows = (input: RetentionMeetingEntry[]) => input.map(normalizeMeetingRow);

  useEffect(() => {
    const valid = rows.filter(rowHasTranscriptSource);
    if (valid.length === 0) {
      setGeneratedPreview(signalText?.trim() || "");
      return;
    }

    const normalized = normalizeRows(valid);
    const withGenerated = applyGeneratedTextToMeetings(normalized);
    setGeneratedPreview(buildRetentionMeetingSignalText(withGenerated));
  }, [rows, signalText]);

  const mergeScannedRows = (
    allRows: RetentionMeetingEntry[],
    scannedRows: RetentionMeetingEntry[],
  ) => {
    const scannedMap = new Map(scannedRows.map((row) => [row.id, row]));
    const merged = allRows.map((row) => scannedMap.get(row.id) || row);
    return merged.length > 0 ? merged : [createEmptyRetentionMeeting()];
  };

  const buildConcernTextFromRows = (inputRows: RetentionMeetingEntry[]) => {
    const normalized = normalizeRows(inputRows.filter(rowHasTranscriptSource));
    const withGenerated = applyGeneratedTextToMeetings(normalized);
    const signal = buildRetentionMeetingSignalText(withGenerated);
    return { withGenerated, signal, merged: mergeScannedRows(inputRows, withGenerated) };
  };

  const applyConcernTextPreview = (inputRows: RetentionMeetingEntry[]) => {
    const { withGenerated, signal, merged } = buildConcernTextFromRows(inputRows);
    replaceRows(merged);
    setGeneratedPreview(signal);
    return { withGenerated, signal };
  };

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

  const scanAndPersistRow = async (rowId: string) => {
    const row = rowsRef.current.find((item) => item.id === rowId);
    if (!row || !rowHasTranscriptSource(row)) {
      throw new Error("Add a transcript link or upload a transcript file first");
    }

    setScanningRowId(rowId);
    try {
      const scanned = await scanMeetingRow(normalizeMeetingRow(row));
      lastScannedRef.current.set(rowId, getScanKey(scanned));

      const rowsWithScan = rowsRef.current.map((item) => (item.id === rowId ? scanned : item));
      replaceRows(rowsWithScan);

      const { withGenerated, signal } = applyConcernTextPreview(rowsWithScan);
      await persist(withGenerated, signal);

      return scanned;
    } finally {
      setScanningRowId((current) => (current === rowId ? null : current));
    }
  };

  const handleScanRow = async (rowId: string) => {
    try {
      const scanned = await scanAndPersistRow(rowId);
      if (scanned.has_client_concerns) {
        toast.warning(
          `Found ${scanned.concern_keywords?.length || 0} concern keyword(s)`,
        );
      } else {
        toast.success("Scan complete — no concern keywords detected");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan for concern keywords";
      toast.error(message);
    }
  };

  const handleLinkChange = (rowId: string, value: string) => {
    updateRow(rowId, {
      transcript_link: value,
      keyword_scan_at: null,
      concern_keywords: [],
      concern_flags: [],
      concern_hits: [],
      has_client_concerns: false,
    });
    lastScannedRef.current.delete(rowId);
  };

  const handleFileUpload = async (rowId: string, file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Transcript file is too large (max 200KB)");
      return;
    }

    setUploadingRowId(rowId);
    try {
      const text = (await file.text()).trim();
      if (!text) {
        toast.error("Uploaded file is empty");
        return;
      }

      const row = rowsRef.current.find((item) => item.id === rowId);
      if (!row) return;

      const updatedRow = normalizeMeetingRow({
        ...row,
        transcript_text: text,
        transcript_link: "",
        title: row.title.trim() || file.name.replace(/\.[^.]+$/, ""),
        concern_keywords: [],
        concern_flags: [],
        concern_hits: [],
        has_client_concerns: false,
        keyword_scan_at: null,
      });

      const nextRows = rowsRef.current.map((item) => (item.id === rowId ? updatedRow : item));
      replaceRows(nextRows);

      const scanned = await scanAndPersistRow(rowId);

      if (scanned.has_client_concerns) {
        toast.warning(
          `Uploaded transcript scanned — ${scanned.concern_keywords?.length || 0} concern keyword(s) found`,
        );
      } else {
        toast.success("Transcript uploaded — no concern keywords detected");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process uploaded transcript";
      toast.error(message);
    } finally {
      setUploadingRowId(null);
    }
  };

  const handleRegenerateConcernText = async () => {
    if (validRows.length === 0) {
      toast.error("Add at least one meeting link or upload a transcript file");
      return;
    }

    setGenerating(true);
    try {
      const normalized = normalizeRows(validRows);
      const scanned = await enrichMeetingsWithConcernScan(normalized);
      const merged = mergeScannedRows(rowsRef.current, scanned);
      replaceRows(merged);

      const { withGenerated, signal } = applyConcernTextPreview(merged);
      await persist(withGenerated, signal);

      const concernMeetings = withGenerated.filter((entry) => entry.has_client_concerns).length;
      toast.success(
        concernMeetings > 0
          ? `Concern text regenerated — ${concernMeetings} meeting(s) flagged. Run Analyze Client in Retention Copilot.`
          : "Concern text regenerated. Run Analyze Client in Retention Copilot.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to regenerate concern text";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeRows(validRows);
      const scanned = await enrichMeetingsWithConcernScan(normalized);
      const merged = mergeScannedRows(rowsRef.current, scanned);
      const { withGenerated, signal } = applyConcernTextPreview(merged);
      await persist(withGenerated, signal);
      toast.success(
        "Meetings saved — concern text stored for Retention Copilot. Run Analyze Client to apply.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save meeting links";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || generating || scanningRowId !== null || uploadingRowId !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Retention meeting transcripts
        </CardTitle>
        <CardDescription>
          Scan meeting transcripts for concern keywords, then save or regenerate concern text.
          The Retention Copilot uses this alongside ActiveCollab tasks, Control Tower tasks,
          task comments, overdue deadlines, and stale work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p>
              <strong>Save meetings</strong> or <strong>Regenerate concern text</strong> stores
              keyword tags and summary text on this project. The Retention Copilot reads that on
              the next <strong>Analyze Client</strong> run, combined with delivery data from
              ActiveCollab and Control Tower.
            </p>
            {clientId && (
              <Link
                to={getClientRetentionCopilotUrl(clientId)}
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                Open Retention Copilot for this client →
              </Link>
            )}
          </AlertDescription>
        </Alert>

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
                {row.transcript_text?.trim() && !row.transcript_link.trim() && (
                  <Badge variant="outline" className="text-[10px]">
                    File uploaded
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
                disabled={isBusy || Boolean(row.transcript_text?.trim() && !row.transcript_link.trim())}
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id={`meeting-upload-${row.id}`}
                  type="file"
                  accept={ACCEPTED_TRANSCRIPT_TYPES}
                  className="hidden"
                  disabled={isBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) {
                      void handleFileUpload(row.id, file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => document.getElementById(`meeting-upload-${row.id}`)?.click()}
                >
                  {uploadingRowId === row.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload transcript
                    </>
                  )}
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  .txt, .md, .vtt, .srt — auto-scans on upload
                </span>
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Concern keywords
              </p>
              <ConcernKeywordTags row={row} />
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleScanRow(row.id)}
              disabled={isBusy || !rowHasTranscriptSource(row)}
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
            lawsuit, complaint, cancel, refund, and similar client-risk phrases.
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
          <Button variant="secondary" onClick={handleRegenerateConcernText} disabled={isBusy}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate concern text
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Generated concern text for retention copilot
          </Label>
          <Textarea
            value={generatedPreview}
            readOnly
            rows={8}
            placeholder="Add meeting transcripts to auto-generate retention signal text…"
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Updates automatically when meetings are added, scanned, or edited.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
