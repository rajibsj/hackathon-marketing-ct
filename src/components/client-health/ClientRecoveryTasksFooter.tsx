import { ClientRecoveryTasksList } from "./ClientRecoveryTasksList";
import { useRecoveryTasks } from "@/hooks/useClientHealth";

interface ClientRecoveryTasksFooterProps {
  clientId: string;
}

/** @deprecated Prefer passing tasks from useRecoveryTasksPortfolio into ClientRecoveryTasksList */
export function ClientRecoveryTasksFooter({ clientId }: ClientRecoveryTasksFooterProps) {
  const { data: tasks = [], isLoading, isError } = useRecoveryTasks(clientId, "all", true);

  return (
    <ClientRecoveryTasksList
      tasks={tasks}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
