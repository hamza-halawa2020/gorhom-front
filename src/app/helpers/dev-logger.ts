import {environment} from "../../environments/environment";

const isDevelopment =
  environment.environment === "dev" || environment.environment === "staging";

/**
 * Development-only logging utility
 * Simple functions for different log levels
 */
export function logInfo(context: string, data?: any): void {
  if (!isDevelopment) return;
  // console.log(
  //   `%c[Info] ${context}`,
  //   "color: #4CAF50; font-weight: bold;",
  //   data || ""
  // );
}

export function logWarn(context: string, data?: any): void {
  if (!isDevelopment) return;
  console.warn(
    `%c[Warn] ${context}`,
    "color: #FF9800; font-weight: bold;",
    data || ""
  );
}

export function logError(context: string, data?: any): void {
  if (!isDevelopment) return;
  console.error(
    `%c[Error] ${context}`,
    "color: #F44336; font-weight: bold;",
    data || ""
  );
}
