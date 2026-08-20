import React, { useState } from "react";
import { OrderItem } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { ProductImageLightboxModal } from "./ProductImageLightboxModal";
import {
  FaBoxOpen,
  FaTag,
  FaCoins,
  FaPercentage,
  FaChevronDown,
  FaChevronUp,
  FaStore,
} from "react-icons/fa";

interface Props {
  items: OrderItem[];
}

export const OrderItemsDetails: React.FC<Props> = ({ items }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    index: number;
  }>({
    isOpen: false,
    images: [],
    index: 0,
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openLightbox = (media: string[] | undefined, index = 0) => {
    if (!media || media.length === 0) return;
    setLightboxState({
      isOpen: true,
      images: media,
      index,
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center text-slate-400 text-xs italic">
        No product items found in this order.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <FaBoxOpen size={17} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">
            Product & Lot Details
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Item List */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isExpanded = expandedItems[item._id] ?? true;
          const media = item.media || [];
          const hasLot = !!item.lot || !!item.lotId;

          return (
            <div
              key={item._id || idx}
              className="border border-slate-200/80 rounded-xl bg-slate-55/30 overflow-hidden shadow-2xs hover:shadow-xs transition"
            >
              {/* Main Item Row Header */}
              <div className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3.5">
                  {/* Media Thumbnail */}
                  {media.length > 0 ? (
                    <div
                      onClick={() => openLightbox(media, 0)}
                      className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 cursor-pointer relative group"
                    >
                      <img
                        src={media[0]}
                        alt={item.brand || "Product"}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      {media.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-tl">
                          +{media.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] italic shrink-0">
                      No Image
                    </div>
                  )}

                  {/* Product Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">
                        #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.brand || "Lottmart Product"}
                      </h4>
                      {item.categoryId && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Cat: {item.categoryId}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {item.productId && <span>Product ID: <strong className="text-slate-600 font-mono">{item.productId}</strong></span>}
                      {item.masterId && <span>Master ID: <strong className="text-slate-600 font-mono">{item.masterId}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Price & Quantity Summary */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right text-xs">
                    <p className="text-slate-400">Quantity</p>
                    <p className="font-extrabold text-slate-800 text-sm">
                      {item.quantity} units
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="text-slate-400">Total Price</p>
                    <p className="font-extrabold text-blue-600 text-base">
                      {formatCurrency(item.totalAmount)}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="p-2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                  >
                    {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Sections */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-4 text-xs">
                  {/* Financial Breakdown per item */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">MRP</span>
                      <span className="font-bold text-slate-700">{formatCurrency(item.mrp)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Discount</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(item.totalDiscountWithQuantity)}{" "}
                        {item.totalDiscountPercentage ? `(${item.totalDiscountPercentage}%)` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Total Amount</span>
                      <span className="font-extrabold text-slate-800">{formatCurrency(item.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Selling Price / Unit</span>
                      <span className="font-bold text-slate-700">
                        {item.quantity ? formatCurrency(Math.round(item.totalAmount / item.quantity)) : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Lot Details */}
                  {hasLot ? (
                    <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <FaTag size={12} className="text-amber-600" />
                          <span>LOT DETAILS</span>
                          {item.lotId && <span className="font-mono text-amber-700 text-[11px]">#{item.lotId}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-amber-900">
                        <div>
                          <span className="text-amber-700 text-[10px] block">Lot Quantity</span>
                          <span className="font-bold">{item.lot?.quantity || "—"} units</span>
                        </div>
                        <div>
                          <span className="text-amber-700 text-[10px] block">Lot Price</span>
                          <span className="font-bold">{formatCurrency(item.lot?.price)}</span>
                        </div>
                        <div>
                          <span className="text-amber-700 text-[10px] block">Original Price</span>
                          <span className="font-bold">{formatCurrency(item.lot?.originalPrice)}</span>
                        </div>
                        <div>
                          <span className="text-amber-700 text-[10px] block">Lot Discount</span>
                          <span className="font-bold">
                            {item.lot?.discount !== undefined ? `${item.lot.discount}%` : "—"}
                          </span>
                        </div>
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-amber-700 font-semibold">Tags:</span>
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-100/60 p-2.5 rounded-xl text-slate-400 italic text-[11px]">
                      No lot information available for this item.
                    </div>
                  )}

                  {/* Item-level Security Token & Commission Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Token Breakdown */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                        <FaCoins size={11} className="text-emerald-500" />
                        <span>Item Security Tokens</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Buyer Token:</span>
                          <span className="font-bold text-slate-700">
                            {formatCurrency(item.buyerTokenAmount)}
                            {item.buyerTokenRefunded
                              ? " (Refunded)"
                              : item.buyerTokenDebited
                              ? " (Debited)"
                              : " (Not debited)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seller Token:</span>
                          <span className="font-bold text-slate-700">
                            {formatCurrency(item.sellerTokenAmount)}
                            {item.sellerTokenDebited ? " (Debited)" : " (Not debited)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commission Breakdown */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                        <FaPercentage size={11} className="text-violet-500" />
                        <span>Item Earnings & Commission</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Promoter Commission:</span>
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(item.promoterCommission)}
                            {item.promoterCommissionPercentage ? ` (${item.promoterCommissionPercentage}%)` : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connector Commission:</span>
                          <span className="font-bold text-slate-700">
                            {formatCurrency(item.connectorCommission)}
                            {item.connectorCommissionPercentage ? ` (${item.connectorCommissionPercentage}%)` : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Promotion Fee:</span>
                          <span className="font-bold text-slate-700">
                            {formatCurrency(item.promotionFeeAmount)}
                            {item.promotionFeePercentage ? ` (${item.promotionFeePercentage}%)` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Address for this item if available */}
                  {item.pickupAddress && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b border-slate-100 pb-1">
                        <FaStore size={11} className="text-orange-500" />
                        <span>Seller Pickup Address</span>
                      </div>
                      <p className="font-bold text-slate-800">{item.pickupAddress.name}</p>
                      <p>
                        {item.pickupAddress.addressLine1}
                        {item.pickupAddress.addressLine2 && `, ${item.pickupAddress.addressLine2}`}
                        {item.pickupAddress.city && `, ${item.pickupAddress.city}`}
                        {item.pickupAddress.state && `, ${item.pickupAddress.state}`}
                        {item.pickupAddress.postalCode && ` - ${item.pickupAddress.postalCode}`}
                      </p>
                      {item.pickupAddress.phone && (
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Phone: {item.pickupAddress.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <ProductImageLightboxModal
        images={lightboxState.images}
        currentIndex={lightboxState.index}
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState({ ...lightboxState, isOpen: false })}
        onSelectIndex={(idx) => setLightboxState({ ...lightboxState, index: idx })}
      />
    </div>
  );
};
