import React, { useState } from "react";
import { Order } from "../../types";
import Breadcrumb from "../Breadcrumb";
import BackButton from "../BackButton";
import OrderStatusTag from "../../utils/OrderStatusTag";
import { formatDateTime, copyToClipboard } from "../../utils/formatters";
import {
  FaPrint,
  FaDownload,
  FaChevronDown,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

interface Props {
  order: Order;
  isUpdating: boolean;
  onUpdateStatus: (statusId: number) => void;
}

export const OrderHeader: React.FC<Props> = ({
  order,
  isUpdating,
  onUpdateStatus,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    const ok = await copyToClipboard(order._id);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      {/* Navigation & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Order List", to: "/orders" },
              { label: `Order #${order.numericOrderId}` },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <BackButton fallback="/orders" label="Order List" variant="icon" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Order #{order.numericOrderId}
            </h1>
            <OrderStatusTag status={order.status} size="sm" type="order" />
            {order.paymentMethod !== undefined && (
              <OrderStatusTag status={order.paymentMethod} size="sm" type="payment" />
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
            Placed on:{" "}
            <span className="font-bold text-slate-600">
              {formatDateTime(order.createdAt)}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto relative">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Print Invoice"
          >
            <FaPrint size={12} className="text-slate-500" /> Print Invoice
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download PDF"
          >
            <FaDownload size={12} className="text-slate-500" /> Download PDF
          </button>

          {/* Update Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Status"} <FaChevronDown size={10} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onUpdateStatus(0);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                >
                  Mark Pending
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onUpdateStatus(1);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                >
                  Approve Order
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onUpdateStatus(4);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onUpdateStatus(3);
                  }}
                  className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-semibold text-left"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onUpdateStatus(5);
                  }}
                  className="w-full px-4 py-2 text-xs text-purple-600 hover:bg-purple-50 transition font-semibold text-left"
                >
                  Mark RTO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Order ID Sub-bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Internal Order ID:</span>
          <span className="font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            {order._id}
          </span>
          <button
            onClick={handleCopyId}
            className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title="Copy ID"
          >
            {copied ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <FaCheck size={10} /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FaCopy size={10} /> Copy
              </span>
            )}
          </button>
        </div>

        {order.updatedAt && (
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Last Updated: {formatDateTime(order.updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
};
