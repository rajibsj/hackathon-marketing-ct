import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Link as LinkIcon, Plus, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RetentionMeetingEntry,
  applyGeneratedTextToMeetings,
  buildRetentionMeetingSignalText,
  createEmptyRetentionMeeting,
  parseRetentionMeetings,
} from "@/lib/retentionMeetingText";

interface ProjectRetentionMeetingsProps {
  projectId: string;
  meetings?: unknown;
  signalText?: string | null;
  onSaved?: (payload: {
    meetings: RetentionMeetingEntry[];
    signalText: string | null;
  }) => void;
}

export function ProjectRetentionMeetings({
  projectId,
  meetings,
  signalText,
  onSaved,
}: ProjectRetentionMeetingsProps) {
  const [rows, setRows] = useState<RetentionMeetingEntry[]>([]);
  const [generatedPreview, setGeneratedPreview] = useState(signalText ?? "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const parsed = parseRetentionMeetings(meetings);
    setRows(parsed.length > 0 ? parsed : [createEmptyRetentionMeeting()]);
    setGeneratedPreview(signalText ?? "");
  }, [meetings, signalText]);

  const updateRow = (id: string, patch: Partial<RetentionMeetingEntry>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = validRows.map((row) => ({
        ...row,
        title: row.title.trim(),
        transcript_link: row.transcript_link.trim(),
        transcript_text: row.transcript_text?.trim() || null,
      }));

      await persist(payload, generatedPreview.trim() || null);
      toast.success("Meeting links saved");
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
      const withGenerated = applyGeneratedTextToMeetings(
        validRows.map((row) => ({
          ...row,
          title: row.title.trim(),
          transcript_link: row.transcript_link.trim(),
          transcript_text: row.transcript_text?.trim() || null,
        })),
      );
      const signal = buildRetentionMeetingSignalText(withGenerated);

      setRows(withGenerated);
      setGeneratedPreview(signal);
      await persist(withGenerated, signal);
      toast.success("Retention copilot text generated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate retention text";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Retention meeting transcripts
        </CardTitle>
        <CardDescription>
          Meeting links and dates for this project — used by the retention copilot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Meeting {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.id)}
                className="text-destructive hover:text-destructive"
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
                  disabled={saving || generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`meeting-date-${row.id}`}>Meeting date</Label>
                <Input
                  id={`meeting-date-${row.id}`}
                  type="date"
                  value={row.meeting_date?.slice(0, 10) || ""}
                  onChange={(e) => updateRow(row.id, { meeting_date: e.target.value })}
                  disabled={saving || generating}
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
                onChange={(e) => updateRow(row.id, { transcript_link: e.target.value })}
                disabled={saving || generating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`meeting-text-${row.id}`}>Transcript text (optional)</Label>
              <Textarea
                id={`meeting-text-${row.id}`}
                placeholder="Paste transcript text here if the link cannot be fetched automatically"
                value={row.transcript_text || ""}
                onChange={(e) => updateRow(row.id, { transcript_text: e.target.value })}
                disabled={saving || generating}
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addRow} disabled={saving || generating}>
          <Plus className="mr-2 h-4 w-4" />
          Add meeting
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={saving || generating}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save meetings"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleGenerate}
            disabled={saving || generating}
          >
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
