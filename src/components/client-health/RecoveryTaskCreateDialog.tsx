import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateManualRecoveryTask } from "@/hooks/useClientHealth";
import { Loader2, ListTodo } from "lucide-react";

export interface RecoveryTaskCreateDefaults {
  title: string;
  description?: string;
  concernText?: string;
  projectId?: string | null;
  contextLabel?: string;
}

interface RecoveryTaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  defaults: RecoveryTaskCreateDefaults | null;
  onCreated?: () => void;
}

export function suggestRecoveryTitleFromConcern(concern: string, projectName?: string): string {
  const trimmed = concern.trim();
  if (!trimmed) return "Recovery action";
  const prefix = projectName ? `${projectName}: ` : "";
  const body = trimmed.length > 72 ? `${trimmed.slice(0, 72)}…` : trimmed;
  return `${prefix}${body}`;
}

export function RecoveryTaskCreateDialog({
  open,
  onOpenChange,
  clientId,
  defaults,
  onCreated,
}: RecoveryTaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTask = useCreateManualRecoveryTask();

  useEffect(() => {
    if (!open || !defaults) return;
    setTitle(defaults.title);
    setDescription(defaults.description ?? "");
  }, [open, defaults]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    await createTask.mutateAsync({
      clientId,
      title: title.trim(),
      description: description.trim() || undefined,
      concernText: defaults?.concernText,
      projectId: defaults?.projectId,
    });

    onCreated?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Create recovery task
            </DialogTitle>
            <DialogDescription>
              {defaults?.contextLabel
                ? `Add a recovery task for: ${defaults.contextLabel}`
                : "Name and describe the recovery action before creating the task."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-task-title">Task name</Label>
              <Input
                id="recovery-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Recovery task title"
                autoFocus
                disabled={createTask.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recovery-task-description">Details</Label>
              <Textarea
                id="recovery-task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What needs to be done to address this concern?"
                rows={4}
                disabled={createTask.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createTask.isPending}>
              {createTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
