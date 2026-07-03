import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecoveryTaskClientSummary } from "@/hooks/useClientHealth";
import { RecoveryTaskList } from "./RecoveryTaskList";
import { ChevronDown, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientRecoveryTasksExpandableProps {
  clientId: string;
  summary?: RecoveryTaskClientSummary;
  defaultOpen?: boolean;
}

function stopCardClick(event: React.MouseEvent) {
  event.stopPropagation();
}

export function ClientRecoveryTasksExpandable({
  clientId,
  summary,
  defaultOpen = false,
}: ClientRecoveryTasksExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const total = summary?.total ?? 0;
  const pending = summary?.pending ?? 0;
  const ongoing = summary?.ongoing ?? 0;

  const label =
    total === 0
      ? "View recovery tasks"
      : `${total} recovery task${total === 1 ? "" : "s"}`;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between h-9"
          onClick={stopCardClick}
        >
          <span className="flex items-center gap-2 min-w-0">
            <ListTodo className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
            {pending > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {pending} pending
              </Badge>
            )}
            {ongoing > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {ongoing} ongoing
              </Badge>
            )}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className="mt-2"
        onClick={stopCardClick}
        onPointerDown={stopCardClick}
      >
        <RecoveryTaskList
          clientId={clientId}
          compact
          defaultFilter="all"
          enabled={open}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
