/**
 * App-wide constants.
 *
 * STORAGE_KEYS include a version suffix (v2/v3). Bump the suffix when the
 * persisted shape changes so older localStorage blobs are not mixed with new data.
 *
 * APP_NOW_ISO is the demo "current time". Sample sales, purchases, and
 * relative timestamps are written around this date so the UI looks live
 * even though the catalogue is static seed data.
 */
export const STORAGE_KEYS = {
  inventory: "stockwise-inventory-v3",
  sales: "stockwise-sales-v3",
  purchases: "stockwise-purchases-v3",
  ui: "stockwise-ui-v2",
} as const;

export const LOCALE = "en-IN";
export const CURRENCY_CODE = "INR";
export const APP_NOW_ISO = "2026-11-23T12:35:00.000Z";
