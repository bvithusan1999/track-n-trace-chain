import { toast } from "sonner";
import {
  ToastMessage,
  type ToastMessageType,
} from "@/components/toasts/ToastMessage";
import { getToastConfig } from "@/components/toasts/toastConfig";

/**
 * Unified toast notification helper for consistent app-wide notifications
 * Usage: const { showSuccess, showError, showInfo, showWarning } = useAppToast();
 */
export function useAppToast() {
  return {
    /**
     * Show success notification
     * @example showSuccess("Product created successfully")
     */
    showSuccess: (message: string) => {
      const config = getToastConfig("success");
      toast.success(<ToastMessage message={message} type="success" />, config);
    },

    /**
     * Show error notification
     * @example showError("Failed to save changes")
     */
    showError: (message: string) => {
      const config = getToastConfig("error");
      toast.error(<ToastMessage message={message} type="error" />, config);
    },

    /**
     * Show info notification
     * @example showInfo("Processing your request")
     */
    showInfo: (message: string) => {
      const config = getToastConfig("info");
      toast.info(<ToastMessage message={message} type="info" />, config);
    },

    /**
     * Show warning notification
     * @example showWarning("This action cannot be undone")
     */
    showWarning: (message: string) => {
      const config = getToastConfig("warning");
      toast.warning(<ToastMessage message={message} type="warning" />, config);
    },
  };
}

export default useAppToast;
