import React from "react";
import { Order } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { PAYMENT_METHODS } from "../../utils/Constant";
import { FaFileInvoiceDollar, FaCreditCard } from "react-icons/fa";

interface Props {
  order: Order;
}

export const FinancialSummaryCard: React.FC<Props> = ({ order }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <FaFileInvoiceDollar size={16} className="text-amber-500" />
        Order Financial Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Total MRP</span>
          <span className="font-bold text-slate-700">
            {formatCurrency(order.totalMrpWithQuantity)}
          </span>
        </div>

        <div className="flex justify-between text-emerald-600 font-medium">
          <span>
            Discount{" "}
            {order.totalDiscountPercentage !== undefined && order.totalDiscountPercentage !== null
              ? `(${order.totalDiscountPercentage}%)`
              : ""}
          </span>
          <span className="font-bold">
            {order.totalDiscountWithQuantity !== undefined && order.totalDiscountWithQuantity !== null
              ? `- ${formatCurrency(order.totalDiscountWithQuantity)}`
              : "—"}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-blue-600 text-base">
          <span>Total Payable</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            <FaCreditCard size={12} className="text-slate-400" /> Payment Method:
          </span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            {PAYMENT_METHODS[order.paymentMethod] || `Method ${order.paymentMethod}`}
          </span>
        </div>
      </div>
    </div>
  );
};
