import React from "react";
import { FiLayers, FiStar } from "react-icons/fi";

interface LotInformationCardProps {
  product: any;
}

export const LotInformationCard: React.FC<LotInformationCardProps> = ({ product }) => {
  const lotSizeVal = product.lotSize !== undefined ? product.lotSize : product.unitsPerLot;
  const unitsPerLotVal = product.unitsPerLot !== undefined ? product.unitsPerLot : product.lotSize;
  const numberOfLotsVal = product.numberOfLots !== undefined ? product.numberOfLots : product.stock;
  const moqVal = product.moq !== undefined ? product.moq : product.minimumOrderQuantity;
  const availableLotsVal = product.availableLots !== undefined ? product.availableLots : product.stock;
  
  let availableQtyVal = product.availableQuantity;
  if (availableQtyVal === undefined || availableQtyVal === null) {
    if (availableLotsVal !== undefined && availableLotsVal !== null && lotSizeVal !== undefined && lotSizeVal !== null) {
      availableQtyVal = Number(availableLotsVal) * Number(lotSizeVal);
    } else {
      availableQtyVal = null;
    }
  }

  const weightVal = product.lotWeight || product.weight;
  const dimensionsVal = product.lotDimensions || product.dimensions;

  const lotArray = Array.isArray(product.lot) ? product.lot : [];
  const bestSellerLot = product.bestSellerLot || {};

  // Display grid cells for valid non-empty fields only
  const displayFields = [
    { label: "Lot Size", value: lotSizeVal !== undefined ? `${lotSizeVal} units` : null },
    { label: "Units per Lot", value: unitsPerLotVal !== undefined ? `${unitsPerLotVal} units` : null },
    { label: "Number of Lots", value: numberOfLotsVal !== undefined ? `${numberOfLotsVal} lots` : null },
    { label: "Available Lots", value: availableLotsVal !== undefined ? `${availableLotsVal} lots` : null },
    { label: "Available Quantity", value: availableQtyVal !== null && availableQtyVal !== undefined ? `${availableQtyVal} units` : null },
    { label: "Min Order Qty (MOQ)", value: moqVal !== undefined ? `${moqVal} lots` : null },
    { label: "Lot Weight", value: weightVal ? String(weightVal) : null },
    { label: "Lot Dimensions", value: dimensionsVal ? String(dimensionsVal) : null },
  ].filter(f => f.value !== null);

  // If no lots and no display fields, return null to dynamically hide empty section
  if (displayFields.length === 0 && lotArray.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
          Lots & Bulk Pricing Configuration
        </h2>
        {lotArray.length > 0 && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
            {lotArray.length} Lot Configuration{lotArray.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lot Info Grid */}
      {displayFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayFields.map((field, idx) => (
            <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {field.label}
              </span>
              <span className="text-xs font-bold text-slate-800 block truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full Responsive Lot Breakdown Table */}
      {lotArray.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <FiLayers className="text-teal-600" />
              Complete Bulk Lots & Tiered Pricing Matrix
            </h3>
            {bestSellerLot.price && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <FiStar size={11} className="fill-amber-400 text-amber-500" /> Best Seller Config: Qty {bestSellerLot.quantity} @ ₹{bestSellerLot.price}
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs scrollbar-thin">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Lot #</th>
                  <th className="px-4 py-3 text-left">Lot ID</th>
                  <th className="px-4 py-3 text-left">Lot Quantity</th>
                  <th className="px-4 py-3 text-left">Original / Base Price</th>
                  <th className="px-4 py-3 text-left">Discount %</th>
                  <th className="px-4 py-3 text-left">Final Lot Price</th>
                  <th className="px-4 py-3 text-center">Badge / Highlight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-medium">
                {lotArray.map((item: any, idx: number) => {
                  const isBestSeller = (bestSellerLot._id && item._id === bestSellerLot._id) ||
                    (bestSellerLot.quantity && item.quantity === bestSellerLot.quantity) ||
                    idx === 0;

                  const itemDiscount = item.discount !== undefined ? item.discount : 0;
                  const finalPrice = item.price;
                  const basePrice = item.originalPrice || finalPrice;

                  return (
                    <tr
                      key={item._id || idx}
                      className={`transition ${
                        isBestSeller
                          ? "bg-amber-50/40 font-semibold border-l-4 border-l-amber-400"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-4 py-3 font-extrabold text-slate-900">Lot #{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                        {item._id || item.id || `LOT-${idx + 1}`}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.quantity} units</td>
                      <td className="px-4 py-3 text-slate-500">₹{basePrice}</td>
                      <td className="px-4 py-3 text-indigo-600 font-bold">
                        {itemDiscount > 0 ? `${itemDiscount}% Off` : "0%"}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 text-sm">₹{finalPrice}</td>
                      <td className="px-4 py-3 text-center">
                        {isBestSeller ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                            <FiStar size={11} className="fill-amber-400 text-amber-500" /> Best Seller Lot
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotInformationCard;
