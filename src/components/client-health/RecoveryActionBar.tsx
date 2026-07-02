import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RecommendedAction, useCreateRecoveryTasks } from "@/hooks/useClientHealth";
import { Loader2, ListTodo, Mail, MessageSquare } from "lucide-react";

interface RecoveryActionBarProps {
  clientId: string;
  actions: RecommendedAction[];
  projectId?: string | null;
}

export function RecoveryActionBar({ clientId, actions, projectId }: RecoveryActionBarProps) {
  const createTasks = useCreateRecoveryTasks();
  const taskActions = actions.filter((a) => a.type === "create_task");
  const emailActions = actions.filter((a) => a.type === "draft_email");
  const slackActions = actions.filter((a) => a.type === "slack_notify");

  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    taskActions.map((_, i) => i),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleTask = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleCreateTasks = async () => {
    const selected = selectedIndices.map((i) => taskActions[i]);
    await createTasks.mutateAsync({
      clientId,
      actions: selected,
      projectId,
    });
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-4">
      {taskActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recovery Tasks
          </p>
          {taskActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border rounded-lg p-3 text-sm"
            >
              <Checkbox
                checked={selectedIndices.includes(i)}
                onCheckedChange={() => toggleTask(i)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{action.title}</div>
                {action.description && (
                  <p className="text-muted-foreground mt-1">{action.description}</p>
                )}
                {action.priority && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {action.priority}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={selectedIndices.length === 0 || createTasks.isPending}
            className="w-full"
          >
            {createTasks.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ListTodo className="h-4 w-4 mr-2" />
            )}
            Create {selectedIndices.length} Recovery Task{selectedIndices.length === 1 ? "" : "s"}
          </Button>
        </div>
      )}

      {emailActions.map((action, i) => (
        <div key={`email-${i}`} className="border rounded-lg p-3 text-sm opacity-60">
          <div className="flex items-center gap-2 font-medium">
            <Mail className="h-4 w-4" />
            {action.subject || "Draft recovery email"}
            <Badge variant="outline" className="text-xs ml-auto">Coming soon</Badge>
          </div>
          {action.body && (
            <p className="text-muted-foreground mt-2 line-clamp-3">{action.body}</p>
          )}
        </div>
      ))}

      {slackActions.map((action, i) => (
        <div key={`slack-${i}`} className="border rounded-lg p-3 text-sm opacity-60">
          <div className="flex items-center gap-2 font-medium">
            <MessageSquare className="h-4 w-4" />
            Slack alert
            <Badge variant="outline" className="text-xs ml-auto">Coming soon</Badge>
          </div>
          {action.message && (
            <p className="text-muted-foreground mt-2">{action.message}</p>
          )}
        </div>
      ))}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create recovery tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create {selectedIndices.length} task{selectedIndices.length === 1 ? "" : "s"} in the
              client&apos;s project. You can review and assign them after creation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateTasks} disabled={createTasks.isPending}>
              {createTasks.isPending ? "Creating..." : "Create Tasks"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
