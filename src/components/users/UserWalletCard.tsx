import React, { useState, useEffect, useCallback } from "react";
import { Wallet, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { httpClient } from "../../services/ApiService";
import { getCompleteUrlV1 } from "../../utils";
import { formatIndianCurrency } from "../../utils/utils";
import moment from "moment";

interface WalletApiData {
  _id?: string;
  userId?: string;
  balance?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserWalletCardProps {
  userId?: string;
}

export const UserWalletCard: React.FC<UserWalletCardProps> = ({ userId }) => {
  const [walletData, setWalletData] = useState<WalletApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("User ID unavailable for wallet retrieval.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await httpClient.get(getCompleteUrlV1("wallet", { userId }));

      if (res.ok) {
        const json = await res.json();
        setWalletData(json.data || null);
      } else {
        setError("Unable to load wallet balance");
      }
    } catch (err) {
      console.error("Wallet API error:", err);
      setError("Unable to load wallet balance");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Reset and fetch immediately when userId changes
  useEffect(() => {
    setWalletData(null);
    setLoading(true);
    setError(null);
    if (userId) {
      fetchWallet();
    } else {
      setLoading(false);
      setError("User ID unavailable for wallet retrieval.");
    }
  }, [userId, fetchWallet]);

  const currencySymbol = walletData?.currency === "INR" || !walletData?.currency ? "₹" : walletData.currency + " ";
  const rawBalance = walletData?.balance;
  const hasValidBalance = rawBalance !== undefined && rawBalance !== null && !isNaN(rawBalance);
  const formattedBalance = hasValidBalance
    ? walletData?.currency === "INR" || !walletData?.currency
      ? formatIndianCurrency(rawBalance)
      : `${currencySymbol}${rawBalance.toLocaleString()}`
    : "—";

  const walletStatus = walletData?.status || "active";

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-white/70 flex items-center gap-2">
          <Wallet size={15} />
          CRM Active Wallet
        </h3>
        <div className="flex items-center gap-2">
          {!loading && !error && walletStatus && (
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <CheckCircle2 size={10} />
              {walletStatus}
            </span>
          )}
          <button
            onClick={fetchWallet}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white cursor-pointer disabled:opacity-50"
            title="Refresh wallet balance"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-3 bg-white/10 rounded w-1/3"></div>
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-semibold">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchWallet}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Main Available Balance */}
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 uppercase font-medium">Available Balance</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {formattedBalance}
            </h1>
            {walletData?.updatedAt && (
              <span className="text-[10px] text-white/40 block">
                Last updated: {moment(walletData.updatedAt).format("DD MMM YYYY, HH:mm")}
              </span>
            )}
          </div>

          {/* Secondary Financial Metrics (N/A unless provided by backend) */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-white/5">
            <div>
              <span className="text-white/40">Locked Balance</span>
              <p className="font-bold text-white/60 mt-0.5">N/A</p>
            </div>
            <div>
              <span className="text-white/40">Lifetime Earnings</span>
              <p className="font-bold text-white/60 mt-0.5">N/A</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-white/40">Withdrawals</span>
              <p className="font-bold text-white/60 mt-0.5">N/A</p>
            </div>
            <div>
              <span className="text-white/40">Pending Payouts</span>
              <p className="font-bold text-white/60 mt-0.5">N/A</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
