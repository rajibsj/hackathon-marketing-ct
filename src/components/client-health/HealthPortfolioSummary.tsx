import { Card, CardContent } from "@/components/ui/card";
import { RiskBand } from "@/hooks/useClientHealth";

const BAND_CONFIG: Record<RiskBand, { label: string; emoji: string; color: string; bg: string }> = {
  healthy: { label: "Healthy", emoji: "🟢", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  stable: { label: "Stable", emoji: "🟡", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  watch: { label: "Watch", emoji: "🟡", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  critical: { label: "Critical", emoji: "🔴", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  immediate: { label: "Immediate", emoji: "🔴", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const BANDS: RiskBand[] = ["healthy", "stable", "watch", "critical", "immediate"];

interface HealthPortfolioSummaryProps {
  bandCounts: Partial<Record<RiskBand, number>>;
}

export function HealthPortfolioSummary({ bandCounts }: HealthPortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {BANDS.map((band) => {
        const config = BAND_CONFIG[band];
        const count = bandCounts[band] || 0;
        return (
          <Card key={band} className={`border ${config.bg}`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className={`text-sm font-medium ${config.color}`}>
                {config.emoji} {config.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function getBandConfig(band: RiskBand) {
  return BAND_CONFIG[band] || BAND_CONFIG.stable;
}

export { BAND_CONFIG };
