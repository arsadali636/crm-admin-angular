import React from "react";
import { Order } from "../../types";
import { formatDateTime } from "../../utils/formatters";
import { FaTruck, FaBox, FaHistory, FaMapMarkerAlt } from "react-icons/fa";

interface Props {
  order: Order;
}

export const FulfillmentDeliveryCard: React.FC<Props> = ({ order }) => {
  const awbLogs = order.awbNumberUpdatedLogs || [];
  const shippingDetails = order.shippingDetails;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaTruck size={16} className="text-blue-500" />
          Fulfillment & Delivery
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
            order.deliveredAt
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : order.rtoAt
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : order.awbNumber
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {order.deliveredAt
            ? "DELIVERED"
            : order.rtoAt
            ? "RTO"
            : order.awbNumber
            ? "DISPATCHED"
            : "UNASSIGNED"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <FaBox size={12} className="text-blue-500" /> AWB / Tracking Number:
            </span>
          </div>
          <p className="font-mono text-sm font-extrabold text-slate-800">
            {order.awbNumber || "Not assigned"}
          </p>
          {order.awbNumberUpdatedAt && (
            <p className="text-[10px] text-slate-400">
              Updated: {formatDateTime(order.awbNumberUpdatedAt)}
            </p>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <FaTruck size={12} className="text-emerald-500" /> Expected Delivery:
          </span>
          <p className="text-sm font-bold text-slate-800">
            {formatDateTime(order.expectedDeliveryDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-500">Delivered At:</span>
          <span className="font-bold text-slate-800">
            {order.deliveredAt ? formatDateTime(order.deliveredAt) : "Not delivered"}
          </span>
        </div>

        <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-500">RTO At:</span>
          <span className="font-bold text-slate-800">
            {order.rtoAt ? formatDateTime(order.rtoAt) : "Not applicable"}
          </span>
        </div>
      </div>

      {/* Shipping Details if actually present and non-empty */}
      {(() => {
        const hasValidShippingDetails =
          Boolean(shippingDetails) &&
          (typeof shippingDetails === "string"
            ? shippingDetails.trim().length > 0
            : Array.isArray(shippingDetails)
            ? shippingDetails.length > 0
            : typeof shippingDetails === "object"
            ? Object.keys(shippingDetails).length > 0
            : false);

        if (!hasValidShippingDetails) return null;

        return (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <FaMapMarkerAlt size={12} className="text-indigo-500" /> Carrier & Dispatch Details:
            </p>
            {typeof shippingDetails === "string" ? (
              <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                {shippingDetails}
              </p>
            ) : Array.isArray(shippingDetails) ? (
              <div className="space-y-1.5">
                {shippingDetails.map((item, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                    {typeof item === "object" ? JSON.stringify(item) : String(item)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                {Object.entries(shippingDetails).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{key}:</span>
                    <span className="font-bold text-slate-700 ml-1.5">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* AWB Update History */}
      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <FaHistory size={12} className="text-slate-400" />
          <span>AWB Update History</span>
        </div>

        {awbLogs.length > 0 ? (
          <div className="space-y-1.5">
            {awbLogs.map((log, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 flex flex-wrap justify-between gap-2"
              >
                <span>AWB: <strong className="font-mono text-slate-800">{log.newAwb || log.previousAwb || "—"}</strong></span>
                <span>By: <strong>{log.updatedBy || "System"}</strong></span>
                <span>At: <strong>{formatDateTime(log.updatedAt)}</strong></span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic text-[11px] py-1">
            No AWB update logs recorded.
          </p>
        )}
      </div>
    </div>
  );
};
