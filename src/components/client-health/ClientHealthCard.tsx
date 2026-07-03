import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientHealthSnapshot, RecoveryTask, RecoveryTaskClientSummary } from "@/hooks/useClientHealth";
import { getBandConfig } from "./HealthPortfolioSummary";
import { ClientRecoveryTasksList } from "./ClientRecoveryTasksList";
import { parseProjectBreakdown, countMeetingConcernKeywords } from "./ClientProjectConcerns";
import { RecoveryTaskCountBadge } from "./RecoveryTasksPortfolio";
import { cn } from "@/lib/utils";
import { Loader2, Play } from "lucide-react";

interface ClientHealthCardProps {
  snapshot: ClientHealthSnapshot;
  selected?: boolean;
  onClick: () => void;
  onAnalyze?: (clientId: string) => void;
  isAnalyzingClient?: boolean;
  isAnalyzingAll?: boolean;
  recoverySummary?: RecoveryTaskClientSummary;
  recoveryTasks?: RecoveryTask[];
  recoveryTasksLoading?: boolean;
  recoveryTasksError?: boolean;
}

export function ClientHealthCard({
  snapshot,
  selected,
  onClick,
  onAnalyze,
  isAnalyzingClient = false,
  isAnalyzingAll = false,
  recoverySummary,
  recoveryTasks = [],
  recoveryTasksLoading = false,
  recoveryTasksError = false,
}: ClientHealthCardProps) {
  const bandConfig = getBandConfig(snapshot.risk_band);
  const clientName = snapshot.client?.name || "Unknown Client";
  const company = snapshot.client?.company;
  const churnPct = Math.round(snapshot.churn_probability * 100);
  const hasAnalysis = !!snapshot.summary;
  const pending = recoverySummary?.pending ?? 0;
  const ongoing = recoverySummary?.ongoing ?? 0;
  const projectBreakdown = parseProjectBreakdown(snapshot.signals);
  const projectConcernCount = projectBreakdown.reduce(
    (sum, project) => sum + (project.concerns?.length ?? 0),
    0,
  );
  const meetingKeywordCount = countMeetingConcernKeywords(projectBreakdown);
  const primaryProjectId = (snapshot.signals?.primary_project_id as string) || null;
  const analyzeDisabled = isAnalyzingClient || isAnalyzingAll;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        selected && "ring-2 ring-primary shadow-md",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <button
          type="button"
          className="w-full text-left cursor-pointer rounded-md -m-1 p-1 hover:bg-muted/40 transition-colors"
          onClick={onClick}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{clientName}</h3>
              {company && (
                <p className="text-sm text-muted-foreground truncate">{company}</p>
              )}
              {projectBreakdown.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {projectBreakdown.length} project{projectBreakdown.length === 1 ? "" : "s"}
                  {projectConcernCount > 0
                    ? ` · ${projectConcernCount} concern${projectConcernCount === 1 ? "" : "s"}`
                    : ""}
                  {meetingKeywordCount > 0
                    ? ` · ${meetingKeywordCount} meeting keyword${meetingKeywordCount === 1 ? "" : "s"}`
                    : ""}
                </p>
              )}
              {snapshot.client?.status && snapshot.client.status !== "active" && (
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {snapshot.client.status}
                </Badge>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold">{snapshot.health_score}</div>
              <Badge variant="outline" className={cn("text-xs", bandConfig.color)}>
                {bandConfig.emoji} {bandConfig.label}
              </Badge>
            </div>
          </div>

          {hasAnalysis ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground line-clamp-2">
                {snapshot.summary}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-destructive">{churnPct}% churn risk</span>
                {snapshot.churn_window_days && (
                  <span>· {snapshot.churn_window_days}d window</span>
                )}
              </div>
              <RecoveryTaskCountBadge pending={pending} ongoing={ongoing} />
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground italic">
              Not yet analyzed — run analysis for this client
            </p>
          )}
        </button>

        {onAnalyze && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={analyzeDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onAnalyze(snapshot.client_id);
            }}
          >
            {isAnalyzingClient ? (
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-2" />
            )}
            {isAnalyzingClient
              ? "Analyzing..."
              : hasAnalysis
                ? "Re-analyze Client"
                : "Analyze Client"}
          </Button>
        )}

        <ClientRecoveryTasksList
          clientId={snapshot.client_id}
          projectId={primaryProjectId}
          tasks={recoveryTasks}
          isLoading={recoveryTasksLoading}
          isError={recoveryTasksError}
          className="pt-3 border-t"
        />
      </CardContent>
    </Card>
  );
}
