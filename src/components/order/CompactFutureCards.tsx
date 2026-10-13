import React from "react";
import { OrderItem } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { FaBan, FaCoins } from "react-icons/fa";

interface Props {
  items: OrderItem[];
  orderStatus?: number;
}

export const CompactFutureCards: React.FC<Props> = ({ items = [], orderStatus }) => {
  const isAnyBuyerRefunded = items.some((i) => i.buyerTokenRefunded);
  const isAnySellerRefunded = items.some((i) => i.sellerTokenRefunded);
  const isCancelled = orderStatus === 3;

  // Only display if there is actual cancellation or refund activity
  if (!isCancelled && !isAnyBuyerRefunded && !isAnySellerRefunded) {
    return null;
  }

  const refundedBuyerToken = items.reduce(
    (sum, i) => sum + (i.buyerTokenRefunded ? (i.buyerTokenAmount || 0) : 0),
    0
  );
  const refundedSellerToken = items.reduce(
    (sum, i) => sum + (i.sellerTokenRefunded ? (i.sellerTokenAmount || 0) : 0),
    0
  );

  return (
    <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
        <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <FaBan size={15} className="text-rose-600" />
          Cancellation & Refund Breakdown
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
          {isCancelled ? "Order Cancelled" : "Token Refunded"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-rose-150 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
            <FaCoins className="text-emerald-500" /> Buyer Token Refund
          </span>
          <p className="text-base font-extrabold text-slate-800">
            {formatCurrency(refundedBuyerToken)}
          </p>
          <p className="text-[11px] text-slate-500">
            {isAnyBuyerRefunded ? "Credited back to buyer wallet balance" : "No buyer refund processed"}
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-rose-150 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
            <FaCoins className="text-indigo-500" /> Seller Token Refund
          </span>
          <p className="text-base font-extrabold text-slate-800">
            {formatCurrency(refundedSellerToken)}
          </p>
          <p className="text-[11px] text-slate-500">
            {isAnySellerRefunded ? "Credited back to seller wallet balance" : "No seller refund processed"}
          </p>
        </div>
      </div>
    </div>
  );
};
