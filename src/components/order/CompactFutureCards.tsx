import React from "react";
import { Link } from "react-router-dom";
import { OrderItem } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import {
  FaBan,
  FaGavel,
  FaBullhorn,
  FaWallet,
  FaExternalLinkAlt,
  FaInfoCircle,
} from "react-icons/fa";

interface Props {
  items: OrderItem[];
}

export const CompactFutureCards: React.FC<Props> = ({ items = [] }) => {
  // Attribution logic
  const promoterId = items.find((i) => i.promoterId)?.promoterId;
  const connectorId = items.find((i) => i.connectorId)?.connectorId;

  const totalPromoterComm = items.reduce((s, i) => s + (i.promoterCommission || 0), 0);
  const totalConnectorComm = items.reduce((s, i) => s + (i.connectorCommission || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* DEAL ATTRIBUTION */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FaBullhorn size={15} className="text-amber-500" />
          DEAL ATTRIBUTION
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Promoter</span>
            {promoterId ? (
              <div>
                <p className="font-mono font-bold text-slate-800 truncate">ID: {promoterId}</p>
                <p className="text-emerald-600 font-semibold mt-0.5">
                  Comm: {formatCurrency(totalPromoterComm)}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 italic">No promoter assigned</p>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Connector</span>
            {connectorId ? (
              <div>
                <p className="font-mono font-bold text-slate-800 truncate">ID: {connectorId}</p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  Comm: {formatCurrency(totalConnectorComm)}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 italic">No connector assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* FINANCIAL ACTIVITY / WALLET LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FaWallet size={15} className="text-indigo-500" />
            FINANCIAL ACTIVITY
          </h3>
          <Link
            to="/wallet/transactions"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            View Wallet Transactions <FaExternalLinkAlt size={10} />
          </Link>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
          <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <FaInfoCircle size={12} className="text-blue-500" /> Order Financial Summary:
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Detailed wallet ledger transactions are managed in the Wallet module. Use the link above to view transaction logs.
          </p>
        </div>
      </div>

      {/* CANCELLATION & REFUND (COMPACT EMPTY STATE) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FaBan size={14} className="text-rose-500" />
          CANCELLATION & REFUND
        </h3>
        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
          No cancellation activity recorded for this order.
        </div>
      </div>

      {/* DISPUTE & RESOLUTION (COMPACT EMPTY STATE) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FaGavel size={14} className="text-purple-500" />
          DISPUTE & RESOLUTION
        </h3>
        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
          No dispute raised for this order.
        </div>
      </div>
    </div>
  );
};
