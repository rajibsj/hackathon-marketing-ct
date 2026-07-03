import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RecoveryTask, RECOVERY_TITLE_PREFIX } from "@/hooks/useClientHealth";
import { ManualRecoveryTaskInput } from "./ManualRecoveryTaskInput";
import { format } from "date-fns";
import { ChevronRight, ListTodo, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function displayTitle(title: string) {
  return title.startsWith(RECOVERY_TITLE_PREFIX)
    ? title.slice(RECOVERY_TITLE_PREFIX.length).trim()
    : title;
}

function statusLabel(status: string) {
  switch (status) {
    case "todo":
      return "Pending";
    case "in_progress":
      return "Ongoing";
    case "review":
      return "In review";
    case "blocked":
      return "Blocked";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function statusVariant(status: string): "destructive" | "secondary" | "outline" {
  if (status === "todo") return "destructive";
  if (status === "completed") return "outline";
  return "secondary";
}

interface ClientRecoveryTasksListProps {
  tasks: RecoveryTask[];
  clientId?: string;
  projectId?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
  /** Show completed tasks as well as active ones */
  showCompleted?: boolean;
}

export function ClientRecoveryTasksList({
  tasks,
  clientId,
  projectId,
  isLoading = false,
  isError = false,
  className,
  showCompleted = false,
}: ClientRecoveryTasksListProps) {
  const visibleTasks = showCompleted
    ? tasks
    : tasks.filter((task) => task.status !== "completed");

  return (
    <div
      className={cn("space-y-2", className)}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <ListTodo className="h-3.5 w-3.5 text-primary" />
        Recovery Tasks
        {visibleTasks.length > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal normal-case">
            {visibleTasks.length}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="text-xs text-destructive">Could not load recovery tasks.</p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1.5">
          {tasks.length > 0
            ? "All recovery tasks completed."
            : "No recovery tasks yet — add one below or create from recommended actions."}
        </p>
      ) : (
        <ul className="space-y-1">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <Link
                to={`/tasks/${task.id}`}
                className="group flex items-center gap-2 rounded-md border bg-muted/20 px-2.5 py-2 text-xs hover:bg-muted/50 hover:border-primary/30 transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="font-medium leading-snug line-clamp-2 group-hover:text-primary">
                    {displayTitle(task.title)}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={statusVariant(task.status)} className="text-[10px] px-1 py-0">
                      {statusLabel(task.status)}
                    </Badge>
                    {task.due_date && (
                      <span className="text-[10px] text-muted-foreground">
                        Due {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {clientId && (
        <ManualRecoveryTaskInput
          clientId={clientId}
          projectId={projectId}
          compact
        />
      )}
    </div>
  );
}
