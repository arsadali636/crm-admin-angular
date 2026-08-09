import React, { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight, Wallet, CreditCard, Tag, ExternalLink, Eye, Maximize2, ShieldCheck, FileText } from "lucide-react";
import { WalletHistoryItem } from "../../types";
import { formatIndianCurrency } from "../../utils/utils";
import moment from "moment";

interface WalletTransactionDetailDrawerProps {
  isOpen: boolean;
  transaction: WalletHistoryItem | null;
  onClose: () => void;
}

export const WalletTransactionDetailDrawer: React.FC<WalletTransactionDetailDrawerProps> = ({
  isOpen,
  transaction,
  onClose,
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const isCredit = transaction.direction === "credit";
  const metadata = transaction.metadata || {};

  // Friendly type display
  const getTypeLabel = (typeStr: string) => {
    switch (typeStr) {
      case "add_money":
        return "Wallet Top-up";
      case "seller_token_debit":
        return "Seller Token Debit";
      case "redeem":
        return "Wallet Redemption";
      default:
        return typeStr
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
    }
  };

  const formattedAmount = `${isCredit ? "+" : "-"}${formatIndianCurrency(transaction.amount)}`;
  const formattedBefore = transaction.balanceBefore !== undefined ? formatIndianCurrency(transaction.balanceBefore) : "—";
  const formattedAfter = transaction.balanceAfter !== undefined ? formatIndianCurrency(transaction.balanceAfter) : "—";

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
                    Transaction Audit Ledger
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isCredit
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {isCredit ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                    {isCredit ? "Credit (+)" : "Debit (-)"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  ID: {transaction._id}
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
              {/* 1. Transaction Overview Card */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>Transaction Overview</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {transaction.status || "Success"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Transaction Amount</span>
                    <span
                      className={`text-lg font-black block ${
                        isCredit ? "text-emerald-700" : "text-slate-900"
                      }`}
                    >
                      {formattedAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Transaction Type</span>
                    <span className="font-bold text-slate-900 block">
                      {getTypeLabel(transaction.type)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Raw: {transaction.type}
                    </span>
                  </div>
                  {transaction.userId && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">User ID</span>
                      <span className="font-mono text-slate-600 truncate block" title={transaction.userId}>
                        {transaction.userId}
                      </span>
                    </div>
                  )}
                  {transaction.currency && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Currency</span>
                      <span className="font-bold text-slate-800 uppercase">{transaction.currency}</span>
                    </div>
                  )}
                  {transaction.createdAt && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Created Date</span>
                      <span className="font-medium text-slate-700">
                        {moment(transaction.createdAt).format("DD MMM YYYY, HH:mm A")}
                      </span>
                    </div>
                  )}
                  {transaction.walletId && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Wallet ID</span>
                      <span className="font-mono text-slate-600 truncate block" title={transaction.walletId}>
                        {transaction.walletId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Balance Impact Card */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Balance Impact Ledger</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs text-center">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Balance Before</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {formattedBefore}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Amount</span>
                    <span
                      className={`font-extrabold text-sm mt-0.5 block ${
                        isCredit ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {formattedAmount}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Balance After</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {formattedAfter}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Source & Reference Information */}
              {(transaction.source || transaction.referenceType || transaction.referenceId || transaction.idempotencyKey || transaction.initiatedBy) && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>Source & Reference Info</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {transaction.source && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Source</span>
                        <span className="font-semibold text-slate-800 capitalize">{transaction.source}</span>
                      </div>
                    )}
                    {transaction.referenceType && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Reference Type</span>
                        <span className="font-semibold text-slate-800 capitalize">{transaction.referenceType}</span>
                      </div>
                    )}
                    {transaction.referenceId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Reference ID</span>
                        <span className="font-mono text-slate-700 truncate block" title={transaction.referenceId}>
                          {transaction.referenceId}
                        </span>
                      </div>
                    )}
                    {transaction.initiatedBy && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Initiated By</span>
                        <span className="font-mono text-slate-700 truncate block">{transaction.initiatedBy}</span>
                      </div>
                    )}
                    {transaction.idempotencyKey && (
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[11px] block">Idempotency Key</span>
                        <span className="font-mono text-slate-600 text-[11px] truncate block" title={transaction.idempotencyKey}>
                          {transaction.idempotencyKey}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Remarks (if available) */}
              {transaction.remarks && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-2 pb-2 border-b border-slate-200/60">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Transaction Remarks</span>
                  </div>
                  <p className="text-slate-800 font-medium italic">{transaction.remarks}</p>
                </div>
              )}

              {/* 5. Type-Specific Metadata (Redeem, Top-up, Token Debit) */}
              {(metadata.utrNumber || metadata.screenshotUrl || metadata.paymentMode || metadata.adminNote || metadata.approvedBy || metadata.requestId || metadata.razorpayOrderId || metadata.numericOrderId || metadata.manualPayout !== undefined || metadata.payoutSkippedReason) && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Transaction Audit Metadata</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {metadata.requestId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Request ID</span>
                        <span className="font-mono font-bold text-slate-900 truncate block" title={metadata.requestId}>{metadata.requestId}</span>
                      </div>
                    )}
                    {metadata.requestType && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Request Type</span>
                        <span className="font-semibold text-slate-800">{metadata.requestType}</span>
                      </div>
                    )}
                    {metadata.paymentMode && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Payment Mode</span>
                        <span className="font-bold text-blue-700 uppercase">{metadata.paymentMode}</span>
                      </div>
                    )}
                    {metadata.manualTranferSource && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Transfer Source</span>
                        <span className="font-semibold text-slate-800 uppercase">{metadata.manualTranferSource}</span>
                      </div>
                    )}
                    {metadata.utrNumber && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">UTR Number</span>
                        <span className="font-mono font-bold text-slate-900">{metadata.utrNumber}</span>
                      </div>
                    )}
                    {metadata.approvedBy && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Approved By</span>
                        <span className="font-mono text-slate-700 truncate block" title={metadata.approvedBy}>{metadata.approvedBy}</span>
                      </div>
                    )}
                    {metadata.manualPayout !== undefined && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Manual Payout</span>
                        <span className="font-bold text-slate-900">{metadata.manualPayout ? "True" : "False"}</span>
                      </div>
                    )}
                    {metadata.payoutSkipped !== undefined && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Payout Skipped</span>
                        <span className="font-bold text-amber-700">{metadata.payoutSkipped ? "True" : "False"}</span>
                      </div>
                    )}
                    {metadata.orderId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Order ID</span>
                        <span className="font-mono text-slate-800 truncate block" title={metadata.orderId}>{metadata.orderId}</span>
                      </div>
                    )}
                    {metadata.numericOrderId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Numeric Order ID</span>
                        <span className="font-bold text-slate-900">#{metadata.numericOrderId}</span>
                      </div>
                    )}
                    {metadata.orderItemIds && metadata.orderItemIds.length > 0 && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Order Item IDs</span>
                        <span className="font-mono text-slate-700 text-[11px] truncate block" title={Array.isArray(metadata.orderItemIds) ? metadata.orderItemIds.join(", ") : String(metadata.orderItemIds)}>
                          {Array.isArray(metadata.orderItemIds) ? metadata.orderItemIds.join(", ") : String(metadata.orderItemIds)}
                        </span>
                      </div>
                    )}
                    {metadata.razorpayOrderId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Razorpay Order ID</span>
                        <span className="font-mono text-slate-800 truncate block" title={metadata.razorpayOrderId}>{metadata.razorpayOrderId}</span>
                      </div>
                    )}
                    {metadata.razorpayPaymentId && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Razorpay Payment ID</span>
                        <span className="font-mono text-slate-800 truncate block" title={metadata.razorpayPaymentId}>{metadata.razorpayPaymentId}</span>
                      </div>
                    )}
                    {metadata.orderStatus && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Order Status</span>
                        <span className="font-bold text-emerald-700 uppercase">{metadata.orderStatus}</span>
                      </div>
                    )}
                    {metadata.paymentStatus && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Payment Status</span>
                        <span className="font-bold text-emerald-700 uppercase">{metadata.paymentStatus}</span>
                      </div>
                    )}
                  </div>

                  {metadata.payoutSkippedReason && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-400 text-[11px] block font-semibold">Payout Skipped Reason</span>
                      <p className="text-slate-700 italic mt-0.5">{metadata.payoutSkippedReason}</p>
                    </div>
                  )}

                  {metadata.adminNote && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-400 text-[11px] block font-semibold">Admin Note</span>
                      <p className="text-slate-800 font-medium mt-0.5">{metadata.adminNote}</p>
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
                            <span>Preview Image</span>
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

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/80 sticky bottom-0 z-10 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close Audit Drawer
            </button>
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
