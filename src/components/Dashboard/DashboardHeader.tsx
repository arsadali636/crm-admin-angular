import React from "react";
import { RefreshCw, Calendar, Clock } from "lucide-react";

interface DashboardHeaderProps {
  startDate: string;
  endDate: string;
  maxDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  startDate,
  endDate,
  maxDate,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            {isRefreshing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                Syncing...
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitor marketplace performance, operations and pending actions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Pickers */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xl text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-2 text-slate-600 font-medium">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Range:</span>
            </div>
            <input
              type="date"
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={startDate}
              max={endDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
            <span className="text-slate-400 font-medium">to</span>
            <input
              type="date"
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={endDate}
              min={startDate}
              max={maxDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 active:bg-slate-100 font-medium px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-600 ${
                isRefreshing ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Last Updated Timestamp */}
          {lastUpdated && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-1 border-l border-slate-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated: {formatTime(lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
