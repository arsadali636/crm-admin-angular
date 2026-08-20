import React from "react";
import { Order } from "../../types";
import { STATUS_LABEL, PAYMENT_METHODS } from "../../utils/Constant";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import {
  FaShieldAlt,
  FaCheck,
  FaTimes,
  FaTruck,
  FaUndoAlt,
  FaCoins,
  FaPhoneAlt,
} from "react-icons/fa";

interface Props {
  order: Order;
  isUpdating: boolean;
  onUpdateStatus: (statusId: number) => void;
}

export const OrderControlCenter: React.FC<Props> = ({
  order,
  isUpdating,
  onUpdateStatus,
}) => {
  const items = order.order_items || [];

  // Calculate aggregated item-aware token amounts
  const totalBuyerToken = items.reduce((sum, item) => sum + (item.buyerTokenAmount || 0), 0);
  const isAnyBuyerTokenDebited = items.some((item) => item.buyerTokenDebited);
  const isAnyBuyerTokenRefunded = items.some((item) => item.buyerTokenRefunded);

  const totalSellerToken = items.reduce((sum, item) => sum + (item.sellerTokenAmount || 0), 0);
  const isAnySellerTokenDebited = items.some((item) => item.sellerTokenDebited);

  // Delivery status derived from real API fields
  const deliveryStatusText = order.deliveredAt
    ? `Delivered on ${formatDateTime(order.deliveredAt)}`
    : order.rtoAt
    ? `RTO on ${formatDateTime(order.rtoAt)}`
    : order.expectedDeliveryDate
    ? `Expected ${formatDateTime(order.expectedDeliveryDate)}`
    : "Pending Delivery";

  // State flags for actions
  const isPending = order.status === 0;
  const isApproved = order.status === 1;
  const isDelivered = order.status === 4;
  const isCancelled = order.status === 3;
  const isRto = order.status === 5;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 shadow-xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <FaShieldAlt size={16} className="text-blue-400" />
          <h3 className="text-sm font-bold tracking-wider uppercase">
            Order Control Center
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Live Status
        </span>
      </div>

      {/* Operational State Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Order Status</p>
          <p className="font-bold text-white flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDelivered
                  ? "bg-emerald-400"
                  : isCancelled
                  ? "bg-rose-400"
                  : isApproved
                  ? "bg-blue-400"
                  : "bg-amber-400"
              }`}
            />
            {STATUS_LABEL[order.status] || `Status ${order.status}`}
          </p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method</p>
          <p className="font-bold text-white">
            {PAYMENT_METHODS[order.paymentMethod] || `Method ${order.paymentMethod}`}
          </p>
          <p className="text-[9px] text-slate-400 italic">Status not in API</p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Buyer Token</p>
          <p className="font-bold text-emerald-400 flex items-center gap-1">
            <FaCoins size={10} />
            {totalBuyerToken > 0 ? formatCurrency(totalBuyerToken) : "—"}
          </p>
          <p className="text-[9px] text-slate-300">
            {isAnyBuyerTokenRefunded
              ? "Refunded"
              : isAnyBuyerTokenDebited
              ? "Debited / Locked"
              : "Not debited"}
          </p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Seller Token</p>
          <p className="font-bold text-indigo-300 flex items-center gap-1">
            <FaCoins size={10} />
            {totalSellerToken > 0 ? formatCurrency(totalSellerToken) : "—"}
          </p>
          <p className="text-[9px] text-slate-300">
            {isAnySellerTokenDebited ? "Debited" : "Not debited"}
          </p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">AWB Tracking</p>
          <p className="font-bold text-slate-200 truncate">
            {order.awbNumber || "Not assigned"}
          </p>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Delivery</p>
          <p className="font-bold text-slate-200 truncate" title={deliveryStatusText}>
            {order.deliveredAt ? "Delivered" : order.rtoAt ? "RTO" : "Pending"}
          </p>
        </div>
      </div>

      {/* State-Aware Actions */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          State-Aware Actions
        </p>

        {isPending && (
          <button
            onClick={() => onUpdateStatus(1)}
            disabled={isUpdating}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FaCheck size={11} /> Approve Order
          </button>
        )}

        {isApproved && (
          <>
            <button
              onClick={() => onUpdateStatus(4)}
              disabled={isUpdating}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaTruck size={11} /> Mark as Delivered
            </button>

            <button
              onClick={() => onUpdateStatus(5)}
              disabled={isUpdating}
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaUndoAlt size={11} /> Mark as RTO
            </button>
          </>
        )}

        {(isPending || isApproved) && (
          <button
            onClick={() => onUpdateStatus(3)}
            disabled={isUpdating}
            className="w-full h-10 bg-rose-600/90 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FaTimes size={11} /> Cancel Order
          </button>
        )}

        {isDelivered && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-center">
            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <FaCheck size={12} /> Order Delivered
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              No further state changes allowed for delivered order.
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-center">
            <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1.5">
              <FaTimes size={12} /> Order Cancelled
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Order is cancelled and inactive.
            </p>
          </div>
        )}

        {isRto && (
          <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl text-center">
            <p className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5">
              <FaUndoAlt size={12} /> Return to Origin (RTO)
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Order returned to seller warehouse.
            </p>
          </div>
        )}
      </div>

      {/* Buyer Quick Contact */}
      {order.address?.phone && (
        <div className="pt-3 border-t border-slate-800">
          <a
            href={`tel:${order.address.phone}`}
            className="w-full h-9 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaPhoneAlt size={10} className="text-blue-400" /> Call Buyer ({order.address.phone})
          </a>
        </div>
      )}
    </div>
  );
};
