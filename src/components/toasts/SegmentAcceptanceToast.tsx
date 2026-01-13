import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentAcceptanceToastProps {
  type?: "success" | "error";
}

/**
 * Minimal toast component for shipment acceptance notifications
 * Clean and visually appealing with simple messaging
 */
export function SegmentAcceptanceToast({
  type = "success",
}: SegmentAcceptanceToastProps) {
  const isError = type === "error";

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Icon */}
      {isError ? (
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      ) : (
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
        </div>
      )}

      {/* Text */}
      <span
        className={cn(
          "font-medium text-sm",
          isError
            ? "text-red-900 dark:text-red-100"
            : "text-green-900 dark:text-green-100"
        )}
      >
        {isError ? "Failed to Accept" : "Shipment Accepted"}
      </span>
    </div>
  );
}
