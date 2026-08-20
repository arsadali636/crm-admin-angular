import React, { useState } from "react";
import { Order } from "../../types";
import { formatDateTime, copyToClipboard } from "../../utils/formatters";
import { FaInfoCircle, FaCopy, FaCheck } from "react-icons/fa";

interface Props {
  order: Order;
}

export const AdditionalTechnicalDetails: React.FC<Props> = ({ order }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const userIdStr = typeof order.userId === "object" ? order.userId?._id : order.userId;
  const sellerIdStr = typeof order.sellerId === "object" ? order.sellerId?._id : order.sellerId;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <FaInfoCircle size={15} className="text-slate-500" />
        ADDITIONAL TECHNICAL DETAILS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Order ID */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
          <div className="space-y-0.5 truncate">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Internal Order ID</span>
            <span className="font-mono font-bold text-slate-700 truncate block">{order._id}</span>
          </div>
          <button
            onClick={() => handleCopy(order._id, "_id")}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
            title="Copy ID"
          >
            {copiedField === "_id" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
          </button>
        </div>

        {/* Numeric Order ID */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Numeric Order ID</span>
            <span className="font-bold text-slate-700 block">#{order.numericOrderId}</span>
          </div>
          <button
            onClick={() => handleCopy(order.numericOrderId.toString(), "numericId")}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
            title="Copy Numeric ID"
          >
            {copiedField === "numericId" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
          </button>
        </div>

        {/* Buyer ID */}
        {userIdStr && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="space-y-0.5 truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Buyer Reference ID</span>
              <span className="font-mono font-bold text-slate-700 truncate block">{userIdStr}</span>
            </div>
            <button
              onClick={() => handleCopy(userIdStr, "userId")}
              className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
              title="Copy Buyer ID"
            >
              {copiedField === "userId" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
            </button>
          </div>
        )}

        {/* Seller ID */}
        {sellerIdStr && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="space-y-0.5 truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Seller Reference ID</span>
              <span className="font-mono font-bold text-slate-700 truncate block">{sellerIdStr}</span>
            </div>
            <button
              onClick={() => handleCopy(sellerIdStr, "sellerId")}
              className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
              title="Copy Seller ID"
            >
              {copiedField === "sellerId" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
            </button>
          </div>
        )}

        {/* Address ID */}
        {order.addressId && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="space-y-0.5 truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Address ID</span>
              <span className="font-mono font-bold text-slate-700 truncate block">{order.addressId}</span>
            </div>
            <button
              onClick={() => handleCopy(order.addressId!, "addressId")}
              className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
              title="Copy Address ID"
            >
              {copiedField === "addressId" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
            </button>
          </div>
        )}

        {/* Order GST Number */}
        {order.gstNumber && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="space-y-0.5 truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Order GST Number</span>
              <span className="font-mono font-bold text-slate-700 truncate block">{order.gstNumber}</span>
            </div>
            <button
              onClick={() => handleCopy(order.gstNumber!, "gstNumber")}
              className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
              title="Copy GST Number"
            >
              {copiedField === "gstNumber" ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
            </button>
          </div>
        )}

        {/* Created At */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Created At</span>
          <span className="font-bold text-slate-700 block">{formatDateTime(order.createdAt)}</span>
        </div>

        {/* Updated At */}
        {order.updatedAt && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Updated At</span>
            <span className="font-bold text-slate-700 block">{formatDateTime(order.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
