import React from "react";
import { Link } from "react-router-dom";
import { Address } from "../../types";
import { FaUser, FaPhoneAlt, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";

interface Props {
  userId?: string | any;
  address?: Address;
}

export const BuyerProfileCard: React.FC<Props> = ({ userId, address }) => {
  const buyerName = address?.name || "Buyer";
  const buyerIdStr = typeof userId === "object" ? userId?._id || "—" : userId || "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FaUser size={14} className="text-blue-500" />
          BUYER PROFILE
        </h3>
        <Link
          to="/users"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          View Users <FaExternalLinkAlt size={10} />
        </Link>
      </div>

      {address ? (
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center border border-blue-100 shrink-0 uppercase">
              {buyerName.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">{buyerName}</h4>
              <p className="text-xs text-slate-400 font-mono">
                ID: {buyerIdStr}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
            {address.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone:</span>
                <a href={`tel:${address.phone}`} className="font-bold text-slate-700 hover:text-blue-600 transition flex items-center gap-1">
                  <FaPhoneAlt size={10} /> {address.phone}
                </a>
              </div>
            )}

            {address.alternatePhone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Alt Phone:</span>
                <span className="font-bold text-slate-700">{address.alternatePhone}</span>
              </div>
            )}

            {(address.city || address.state) && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <FaMapMarkerAlt size={10} className="text-emerald-500" />
                  {address.city ? address.city : ""}{address.city && address.state ? ", " : ""}{address.state ? address.state : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <p className="text-slate-500">
            Buyer Reference ID: <strong className="font-mono text-slate-800">{buyerIdStr}</strong>
          </p>
          <p className="text-slate-400 italic text-[11px]">
            Detailed buyer profile not attached to order response.
          </p>
        </div>
      )}
    </div>
  );
};
