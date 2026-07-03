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
import { RecommendedAction, useCreateRecoveryTasks } from "@/hooks/useClientHealth";
import { Loader2, ListTodo } from "lucide-react";

interface EditableRecoveryAction {
  title: string;
  description: string;
  priority?: string;
}

interface RecoveryTaskBatchCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  projectId?: string | null;
  actions: RecommendedAction[];
  onCreated?: () => void;
}

function toEditable(actions: RecommendedAction[]): EditableRecoveryAction[] {
  return actions.map((action) => ({
    title: action.title || "Recovery action",
    description: action.description || "",
    priority: action.priority,
  }));
}

export function RecoveryTaskBatchCreateDialog({
  open,
  onOpenChange,
  clientId,
  projectId,
  actions,
  onCreated,
}: RecoveryTaskBatchCreateDialogProps) {
  const [rows, setRows] = useState<EditableRecoveryAction[]>([]);
  const createTasks = useCreateRecoveryTasks();

  useEffect(() => {
    if (open) {
      setRows(toEditable(actions));
    }
  }, [open, actions]);

  const updateRow = (index: number, patch: Partial<EditableRecoveryAction>) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const handleSubmit = async () => {
    const payload = rows
      .filter((row) => row.title.trim())
      .map((row) => ({
        type: "create_task" as const,
        title: row.title.trim(),
        description: row.description.trim() || undefined,
        priority: row.priority,
      }));

    if (payload.length === 0) return;

    await createTasks.mutateAsync({
      clientId,
      projectId,
      actions: payload,
    });

    onCreated?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Create recovery tasks
          </DialogTitle>
          <DialogDescription>
            Edit the task name and details before creating. Tasks are linked to this client&apos;s project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {rows.map((row, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Task {index + 1}</p>
              <div className="space-y-2">
                <Label htmlFor={`batch-title-${index}`}>Task name</Label>
                <Input
                  id={`batch-title-${index}`}
                  value={row.title}
                  onChange={(e) => updateRow(index, { title: e.target.value })}
                  disabled={createTasks.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`batch-desc-${index}`}>Details</Label>
                <Textarea
                  id={`batch-desc-${index}`}
                  value={row.description}
                  onChange={(e) => updateRow(index, { description: e.target.value })}
                  rows={3}
                  disabled={createTasks.isPending}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createTasks.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createTasks.isPending || rows.every((row) => !row.title.trim())}
          >
            {createTasks.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              `Create ${rows.filter((row) => row.title.trim()).length} task${rows.length === 1 ? "" : "s"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
