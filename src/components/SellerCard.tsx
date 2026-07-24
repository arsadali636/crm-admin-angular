import React from "react";
import { FiMail, FiPhone, FiMapPin, FiShield, FiStar } from "react-icons/fi";

interface SellerCardProps {
  req: any;
}

export const SellerCard: React.FC<SellerCardProps> = ({ req }) => {
  const product = req.metadata || {};
  const sellerDetails = product.sellerDetails || req.sellerDetails || req.seller || {};



  // Resolve Seller Name
  const firstName = sellerDetails.firstName || req.firstName || "";
  const lastName = sellerDetails.lastName || req.lastName || "";
  const sellerNameVal = `${firstName} ${lastName}`.trim() || sellerDetails.name || "Not Available";

  // Resolve Business Name
  const businessNameVal = sellerDetails.businessName || product.brandName || req.brand || "Not Available";

  // Resolve Contact
  const emailVal = req.email || sellerDetails.email || "Not Available";
  const phoneVal = req.phoneNumber || req.phone || sellerDetails.phoneNumber || sellerDetails.phone || "Not Available";

  // Resolve Address
  const addressVal = sellerDetails.address || sellerDetails.businessAddress || req.address || "Not Available";

  // Resolve Tax Details
  const gstVal = product.gstNumber || sellerDetails.gstNumber || sellerDetails.gst || "Not Available";
  const panVal = sellerDetails.pan || sellerDetails.panNumber || "Not Available";

  // Resolve verification status
  const verificationStatusVal = sellerDetails.verificationStatus || req.kycStatus || "pending";

  // Resolve Rating
  const ratingVal = sellerDetails.rating || sellerDetails.sellerRating || 4.5;

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<FiStar key={i} className="text-amber-400 fill-amber-400 inline-block mr-0.5" size={13} />);
      } else if (i - rating < 1) {
        stars.push(
          <div key={i} className="relative inline-block mr-0.5" style={{ width: "13px", height: "13px" }}>
            <FiStar className="text-slate-200 fill-slate-200 absolute" size={13} />
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <FiStar className="text-amber-400 fill-amber-400" size={13} />
            </div>
          </div>
        );
      } else {
        stars.push(<FiStar key={i} className="text-slate-200 fill-slate-200 inline-block" size={13} />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Seller Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg shadow-xs">
            {businessNameVal !== "Not Available" ? businessNameVal.substring(0, 2).toUpperCase() : "SL"}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">{businessNameVal}</h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
              <span>{sellerNameVal}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center" title={`Seller Rating: ${ratingVal}/5`}>
                {renderStars(ratingVal)}
                <span className="text-[10px] font-bold text-slate-500 ml-1">({ratingVal})</span>
              </div>
            </div>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold border capitalize ${
          verificationStatusVal === "verified"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-blue-50 text-blue-700 border-blue-100"
        }`}>
          <FiShield />
          {verificationStatusVal}
        </span>
      </div>

      {/* Seller Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        <div className="flex items-center gap-2.5">
          <FiMail className="text-slate-400 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email Address</span>
            <a href={`mailto:${emailVal}`} className="font-semibold text-slate-700 hover:text-indigo-600 transition">
              {emailVal}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <FiPhone className="text-slate-400 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Phone Number</span>
            <a href={`tel:${phoneVal}`} className="font-semibold text-slate-700 hover:text-indigo-600 transition">
              {phoneVal}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <FiShield className="text-slate-400 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">GST Registration</span>
            <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
              {gstVal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <FiShield className="text-slate-400 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">PAN Number</span>
            <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
              {panVal}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 md:col-span-2">
          <FiMapPin className="text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Registered Address</span>
            <span className="font-semibold text-slate-700 leading-relaxed block">
              {addressVal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
