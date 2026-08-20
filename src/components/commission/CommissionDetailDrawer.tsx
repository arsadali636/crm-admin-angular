import React from "react";
import { PromoterCommissionItem } from "../../services/PromoterCommissionService";
import moment from "moment";
import { X, Calendar, User, FileText, ShieldAlert, History, Wallet } from "lucide-react";

interface CommissionDetailDrawerProps {
  isOpen: boolean;
  commission: PromoterCommissionItem | null;
  onClose: () => void;
  onSchedule?: (item: PromoterCommissionItem) => void;
  onRelease?: (item: PromoterCommissionItem) => void;
  onHold?: (item: PromoterCommissionItem) => void;
  onUnhold?: (item: PromoterCommissionItem) => void;
}

export const CommissionDetailDrawer: React.FC<CommissionDetailDrawerProps> = ({
  isOpen,
  commission,
  onClose,
  onSchedule,
  onRelease,
  onHold,
  onUnhold,
}) => {
  if (!isOpen || !commission) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "SCHEDULED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DUE":
        return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      case "RELEASED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
      case "HOLD":
        return "bg-rose-50 text-rose-800 border-rose-200 font-bold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-100 flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400">{commission._id}</span>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Commission Breakdown</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Current Status</span>
              <span className={`px-3 py-1 rounded-full text-xs border uppercase tracking-wider ${getStatusBadgeClass(commission.status)}`}>
                {commission.status}
              </span>
            </div>

            {/* 1. COMMISSION INFORMATION */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-blue-500" />
                Commission Information
              </h4>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Commission ID</span>
                  <span className="font-mono font-bold text-slate-800">{commission._id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Order ID</span>
                  <span className="font-mono font-bold text-slate-800">#{commission.numericOrderId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Promoter</span>
                  <span className="font-bold text-slate-800 block">{commission.promoterName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{commission.promoterId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Promoter Contact</span>
                  <span className="font-semibold text-slate-700 block">{commission.promoterPhone}</span>
                  <span className="text-[10px] text-slate-400 block">{commission.promoterEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Order Value</span>
                  <span className="font-extrabold text-slate-900">₹{commission.orderValue.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Commission Rate / Amount</span>
                  <span className="font-extrabold text-emerald-600 text-xs">
                    {commission.commissionPercentage}% (₹{commission.commissionAmount.toLocaleString("en-IN")})
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SCHEDULE INFORMATION */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-500" />
                Schedule Information
              </h4>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Eligible From</span>
                  <span className="font-medium text-slate-700">{moment(commission.eligibleFrom).format("DD MMM YYYY")}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Scheduled Date</span>
                  <span className="font-bold text-blue-600">
                    {commission.scheduledDate ? moment(commission.scheduledDate).format("DD MMM YYYY") : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Scheduled By</span>
                  <span className="font-medium text-slate-700">{commission.scheduledBy || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Scheduled At</span>
                  <span className="font-medium text-slate-700">
                    {commission.scheduledAt ? moment(commission.scheduledAt).format("DD MMM YYYY, hh:mm A") : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. RELEASE INFORMATION */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Wallet size={13} className="text-emerald-500" />
                Release Information
              </h4>
              <div className="grid grid-cols-2 gap-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block">Released Date</span>
                  <span className="font-bold text-emerald-700">
                    {commission.releasedDate ? moment(commission.releasedDate).format("DD MMM YYYY, hh:mm A") : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Released By</span>
                  <span className="font-medium text-slate-700">{commission.releasedBy || "—"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] block">Wallet Transaction ID</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                    {commission.walletTransactionId || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. ADMIN NOTES / HOLD REASON */}
            {(commission.holdReason || commission.adminNotes) && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-amber-500" />
                  Admin Notes & Hold Details
                </h4>
                <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl space-y-2 text-[11px]">
                  {commission.holdReason && (
                    <div>
                      <span className="text-amber-800 font-bold block">Hold Reason:</span>
                      <p className="text-amber-900 mt-0.5">{commission.holdReason}</p>
                      {commission.heldBy && (
                        <p className="text-[10px] text-amber-700 mt-1">
                          Held by {commission.heldBy} at {commission.heldAt ? moment(commission.heldAt).format("DD MMM YYYY HH:mm") : ""}
                        </p>
                      )}
                    </div>
                  )}
                  {commission.adminNotes && (
                    <div>
                      <span className="text-slate-500 font-bold block">Admin Notes:</span>
                      <p className="text-slate-700 mt-0.5">{commission.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. AUDIT LOGS */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <History size={13} className="text-slate-500" />
                Audit Log History
              </h4>
              <div className="space-y-2">
                {commission.auditLogs && commission.auditLogs.length > 0 ? (
                  commission.auditLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>{log.action}</span>
                        <span className="text-[10px] font-normal text-slate-400">{moment(log.timestamp).fromNow()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">By {log.changedBy} on {moment(log.timestamp).format("DD MMM YYYY HH:mm")}</p>
                      {log.note && <p className="text-[10px] text-slate-600 italic mt-1">{log.note}</p>}
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 italic text-[11px] text-center">
                    Created at {moment(commission.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
            {commission.status === "PENDING" && onSchedule && (
              <button
                onClick={() => onSchedule(commission)}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Schedule Release
              </button>
            )}
            {(commission.status === "DUE" || commission.status === "SCHEDULED") && onRelease && (
              <button
                onClick={() => onRelease(commission)}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Release Commission
              </button>
            )}
            {commission.status === "HOLD" && onUnhold ? (
              <button
                onClick={() => onUnhold(commission)}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Resume / Unhold
              </button>
            ) : (
              commission.status !== "RELEASED" && onHold && (
                <button
                  onClick={() => onHold(commission)}
                  className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hold
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
