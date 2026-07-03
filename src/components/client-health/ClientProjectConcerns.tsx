import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FolderKanban, ListTodo, MessageSquareQuote } from "lucide-react";
import {
  RecoveryTaskCreateDialog,
  suggestRecoveryTitleFromConcern,
} from "./RecoveryTaskCreateDialog";

export interface ProjectBreakdown {
  project_id: string;
  project_name: string;
  activecollab_linked?: boolean;
  control_tower_linked?: boolean;
  open_tasks?: number;
  overdue_count?: number;
  approaching_deadline_count?: number;
  stale_count?: number;
  overdue_tasks?: Array<{ title?: string; due_date?: string; source?: string }>;
  approaching_deadlines?: Array<{ title?: string; due_date?: string; source?: string }>;
  recent_comments?: Array<{ text?: string; task_title?: string; task_due_date?: string }>;
  meetings?: Array<{
    subject?: string;
    date?: string;
    concern_keywords?: string[];
    has_client_concerns?: boolean;
  }>;
  meeting_concern_keywords?: string[];
  meeting_concern_count?: number;
  meeting_concern_flags?: string[];
  concerns?: string[];
}

export function parseProjectBreakdown(signals: Record<string, unknown>): ProjectBreakdown[] {
  const raw = signals.project_breakdown;
  if (!Array.isArray(raw)) return [];
  return raw as ProjectBreakdown[];
}

export function countMeetingConcernKeywords(projects: ProjectBreakdown[]): number {
  return projects.reduce(
    (sum, project) => sum + (project.meeting_concern_count ?? project.meeting_concern_keywords?.length ?? 0),
    0,
  );
}

interface ClientProjectConcernsProps {
  signals: Record<string, unknown>;
  clientId?: string;
}

export function ClientProjectConcerns({ signals, clientId }: ClientProjectConcernsProps) {
  const projects = parseProjectBreakdown(signals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDefaults, setDialogDefaults] = useState<{
    title: string;
    description?: string;
    projectId?: string | null;
    contextLabel?: string;
  } | null>(null);

  if (projects.length === 0) return null;

  const withConcerns = projects.filter((p) => (p.concerns?.length ?? 0) > 0);
  const meetingKeywordTotal = countMeetingConcernKeywords(projects);

  const openConcernDialog = (
    concern: string,
    project: ProjectBreakdown,
  ) => {
    const projectId = project.project_id !== "unassigned" ? project.project_id : null;
    setDialogDefaults({
      title: suggestRecoveryTitleFromConcern(concern, project.project_name),
      description: concern,
      concernText: concern,
      projectId,
      contextLabel: project.project_name,
    });
    setDialogOpen(true);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <FolderKanban className="h-4 w-4 text-primary" />
        Project-wise concerns
        {meetingKeywordTotal > 0 && (
          <Badge variant="destructive" className="text-[10px] font-normal">
            {meetingKeywordTotal} meeting keyword{meetingKeywordTotal === 1 ? "" : "s"}
          </Badge>
        )}
      </h4>
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.project_id} className="border rounded-lg p-3 text-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{project.project_name}</div>
              <div className="flex flex-wrap gap-1 justify-end">
                {project.activecollab_linked && (
                  <Badge variant="outline" className="text-[10px]">ActiveCollab</Badge>
                )}
                {project.control_tower_linked && (
                  <Badge variant="outline" className="text-[10px]">Control Tower</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{project.open_tasks ?? 0} open</span>
              {(project.overdue_count ?? 0) > 0 && (
                <span className="text-destructive">{project.overdue_count} overdue</span>
              )}
              {(project.approaching_deadline_count ?? 0) > 0 && (
                <span>{project.approaching_deadline_count} due soon</span>
              )}
              {(project.stale_count ?? 0) > 0 && (
                <span className="text-destructive">{project.stale_count} stale</span>
              )}
              {(project.meeting_concern_count ?? 0) > 0 && (
                <span className="text-destructive">
                  {project.meeting_concern_count} meeting concern keyword
                  {(project.meeting_concern_count ?? 0) === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {(project.meeting_concern_keywords?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1.5 text-destructive">
                  <MessageSquareQuote className="h-3.5 w-3.5" />
                  Meeting transcript keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.meeting_concern_keywords!.map((keyword) => (
                    <Badge key={`${project.project_id}-${keyword}`} variant="outline" className="text-[10px]">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(project.concerns?.length ?? 0) > 0 ? (
              <ul className="space-y-2">
                {project.concerns!.map((concern, i) => (
                  <li key={i} className="rounded-md border border-border/60 p-2 space-y-2">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="flex-1">{concern}</span>
                    </div>
                    {clientId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => openConcernDialog(concern, project)}
                      >
                        <ListTodo className="h-3 w-3 mr-1.5" />
                        Create recovery task
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No major delivery concerns flagged.</p>
            )}
          </div>
        ))}
      </div>
      {withConcerns.length === 0 && projects.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          All {projects.length} project{projects.length === 1 ? "" : "s"} look stable on delivery signals.
        </p>
      )}

      {clientId && (
        <RecoveryTaskCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clientId={clientId}
          defaults={dialogDefaults}
        />
      )}
    </div>
  );
}
