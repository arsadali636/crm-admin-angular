import React, { useState } from "react";
import { FiCheck, FiX, FiEdit3, FiUserPlus, FiMoreHorizontal, FiDownload, FiMessageSquare } from "react-icons/fi";

interface ApprovalActionGroupProps {
  status: string;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges?: () => void;
  onDownloadDocuments?: () => void;
  loading: boolean;
}

export const ApprovalActionGroup: React.FC<ApprovalActionGroupProps> = ({
  status,
  onApprove,
  onReject,
  onRequestChanges,
  onDownloadDocuments,
  loading,
}) => {
  const [showMore, setShowMore] = useState(false);

  const isPending = status === "pending";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight">Workflow Actions</h3>
      
      <div className="flex flex-col gap-2">
        {isPending ? (
          <>
            {/* Primary Approve Action */}
            <button
              onClick={onApprove}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              <FiCheck className="h-4 w-4" />
              <span>Approve Request</span>
            </button>

            {/* Request Changes Action */}
            {onRequestChanges && (
              <button
                onClick={onRequestChanges}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <FiEdit3 className="h-3.5 w-3.5" />
                <span>Request Changes</span>
              </button>
            )}

            {/* Reject Action */}
            <button
              onClick={onReject}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <FiX className="h-4 w-4" />
              <span>Reject Request</span>
            </button>
          </>
        ) : (
          <div className="text-center py-2 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-505 font-bold uppercase tracking-wider">
            Review Complete
          </div>
        )}

        <div className="relative flex gap-2 mt-2 pt-2 border-t border-slate-100/60">
          {/* Download Docs */}
          {onDownloadDocuments && (
            <button
              onClick={onDownloadDocuments}
              title="Download all files"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer active:scale-95"
            >
              <FiDownload className="h-3 w-3" />
              <span>Files</span>
            </button>
          )}

          {/* Add Internal Note */}
          <button
            onClick={() => alert("Notes workflow is placeholder in existing API context.")}
            title="Add moderation note"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer active:scale-95"
          >
            <FiMessageSquare className="h-3 w-3" />
            <span>Note</span>
          </button>

          {/* Assign Reviewer */}
          <button
            onClick={() => alert("Assigned Reviewer update is placeholder in existing API context.")}
            title="Assign review queue user"
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-505 hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer active:scale-95"
          >
            <FiUserPlus className="h-3.5 w-3.5" />
          </button>

          {/* More Actions Dropdown Toggle */}
          <button
            onClick={() => setShowMore(!showMore)}
            title="More Actions"
            className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all cursor-pointer active:scale-95 ${
              showMore 
                ? "bg-indigo-50 border-indigo-250 text-indigo-700" 
                : "border-slate-200 bg-white text-slate-505 hover:bg-slate-50 hover:border-slate-350"
            }`}
          >
            <FiMoreHorizontal className="h-4 w-4" />
          </button>

          {/* More actions floating panel */}
          {showMore && (
            <div className="absolute right-0 bottom-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-md animate-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  alert("Moderation history requested.");
                  setShowMore(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                View History Logs
              </button>
              <button
                onClick={() => {
                  alert("Request Escalated.");
                  setShowMore(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
              >
                Escalate Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalActionGroup;
