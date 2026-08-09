import React from "react";
import { AlertTriangle, RefreshCw, Inbox } from "lucide-react";

interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const SectionErrorState: React.FC<SectionErrorProps> = ({
  message = "Unable to load data for this section.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-rose-50/50 border border-rose-100 rounded-xl text-center my-2">
      <AlertTriangle className="w-8 h-8 text-rose-500 mb-2 stroke-[1.5]" />
      <p className="text-sm font-medium text-rose-900 mb-1">{message}</p>
      <p className="text-xs text-rose-600 mb-3">Check network or backend availability.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

interface SectionEmptyProps {
  title?: string;
  message?: string;
}

export const SectionEmptyState: React.FC<SectionEmptyProps> = ({
  title = "No data available",
  message = "No records found for the selected period.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center my-2">
      <Inbox className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{message}</p>
    </div>
  );
};
