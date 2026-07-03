import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClientHealthSnapshot } from "@/hooks/useClientHealth";
import { getBandConfig } from "./HealthPortfolioSummary";
import { RecoveryActionBar } from "./RecoveryActionBar";
import { ClientRecoveryTasksExpandable } from "./ClientRecoveryTasksExpandable";
import { ClientProjectConcerns } from "./ClientProjectConcerns";
import { RetentionCopilotSignalsSummary } from "./RetentionCopilotSignalsSummary";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2, Lightbulb, ListTodo, Loader2, Play } from "lucide-react";

interface ClientHealthDetailPanelProps {
  snapshot: ClientHealthSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze?: (clientId: string) => void;
  isAnalyzingClient?: boolean;
  isAnalyzingAll?: boolean;
}

export function ClientHealthDetailPanel({
  snapshot,
  open,
  onOpenChange,
  onAnalyze,
  isAnalyzingClient = false,
  isAnalyzingAll = false,
}: ClientHealthDetailPanelProps) {
  if (!snapshot) return null;

  const bandConfig = getBandConfig(snapshot.risk_band);
  const clientName = snapshot.client?.name || "Client";
  const churnPct = Math.round(snapshot.churn_probability * 100);
  const primaryProjectId = (snapshot.signals?.primary_project_id as string) || null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {clientName}
            <Badge variant="outline" className={bandConfig.color}>
              {bandConfig.emoji} {bandConfig.label}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Health score {snapshot.health_score}/100 · {churnPct}% churn probability
            {snapshot.churn_window_days ? ` · ${snapshot.churn_window_days}-day window` : ""}
            {snapshot.analyzed_at && (
              <> · Analyzed {formatDistanceToNow(new Date(snapshot.analyzed_at), { addSuffix: true })}</>
            )}
          </SheetDescription>
        </SheetHeader>

        {onAnalyze && (
          <Button
            className="w-full"
            variant="outline"
            disabled={isAnalyzingClient || isAnalyzingAll}
            onClick={() => onAnalyze(snapshot.client_id)}
          >
            {isAnalyzingClient ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isAnalyzingClient
              ? "Analyzing..."
              : snapshot.summary
                ? "Re-analyze Client"
                : "Analyze Client"}
          </Button>
        )}

        <div className="mt-6 space-y-6">
          {snapshot.summary && (
            <div>
              <h4 className="text-sm font-semibold mb-2">AI Headline</h4>
              <p className="text-sm">{snapshot.summary}</p>
            </div>
          )}

          {snapshot.explanation && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Why This Score</h4>
              <p className="text-sm text-muted-foreground">{snapshot.explanation}</p>
            </div>
          )}

          {snapshot.summary && Object.keys(snapshot.signals || {}).length > 0 && (
            <RetentionCopilotSignalsSummary signals={snapshot.signals} />
          )}

          <ClientProjectConcerns signals={snapshot.signals} />

          {snapshot.root_causes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Root Causes
              </h4>
              <ul className="space-y-3">
                {snapshot.root_causes.map((cause, i) => (
                  <li key={i} className="text-sm border rounded-lg p-3">
                    <div className="font-medium">{cause.cause}</div>
                    <p className="text-muted-foreground mt-1">{cause.evidence}</p>
                    {cause.severity && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {cause.severity}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {snapshot.recovery_plan.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Recovery Plan
              </h4>
              <ol className="space-y-3">
                {snapshot.recovery_plan
                  .sort((a, b) => a.priority - b.priority)
                  .map((step, i) => (
                    <li key={i} className="text-sm border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-primary shrink-0">#{step.priority}</span>
                        <div>
                          <div className="font-medium">{step.action}</div>
                          {step.rationale && (
                            <p className="text-muted-foreground mt-1">{step.rationale}</p>
                          )}
                          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            {step.owner_hint && <span>Owner: {step.owner_hint}</span>}
                            {step.due_in_days && <span>Due in {step.due_in_days}d</span>}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          )}

          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              Recovery Tasks
            </h4>
            <ClientRecoveryTasksExpandable
              clientId={snapshot.client_id}
              projectId={primaryProjectId}
              defaultOpen
            />
          </div>

          {snapshot.recommended_actions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Recommended Actions
                </h4>
                <RecoveryActionBar
                  clientId={snapshot.client_id}
                  actions={snapshot.recommended_actions}
                  projectId={primaryProjectId}
                />
              </div>
            </>
          )}

          {!snapshot.summary && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Run portfolio analysis to generate health insights for this client.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
