import React, { useState } from "react";
import { OrderItem } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { FaCoins, FaLock, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Props {
  items: OrderItem[];
}

export const TokenSecurityCard: React.FC<Props> = ({ items = [] }) => {
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Aggregate numeric API fields safely across items
  const totalBuyerToken = items.reduce((sum, item) => sum + (item.buyerTokenAmount || 0), 0);
  const isAnyBuyerDebited = items.some((item) => item.buyerTokenDebited);
  const isAnyBuyerRefunded = items.some((item) => item.buyerTokenRefunded);

  const totalSellerToken = items.reduce((sum, item) => sum + (item.sellerTokenAmount || 0), 0);
  const isAnySellerDebited = items.some((item) => item.sellerTokenDebited);
  const isAnySellerRefunded = items.some((item) => item.sellerTokenRefunded);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaCoins size={16} className="text-emerald-500" />
          Token & Security
        </h3>
        <span className="text-[11px] font-bold text-slate-400 uppercase">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Token Card */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <FaLock size={10} className="text-emerald-600" /> Buyer Token
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isAnyBuyerRefunded
                  ? "bg-rose-100 text-rose-700 border-rose-200"
                  : isAnyBuyerDebited
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isAnyBuyerRefunded
                ? "REFUNDED"
                : isAnyBuyerDebited
                ? "DEBITED / LOCKED"
                : "NOT DEBITED"}
            </span>
          </div>

          <div>
            <p className="text-[10px] text-emerald-700 font-semibold uppercase">Order Total Buyer Token</p>
            <p className="text-xl font-black text-emerald-900">
              {formatCurrency(totalBuyerToken)}
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-100 text-[11px] space-y-1 text-emerald-800">
            <div className="flex justify-between">
              <span>Source:</span>
              <span className="font-semibold">
                {items[0]?.buyerTokenSource || "Not available"}
              </span>
            </div>
            {items[0]?.buyerTokenDebitedAt && (
              <div className="flex justify-between">
                <span>Debited At:</span>
                <span className="font-semibold">{formatDateTime(items[0].buyerTokenDebitedAt)}</span>
              </div>
            )}
            {items[0]?.buyerTokenRefundedAt && (
              <div className="flex justify-between">
                <span>Refunded At:</span>
                <span className="font-semibold">{formatDateTime(items[0].buyerTokenRefundedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seller Token Card */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
              <FaLock size={10} className="text-indigo-600" /> Seller Token
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isAnySellerRefunded
                  ? "bg-rose-100 text-rose-700 border-rose-200"
                  : isAnySellerDebited
                  ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isAnySellerRefunded
                ? "REFUNDED"
                : isAnySellerDebited
                ? "DEBITED"
                : "NOT DEBITED"}
            </span>
          </div>

          <div>
            <p className="text-[10px] text-indigo-700 font-semibold uppercase">Order Total Seller Token</p>
            <p className="text-xl font-black text-indigo-900">
              {formatCurrency(totalSellerToken)}
            </p>
          </div>

          <div className="pt-2 border-t border-indigo-100 text-[11px] space-y-1 text-indigo-800">
            <div className="flex justify-between">
              <span>Source:</span>
              <span className="font-semibold">
                {items[0]?.sellerTokenSource || "Not available"}
              </span>
            </div>
            {items[0]?.sellerTokenDebitedAt && (
              <div className="flex justify-between">
                <span>Debited At:</span>
                <span className="font-semibold">{formatDateTime(items[0].sellerTokenDebitedAt)}</span>
              </div>
            )}
            {items[0]?.sellerTokenRefundedAt && (
              <div className="flex justify-between">
                <span>Refunded At:</span>
                <span className="font-semibold">{formatDateTime(items[0].sellerTokenRefundedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item-level Details Toggle */}
      {items.length > 1 && (
        <div className="pt-2">
          <button
            onClick={() => setShowItemDetails(!showItemDetails)}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            {showItemDetails ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            {showItemDetails ? "Hide Item-level Tokens" : "View Item-level Token Breakdown"}
          </button>

          {showItemDetails && (
            <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 text-xs">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-slate-700"
                >
                  <span className="font-bold">Item #{idx + 1} ({item.brand || "Product"})</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span>Buyer: <strong>{formatCurrency(item.buyerTokenAmount)}</strong></span>
                    <span>Seller: <strong>{formatCurrency(item.sellerTokenAmount)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Reference Note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 italic">
        <span>Transaction reference:</span>
        <span className="font-semibold text-slate-500">Not available in current API</span>
      </div>
    </div>
  );
};
