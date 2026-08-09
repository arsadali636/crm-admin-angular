import React from "react";
import { FiRefreshCw, FiDownload, FiFilter, FiSliders, FiCheckSquare, FiSquare } from "react-icons/fi";
import Breadcrumb from "../Breadcrumb";

interface ApprovalToolbarProps {
  onRefresh: () => void;
  onExport: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onBulkApprove?: () => void;
  onBulkReject?: () => void;
}

export const ApprovalToolbar: React.FC<ApprovalToolbarProps> = ({
  onRefresh,
  onExport,
  onToggleFilters,
  showFilters,
  selectedCount,
  totalCount,
  onSelectAll,
  isAllSelected,
  onBulkApprove,
  onBulkReject,
}) => {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
      {/* Breadcrumbs & Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Approvals", to: "/approvals" },
            ]}
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Review and manage all pending seller and product approvals.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh list"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer active:scale-95"
          >
            <FiRefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          {/* Export Selected Button */}
          <button
            onClick={onExport}
            disabled={selectedCount === 0}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="h-3.5 w-3.5 text-slate-500" />
            <span>Export {selectedCount > 0 ? `(${selectedCount})` : ""}</span>
          </button>

          {/* Filter Panel Toggle */}
          <button
            onClick={onToggleFilters}
            className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 ${
              showFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <FiFilter className={`h-3.5 w-3.5 ${showFilters ? "text-indigo-650" : "text-slate-500"}`} />
            <span>Filters</span>
          </button>

          {/* View Options/Settings */}
          <button
            title="View Options"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            <FiSliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions Notification Bar */}
      {totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-2 text-slate-650 hover:text-slate-900 text-2xs font-bold transition cursor-pointer select-none"
            >
              {isAllSelected ? (
                <FiCheckSquare className="h-4 w-4 text-indigo-600" />
              ) : (
                <FiSquare className="h-4 w-4 text-slate-400" />
              )}
              <span>Select All ({totalCount})</span>
            </button>

            {selectedCount > 0 && (
              <span className="text-3xs bg-indigo-100 text-indigo-800 font-extrabold uppercase px-2 py-0.5 rounded-md border border-indigo-200/40">
                {selectedCount} Selected
              </span>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-3 duration-250">
              <button
                onClick={onBulkReject}
                className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-rose-250 bg-rose-50 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 transition hover:bg-rose-100 cursor-pointer active:scale-95"
              >
                Reject Selected
              </button>
              <button
                onClick={onBulkApprove}
                className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-slate-900 text-[10px] font-extrabold uppercase tracking-wider text-white transition hover:bg-slate-800 cursor-pointer active:scale-95"
              >
                Approve Selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalToolbar;
