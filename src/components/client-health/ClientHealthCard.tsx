import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientHealthSnapshot } from "@/hooks/useClientHealth";
import { getBandConfig } from "./HealthPortfolioSummary";
import { cn } from "@/lib/utils";

interface ClientHealthCardProps {
  snapshot: ClientHealthSnapshot;
  selected?: boolean;
  onClick: () => void;
}

export function ClientHealthCard({ snapshot, selected, onClick }: ClientHealthCardProps) {
  const bandConfig = getBandConfig(snapshot.risk_band);
  const clientName = snapshot.client?.name || "Unknown Client";
  const company = snapshot.client?.company;
  const churnPct = Math.round(snapshot.churn_probability * 100);
  const hasAnalysis = !!snapshot.summary;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary shadow-md",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{clientName}</h3>
            {company && (
              <p className="text-sm text-muted-foreground truncate">{company}</p>
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
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground italic">
            Not yet analyzed — run portfolio scan
          </p>
        )}
      </CardContent>
    </Card>
  );
}
