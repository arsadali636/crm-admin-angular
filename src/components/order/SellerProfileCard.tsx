import React from "react";
import { OrderItem } from "../../types";
import { FaStore, FaMapMarkerAlt, FaPhoneAlt, FaInfoCircle } from "react-icons/fa";

interface Props {
  sellerId?: string | any;
  gstNumber?: string;
  items: OrderItem[];
}

export const SellerProfileCard: React.FC<Props> = ({ sellerId, gstNumber, items = [] }) => {
  // Extract unique sellers from items
  const uniqueSellersMap = new Map<string, { id: string; brand: string; pickup?: any }>();

  items.forEach((item) => {
    const sId = typeof item.sellerId === "object" ? item.sellerId?._id : item.sellerId || sellerId || "Vendor";
    const brandName = item.brand || "Lottmart Vendor";
    if (!uniqueSellersMap.has(sId)) {
      uniqueSellersMap.set(sId, {
        id: sId,
        brand: brandName,
        pickup: item.pickupAddress,
      });
    }
  });

  const uniqueSellers = Array.from(uniqueSellersMap.values());

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaStore size={15} className="text-orange-500" />
          SELLER PROFILE
        </h3>
        <span className="text-xs font-bold text-slate-400">
          {uniqueSellers.length} {uniqueSellers.length === 1 ? "Seller" : "Sellers"}
        </span>
      </div>

      <div className="space-y-4">
        {uniqueSellers.map((seller, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center border border-orange-100 shrink-0">
                <FaStore size={14} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{seller.brand}</h4>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                  Seller ID: {seller.id}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 pt-1">
              {gstNumber && (
                <div className="flex justify-between">
                  <span>Order GST Number:</span>
                  <span className="font-bold text-slate-700 font-mono">{gstNumber}</span>
                </div>
              )}

              {seller.pickup && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <p className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                    <FaMapMarkerAlt size={10} className="text-orange-500" /> Pickup Location:
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {seller.pickup.name ? `${seller.pickup.name}, ` : ""}
                    {seller.pickup.addressLine1 ? `${seller.pickup.addressLine1}, ` : ""}
                    {seller.pickup.city ? `${seller.pickup.city}, ` : ""}
                    {seller.pickup.state ? seller.pickup.state : ""}
                  </p>
                  {seller.pickup.phone && (
                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 pt-0.5">
                      <FaPhoneAlt size={9} /> {seller.pickup.phone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Unavailable Information Notice */}
        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
          <FaInfoCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <span>
            Additional seller profile information (email, company status, ratings) is not available in current order API.
          </span>
        </div>
      </div>
    </div>
  );
};
