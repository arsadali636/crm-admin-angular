import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompleteUrlV1 } from "../utils";
import { httpClient } from "../services/ApiService";
import { Order } from "../types";
import BackButton from "../components/BackButton";
import { formatCurrency } from "../utils/formatters";
import {
  FaInfoCircle,
  FaBoxOpen,
  FaTruck,
  FaPercentage,
  FaHistory,
  FaThList,
} from "react-icons/fa";

// Modular Order Components
import { OrderHeader } from "../components/order/OrderHeader";
import { OrderControlCenter } from "../components/order/OrderControlCenter";
import { OrderLifecycleTimeline } from "../components/order/OrderLifecycleTimeline";
import { OrderItemsDetails } from "../components/order/OrderItemsDetails";
import { FinancialSummaryCard } from "../components/order/FinancialSummaryCard";
import { TokenSecurityCard } from "../components/order/TokenSecurityCard";
import { CommissionEarningsCard } from "../components/order/CommissionEarningsCard";
import { BuyerProfileCard } from "../components/order/BuyerProfileCard";
import { SellerProfileCard } from "../components/order/SellerProfileCard";
import { FulfillmentDeliveryCard } from "../components/order/FulfillmentDeliveryCard";
import { AddressDetailsCard } from "../components/order/AddressDetailsCard";
import { CompactFutureCards } from "../components/order/CompactFutureCards";
import { ActivityAuditLog } from "../components/order/ActivityAuditLog";
import { AdditionalTechnicalDetails } from "../components/order/AdditionalTechnicalDetails";
import { ProductSalesSummaryCard } from "../components/order/ProductSalesSummaryCard";

type TabKey = "items" | "shipping" | "commissions" | "audit" | "all";

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await httpClient.get(getCompleteUrlV1(`order/${id}`));
      if (res.ok) {
        const json = await res.json();
        console.log("ORDER_API_RESPONSE:", json);
        const orderData = Array.isArray(json.data)
          ? json.data[0]
          : json.data || (json._id ? json : null);
        if (orderData) {
          setOrder(orderData);
        }
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
      const payload = {
        id: order._id,
        status: statusId,
        reason: "Fulfillment updated from CRM Admin Order Control Center",
      };

      // Try PUT /order
      let res = await httpClient.put(getCompleteUrlV1("order"), payload);
      if (!res.ok) {
        // Fallback: try PUT /order/:id
        res = await httpClient.put(getCompleteUrlV1(`order/${order._id}`), {
          status: statusId,
          reason: "Fulfillment updated from CRM Admin Order Control Center",
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
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto mt-10">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <FaInfoCircle size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested order ID could not be located in CRM database.
        </p>
        <BackButton fallback="/orders" label="Order List" variant="button" className="mt-4" />
      </div>
    );
  }

  const extractStringId = (idVal: any): string | null => {
    if (!idVal) return null;
    if (typeof idVal === "string") return idVal;
    if (typeof idVal === "object") {
      if (idVal._id && typeof idVal._id === "string") return idVal._id;
      if (idVal.id && typeof idVal.id === "string") return idVal.id;
    }
    return String(idVal);
  };

  // Extract unique string productIds from order items
  const productIds = Array.from(
    new Set(
      (order.order_items || [])
        .map((item) =>
          extractStringId(item.productId) ||
          extractStringId((item as any).lot?.productId) ||
          extractStringId((order as any).productId)
        )
        .filter((idVal): idVal is string => Boolean(idVal) && typeof idVal === "string")
    )
  );

  const totalUnits = (order.order_items || []).reduce(
    (sum, i) => sum + (i.quantity || 0),
    0
  );
  const totalBuyerToken = (order.order_items || []).reduce(
    (sum, i) => sum + (i.buyerTokenAmount || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ORDER HEADER */}
      <OrderHeader
        order={order}
        isUpdating={isUpdating}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 2. EXECUTIVE OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Payable Amount Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Order Total Payable
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-blue-600">
              {formatCurrency(order.totalAmount)}
            </span>
            {order.totalMrpWithQuantity > order.totalAmount && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(order.totalMrpWithQuantity)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {order.totalDiscountPercentage ? `${order.totalDiscountPercentage}% Discount Applied` : "Standard Pricing"}
          </p>
        </div>

        {/* Items & Units Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Ordered Products
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">
              {order.order_items?.length || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {order.order_items?.length === 1 ? "Product" : "Products"} ({totalUnits} units)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {order.order_items?.[0]?.brand || "Lottmart Deal"}
          </p>
        </div>

        {/* Security Token Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Buyer Security Token
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(totalBuyerToken)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {order.order_items?.some((i) => i.buyerTokenDebited)
              ? "Debited & Locked in Vault"
              : "Token debit pending"}
          </p>
        </div>

        {/* Fulfillment Status Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Fulfillment / AWB
          </span>
          <div className="text-sm font-extrabold text-slate-800 truncate">
            {order.awbNumber ? (
              <span className="font-mono text-blue-600">{order.awbNumber}</span>
            ) : order.deliveredAt ? (
              <span className="text-emerald-600">Delivered</span>
            ) : (
              <span className="text-amber-600">AWB Not Assigned</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            {order.deliveredAt
              ? "Delivered successfully"
              : order.rtoAt
              ? "Returned to Origin"
              : "In fulfillment pipeline"}
          </p>
        </div>
      </div>

      {/* 3. SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-200/80">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaThList size={12} /> View All Sections
        </button>

        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "items"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaBoxOpen size={13} /> Items & Pricing
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "shipping"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaTruck size={13} /> Customer & Shipping
        </button>

        <button
          onClick={() => setActiveTab("commissions")}
          className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "commissions"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaPercentage size={12} /> Commission & Analytics
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "audit"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaHistory size={12} /> Timeline & Audit Logs
        </button>
      </div>

      {/* 4. MAIN TWO-COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Modular Content Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conditional Cancellation & Refund Banner (Only if order is cancelled or refunds exist) */}
          <CompactFutureCards
            items={order.order_items || []}
            orderStatus={order.status}
          />

          {/* TAB 1 / ALL: ITEMS & FINANCIAL BREAKDOWN */}
          {(activeTab === "all" || activeTab === "items") && (
            <div className="space-y-6">
              {/* Product & Lot Details */}
              <OrderItemsDetails items={order.order_items || []} />

              {/* Order Financial Summary & Security Tokens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinancialSummaryCard order={order} />
                <TokenSecurityCard items={order.order_items || []} />
              </div>
            </div>
          )}

          {/* TAB 2 / ALL: CUSTOMER, SELLER & FULFILLMENT */}
          {(activeTab === "all" || activeTab === "shipping") && (
            <div className="space-y-6">
              {/* Profiles: Buyer & Seller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BuyerProfileCard userId={order.userId} address={order.address} />
                <SellerProfileCard
                  sellerId={order.sellerId}
                  gstNumber={order.gstNumber}
                  items={order.order_items || []}
                />
              </div>

              {/* Addresses: Shipping & Pickup */}
              <AddressDetailsCard
                buyerAddress={order.address}
                items={order.order_items || []}
              />

              {/* Fulfillment & Delivery Tracking */}
              <FulfillmentDeliveryCard order={order} />
            </div>
          )}

          {/* TAB 3 / ALL: COMMISSION & SALES ANALYTICS */}
          {(activeTab === "all" || activeTab === "commissions") && (
            <div className="space-y-6">
              {/* Commission Earnings Card */}
              <CommissionEarningsCard
                items={order.order_items || []}
                orderId={order._id}
                orderStatus={order.status}
                orderDeliveredAt={order.deliveredAt}
                onRefresh={fetchOrder}
              />

              {/* Product Level Order & Sales Summary Analytics */}
              {productIds.map((prodId, pIdx) => {
                const matchingItem = (order.order_items || []).find(
                  (i) => extractStringId(i.productId) === prodId
                );
                return (
                  <ProductSalesSummaryCard
                    key={String(prodId) || String(pIdx)}
                    productId={String(prodId)}
                    productName={matchingItem?.brand || matchingItem?.description}
                  />
                );
              })}
            </div>
          )}

          {/* TAB 4 / ALL: TIMELINE & AUDIT LOGS */}
          {(activeTab === "all" || activeTab === "audit") && (
            <div className="space-y-6">
              {/* Order Lifecycle Timeline */}
              <OrderLifecycleTimeline history={order.statusChangeLogs || []} />

              {/* Activity Audit Log */}
              <ActivityAuditLog order={order} />

              {/* Additional Technical Details */}
              <AdditionalTechnicalDetails order={order} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Order Operations Control Center */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <OrderControlCenter
            order={order}
            isUpdating={isUpdating}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
};
