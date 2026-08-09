import React, { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { WalletRedeemRequest, WalletRedeemPagination } from "../types";
import { formatIndianCurrency, formatNumberInIN, maskBankAccount } from "../utils/utils";
import moment from "moment";
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Eye,
  Check,
  X,
  History,
  Copy,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";

import { WalletRedeemActionModal, WalletRedeemActionPayload } from "../components/wallet/WalletRedeemActionModal";
import { WalletRedeemDetailDrawer } from "../components/wallet/WalletRedeemDetailDrawer";
import { WalletUserHistoryDrawer } from "../components/wallet/WalletUserHistoryDrawer";

export const WalletWithdrawals: React.FC = () => {
  // Main Data States
  const [requests, setRequests] = useState<WalletRedeemRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeStatusTab, setActiveStatusTab] = useState<"all" | "pending" | "accept" | "reject">("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [pagination, setPagination] = useState<WalletRedeemPagination>({
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Action Modal State (Accept / Reject Confirmation)
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    request: WalletRedeemRequest | null;
    actionType: "accept" | "reject" | null;
    isProcessing: boolean;
  }>({
    isOpen: false,
    request: null,
    actionType: null,
    isProcessing: false,
  });

  // Drawer States
  const [detailDrawerRequest, setDetailDrawerRequest] = useState<WalletRedeemRequest | null>(null);
  const [historyDrawerState, setHistoryDrawerState] = useState<{
    isOpen: boolean;
    targetUserId: string | null;
    requesterData?: any;
    refreshKey: number;
  }>({
    isOpen: false,
    targetUserId: null,
    refreshKey: 0,
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Requests from API (Source of Truth)
  const fetchRedemptionRequests = useCallback(async (page = 1, status = activeStatusTab) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: Record<string, string> = {
        type: "wallet_redeem",
        page: String(page),
        limit: "10",
      };

      if (status !== "all") {
        queryParams.status = status;
      }

      const res = await httpClient.get(getCompleteUrlV1("request/admin-requests", queryParams));

      if (res.ok) {
        const json = await res.json();
        setRequests(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        setError("Failed to fetch wallet redemption requests from server.");
      }
    } catch (err) {
      console.error("Error fetching redemption requests:", err);
      setError("Network connection error. Unable to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }, [activeStatusTab]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRedemptionRequests(1, activeStatusTab);
  }, [activeStatusTab, fetchRedemptionRequests]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchRedemptionRequests(newPage, activeStatusTab);
  };

  // Client Search & Payment Mode Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const reqId = req._id.toLowerCase();
        const uId = (req.requesterId || "").toLowerCase();
        const fName = (req.requester?.firstName || "").toLowerCase();
        const lName = (req.requester?.lastName || "").toLowerCase();
        const email = (req.requester?.email || "").toLowerCase();
        const phone = (req.requester?.phoneNumber || "").toLowerCase();

        const matchesSearch =
          reqId.includes(q) ||
          uId.includes(q) ||
          fName.includes(q) ||
          lName.includes(q) ||
          email.includes(q) ||
          phone.includes(q);

        if (!matchesSearch) return false;
      }

      // 2. Payment Mode Filter
      if (paymentModeFilter !== "all") {
        const mode = (
          req.metadata?.paymentMode ||
          req.metadata?.manualTranferSource ||
          req.metadata?.source ||
          ""
        ).toLowerCase();

        if (!mode.includes(paymentModeFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [requests, searchQuery, paymentModeFilter]);

  // Page Summary Statistics
  const pageStats = useMemo(() => {
    const totalOnPage = requests.length;
    const pendingOnPage = requests.filter((r) => r.status === "pending").length;
    const acceptedOnPage = requests.filter((r) => r.status === "accept").length;
    const rejectedOnPage = requests.filter((r) => r.status === "reject" || r.status === "rejected").length;

    const pendingAmountPage = requests
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + (Number(r.metadata?.amount) || 0), 0);

    const acceptedAmountPage = requests
      .filter((r) => r.status === "accept")
      .reduce((sum, r) => sum + (Number(r.metadata?.amount) || 0), 0);

    return {
      totalOnPage,
      pendingOnPage,
      acceptedOnPage,
      rejectedOnPage,
      pendingAmountPage,
      acceptedAmountPage,
    };
  }, [requests]);

  // Open Action Modal (Accept / Reject)
  const openActionModal = (request: WalletRedeemRequest, actionType: "accept" | "reject") => {
    setActionModalState({
      isOpen: true,
      request,
      actionType,
      isProcessing: false,
    });
  };

  // Execute Accept / Reject via Backend API (PUT request)
  const handleExecuteAction = async (payload: WalletRedeemActionPayload) => {
    try {
      setActionModalState((prev) => ({ ...prev, isProcessing: true }));

      const res = await httpClient.put(getCompleteUrlV1("request"), payload);

      if (res.ok) {
        showToast(
          `Successfully ${payload.status === "accept" ? "accepted" : "rejected"} payout request #${payload.id}.`,
          "success"
        );
        setActionModalState({ isOpen: false, request: null, actionType: null, isProcessing: false });
        if (detailDrawerRequest?._id === payload.id) {
          setDetailDrawerRequest(null);
        }

        // Re-fetch list directly from backend (Source of Truth)
        fetchRedemptionRequests(currentPage, activeStatusTab);

        // Re-fetch history if history drawer is currently open
        if (historyDrawerState.isOpen) {
          setHistoryDrawerState((prev) => ({ ...prev, refreshKey: prev.refreshKey + 1 }));
        }
      } else {
        const errorJson = await res.json().catch(() => ({}));
        showToast(errorJson.message || `Failed to ${payload.status} payout request.`, "error");
      }
    } catch (err) {
      console.error(`Error processing ${payload.status} request:`, err);
      showToast(`Network error performing ${payload.status} action.`, "error");
    } finally {
      setActionModalState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Open History Drawer
  const openUserHistory = (requesterId: string, requesterObj?: any) => {
    setHistoryDrawerState((prev) => ({
      isOpen: true,
      targetUserId: requesterId,
      requesterData: requesterObj,
      refreshKey: prev.refreshKey + 1,
    }));
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, label = "ID") => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 lg:p-8 space-y-6">
      {/* ── Breadcrumb & Header ── */}
      <div className="bg-white rounded-2xl px-5 py-3.5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Wallet Module", to: "/wallet/dashboard" },
              { label: "Withdrawal Requests", to: "/wallet/withdrawals" },
            ]}
          />
          <h1 className="text-xl font-bold text-slate-900 mt-1">Withdrawal Requests</h1>
          <p className="text-xs text-slate-500">
            Manage wallet redemption requests, payouts and redemption history.
          </p>
        </div>

        <button
          onClick={() => fetchRedemptionRequests(currentPage, activeStatusTab)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Summary KPI Cards (Page / Available Scope) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-bold text-slate-900 block">
            {formatNumberInIN(pagination.totalCount || pageStats.totalOnPage)}
          </span>
          <span className="text-[10px] text-slate-400">Total in view scope</span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-bold text-amber-900 block">
            {formatNumberInIN(pageStats.pendingOnPage)}
          </span>
          <span className="text-[10px] text-slate-400">Page pending count</span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Accepted
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-bold text-emerald-900 block">
            {formatNumberInIN(pageStats.acceptedOnPage)}
          </span>
          <span className="text-[10px] text-slate-400">Page accepted count</span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-bold text-rose-900 block">
            {formatNumberInIN(pageStats.rejectedOnPage)}
          </span>
          <span className="text-[10px] text-slate-400">Page rejected count</span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Amount
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm font-extrabold text-amber-900 block truncate">
            {formatIndianCurrency(pageStats.pendingAmountPage)}
          </span>
          <span className="text-[10px] text-slate-400">Page pending total</span>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Accepted Amount
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm font-extrabold text-emerald-900 block truncate">
            {formatIndianCurrency(pageStats.acceptedAmountPage)}
          </span>
          <span className="text-[10px] text-slate-400">Page accepted total</span>
        </div>
      </div>

      {/* ── Status Tabs & Search Controls ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending" },
              { id: "accept", label: "Accepted" },
              { id: "reject", label: "Rejected" },
            ].map((tab) => {
              const isActive = activeStatusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Mode Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, phone, ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Payment Mode Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={paymentModeFilter}
                onChange={(e) => setPaymentModeFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Modes</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Account</option>
                <option value="account">Account</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchRedemptionRequests(currentPage, activeStatusTab)}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Table Grid ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">User Information</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">Requested Date</th>
                <th className="py-3.5 px-4">Payout Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs font-semibold">
                    No redemption requests found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const requester = req.requester;
                  const fullName = requester
                    ? [requester.firstName, requester.lastName].filter(Boolean).join(" ") || "User"
                    : "User";

                  const payout = requester?.payoutDetails;
                  const upiId = payout?.upi?.upiId;
                  const bankAcc = payout?.bankAccount?.accountNumber;
                  const maskedBank = maskBankAccount(bankAcc);

                  const statusPill =
                    req.status === "accept"
                      ? { label: "Accepted", class: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 }
                      : req.status === "reject" || req.status === "rejected"
                      ? { label: "Rejected", class: "bg-rose-50 text-rose-700 border-rose-200", Icon: AlertTriangle }
                      : { label: "Pending", class: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock };

                  const StatusIconComp = statusPill.Icon;
                  const requesterId = req.requesterId || requester?._id;

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Request ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 text-[11px]" title={req._id}>
                            {req._id.substring(0, 10)}...
                          </span>
                          <button
                            onClick={() => handleCopyText(req._id, "Request ID")}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title="Copy full Request ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {requester?.profileImg ? (
                              <img
                                src={requester.profileImg}
                                alt={fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-slate-900 block truncate max-w-[150px]" title={fullName}>
                              {fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]" title={requester?.email}>
                              {requester?.email || requester?.phoneNumber || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                        {formatIndianCurrency(req.metadata?.amount || 0)}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                        {req.metadata?.paymentMode || req.metadata?.manualTranferSource || req.metadata?.source || "—"}
                      </td>

                      {/* Requested Date */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div>
                          <span>{req.createdAt ? moment(req.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {req.createdAt ? moment(req.createdAt).fromNow() : ""}
                          </span>
                        </div>
                      </td>

                      {/* Payout Method (Masked) */}
                      <td className="py-3 px-4">
                        {upiId ? (
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                            {upiId}
                          </span>
                        ) : bankAcc ? (
                          <div>
                            <span className="font-mono text-[11px] font-bold text-slate-800 block">
                              {maskedBank}
                            </span>
                            {payout?.bankAccount?.ifsc && (
                              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                                IFSC: {payout.bankAccount.ifsc}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No payout details</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill.class}`}
                        >
                          <StatusIconComp className="w-3 h-3" />
                          {statusPill.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setDetailDrawerRequest(req)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="View Full Details Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Accept (if pending) */}
                          {req.status === "pending" && (
                            <button
                              onClick={() => openActionModal(req, "accept")}
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                              title="Approve / Accept Request"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* Reject (if pending) */}
                          {req.status === "pending" && (
                            <button
                              onClick={() => openActionModal(req, "reject")}
                              className="p-1.5 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* View User History */}
                          {requesterId && (
                            <button
                              onClick={() => openUserHistory(requesterId, requester)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                              title="View User Redemption History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total requests)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION CONFIRMATION MODAL ── */}
      <WalletRedeemActionModal
        isOpen={actionModalState.isOpen}
        request={actionModalState.request}
        actionType={actionModalState.actionType}
        onClose={() =>
          setActionModalState({ isOpen: false, request: null, actionType: null, isProcessing: false })
        }
        onConfirm={handleExecuteAction}
        isProcessing={actionModalState.isProcessing}
      />

      {/* ── REDEMPTION DETAILS DRAWER ── */}
      <WalletRedeemDetailDrawer
        isOpen={Boolean(detailDrawerRequest)}
        request={detailDrawerRequest}
        onClose={() => setDetailDrawerRequest(null)}
        onAccept={(req) => openActionModal(req, "accept")}
        onReject={(req) => openActionModal(req, "reject")}
        onViewUserHistory={openUserHistory}
      />

      {/* ── USER REDEMPTION HISTORY DRAWER ── */}
      <WalletUserHistoryDrawer
        key={historyDrawerState.refreshKey}
        isOpen={historyDrawerState.isOpen}
        targetUserId={historyDrawerState.targetUserId}
        requesterData={historyDrawerState.requesterData}
        onClose={() => setHistoryDrawerState((prev) => ({ ...prev, isOpen: false, targetUserId: null }))}
      />
    </div>
  );
};
