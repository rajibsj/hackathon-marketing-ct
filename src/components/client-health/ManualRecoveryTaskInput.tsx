import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateManualRecoveryTask } from "@/hooks/useClientHealth";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualRecoveryTaskInputProps {
  clientId: string;
  projectId?: string | null;
  compact?: boolean;
  className?: string;
}

function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export function ManualRecoveryTaskInput({
  clientId,
  projectId,
  compact = false,
  className,
}: ManualRecoveryTaskInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTask = useCreateManualRecoveryTask();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    stopPropagation(event);
    if (!title.trim()) return;

    await createTask.mutateAsync({
      clientId,
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
    });

    setTitle("");
    setDescription("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("w-full h-8 text-xs text-muted-foreground", className)}
        onClick={(event) => {
          stopPropagation(event);
          setExpanded(true);
        }}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add recovery task
      </Button>
    );
  }

  return (
    <form
      className={cn("space-y-2", className)}
      onSubmit={handleSubmit}
      onClick={stopPropagation}
      onPointerDown={stopPropagation}
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Recovery task title"
        className={cn(compact && "h-8 text-xs")}
        autoFocus
        disabled={createTask.isPending}
      />
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        rows={compact ? 2 : 3}
        className={cn(compact && "text-xs min-h-0")}
        disabled={createTask.isPending}
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          className={cn(compact && "h-7 text-xs")}
          disabled={!title.trim() || createTask.isPending}
        >
          {createTask.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1" />
          )}
          Add task
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(compact && "h-7 text-xs")}
          disabled={createTask.isPending}
          onClick={(event) => {
            stopPropagation(event);
            setExpanded(false);
            setTitle("");
            setDescription("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
