import React, { useEffect, useState, useCallback } from "react";
import { X, History, User, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { httpClient } from "../../services/ApiService";
import { getCompleteUrlV1 } from "../../utils";
import { WalletRedeemRequest, WalletRedeemPagination } from "../../types";
import { formatIndianCurrency, formatNumberInIN } from "../../utils/utils";
import moment from "moment";

interface WalletUserHistoryDrawerProps {
  isOpen: boolean;
  targetUserId: string | null;
  requesterData?: any;
  onClose: () => void;
}

export const WalletUserHistoryDrawer: React.FC<WalletUserHistoryDrawerProps> = ({
  isOpen,
  targetUserId,
  requesterData,
  onClose,
}) => {
  const [historyItems, setHistoryItems] = useState<WalletRedeemRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<WalletRedeemPagination>({
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchUserHistory = useCallback(
    async (page = 1) => {
      if (!targetUserId) return;
      try {
        setLoading(true);
        setError(null);

        const res = await httpClient.get(
          getCompleteUrlV1("request/admin-requests", {
            type: "wallet_redeem",
            userId: targetUserId,
            page: String(page),
            limit: "10",
          })
        );

        if (res.ok) {
          const json = await res.json();
          setHistoryItems(json.data || []);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        } else {
          setError("Failed to retrieve user redemption history from server.");
        }
      } catch (err) {
        console.error("User history fetch error:", err);
        setError("Network error fetching user redemption history.");
      } finally {
        setLoading(false);
      }
    },
    [targetUserId]
  );

  useEffect(() => {
    if (isOpen && targetUserId) {
      fetchUserHistory(1);
    }
  }, [isOpen, targetUserId, fetchUserHistory]);

  if (!isOpen || !targetUserId) return null;

  // Use user info from requesterData or first item in history
  const sampleRequester = requesterData || (historyItems.length > 0 ? historyItems[0].requester : null);
  const userName = sampleRequester
    ? [sampleRequester.firstName, sampleRequester.lastName].filter(Boolean).join(" ") || "User"
    : "User Ledger";

  // Calculations for current history view
  const pendingCount = historyItems.filter((i) => i.status === "pending").length;
  const acceptedCount = historyItems.filter((i) => i.status === "accept").length;
  const rejectedCount = historyItems.filter(
    (i) => i.status === "reject" || i.status === "rejected"
  ).length;

  const totalRequestedAmount = historyItems.reduce(
    (sum, i) => sum + (Number(i.metadata?.amount) || 0),
    0
  );
  const totalAcceptedAmount = historyItems
    .filter((i) => i.status === "accept")
    .reduce((sum, i) => sum + (Number(i.metadata?.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <History className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  User Redemption History Audit
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Target User ID: {targetUserId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* User Profile Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{userName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {sampleRequester?.email || "No email"} • {sampleRequester?.phoneNumber || "No phone"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => fetchUserHistory(pagination.page)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
                <span>Refresh History</span>
              </button>
            </div>

            {/* Page Ledger Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total (Page)
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatNumberInIN(pagination.totalCount || historyItems.length)}
                </span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending
                </span>
                <span className="text-base font-extrabold text-amber-900">
                  {pendingCount}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Accepted
                </span>
                <span className="text-base font-extrabold text-emerald-900">
                  {acceptedCount}
                </span>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Rejected
                </span>
                <span className="text-base font-extrabold text-rose-900">
                  {rejectedCount}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Requested (Page)
                </span>
                <span className="text-xs font-extrabold text-slate-900 block truncate">
                  {formatIndianCurrency(totalRequestedAmount)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Accepted (Page)
                </span>
                <span className="text-xs font-extrabold text-emerald-900 block truncate">
                  {formatIndianCurrency(totalAcceptedAmount)}
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => fetchUserHistory(1)}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-100"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Ledger Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-800 flex justify-between items-center">
                <span>User Redemption Requests Ledger</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Newest requests first
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-500">
                    Loading user redemption ledger...
                  </p>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No redemption requests found for this user.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Request ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Mode</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Details / Txn ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {historyItems.map((item) => {
                        const statusPill =
                          item.status === "accept"
                            ? { label: "Accepted", class: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 }
                            : item.status === "reject" || item.status === "rejected"
                            ? { label: "Rejected", class: "bg-rose-50 text-rose-700 border-rose-200", Icon: AlertTriangle }
                            : { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock };

                        const StatusIconComp = statusPill.Icon;

                        return (
                          <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-800 text-[11px]">
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                              {item.createdAt
                                ? moment(item.createdAt).format("DD MMM YYYY, hh:mm A")
                                : "--"}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                              {formatIndianCurrency(item.metadata?.amount || 0)}
                            </td>
                            <td className="py-3 px-4 capitalize text-slate-700 font-semibold">
                              {item.metadata?.paymentMode || item.metadata?.manualTranferSource || "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusPill.class}`}
                              >
                                <StatusIconComp className="w-3 h-3" />
                                {statusPill.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {item.reason && (
                                <p className="text-[11px] text-slate-800 font-medium truncate max-w-[160px]" title={item.reason}>
                                  Reason: {item.reason}
                                </p>
                              )}
                              {item.metadata?.walletTransactionId && (
                                <p className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]" title={item.metadata.walletTransactionId}>
                                  Txn: {item.metadata.walletTransactionId}
                                </p>
                              )}
                              {!item.reason && !item.metadata?.walletTransactionId && (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-500 font-medium">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total requests)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUserHistory(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => fetchUserHistory(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 sticky bottom-0 z-10 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close History Audit
          </button>
        </div>
      </div>
    </div>
  );
};
