import React from "react";
import moment from "moment";
import { FiClock, FiUser, FiCalendar, FiActivity, FiAlertTriangle } from "react-icons/fi";

interface ApprovalSummaryCardProps {
  req: any;
  validations: { type: "error" | "warning"; message: string }[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export const ApprovalSummaryCard: React.FC<ApprovalSummaryCardProps> = ({
  req,
  validations,
  riskLevel,
}) => {
  const pendingSince = req.createdAt ? moment(req.createdAt).fromNow() : "Not Available";
  const submissionDate = req.createdAt
    ? moment(req.createdAt).format("DD MMM YYYY, hh:mm A")
    : "Not Available";
  const submittedBy = `${req.firstName || ""} ${req.lastName || ""}`.trim() || "Not Available";
  const email = req.email || "Not Available";

  const riskColorMap = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-orange-50 text-orange-700 border-orange-100",
    Critical: "bg-rose-50 text-rose-700 border-rose-100 animate-pulse",
  };

  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    accept: "bg-emerald-100 text-emerald-800 border-emerald-200",
    reject: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Submitted By */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <FiUser size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Submitted By</span>
            <span className="text-sm font-semibold text-slate-800 block truncate">{submittedBy}</span>
            <span className="text-xs text-slate-400 block truncate">{email}</span>
          </div>
        </div>

        {/* Submission Date */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FiCalendar size={18} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Submission Date</span>
            <span className="text-sm font-semibold text-slate-800 block">{submissionDate}</span>
          </div>
        </div>

        {/* Pending Since */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <FiClock size={18} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Pending Since</span>
            <span className="text-sm font-semibold text-slate-800 block">{pendingSince}</span>
          </div>
        </div>

        {/* Status & Risk */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <FiActivity size={18} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Approval Status:</span>
              <span className={`px-2 py-0.5 text-2xs font-semibold rounded-md border ${statusColorMap[req.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {(req.status || "pending").toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Risk Level:</span>
              <span className={`px-2 py-0.5 text-2xs font-semibold rounded-md border ${riskColorMap[riskLevel]}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Banner Section */}
      {validations.length > 0 && (
        <div className="border-t border-slate-100 pt-5">
          <div className="bg-rose-50/50 border border-rose-100/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-2">
              <FiAlertTriangle className="text-rose-600 animate-bounce" />
              Automated Listing Validation Alerts ({validations.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-rose-700">
              {validations.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{val.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalSummaryCard;
