import React, { useState } from "react";
import { OrderItem } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { FaPercentage, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Props {
  items: OrderItem[];
}

export const CommissionEarningsCard: React.FC<Props> = ({ items = [] }) => {
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Safely aggregate item-level commission fields across items
  const totalPromoterCommission = items.reduce(
    (sum, item) => sum + (item.promoterCommission || 0),
    0
  );

  const totalConnectorCommission = items.reduce(
    (sum, item) => sum + (item.connectorCommission || 0),
    0
  );

  const totalPromotionFee = items.reduce(
    (sum, item) => sum + (item.promotionFeeAmount || 0),
    0
  );

  const isTransferred = items.some((item) => item.commissionTransferred);

  // Check if logs exist on any item
  const transferLogs = (Array.isArray(items) ? items : []).flatMap((item) =>
    item && Array.isArray(item.commissionTransferredLogs) ? item.commissionTransferredLogs : []
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaPercentage size={15} className="text-violet-500" />
          Commission & Earnings
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
            isTransferred
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {isTransferred ? "TRANSFERRED" : "NOT TRANSFERRED"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">
            Promoter Commission
          </p>
          <p className="text-base font-extrabold text-emerald-600">
            {formatCurrency(totalPromoterCommission)}
          </p>
          {items[0]?.promoterCommissionPercentage !== undefined && (
            <p className="text-[10px] text-slate-400 font-medium">
              Rate: {items[0].promoterCommissionPercentage}%
            </p>
          )}
          {items[0]?.promoterId ? (
            <p className="text-[10px] text-slate-500 font-mono">
              ID: {items[0].promoterId}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 italic">No promoter ID</p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">
            Connector Commission
          </p>
          <p className="text-base font-extrabold text-slate-800">
            {formatCurrency(totalConnectorCommission)}
          </p>
          {items[0]?.connectorCommissionPercentage !== undefined && (
            <p className="text-[10px] text-slate-400 font-medium">
              Rate: {items[0].connectorCommissionPercentage}%
            </p>
          )}
          {items[0]?.connectorId ? (
            <p className="text-[10px] text-slate-500 font-mono">
              ID: {items[0].connectorId}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 italic">No connector ID</p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">
            Promotion Fee
          </p>
          <p className="text-base font-extrabold text-slate-800">
            {formatCurrency(totalPromotionFee)}
          </p>
          {items[0]?.promotionFeePercentage !== undefined && (
            <p className="text-[10px] text-slate-400 font-medium">
              Rate: {items[0].promotionFeePercentage}%
            </p>
          )}
        </div>
      </div>

      {/* Transfer Logs if present */}
      {transferLogs.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
          <p className="font-bold text-slate-700">Commission Transfer Logs:</p>
          <div className="space-y-1.5">
            {transferLogs.map((log, lIdx) => (
              <div key={lIdx} className="p-2 bg-slate-50 rounded-lg text-slate-600 flex justify-between">
                <span>Method: {log.transferMethod || "Direct"}</span>
                <span>By: {log.transferredBy || "System"}</span>
                <span>At: {formatDateTime(log.transferredAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item-level Details Toggle */}
      {items.length > 1 && (
        <div className="pt-2">
          <button
            onClick={() => setShowItemDetails(!showItemDetails)}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            {showItemDetails ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            {showItemDetails ? "Hide Item-level Commissions" : "View Item-level Commission Breakdown"}
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
                    <span>Promoter: <strong>{formatCurrency(item.promoterCommission)}</strong></span>
                    <span>Connector: <strong>{formatCurrency(item.connectorCommission)}</strong></span>
                    <span>Promo Fee: <strong>{formatCurrency(item.promotionFeeAmount)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
