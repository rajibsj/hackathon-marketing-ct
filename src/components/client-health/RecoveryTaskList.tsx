import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RecoveryTaskFilter,
  useRecoveryTasks,
  useCompleteRecoveryTask,
  useStartRecoveryTask,
  RECOVERY_TITLE_PREFIX,
} from "@/hooks/useClientHealth";
import { ManualRecoveryTaskInput } from "./ManualRecoveryTaskInput";
import { format } from "date-fns";
import { CheckCircle2, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecoveryTaskListProps {
  clientId?: string;
  projectId?: string | null;
  showClientName?: boolean;
  compact?: boolean;
  defaultFilter?: RecoveryTaskFilter;
  enabled?: boolean;
}

const FILTERS: { value: RecoveryTaskFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

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

export function RecoveryTaskList({
  clientId,
  projectId,
  showClientName = false,
  compact = false,
  defaultFilter = "pending",
  enabled = true,
}: RecoveryTaskListProps) {
  const [filter, setFilter] = useState<RecoveryTaskFilter>(defaultFilter);
  const { data: tasks = [], isLoading } = useRecoveryTasks(clientId, filter, enabled);
  const completeTask = useCompleteRecoveryTask();
  const startTask = useStartRecoveryTask();

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {clientId && (
        <ManualRecoveryTaskInput
          clientId={clientId}
          projectId={projectId}
          compact={compact}
        />
      )}

      <Tabs value={filter} onValueChange={(value) => setFilter(value as RecoveryTaskFilter)}>
        <TabsList className={cn("grid w-full grid-cols-4", compact ? "h-8" : "h-9")}>
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="text-xs">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className={cn("flex justify-center", compact ? "py-4" : "py-6")}>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <p
          className={cn(
            "text-sm text-muted-foreground text-center border rounded-lg",
            compact ? "py-3 px-2" : "py-4",
          )}
        >
          No {filter} recovery tasks
          {clientId ? " for this client" : ""}.
        </p>
      ) : (
        <ul className={cn(compact ? "space-y-1.5" : "space-y-2")}>
          {tasks.map((task) => (
            <li
              key={task.id}
              className={cn("border rounded-lg text-sm", compact ? "p-2" : "p-3")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className={cn("font-medium", compact && "text-xs leading-snug")}>
                    {displayTitle(task.title)}
                  </div>
                  {showClientName && task.client?.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{task.client.name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {statusLabel(task.status)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <span className="text-[10px] text-muted-foreground">
                        Due {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn("flex shrink-0", compact ? "flex-row gap-1" : "flex-col gap-1")}>
                  {task.status === "todo" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(compact && "h-7 px-2 text-xs")}
                      disabled={startTask.isPending}
                      onClick={() => startTask.mutate(task.id)}
                    >
                      <PlayCircle className={cn("h-3.5 w-3.5", !compact && "mr-1")} />
                      {!compact && "Start"}
                    </Button>
                  )}
                  {task.status !== "completed" && (
                    <Button
                      size="sm"
                      className={cn(compact && "h-7 px-2 text-xs")}
                      disabled={completeTask.isPending}
                      onClick={() => completeTask.mutate(task.id)}
                    >
                      <CheckCircle2 className={cn("h-3.5 w-3.5", !compact && "mr-1")} />
                      {!compact && "Complete"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(compact && "h-7 px-2 text-xs")}
                    asChild
                  >
                    <Link to={`/tasks/${task.id}`}>
                      <ExternalLink className={cn("h-3.5 w-3.5", !compact && "mr-1")} />
                      {!compact && "Open"}
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
