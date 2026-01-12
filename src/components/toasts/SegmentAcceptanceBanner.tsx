import { CheckCircle2, AlertCircle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type SegmentAcceptanceBannerVariant =
  | "success"
  | "info"
  | "warning"
  | "error";

export interface SegmentAcceptanceBannerProps {
  variant: SegmentAcceptanceBannerVariant;
  title: string;
  description?: string;
  segmentId?: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  showDismiss?: boolean;
}

/**
 * Enhanced inline banner for segment acceptance feedback
 * Can be displayed above the segment list or in a dedicated notification area
 */
export function SegmentAcceptanceBanner({
  variant,
  title,
  description,
  segmentId,
  onDismiss,
  actionLabel,
  onAction,
  showDismiss = true,
}: SegmentAcceptanceBannerProps) {
  const variantStyles = {
    success: {
      container:
        "bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 dark:border-green-600",
      icon: (
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
      ),
      title: "text-green-900 dark:text-green-100",
      text: "text-green-700 dark:text-green-300",
      action: "bg-green-600 hover:bg-green-700 text-white",
    },
    info: {
      container:
        "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 dark:border-blue-600",
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: "text-blue-900 dark:text-blue-100",
      text: "text-blue-700 dark:text-blue-300",
      action: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    warning: {
      container:
        "bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 dark:border-amber-600",
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: "text-amber-900 dark:text-amber-100",
      text: "text-amber-700 dark:text-amber-300",
      action: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    error: {
      container:
        "bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 dark:border-red-600",
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      title: "text-red-900 dark:text-red-100",
      text: "text-red-700 dark:text-red-300",
      action: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-lg p-4 shadow-sm animate-in slide-in-from-top fade-in-50 duration-300",
        styles.container
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">{styles.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold text-sm mb-1", styles.title)}>
            {title}
          </h4>

          {description && (
            <p className={cn("text-sm mb-2", styles.text)}>{description}</p>
          )}

          {segmentId && (
            <div className={cn("text-xs font-mono mb-2", styles.text)}>
              <span className="opacity-75">ID:</span> {segmentId}
            </div>
          )}

          {/* Actions */}
          {(actionLabel || showDismiss) && (
            <div className="flex gap-2 mt-2">
              {actionLabel && onAction && (
                <Button
                  size="sm"
                  className={cn("text-xs h-7", styles.action)}
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              )}
              {showDismiss && onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity",
              styles.text
            )}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Success state for segment acceptance
 */
export function SegmentAcceptanceSuccessBanner({
  segmentId,
  description = "Manufacturer has been notified of your acceptance.",
  onDismiss,
}: {
  segmentId: string;
  description?: string;
  onDismiss?: () => void;
}) {
  return (
    <SegmentAcceptanceBanner
      variant="success"
      title="Segment Accepted"
      description={description}
      segmentId={segmentId}
      onDismiss={onDismiss}
      showDismiss={!!onDismiss}
    />
  );
}

/**
 * Error state for segment acceptance
 */
export function SegmentAcceptanceErrorBanner({
  segmentId,
  errorMessage = "Failed to accept segment",
  onRetry,
  onDismiss,
}: {
  segmentId: string;
  errorMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <SegmentAcceptanceBanner
      variant="error"
      title="Acceptance Failed"
      description={errorMessage}
      segmentId={segmentId}
      onDismiss={onDismiss}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
      showDismiss={!!onDismiss}
    />
  );
}
