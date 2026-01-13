import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastMessageType = "success" | "error" | "info" | "warning";

export interface ToastMessageProps {
  message: string;
  type?: ToastMessageType;
}

/**
 * Unified minimal toast message component used across the app
 * Simple icon + text, clean and consistent
 */
export function ToastMessage({ message, type = "success" }: ToastMessageProps) {
  const iconMap = {
    success: (
      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
    ),
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    warning: (
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    ),
  };

  const textColorMap = {
    success: "text-green-900 dark:text-green-100",
    error: "text-red-900 dark:text-red-100",
    info: "text-blue-900 dark:text-blue-100",
    warning: "text-amber-900 dark:text-amber-100",
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <span className={cn("font-medium text-sm", textColorMap[type])}>
        {message}
      </span>
    </div>
  );
}

export default ToastMessage;
