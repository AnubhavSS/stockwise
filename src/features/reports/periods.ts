export type ReportPeriod = "7d" | "30d" | "90d" | "ytd";

export const reportPeriodLabel: Record<ReportPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
};

export function getPeriodStart(period: ReportPeriod, now = new Date()): Date {
  const start = new Date(now);

  if (period === "ytd") {
    return new Date(now.getFullYear(), 0, 1);
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  start.setDate(start.getDate() - days);
  return start;
}
