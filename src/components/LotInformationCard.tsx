import React from "react";
import { FiLayers } from "react-icons/fi";

interface LotInformationCardProps {
  product: any;
}

export const LotInformationCard: React.FC<LotInformationCardProps> = ({ product }) => {
  const getVal = (val: any) => {
    if (val === undefined || val === null || val === "") return "Not Available";
    return val;
  };

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

  const displayFields = [
    { label: "Lot Size", value: lotSizeVal !== undefined ? `${lotSizeVal} units` : "Not Available" },
    { label: "Units per Lot", value: unitsPerLotVal !== undefined ? `${unitsPerLotVal} units` : "Not Available" },
    { label: "Number of Lots", value: numberOfLotsVal !== undefined ? `${numberOfLotsVal} lots` : "Not Available" },
    { label: "Available Lots", value: availableLotsVal !== undefined ? `${availableLotsVal} lots` : "Not Available" },
    { label: "Available Quantity", value: availableQtyVal !== null && availableQtyVal !== undefined ? `${availableQtyVal} units` : "Not Available" },
    { label: "Min Order Qty (MOQ)", value: moqVal !== undefined ? `${moqVal} lots` : "Not Available" },
    { label: "Lot Weight", value: getVal(weightVal) },
    { label: "Lot Dimensions", value: getVal(dimensionsVal) },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <h2 className="text-md font-bold text-slate-800 mb-2 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
        Lot & Packaging Specifications
      </h2>

      {/* Lot Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {displayFields.map((field, idx) => (
          <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {field.label}
            </span>
            <span className="text-xs font-bold text-slate-700 block truncate">
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Lot Breakdown Table */}
      {lotArray.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <FiLayers />
            Lot Configurations ({lotArray.length})
          </h3>
          <div className="overflow-hidden border border-slate-150 rounded-xl">
            <table className="min-w-full divide-y divide-slate-150 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2 text-left">Lot index</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Base Price</th>
                  <th className="px-4 py-2 text-left">Discount</th>
                  <th className="px-4 py-2 text-left">Final Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-medium">
                {lotArray.map((item: any, idx: number) => {
                  const itemDiscount = item.discount !== undefined ? item.discount : 0;
                  const finalPrice = item.price;
                  const basePrice = item.originalPrice || finalPrice;

                  return (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-500">Lot #{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{item.quantity} units</td>
                      <td className="px-4 py-2.5">₹{basePrice}</td>
                      <td className="px-4 py-2.5 text-indigo-600 font-bold">{itemDiscount}% Off</td>
                      <td className="px-4 py-2.5 font-extrabold text-slate-900">₹{finalPrice}</td>
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
