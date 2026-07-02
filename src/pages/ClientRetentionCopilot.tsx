import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Play, Shield, Activity, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useClientHealth, ClientHealthSnapshot } from "@/hooks/useClientHealth";
import { HealthPortfolioSummary } from "@/components/client-health/HealthPortfolioSummary";
import { ClientHealthCard } from "@/components/client-health/ClientHealthCard";
import { ClientHealthDetailPanel } from "@/components/client-health/ClientHealthDetailPanel";

export default function ClientRetentionCopilot() {
  const {
    snapshots,
    isLoading,
    error,
    snapshotsError,
    analyzePortfolio,
    isAnalyzing,
    bandCounts,
    lastScanAt,
    monitoredCount,
  } = useClientHealth();

  const [selectedSnapshot, setSelectedSnapshot] = useState<ClientHealthSnapshot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleSelectClient = (snapshot: ClientHealthSnapshot) => {
    setSelectedSnapshot(snapshot);
    setDetailOpen(true);
  };

  const analyzedCount = snapshots.filter((s) => s.summary).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">AI Client Retention Copilot</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Autonomous account manager — monitors delivery, engagement, and analytics to predict churn
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              {monitoredCount} clients monitored
            </span>
            {lastScanAt && (
              <span>
                Last scan: {formatDistanceToNow(new Date(lastScanAt), { addSuffix: true })}
              </span>
            )}
            {analyzedCount < monitoredCount && (
              <Badge variant="secondary">{monitoredCount - analyzedCount} pending analysis</Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => analyzePortfolio()}
          disabled={isAnalyzing}
          size="lg"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isAnalyzing ? "Analyzing Portfolio..." : "Analyze Portfolio"}
        </Button>
      </div>

      {(error || snapshotsError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data load issue</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : snapshotsError}
            {snapshotsError && " — Client cards may show without AI scores until this is fixed."}
          </AlertDescription>
        </Alert>
      )}

      {monitoredCount > 0 && analyzedCount === 0 && !isAnalyzing && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Demo data is in the database — run AI analysis to see it</AlertTitle>
          <AlertDescription>
            Tasks, comments, and meetings you seeded are inputs to the copilot. They do not appear on
            cards until you click <strong>Analyze Portfolio</strong>. If analysis fails, check that
            <code className="mx-1">GEMINI_API_KEY</code> is set in Supabase → Edge Functions → Secrets.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {["ActiveCollab Tasks", "Meeting History", "GA Traffic", "HubSpot CRM"].map((source) => (
          <Badge key={source} variant="outline" className="text-xs">
            {source}
          </Badge>
        ))}
        {["Google Search Console", "Slack Alerts", "Invoice Data"].map((source) => (
          <Badge key={source} variant="secondary" className="text-xs opacity-60">
            {source} · soon
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <HealthPortfolioSummary bandCounts={bandCounts} />

          <div>
            <h2 className="text-lg font-semibold mb-4">
              Client Portfolio
              <span className="text-muted-foreground font-normal text-sm ml-2">
                sorted by churn risk
              </span>
            </h2>

            {snapshots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg">
                <p>No active clients found.</p>
                <p className="text-sm mt-1">Add clients to start monitoring retention health.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {snapshots.map((snapshot) => (
                  <ClientHealthCard
                    key={snapshot.client_id}
                    snapshot={snapshot}
                    selected={selectedSnapshot?.client_id === snapshot.client_id}
                    onClick={() => handleSelectClient(snapshot)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ClientHealthDetailPanel
        snapshot={selectedSnapshot}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
