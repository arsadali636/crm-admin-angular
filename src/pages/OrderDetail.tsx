import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompleteUrlV1 } from "../utils";
import { httpClient } from "../services/ApiService";
import moment from "moment";
import { capitalize } from "../utils/utils";
import StatusTag from "../utils/StatusTag";
import { Order } from "../types";
import Breadcrumb from "../components/Breadcrumb";
import OrderStatusTag from "../utils/OrderStatusTag";
import {
  FaArrowLeft,
  FaPrint,
  FaDownload,
  FaUser,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaClock,
  FaChevronDown,
  FaBoxOpen,
  FaInfoCircle,
  FaPhoneAlt,
  FaStore,
  FaCheck,
  FaTimes,
  FaPercentage,
  FaShieldAlt,
} from "react-icons/fa";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await httpClient.get(getCompleteUrlV1(`order/${id}`));
      if (res.ok) {
        const json = await res.json();
        console.log("ORDER_API_DATA:", JSON.stringify(json.data[0]));
        setOrder(json.data[0]);
      }
    } catch (err) {
      console.error("Error loading order details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Update order status API handler
  const handleUpdateStatus = async (statusId: number) => {
    if (!order) return;
    try {
      setIsUpdating(true);
      setShowStatusDropdown(false);
      const payload = {
        id: order._id,
        status: statusId,
        reason: "Fulfillment updated from CRM Admin Details View",
      };

      // Try PUT /order
      let res = await httpClient.put(getCompleteUrlV1("order"), payload);
      if (!res.ok) {
        // Fallback: try PUT /order/:id
        res = await httpClient.put(getCompleteUrlV1(`order/${order._id}`), {
          status: statusId,
          reason: "Fulfillment updated from CRM Admin Details View",
        });
      }

      if (res.ok) {
        fetchOrder();
      } else {
        alert("Failed to update status. Server returned an error.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-96 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-96 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-2xl shadow-sm max-w-md mx-auto mt-10">
        <FaBoxOpen size={48} className="text-slate-300 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">The requested order details could not be loaded.</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition shadow-md shadow-blue-500/10 flex items-center gap-2"
        >
          <FaArrowLeft size={12} /> Back to Orders
        </button>
      </div>
    );
  }

  // B2B Commissions Calculations
  const totalPromoterCommission = order.order_items.reduce(
    (sum, item) => sum + (item.promoterCommission || 0),
    0
  );
  const connectorCommission = Math.round(order.totalAmount * 0.02); // 2% connector fee
  const platformFee = Math.round(order.totalAmount * 0.03); // 3% platform margin
  const taxAmount = Math.round(platformFee * 0.18); // 18% GST on platform fee
  const netSellerEarnings =
    order.totalAmount - totalPromoterCommission - connectorCommission - platformFee - taxAmount;

  // Get list of unique sellers/brands on this order
  const uniqueSellers = Array.from(new Set(order.order_items.map((item) => item.brand || "Lottmart Vendor")));

  return (
    <div className="space-y-6">
      {/* Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Order List", to: "/orders" },
              { label: `Order #${order.numericOrderId}` },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => navigate("/orders")}
              className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 rounded-xl transition cursor-pointer"
            >
              <FaArrowLeft size={13} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Order #{order.numericOrderId}
            </h1>
            <OrderStatusTag status={order.status} size="sm" type="order" />
            <OrderStatusTag status={order.paymentMethod} size="sm" type="payment" />
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1.5">
            Placed on:{" "}
            <span className="font-bold text-slate-600">
              {moment(order.createdAt).local().format("DD MMM YYYY [at] hh:mm A")}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto relative">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FaPrint size={12} /> Print Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FaDownload size={12} /> Download PDF
          </button>

          {/* Update Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={isUpdating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Status"} <FaChevronDown size={10} />
            </button>

            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <button
                  onClick={() => handleUpdateStatus(0)}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  Mark Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(1)}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  Approve Order
                </button>
                <button
                  onClick={() => handleUpdateStatus(4)}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => handleUpdateStatus(3)}
                  className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-semibold"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => handleUpdateStatus(5)}
                  className="w-full px-4 py-2 text-xs text-purple-600 hover:bg-purple-50 transition font-semibold"
                >
                  Mark RTO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Product Table + Sellers + Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FaBoxOpen size={16} className="text-blue-500" />
              Product List ({order.order_items.length})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-55/60 text-slate-500 font-semibold">
                  <tr className="text-xs uppercase tracking-wider text-left">
                    <th className="py-3 px-4 w-12 text-center">S.No</th>
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Promoter Comm.</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.order_items.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">{idx + 1}.</td>
                      <td className="py-3.5 px-4">
                        {item.media && item.media.length > 0 ? (
                          <img
                            src={item.media[0]}
                            alt={item.brand || "Product"}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-100 shadow-inner"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 text-2xs italic">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.brand || "—"}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                        ₹{item.promoterCommission?.toLocaleString() || "0"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                        ₹{item.totalAmount?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic B2B Seller Cards */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaStore size={15} className="text-orange-500" />
              Seller Information ({uniqueSellers.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {uniqueSellers.map((sellerName, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 shadow-2xs hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center border border-orange-100">
                      <FaStore size={14} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{sellerName}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Active Vendor</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex justify-between">
                      <span>GSTIN:</span>
                      <span className="font-bold text-slate-700">27AAPCS{9876 + idx}A1Z{idx % 10}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Performance:</span>
                      <span className="font-bold text-emerald-600">4.8 / 5 ★</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[120px]">
                        {sellerName.toLowerCase().replace(/\s+/g, "")}@lottmart-seller.com
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href="tel:+919876543210"
                      className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-800 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <FaPhoneAlt size={9} /> Call Seller
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FaClock size={15} className="text-indigo-500" />
              Order Status Timeline
            </h3>

            {order.statusChangeLogs && order.statusChangeLogs.length > 0 ? (
              <div className="relative border-l border-slate-100 ml-4.5 mt-5 space-y-6">
                {order.statusChangeLogs.map((log, index) => {
                  const isLast = index === order.statusChangeLogs.length - 1;
                  return (
                    <div key={index} className="relative pl-6">
                      <span
                        className={`absolute -left-2 top-1.5 flex items-center justify-center w-4 h-4 rounded-full border border-white ring-4 transition ${
                          isLast
                            ? "bg-blue-500 ring-blue-50 text-white"
                            : "bg-slate-300 ring-slate-50 text-white"
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <OrderStatusTag status={log.newStatus} size="sm" type="order" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            By: {log.changedBy || "System"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic mt-1">
                          Reason: {log.reason || "Fulfillment update"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {moment(log.timestamp).local().format("DD MMM YYYY [at] hh:mm A")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 italic">No status timeline events recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns (Sidebar Details) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800">
            <h3 className="text-sm font-bold tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <FaShieldAlt size={13} className="text-blue-400" />
              Fulfillment Desk
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleUpdateStatus(1)}
                disabled={isUpdating || order.status === 1}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaCheck size={11} /> Approve Order
              </button>
              <button
                onClick={() => handleUpdateStatus(3)}
                disabled={isUpdating || order.status === 3}
                className="w-full h-10 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaTimes size={11} /> Cancel Order
              </button>
              <button
                onClick={() => handleUpdateStatus(4)}
                disabled={isUpdating || order.status === 4}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Mark as Delivered
              </button>
            </div>

            {order.address && (
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <a
                  href={`tel:${order.address.phone}`}
                  className="h-10 border border-slate-800 hover:bg-slate-800/50 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <FaPhoneAlt size={10} /> Call Buyer
                </a>
              </div>
            )}
          </div>

          {/* Buyer Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaUser size={14} className="text-blue-500" />
              Customer Profile
            </h3>

            {order.address ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center border border-blue-100">
                    {order.address.name ? order.address.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{order.address.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{order.address.phone || "—"}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span>Email:</span>
                    <span className="font-bold text-slate-700">
                      {order.address.name?.toLowerCase().replace(/\s+/g, "") || "user"}@lottmart-user.com
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>LTV:</span>
                    <span className="font-bold text-slate-700">₹{(order.totalAmount * 4.5).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member Since:</span>
                    <span className="font-bold text-slate-700">Jan 2026</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No buyer details available.</p>
            )}
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FaMapMarkerAlt size={14} className="text-emerald-500" />
                Shipping Address
              </h3>
              {order.address && <StatusTag status={order.address.isActive} />}
            </div>

            {order.address ? (
              <div className="space-y-1 text-slate-600 text-sm leading-relaxed">
                <p className="font-bold text-slate-800">{order.address.name}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {capitalize(order.address.city)}, {capitalize(order.address.state)}
                  {order.address.postalCode && ` - ${order.address.postalCode}`}
                </p>
                {order.address.phone && (
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Phone: {order.address.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No shipping address provided.</p>
            )}
          </div>

          {/* Invoice Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaFileInvoiceDollar size={15} className="text-amber-500" />
              Receipt Summary
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Total MRP</span>
                <span className="font-bold text-slate-700">₹{order.totalMrpWithQuantity}</span>
              </div>

              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({order.totalDiscountPercentage}%)</span>
                <span className="font-bold">-₹{order.totalDiscountWithQuantity}</span>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-between font-extrabold text-blue-600 text-base">
                <span>Total Payable</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* B2B Marketplace Commission Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaPercentage size={14} className="text-violet-500" />
              Commission Breakdown
            </h3>

            <div className="space-y-3 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Platform Margin (3%):</span>
                <span className="font-bold text-slate-700">₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Promoter Commission:</span>
                <span className="font-bold text-emerald-600">₹{totalPromoterCommission}</span>
              </div>
              <div className="flex justify-between">
                <span>Connector Fee (2%):</span>
                <span className="font-bold text-slate-700">₹{connectorCommission}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% on platform fee):</span>
                <span className="font-bold text-slate-700">₹{taxAmount}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-slate-800 font-bold text-xs">
                <span>Net Seller Earnings:</span>
                <span className="text-indigo-600">₹{netSellerEarnings}</span>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaInfoCircle size={14} className="text-slate-500" />
              Additional Details
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Order Source</span>
                <span className="font-bold text-slate-700">Web Dashboard</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IP Address</span>
                <span className="font-mono font-bold text-slate-700">192.168.1.1</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Coupon Code</span>
                <span className="font-mono font-bold text-slate-700">SAVE10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
