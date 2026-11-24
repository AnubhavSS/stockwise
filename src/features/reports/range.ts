import { APP_NOW_ISO } from "@/lib/constants";
import { getPeriodBounds } from "@/features/reports/periods";
import { getSalesPeriodBounds } from "@/features/sales/periods";

export type AnalyticsPreset = "today" | "7d" | "30d" | "90d" | "ytd" | "custom";

export type AnalyticsRange = {
  preset: AnalyticsPreset;
  from: string;
  to: string;
};

export const analyticsPresetLabel: Record<AnalyticsPreset, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  ytd: "This Year",
  custom: "Custom Range",
};

export const ANALYTICS_PRESETS: AnalyticsPreset[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "ytd",
  "custom",
];

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function defaultAnalyticsRange(): AnalyticsRange {
  const { start, end } = getPeriodBounds("30d");
  return {
    preset: "30d",
    from: toDateInput(start),
    to: toDateInput(end),
  };
}

export function getAnalyticsBounds(
  range: AnalyticsRange,
  now = new Date(APP_NOW_ISO),
) {
  if (range.preset === "7d" || range.preset === "30d" || range.preset === "90d") {
    return getPeriodBounds(range.preset, now);
  }

  if (range.preset === "ytd") {
    return getSalesPeriodBounds("ytd", now);
  }

  if (range.preset === "today") {
    const end = new Date(now);
    const start = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 0, 0, 0, 0),
    );
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setUTCHours(0, 0, 0, 0);
    return { start, end, previousStart, previousEnd };
  }

  const from = range.from || toDateInput(getPeriodBounds("30d", now).start);
  const to = range.to || toDateInput(now);
  const start = new Date(`${from}T00:00:00.000Z`);
  let end = new Date(`${to}T23:59:59.999Z`);
  if (end.getTime() < start.getTime()) {
    end = new Date(`${from}T23:59:59.999Z`);
  }
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { start, end, previousStart, previousEnd };
}

export function applyAnalyticsPreset(
  preset: AnalyticsPreset,
  current: AnalyticsRange,
  now = new Date(APP_NOW_ISO),
): AnalyticsRange {
  if (preset === "custom") {
    return { ...current, preset };
  }
  const next = { ...current, preset };
  const { start, end } = getAnalyticsBounds(next, now);
  return {
    preset,
    from: toDateInput(start),
    to: toDateInput(end),
  };
}

export function rangeUsesMonthlyBuckets(range: AnalyticsRange, now = new Date(APP_NOW_ISO)) {
  const { start, end } = getAnalyticsBounds(range, now);
  const days = (end.getTime() - start.getTime()) / 86_400_000;
  return days > 62;
}

export function formatRangeLabel(range: AnalyticsRange, now = new Date(APP_NOW_ISO)): string {
  if (range.preset !== "custom") {
    return analyticsPresetLabel[range.preset];
  }
  const { start, end } = getAnalyticsBounds(range, now);
  return `${toDateInput(start)} to ${toDateInput(end)}`;
}
