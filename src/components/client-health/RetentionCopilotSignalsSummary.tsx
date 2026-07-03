import { Badge } from "@/components/ui/badge";
import { Database, MessageSquare, Calendar, Video, AlertTriangle } from "lucide-react";

interface CountBlock {
  count?: number;
}

function readCount(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Number((value as CountBlock).count) || 0;
}

interface RetentionCopilotSignalsSummaryProps {
  signals: Record<string, unknown>;
  compact?: boolean;
}

export function RetentionCopilotSignalsSummary({
  signals,
  compact = false,
}: RetentionCopilotSignalsSummaryProps) {
  const delivery = signals.delivery as Record<string, unknown> | undefined;
  const meetings = signals.meetings as Record<string, unknown> | undefined;

  const activecollabTasks = Number(signals.activecollab_task_count) || 0;
  const controlTowerTasks = Number(signals.control_tower_task_count) || 0;
  const openTasks = Number(signals.open_task_count) || 0;
  const overdueCount = readCount(delivery?.overdue_tasks ?? signals.overdue_tasks);
  const approachingCount = readCount(delivery?.approaching_deadlines);
  const staleCount = readCount(delivery?.stale_tasks ?? signals.stale_tasks);
  const negativeComments = Array.isArray(signals.negative_comment_flags)
    ? signals.negative_comment_flags.length
    : 0;
  const meetingConcernKeywords =
    Number(meetings?.project_meeting_concern_keywords) ||
    Number(meetings?.concern_keyword_count) ||
    0;
  const hasMeetingSignalText = Boolean(
    String(meetings?.retention_meeting_signal_text || "").trim(),
  );

  const items = [
    {
      label: "ActiveCollab tasks",
      value: activecollabTasks,
      icon: Database,
      highlight: activecollabTasks > 0,
    },
    {
      label: "Control Tower tasks",
      value: controlTowerTasks,
      icon: Database,
      highlight: controlTowerTasks > 0,
    },
    {
      label: "Open tasks",
      value: openTasks,
      icon: Database,
      highlight: false,
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      highlight: overdueCount > 0,
      destructive: true,
    },
    {
      label: "Due within 7 days",
      value: approachingCount,
      icon: Calendar,
      highlight: approachingCount > 0,
    },
    {
      label: "Stale (14+ days)",
      value: staleCount,
      icon: AlertTriangle,
      highlight: staleCount > 0,
      destructive: true,
    },
    {
      label: "Negative comments",
      value: negativeComments,
      icon: MessageSquare,
      highlight: negativeComments > 0,
      destructive: true,
    },
    {
      label: "Meeting concern keywords",
      value: meetingConcernKeywords,
      icon: Video,
      highlight: meetingConcernKeywords > 0,
      destructive: true,
    },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <h4 className={`font-semibold flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        <Database className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} text-primary`} />
        Data sources used in analysis
      </h4>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border p-2.5 ${compact ? "text-xs" : "text-sm"} ${
              item.destructive && item.value > 0 ? "border-destructive/40 bg-destructive/5" : "bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <item.icon className="h-3 w-3 shrink-0" />
              <span className="text-[10px] uppercase tracking-wide leading-tight">{item.label}</span>
            </div>
            <div className={`font-bold ${item.destructive && item.value > 0 ? "text-destructive" : ""}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
      {hasMeetingSignalText && (
        <Badge variant="outline" className="text-[10px]">
          Saved meeting concern text included
        </Badge>
      )}
    </div>
  );
}
