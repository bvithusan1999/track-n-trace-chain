import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toast configuration helpers for consistent styling across the app
 */

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  duration: number;
  className: string;
}

/**
 * Get unified toast configuration by type
 */
export function getToastConfig(type: ToastType = "success"): ToastConfig {
  const configs: Record<ToastType, ToastConfig> = {
    success: {
      duration: 3000,
      className:
        "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-l-4 border-green-500 dark:border-green-600 shadow-lg",
    },
    error: {
      duration: 4000,
      className:
        "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-l-4 border-red-500 dark:border-red-600 shadow-lg",
    },
    info: {
      duration: 3000,
      className:
        "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-l-4 border-blue-500 dark:border-blue-600 shadow-lg",
    },
    warning: {
      duration: 4000,
      className:
        "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-l-4 border-amber-500 dark:border-amber-600 shadow-lg",
    },
  };
  return configs[type];
}

/**
 * Legacy function for backward compatibility
 */
export function getSegmentAcceptanceToastConfig(
  type: "success" | "error" = "success"
): ToastConfig {
  return getToastConfig(type === "success" ? "success" : "error");
}
