import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Clock, User, Wallet, Building2, CreditCard, ExternalLink, History, ArrowRight, Eye, Maximize2 } from "lucide-react";
import { WalletRedeemRequest } from "../../types";
import { formatIndianCurrency, maskBankAccount } from "../../utils/utils";
import moment from "moment";

interface WalletRedeemDetailDrawerProps {
  isOpen: boolean;
  request: WalletRedeemRequest | null;
  onClose: () => void;
  onAccept: (request: WalletRedeemRequest) => void;
  onReject: (request: WalletRedeemRequest) => void;
  onViewUserHistory: (requesterId: string, requesterObj?: any) => void;
}

export const WalletRedeemDetailDrawer: React.FC<WalletRedeemDetailDrawerProps> = ({
  isOpen,
  request,
  onClose,
  onAccept,
  onReject,
  onViewUserHistory,
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const requester = request.requester;
  const fullName = requester
    ? [requester.firstName, requester.lastName].filter(Boolean).join(" ") || "N/A"
    : "N/A";

  const payoutDetails = requester?.payoutDetails;
  const upiId = payoutDetails?.upi?.upiId;
  const bankInfo = payoutDetails?.bankAccount;
  const maskedAccNumber = maskBankAccount(bankInfo?.accountNumber);

  const metadata = request.metadata || {};

  const statusBadge =
    request.status === "accept"
      ? { label: "Accepted", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 }
      : request.status === "reject" || request.status === "rejected"
      ? { label: "Rejected", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle }
      : { label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };

  const StatusIcon = statusBadge.icon;
  const requesterId = request.requesterId || requester?._id;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
        <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Redemption Workspace
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  ID: {request._id}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. User Information */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>User Information</span>
                  </div>
                  {requesterId && (
                    <button
                      onClick={() => onViewUserHistory(requesterId, requester)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>View User History</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Full Name</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  {requester?.email && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Email Address</span>
                      <span className="font-medium text-slate-800 truncate block" title={requester.email}>
                        {requester.email}
                      </span>
                    </div>
                  )}
                  {requester?.phoneNumber && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Phone Number</span>
                      <span className="font-mono text-slate-800">{requester.phoneNumber}</span>
                    </div>
                  )}
                  {requesterId && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">User ID</span>
                      <span className="font-mono text-slate-600 truncate block" title={requesterId}>
                        {requesterId}
                      </span>
                    </div>
                  )}
                  {requester?.role && requester.role.length > 0 && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Role</span>
                      <span className="capitalize font-semibold text-slate-700">{requester.role.join(", ")}</span>
                    </div>
                  )}
                  {requester?.status && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Account Status</span>
                      <span className="capitalize font-semibold text-emerald-700">{requester.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Redemption Details */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Redemption Financial Details</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Requested Amount</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {formatIndianCurrency(metadata.amount || 0)}
                    </span>
                  </div>
                  {metadata.paymentMode && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Payment Mode</span>
                      <span className="font-bold text-blue-700 uppercase">{metadata.paymentMode}</span>
                    </div>
                  )}
                  {metadata.manualTranferSource && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Transfer Source</span>
                      <span className="font-medium text-slate-800 capitalize">{metadata.manualTranferSource}</span>
                    </div>
                  )}
                  {metadata.source && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Request Source</span>
                      <span className="font-medium text-slate-800 capitalize">{metadata.source}</span>
                    </div>
                  )}
                  {request.createdAt && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Request Date</span>
                      <span className="font-medium text-slate-700">
                        {moment(request.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </span>
                    </div>
                  )}
                  {request.updatedAt && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Last Updated</span>
                      <span className="font-medium text-slate-700">
                        {moment(request.updatedAt).format("DD MMM YYYY, hh:mm A")}
                      </span>
                    </div>
                  )}
                </div>

                {metadata.remarks && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 text-[11px] block">User Remarks</span>
                    <p className="text-slate-700 italic mt-0.5">{metadata.remarks}</p>
                  </div>
                )}
              </div>

              {/* 3. Payout Details (Masked Bank / UPI) - ONLY rendered if data exists */}
              {(upiId || (bankInfo && (bankInfo.accountNumber || bankInfo.ifsc))) && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Target Payout Destination</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {upiId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">UPI ID</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md inline-block mt-0.5">
                          {upiId}
                        </span>
                      </div>
                    )}

                    {bankInfo && (bankInfo.accountNumber || bankInfo.ifsc) && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {bankInfo.accountHolderName && (
                          <div>
                            <span className="text-slate-400 text-[11px] block">Account Holder</span>
                            <span className="font-bold text-slate-900">{bankInfo.accountHolderName}</span>
                          </div>
                        )}
                        {bankInfo.accountNumber && (
                          <div>
                            <span className="text-slate-400 text-[11px] block">Masked Account Number</span>
                            <span className="font-mono font-bold text-slate-900">
                              {maskedAccNumber}
                            </span>
                          </div>
                        )}
                        {bankInfo.ifsc && (
                          <div>
                            <span className="text-slate-400 text-[11px] block">IFSC Code</span>
                            <span className="font-mono font-bold text-slate-800 uppercase">{bankInfo.ifsc}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Payment / Transaction Audit Logs - ONLY rendered if fields exist */}
              {(metadata.utrNumber || metadata.screenshotUrl || metadata.walletTransactionId || metadata.adminNote || metadata.approvedBy || request.reason) && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Transaction & Audit Information</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {metadata.utrNumber && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">UTR Number</span>
                        <span className="font-mono font-bold text-slate-900">{metadata.utrNumber}</span>
                      </div>
                    )}
                    {metadata.walletTransactionId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Wallet Txn ID</span>
                        <span className="font-mono font-bold text-slate-900">{metadata.walletTransactionId}</span>
                      </div>
                    )}
                    {metadata.approvedAt && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Approved Date</span>
                        <span className="font-medium text-slate-700">
                          {moment(metadata.approvedAt).format("DD MMM YYYY, hh:mm A")}
                        </span>
                      </div>
                    )}
                    {metadata.approvedBy && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Approved By Admin</span>
                        <span className="font-mono text-slate-700 truncate block">{metadata.approvedBy}</span>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-400 text-[11px] block">Resolution Reason</span>
                      <p className="text-slate-800 font-medium mt-0.5">{request.reason}</p>
                    </div>
                  )}

                  {metadata.adminNote && (
                    <div className="mt-2 text-xs">
                      <span className="text-slate-400 text-[11px] block">Admin Note</span>
                      <p className="text-slate-700 mt-0.5">{metadata.adminNote}</p>
                    </div>
                  )}

                  {/* Screenshot Thumbnail & Lightbox Action */}
                  {metadata.screenshotUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[11px] block mb-2 font-bold uppercase tracking-wider">
                        Payment Proof Screenshot
                      </span>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setLightboxUrl(metadata.screenshotUrl!)}
                          className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 cursor-pointer shadow-xs"
                        >
                          <img
                            src={metadata.screenshotUrl}
                            alt="Payment Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button
                            onClick={() => setLightboxUrl(metadata.screenshotUrl!)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Full Image</span>
                          </button>
                          <a
                            href={metadata.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 block mt-1"
                          >
                            <span>Open in new tab</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/80 sticky bottom-0 z-10 flex items-center justify-between gap-3">
            {requesterId && (
              <button
                onClick={() => onViewUserHistory(requesterId, requester)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Full User History</span>
              </button>
            )}

            {request.status === "pending" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReject(request)}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => onAccept(request)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Accept Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-60 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden p-2 border border-slate-800 shadow-2xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4 py-2 text-white border-b border-slate-800 mb-2">
              <span className="text-xs font-bold font-mono">Payment Proof Screenshot</span>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxUrl}
              alt="Payment Proof Full Size"
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};
