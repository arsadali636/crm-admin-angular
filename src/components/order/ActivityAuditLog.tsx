import React, { useState } from "react";
import { Order } from "../../types";
import { formatDateTime } from "../../utils/formatters";
import { STATUS_LABEL } from "../../utils/Constant";
import { FaHistory, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface AuditEvent {
  type: "STATUS" | "AWB_UPDATE" | "COMMISSION_TRANSFER";
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
}

interface Props {
  order: Order;
}

export const ActivityAuditLog: React.FC<Props> = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize all available log arrays safely
  const events: AuditEvent[] = [];

  // 1. Status Change Logs
  if (Array.isArray(order.statusChangeLogs)) {
    order.statusChangeLogs.forEach((log) => {
      if (!log) return;
      events.push({
        type: "STATUS",
        title: `Status Changed to ${STATUS_LABEL[log.newStatus] || log.newStatus}`,
        detail: [
          log.oldStatus !== undefined && log.oldStatus !== null ? `From ${STATUS_LABEL[log.oldStatus] || log.oldStatus}` : "",
          log.reason ? `Reason: ${log.reason}` : "",
          log.message ? `Message: ${log.message}` : "",
        ].filter(Boolean).join(" • "),
        actor: log.changedBy || "System",
        timestamp: log.timestamp || order.createdAt,
      });
    });
  }

  // 2. AWB Update Logs
  if (Array.isArray(order.awbNumberUpdatedLogs)) {
    order.awbNumberUpdatedLogs.forEach((log) => {
      if (!log) return;
      events.push({
        type: "AWB_UPDATE",
        title: `AWB Updated to ${log.newAwb || "N/A"}`,
        detail: log.previousAwb ? `Previous AWB: ${log.previousAwb}` : "AWB initial assignment",
        actor: log.updatedBy || "System",
        timestamp: log.updatedAt || order.updatedAt || order.createdAt,
      });
    });
  }

  // 3. Commission Transferred Logs
  if (Array.isArray(order.order_items)) {
    order.order_items.forEach((item) => {
      if (item && Array.isArray(item.commissionTransferredLogs)) {
        item.commissionTransferredLogs.forEach((log) => {
          if (!log) return;
          events.push({
            type: "COMMISSION_TRANSFER",
            title: `Commission Transferred (${item.brand || "Item"})`,
            detail: `Method: ${log.transferMethod || "Direct transfer"}${log.amount ? ` • Amount: ₹${log.amount}` : ""}`,
            actor: log.transferredBy || "System",
            timestamp: log.transferredAt || order.updatedAt || order.createdAt,
          });
        });
      }
    });
  }

  // Sort events chronologically (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaHistory size={15} className="text-slate-500" />
          ACTIVITY & AUDIT LOG
        </h3>
        <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50 rounded-xl">
          No audit logs recorded for this order.
        </p>
      </div>
    );
  }

  const displayedEvents = isExpanded ? events : events.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaHistory size={15} className="text-slate-500" />
          ACTIVITY & AUDIT LOG
        </h3>
        <span className="text-xs font-bold text-slate-400">
          {events.length} {events.length === 1 ? "Activity" : "Activities"}
        </span>
      </div>

      <div className="space-y-2.5">
        {displayedEvents.map((evt, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase border ${
                    evt.type === "STATUS"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : evt.type === "AWB_UPDATE"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {evt.type}
                </span>
                <span className="font-bold text-slate-800">{evt.title}</span>
              </div>
              {evt.detail && <p className="text-slate-500 text-[11px]">{evt.detail}</p>}
            </div>

            <div className="text-right shrink-0 text-[10px] text-slate-400 font-medium">
              <p>{formatDateTime(evt.timestamp)}</p>
              <p className="font-mono text-slate-500">By: {evt.actor}</p>
            </div>
          </div>
        ))}
      </div>

      {events.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 rounded-xl border border-slate-200/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isExpanded ? (
            <>
              Show Less <FaChevronUp size={10} />
            </>
          ) : (
            <>
              Show All Audit Events ({events.length}) <FaChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
};
