import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectTask } from "@/hooks/useProjectTasks";
import { CheckCircle2, Loader2, PlayCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const TASK_STATUS_LABELS: Record<ProjectTask["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  completed: "Completed",
  blocked: "Blocked",
};

export const TASK_STATUS_COLORS: Record<ProjectTask["status"], string> = {
  todo: "bg-slate-100 text-slate-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

interface TaskStatusActionsProps {
  status: ProjectTask["status"];
  onStatusChange: (status: ProjectTask["status"]) => void;
  isUpdating?: boolean;
  layout?: "buttons" | "select" | "both";
  className?: string;
}

export function TaskStatusActions({
  status,
  onStatusChange,
  isUpdating = false,
  layout = "both",
  className,
}: TaskStatusActionsProps) {
  const showButtons = layout === "buttons" || layout === "both";
  const showSelect = layout === "select" || layout === "both";

  return (
    <div className={cn("space-y-3", className)}>
      {showButtons && (
        <div className="flex flex-wrap gap-2">
          {status === "todo" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating}
                onClick={() => onStatusChange("in_progress")}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                Start Task
              </Button>
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange("completed")}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark Complete
              </Button>
            </>
          )}

          {(status === "in_progress" || status === "review" || status === "blocked") && (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange("completed")}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark Complete
            </Button>
          )}

          {status === "completed" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onStatusChange("todo")}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reopen Task
            </Button>
          )}
        </div>
      )}

      {showSelect && (
        <div className="space-y-2">
          {layout === "both" && (
            <p className="text-xs text-muted-foreground">Or change status</p>
          )}
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as ProjectTask["status"])}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_STATUS_LABELS) as ProjectTask["status"][]).map((value) => (
                <SelectItem key={value} value={value}>
                  {TASK_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function TaskStatusBadge({ status }: { status: ProjectTask["status"] }) {
  return (
    <Badge variant="outline" className={cn("text-sm", TASK_STATUS_COLORS[status])}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
