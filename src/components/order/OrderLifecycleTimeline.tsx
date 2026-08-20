import React, { useState } from "react";
import { OrderStatusHistory } from "../../types";
import OrderStatusTag from "../../utils/OrderStatusTag";
import { formatDateTime } from "../../utils/formatters";
import { FaClock, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Props {
  history: OrderStatusHistory[];
}

export const OrderLifecycleTimeline: React.FC<Props> = ({ history }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaClock size={16} className="text-indigo-500" />
          Order Lifecycle Timeline
        </h3>
        <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
          No status change timeline events recorded for this order.
        </p>
      </div>
    );
  }

  // Display top 3 logs by default, expand for all
  const displayedHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaClock size={16} className="text-indigo-500" />
          Order Lifecycle Timeline
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {history.length} {history.length === 1 ? "Event" : "Events"}
        </span>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-3.5 pl-5 space-y-5 py-1">
        {displayedHistory.map((log, idx) => {
          const isLatest = idx === 0;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Indicator Dot */}
              <span
                className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 transition ${
                  isLatest
                    ? "bg-blue-600 ring-blue-100"
                    : "bg-slate-300 ring-slate-100"
                }`}
              />

              <div className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <OrderStatusTag status={log.newStatus} size="sm" type="order" />
                    {log.oldStatus !== undefined && log.oldStatus !== null && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <span>(From</span>
                        <OrderStatusTag status={log.oldStatus as number} size="sm" type="order" />
                        <span>)</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>

                {log.reason && (
                  <p className="text-xs text-slate-600 italic">
                    Reason: {log.reason}
                  </p>
                )}

                {log.message && (
                  <p className="text-xs text-slate-500">
                    Message: {log.message}
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Changed By: <strong className="text-slate-600 font-mono">{log.changedBy || "System"}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 rounded-xl border border-blue-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isExpanded ? (
            <>
              Show Less <FaChevronUp size={10} />
            </>
          ) : (
            <>
              Show All Timeline Logs ({history.length}) <FaChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
};
