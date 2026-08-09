import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { httpClient } from "../../services/ApiService";
import { getCompleteUrlV1 } from "../../utils";
import { WalletHistoryItem, WalletHistoryPagination } from "../../types";
import { formatIndianCurrency } from "../../utils/utils";
import moment from "moment";

import { WalletTransactionDetailDrawer } from "./WalletTransactionDetailDrawer";

interface UserWalletActivityProps {
  userId?: string;
  currentBalance?: number | string;
}

export const UserWalletActivity: React.FC<UserWalletActivityProps> = ({
  userId,
  currentBalance,
}) => {
  // Data States
  const [transactions, setTransactions] = useState<WalletHistoryItem[]>([]);
  const [fetchedBalance, setFetchedBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<WalletHistoryPagination>({
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Selected Transaction for Audit Drawer
  const [selectedTransaction, setSelectedTransaction] = useState<WalletHistoryItem | null>(null);

  // Fetch Wallet Balance from API for Current Balance KPI
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await httpClient.get(getCompleteUrlV1("wallet", { userId }));
      if (res.ok) {
        const json = await res.json();
        if (json.data?.balance !== undefined) {
          setFetchedBalance(json.data.balance);
        }
      }
    } catch (e) {
      console.error("Error fetching wallet balance for activity KPI:", e);
    }
  }, [userId]);

  // Fetch Wallet History from API
  const fetchWalletHistory = useCallback(
    async (page = 1, dir = directionFilter, typ = typeFilter) => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
        };

        if (userId) {
          params.userId = userId;
        }

        if (dir !== "all") {
          params.direction = dir; // "credit" or "debit"
        }

        if (typ !== "all") {
          params.type = typ; // "add_money", "seller_token_debit", or "redeem"
        }

        const res = await httpClient.get(getCompleteUrlV1("wallet/history", params));

        if (res.ok) {
          const json = await res.json();
          let rawData: WalletHistoryItem[] = Array.isArray(json.data) ? json.data : [];

          // Strict user isolation check: if userId is present, filter only items matching current user
          if (userId && rawData.length > 0) {
            const matches = rawData.filter((item) => item.userId === userId || (item as any).user === userId);
            if (matches.length > 0) {
              rawData = matches;
            }
          }

          // Sort newest first
          rawData.sort((a, b) => {
            const timeA = a.createdAt_EP || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt_EP || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });

          setTransactions(rawData);

          if (json.pagination) {
            setPagination({
              totalCount: json.pagination.totalCount ?? rawData.length,
              page: json.pagination.page ?? page,
              limit: json.pagination.limit ?? 10,
              totalPages: json.pagination.totalPages ?? Math.ceil(rawData.length / 10),
            });
          } else {
            setPagination({
              totalCount: rawData.length,
              page: page,
              limit: 10,
              totalPages: Math.ceil(rawData.length / 10) || 1,
            });
          }
        } else {
          setError("Unable to load wallet activity");
        }
      } catch (err) {
        console.error("Wallet history API error:", err);
        setError("Unable to load wallet activity");
      } finally {
        setLoading(false);
      }
    },
    [userId, directionFilter, typeFilter]
  );

  // Immediate Reset when userId changes to prevent showing User A's history under User B!
  useEffect(() => {
    setTransactions([]);
    setFetchedBalance(null);
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setDirectionFilter("all");
    setTypeFilter("all");

    if (userId) {
      fetchWalletHistory(1, "all", "all");
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, [userId, fetchWalletHistory, fetchBalance]);

  const handleDirectionChange = (newDir: string) => {
    setDirectionFilter(newDir);
    setCurrentPage(1);
    fetchWalletHistory(1, newDir, typeFilter);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    setCurrentPage(1);
    fetchWalletHistory(1, directionFilter, newType);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchWalletHistory(newPage, directionFilter, typeFilter);
  };

  // Summary Metrics (Loaded scope)
  const summaryMetrics = useMemo(() => {
    const totalCreditsLoaded = transactions
      .filter((t) => t.direction === "credit")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalDebitsLoaded = transactions
      .filter((t) => t.direction === "debit")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalCreditsLoaded,
      totalDebitsLoaded,
      loadedCount: transactions.length,
    };
  }, [transactions]);

  // Friendly type display helper
  const getTypeDisplay = (typeStr: string) => {
    switch (typeStr) {
      case "add_money":
        return { label: "Wallet Top-up", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      case "seller_token_debit":
        return { label: "Seller Token Debit", badge: "bg-purple-50 text-purple-700 border-purple-200" };
      case "redeem":
        return { label: "Wallet Redemption", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        const formatted = typeStr
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return { label: formatted, badge: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            Wallet Activity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete wallet transaction history & balance impact ledger
          </p>
        </div>

        <button
          onClick={() => fetchWalletHistory(currentPage, directionFilter, typeFilter)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* ── Compact Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Balance</span>
          <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
            {currentBalance !== undefined && currentBalance !== null && currentBalance !== ""
              ? typeof currentBalance === "number"
                ? formatIndianCurrency(currentBalance)
                : currentBalance
              : fetchedBalance !== null
              ? formatIndianCurrency(fetchedBalance)
              : "—"}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Loaded Credits</span>
          <span className="font-extrabold text-emerald-800 text-sm block mt-0.5">
            {formatIndianCurrency(summaryMetrics.totalCreditsLoaded)}
          </span>
        </div>

        <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-xl">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">Loaded Debits</span>
          <span className="font-extrabold text-rose-800 text-sm block mt-0.5">
            {formatIndianCurrency(summaryMetrics.totalDebitsLoaded)}
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Loaded Transactions</span>
          <span className="font-bold text-slate-800 text-sm block mt-0.5">
            {pagination.totalCount || summaryMetrics.loadedCount} {pagination.totalCount === 1 ? "Record" : "Records"}
          </span>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Direction Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-xl">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-semibold">Direction:</span>
            <select
              value={directionFilter}
              onChange={(e) => handleDirectionChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Directions</option>
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (-)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-400 font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="add_money">Wallet Top-up</option>
              <option value="seller_token_debit">Seller Token Debit</option>
              <option value="redeem">Wallet Redemption</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          Showing newest transactions first
        </span>
      </div>

      {/* ── Transaction Table / Error / Empty States ── */}
      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchWalletHistory(currentPage, directionFilter, typeFilter)}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full min-w-[720px] text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Direction</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Balance Before</th>
                <th className="py-3 px-3 text-right">Balance After</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-14"></div></td>
                    <td className="py-3 px-3"><div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <span className="font-bold text-slate-700 block">No wallet activity yet</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Wallet transactions will appear here when funds are added, used, or redeemed.
                    </span>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.direction === "credit";
                  const typeObj = getTypeDisplay(tx.type);
                  const formattedAmt = `${isCredit ? "+" : "-"}${formatIndianCurrency(tx.amount)}`;
                  const beforeStr = tx.balanceBefore !== undefined ? formatIndianCurrency(tx.balanceBefore) : "—";
                  const afterStr = tx.balanceAfter !== undefined ? formatIndianCurrency(tx.balanceAfter) : "—";

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        <div>
                          <span>{tx.createdAt ? moment(tx.createdAt).format("DD MMM YYYY, HH:mm") : "—"}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {tx.createdAt ? moment(tx.createdAt).fromNow() : ""}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeObj.badge}`}>
                          {typeObj.label}
                        </span>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {isCredit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isCredit ? "Credit" : "Debit"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-3 px-3 text-right font-extrabold ${isCredit ? "text-emerald-700" : "text-slate-900"}`}>
                        {formattedAmt}
                      </td>

                      {/* Balance Before */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {beforeStr}
                      </td>

                      {/* Balance After */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {afterStr}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 text-slate-700 capitalize font-medium">
                        {tx.source || "System"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {tx.status || "success"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedTransaction(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          title="View Full Transaction Audit Drawer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination Bar ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total history entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Transaction Audit Detail Drawer ── */}
      <WalletTransactionDetailDrawer
        isOpen={Boolean(selectedTransaction)}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
