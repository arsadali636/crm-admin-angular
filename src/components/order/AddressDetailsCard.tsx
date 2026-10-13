import React, { useState } from "react";
import { Address, OrderItem } from "../../types";
import { capitalize } from "../../utils/utils";
import { copyToClipboard } from "../../utils/formatters";
import { FaMapMarkerAlt, FaStore, FaCopy, FaCheck, FaPhoneAlt } from "react-icons/fa";

interface Props {
  buyerAddress?: Address;
  items: OrderItem[];
}

export const AddressDetailsCard: React.FC<Props> = ({ buyerAddress, items = [] }) => {
  const [copiedBuyer, setCopiedBuyer] = useState(false);
  const [copiedPickupIdx, setCopiedPickupIdx] = useState<number | null>(null);

  // Extract unique pickup addresses from items
  const pickupAddresses = React.useMemo(() => {
    const valid = items
      .map((item) => item.pickupAddress)
      .filter((addr): addr is NonNullable<typeof addr> =>
        Boolean(addr && (addr.name || addr.addressLine1 || addr.addressLine2 || addr.city || addr.state))
      );

    // Deduplicate by name + addressLine1 + city
    const seen = new Set<string>();
    return valid.filter((addr) => {
      const key = `${addr.name || ""}_${addr.addressLine1 || ""}_${addr.city || ""}_${addr.phone || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  const handleCopyBuyer = async () => {
    if (!buyerAddress) return;
    const parts = [
      buyerAddress.name,
      buyerAddress.addressLine1,
      buyerAddress.addressLine2,
      [buyerAddress.city ? capitalize(buyerAddress.city) : "", buyerAddress.state ? capitalize(buyerAddress.state) : ""].filter(Boolean).join(", ") + (buyerAddress.postalCode ? ` - ${buyerAddress.postalCode}` : ""),
      buyerAddress.landmark ? `Landmark: ${buyerAddress.landmark}` : "",
      buyerAddress.phone ? `Phone: ${buyerAddress.phone}` : "",
    ].filter(Boolean);
    const ok = await copyToClipboard(parts.join("\n"));
    if (ok) {
      setCopiedBuyer(true);
      setTimeout(() => setCopiedBuyer(false), 2000);
    }
  };

  const handleCopyPickup = async (pickup: any, idx: number) => {
    const parts = [
      pickup.name,
      pickup.addressLine1,
      pickup.addressLine2,
      [pickup.city || "", pickup.state || ""].filter(Boolean).join(", ") + (pickup.postalCode ? ` - ${pickup.postalCode}` : ""),
      pickup.phone ? `Phone: ${pickup.phone}` : "",
    ].filter(Boolean);
    const ok = await copyToClipboard(parts.join("\n"));
    if (ok) {
      setCopiedPickupIdx(idx);
      setTimeout(() => setCopiedPickupIdx(null), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BUYER SHIPPING ADDRESS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FaMapMarkerAlt size={15} className="text-emerald-500" />
            BUYER SHIPPING ADDRESS
          </h3>
          {buyerAddress && (
            <button
              onClick={handleCopyBuyer}
              className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
            >
              {copiedBuyer ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <FaCheck size={10} /> Copied
                </span>
              ) : (
                <>
                  <FaCopy size={10} /> Copy Address
                </>
              )}
            </button>
          )}
        </div>

        {buyerAddress ? (
          <div className="space-y-1.5 text-slate-600 text-sm leading-relaxed">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800">{buyerAddress.name}</p>
              {buyerAddress.isActive !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    buyerAddress.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {buyerAddress.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              )}
            </div>
            <p>{buyerAddress.addressLine1}</p>
            {buyerAddress.addressLine2 && <p>{buyerAddress.addressLine2}</p>}
            {buyerAddress.landmark && (
              <p className="text-xs text-slate-500 italic">Landmark: {buyerAddress.landmark}</p>
            )}
            <p className="font-semibold text-slate-700">
              {buyerAddress.city ? capitalize(buyerAddress.city) : ""},{" "}
              {buyerAddress.state ? capitalize(buyerAddress.state) : ""}
              {buyerAddress.postalCode && ` - ${buyerAddress.postalCode}`}
            </p>
            {buyerAddress.phone && (
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-50 flex items-center gap-1">
                <FaPhoneAlt size={10} className="text-slate-400" /> Phone: {buyerAddress.phone}
              </p>
            )}
            {buyerAddress.alternatePhone && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Alt Phone: {buyerAddress.alternatePhone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-3">No shipping address provided.</p>
        )}
      </div>

      {/* SELLER PICKUP ADDRESS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FaStore size={15} className="text-orange-500" />
            SELLER PICKUP ADDRESS
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {pickupAddresses.length} {pickupAddresses.length === 1 ? "Address" : "Addresses"}
          </span>
        </div>

        {pickupAddresses.length > 0 ? (
          <div className="space-y-3">
            {pickupAddresses.map((pickup, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1 text-xs text-slate-600"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <p className="font-bold text-slate-800">{pickup.name || `Pickup #${idx + 1}`}</p>
                  <button
                    onClick={() => handleCopyPickup(pickup, idx)}
                    className="text-[11px] text-slate-400 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPickupIdx === idx ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <FaCheck size={9} /> Copied
                      </span>
                    ) : (
                      <>
                        <FaCopy size={9} /> Copy
                      </>
                    )}
                  </button>
                </div>
                {pickup.addressLine1 && <p>{pickup.addressLine1}</p>}
                {pickup.addressLine2 && <p>{pickup.addressLine2}</p>}
                <p className="font-semibold text-slate-700">
                  {[pickup.city, pickup.state].filter(Boolean).join(", ")}
                  {pickup.postalCode && ` - ${pickup.postalCode}`}
                </p>
                {pickup.phone && (
                  <p className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-1">
                    <FaPhoneAlt size={9} className="text-slate-400" /> Phone: {pickup.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-3">No seller pickup address provided.</p>
        )}
      </div>
    </div>
  );
};
