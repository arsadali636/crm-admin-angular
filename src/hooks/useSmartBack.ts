import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";

export interface SmartBackOptions {
  fallback?: string;
  onBeforeBack?: () => boolean | Promise<boolean>;
}

export function useSmartBack() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(
    async (options?: SmartBackOptions | string) => {
      const fallbackPath =
        typeof options === "string"
          ? options
          : options?.fallback || "/dashboard";

      const onBeforeBack =
        typeof options === "object" ? options?.onBeforeBack : undefined;

      if (onBeforeBack) {
        const canProceed = await onBeforeBack();
        if (!canProceed) return;
      }

      // Check if location state carries a custom 'from' path (preserves query params & list state)
      if (location.state && typeof (location.state as any).from === "string") {
        navigate((location.state as any).from);
        return;
      }

      // Check if browser history length > 1 and location key is not 'default' (internal navigation)
      if (window.history.length > 1 && location.key !== "default") {
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    },
    [navigate, location]
  );

  return goBack;
}
