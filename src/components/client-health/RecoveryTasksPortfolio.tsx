import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientHealthSnapshot } from "@/hooks/useClientHealth";
import { RecoveryTaskList } from "./RecoveryTaskList";
import { ListTodo } from "lucide-react";

interface RecoveryTasksPortfolioProps {
  snapshots: ClientHealthSnapshot[];
  onSelectClient?: (snapshot: ClientHealthSnapshot) => void;
}

export function RecoveryTasksPortfolio({
  snapshots,
  onSelectClient,
}: RecoveryTasksPortfolioProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  const clientOptions = useMemo(
    () =>
      snapshots.map((snapshot) => ({
        id: snapshot.client_id,
        name: snapshot.client?.name || "Unknown client",
      })),
    [snapshots],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="h-5 w-5" />
              Recovery Tasks
            </CardTitle>
            <CardDescription>
              Track pending, ongoing, and completed recovery work across clients
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {clientOptions.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClientId !== "all" && onSelectClient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const snapshot = snapshots.find((s) => s.client_id === selectedClientId);
                  if (snapshot) onSelectClient(snapshot);
                }}
              >
                Client details
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RecoveryTaskList
          clientId={selectedClientId === "all" ? undefined : selectedClientId}
          showClientName={selectedClientId === "all"}
          defaultFilter="pending"
        />
      </CardContent>
    </Card>
  );
}

export function RecoveryTaskCountBadge({
  pending,
  ongoing,
}: {
  pending: number;
  ongoing: number;
}) {
  if (pending === 0 && ongoing === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {pending > 0 && (
        <Badge variant="destructive" className="text-xs">
          {pending} pending recovery
        </Badge>
      )}
      {ongoing > 0 && (
        <Badge variant="secondary" className="text-xs">
          {ongoing} ongoing
        </Badge>
      )}
    </div>
  );
}
