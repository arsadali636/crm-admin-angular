import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiShield, FiCopy, FiNavigation } from "react-icons/fi";

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[9px] font-extrabold text-emerald-600">Copied!</span>
      ) : (
        <FiCopy size={11} />
      )}
    </button>
  );
};

interface SellerCardProps {
  req: any;
}

export const SellerCard: React.FC<SellerCardProps> = ({ req }) => {
  const metadata = req?.metadata || {};
  const productDetails = metadata.productDetails || {};
  const product = { ...metadata, ...productDetails };
  const sellerDetails = product.sellerDetails || req.sellerDetails || req.seller || req.requester?.seller || {};
  const pickupAddress = product.pickupAddress || metadata.pickupAddress || {};

  // Resolve Seller Name & ID
  const sellerId = req.sellerId || req.requester?._id || req.seller?._id;
  const firstName = sellerDetails.firstName || req.requester?.firstName || req.firstName || "";
  const lastName = sellerDetails.lastName || req.requester?.lastName || req.lastName || "";
  const sellerNameVal = `${firstName} ${lastName}`.trim() || sellerDetails.name || pickupAddress.name || "Seller Account";

  // Business Name
  const businessNameVal = sellerDetails.businessName || product.brandName || req.brand || sellerNameVal;

  // Contact
  const emailVal = req.requester?.email || req.email || sellerDetails.email;
  const phoneVal = req.requester?.phoneNumber || req.phoneNumber || req.phone || sellerDetails.phoneNumber || sellerDetails.phone;
  const altPhoneVal = sellerDetails.alternatePhone || req.altPhone || pickupAddress.alternatePhoneNumber || pickupAddress.altPhone;

  // Address
  const registeredAddress = sellerDetails.address || sellerDetails.businessAddress || req.address;

  // Pickup Specific Address
  const pickupContactName = pickupAddress.name || pickupAddress.contactName || sellerNameVal;
  const pickupPhone = pickupAddress.phoneNumber || pickupAddress.phone || pickupAddress.mobile || phoneVal;
  const addressLine1 = pickupAddress.address1 || pickupAddress.line1;
  const addressLine2 = pickupAddress.address2 || pickupAddress.line2;
  const landmark = pickupAddress.landmark;
  const city = pickupAddress.city || sellerDetails.city;
  const state = pickupAddress.state || sellerDetails.state;
  const postalCode = pickupAddress.postalCode || pickupAddress.pincode || sellerDetails.pincode;
  const latitude = pickupAddress.lat || pickupAddress.latitude || req.latitude;
  const longitude = pickupAddress.lng || pickupAddress.longitude || req.longitude;

  const fullPickupAddressString = [addressLine1, addressLine2, landmark, city, state, postalCode].filter(Boolean).join(", ");

  // Verification Status
  const verificationStatusVal = sellerDetails.verificationStatus || req.kycStatus || "verified";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Seller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs select-none">
            {businessNameVal ? businessNameVal.substring(0, 2).toUpperCase() : "SL"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Business Name:
              </span>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">{businessNameVal}</h2>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200">
                Active Seller
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Seller Name: {sellerNameVal}</span>
              {sellerId && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="font-mono text-[10px] text-slate-400">ID: {String(sellerId).substring(0, 10)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-2xs font-extrabold uppercase tracking-wider border ${
            verificationStatusVal === "verified"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            <FiShield size={13} />
            KYC {verificationStatusVal}
          </span>
        </div>
      </div>

      {/* Seller & Pickup Address Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
        {emailVal && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiMail className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Email Address</span>
              <span className="font-semibold text-slate-800 flex items-center justify-between mt-0.5 truncate">
                <a href={`mailto:${emailVal}`} className="hover:text-indigo-600 truncate">{emailVal}</a>
                <CopyButton value={emailVal} />
              </span>
            </div>
          </div>
        )}

        {phoneVal && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiPhone className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Primary Phone</span>
              <span className="font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                <a href={`tel:${phoneVal}`} className="hover:text-indigo-600">{phoneVal}</a>
                <CopyButton value={phoneVal} />
              </span>
            </div>
          </div>
        )}

        {altPhoneVal && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiPhone className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Alternate Phone</span>
              <span className="font-semibold text-slate-800 flex items-center justify-between mt-0.5">
                <span>{altPhoneVal}</span>
                <CopyButton value={altPhoneVal} />
              </span>
            </div>
          </div>
        )}

        {registeredAddress && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5 md:col-span-2">
            <FiMapPin className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Registered Business Address</span>
              <span className="font-semibold text-slate-800 leading-relaxed block capitalize">{registeredAddress}</span>
            </div>
          </div>
        )}

        {/* Pickup Address Dedicated Block */}
        {fullPickupAddressString && (
          <div className="md:col-span-2 p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                <FiMapPin className="text-amber-600" /> Dispatch & Pickup Location Snapshot
              </span>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded border border-amber-300">
                Primary Pickup Point
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Contact Person</span>
                <span className="font-bold text-slate-900 block">{pickupContactName}</span>
              </div>

              {pickupPhone && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pickup Phone</span>
                  <span className="font-bold text-slate-900 flex items-center">{pickupPhone} <CopyButton value={pickupPhone} /></span>
                </div>
              )}

              {/* Labeled Address Fields Breakdown */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white/80 p-3 rounded-xl border border-amber-200/60">
                {addressLine1 && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Address Line 1</span>
                    <span className="font-semibold text-slate-800 block capitalize">{addressLine1}</span>
                  </div>
                )}
                {addressLine2 && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Address Line 2</span>
                    <span className="font-semibold text-slate-800 block capitalize">{addressLine2}</span>
                  </div>
                )}
                {landmark && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Landmark</span>
                    <span className="font-semibold text-slate-800 block capitalize">{landmark}</span>
                  </div>
                )}
                {(city || state) && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">City & State</span>
                    <span className="font-semibold text-slate-800 block capitalize">{[city, state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {postalCode && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Pincode / Postal Code</span>
                    <span className="font-bold text-slate-900 font-mono block">{postalCode}</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Full Dispatch Warehouse Address</span>
                <span className="font-semibold text-slate-800 leading-relaxed block mt-0.5 capitalize flex items-center justify-between">
                  <span>{fullPickupAddressString}</span>
                  <CopyButton value={fullPickupAddressString} />
                </span>
              </div>

              {(latitude || longitude) && (
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-[10px] font-extrabold text-amber-900 font-mono shadow-xs">
                    <FiNavigation size={12} className="text-amber-600" /> GPS: {latitude || "—"}, {longitude || "—"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">(Map Preview Future-Ready)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerCard;
