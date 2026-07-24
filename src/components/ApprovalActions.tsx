import React from "react";
import { FiCheck, FiXCircle, FiEdit3, FiEye, FiDownload, FiAlertCircle } from "react-icons/fi";

interface ApprovalActionsProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  onViewSeller: () => void;
  onDownloadDocuments: () => void;
  loading: boolean;
  validationCount: number;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  status,
  onApprove,
  onReject,
  onRequestChanges,
  onViewSeller,
  onDownloadDocuments,
  loading,
  validationCount,
}) => {
  const isPending = status === "pending";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Approval Workspace</h3>
        <p className="text-sm font-extrabold text-slate-800">Decision Control Center</p>
      </div>

      {isPending ? (
        <div className="space-y-2.5">
          <button
            onClick={onApprove}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <FiCheck size={16} />
            Approve & Publish Listing
          </button>
          
          <button
            onClick={onReject}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-750 text-white font-bold text-xs rounded-xl shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <FiXCircle size={16} />
            Reject Listing Request
          </button>

          <button
            onClick={onRequestChanges}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
          >
            <FiEdit3 size={16} />
            Request Info Changes
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-slate-150 bg-slate-50 text-slate-500 text-xs font-bold text-center flex flex-col items-center justify-center gap-2">
          <FiAlertCircle size={20} className="text-slate-400" />
          <span>Listing Request has already been processed and is now finalized.</span>
          <span className="px-2.5 py-0.5 bg-slate-200 border border-slate-350 text-slate-700 rounded text-3xs font-black uppercase">
            Status: {status}
          </span>
        </div>
      )}

      {/* Auxiliary Seller & Document triggers */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <button
          onClick={onViewSeller}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 font-bold text-2xs rounded-lg border border-slate-200 transition duration-150 cursor-pointer"
        >
          <FiEye size={12} />
          View Seller Profile
        </button>

        <button
          onClick={onDownloadDocuments}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 font-bold text-2xs rounded-lg border border-slate-200 transition duration-150 cursor-pointer"
        >
          <FiDownload size={12} />
          Download Submitter Docs
        </button>
      </div>

      {validationCount > 0 && isPending && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100/60 rounded-xl text-[10px] font-bold flex items-start gap-2">
          <FiAlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0 animate-pulse" />
          <div>
            <span>Automated checks flagged {validationCount} alerts. Review validations before approving.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalActions;
