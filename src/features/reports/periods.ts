import { APP_NOW_ISO } from "@/lib/constants";

export type ReportPeriod = "7d" | "30d" | "90d";

export const reportPeriodLabel: Record<ReportPeriod, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
};

export function getPeriodLength(period: ReportPeriod): number {
  return period === "7d" ? 7 : period === "30d" ? 30 : 90;
}

export function getPeriodStart(period: ReportPeriod, now = new Date(APP_NOW_ISO)): Date {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (getPeriodLength(period) - 1));
  return start;
}

export function getPeriodBounds(period: ReportPeriod, now = new Date(APP_NOW_ISO)) {
  const end = new Date(now);
  const start = getPeriodStart(period, now);
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = getPeriodStart(period, previousEnd);

  return { start, end, previousStart, previousEnd };
}
