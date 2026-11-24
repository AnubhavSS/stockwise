/** Sales (and purchase) period picker, including year-to-date. */
import { APP_NOW_ISO } from "@/lib/constants";
import {
  getPeriodBounds,
  type ReportPeriod,
} from "@/features/reports/periods";

export type SalesPeriod = ReportPeriod | "ytd";

export const salesPeriodLabel: Record<SalesPeriod, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  ytd: "This Year",
};

export function getSalesPeriodBounds(
  period: SalesPeriod,
  now = new Date(APP_NOW_ISO),
) {
  if (period !== "ytd") {
    return getPeriodBounds(period, now);
  }

  const end = new Date(now);
  const start = new Date(Date.UTC(end.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
  const previousEnd = new Date(
    Date.UTC(
      end.getUTCFullYear() - 1,
      end.getUTCMonth(),
      end.getUTCDate(),
      end.getUTCHours(),
      end.getUTCMinutes(),
      end.getUTCSeconds(),
      end.getUTCMilliseconds(),
    ),
  );
  const previousStart = new Date(Date.UTC(end.getUTCFullYear() - 1, 0, 1, 0, 0, 0, 0));

  return { start, end, previousStart, previousEnd };
}
