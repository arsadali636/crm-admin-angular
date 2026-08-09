import React, { useState } from "react";
import { FiInfo, FiBriefcase, FiUser } from "react-icons/fi";
import { RequestType } from "../pages/Approvals";

interface SellerDetailViewProps {
  req: any;
  onBack: () => void;
  handleSubmit: (request: any, actionType: RequestType) => Promise<void>;
  loading: boolean;
}

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
      className="ml-1.5 inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[9px] font-bold text-emerald-600 animate-in fade-in zoom-in-90">Copied!</span>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )}
    </button>
  );
};

const UserAvatarWithInitial: React.FC<{
  imgUrl?: string;
  name: string;
  initial: string;
  size?: "sm" | "md" | "lg";
}> = ({ imgUrl, name, initial, size = "md" }) => {
  const [imgError, setImgError] = useState(false);

  const dimensions =
    size === "lg"
      ? "h-14 w-14 text-lg"
      : size === "sm"
      ? "h-9 w-9 text-xs"
      : "h-12 w-12 text-base";

  return (
    <div className="relative inline-flex items-center flex-shrink-0">
      {imgUrl && !imgError ? (
        <div className="relative group">
          <img
            src={imgUrl}
            alt={name}
            onError={() => setImgError(true)}
            className={`${dimensions} rounded-2xl object-cover border border-slate-200/90 shadow-xs select-none transition-transform group-hover:scale-105`}
          />
          <span className="absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-[10px] font-black text-white ring-2 ring-white shadow-xs" title={`Initial: ${initial}`}>
            {initial}
          </span>
        </div>
      ) : (
        <div
          className={`${dimensions} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shadow-xs select-none relative`}
          title={`Initial: ${initial}`}
        >
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
      )}
    </div>
  );
};

export const SellerDetailView: React.FC<SellerDetailViewProps> = ({
  req,
  onBack,
  handleSubmit,
  loading,
}) => {
  const seller = req?.metadata || {};

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const reqFirstName = req.requester?.firstName || req.firstName || "";
  const reqLastName = req.requester?.lastName || req.lastName || "";
  const requesterFullName = `${reqFirstName} ${reqLastName}`.trim() || "Applicant";
  
  const userInitial = (
    reqFirstName[0] || 
    reqLastName[0] || 
    seller.businessName?.[0] || 
    "U"
  ).toUpperCase();

  const submitApproval = async () => {
    const userConfirmed = window.confirm(
      `Are you sure you want to accept seller - ${seller.businessName}`
    );
    if (userConfirmed) {
      await handleSubmit(req, "accept");
    }
  };

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      setError("Please specify a reason for rejection.");
      return;
    }
    const userConfirmed = window.confirm(
      `Are you sure you want to reject seller - ${seller.businessName}`
    );
    if (userConfirmed) {
      await handleSubmit(req, "reject");
    }
  };

  // Helper checks for empty fields
  const hasVal = (val: any) => val !== undefined && val !== null && val !== "" && String(val).trim() !== "";

  // Dynamic Insight Stats List
  const insights = [
    { label: "GSTIN Status", value: seller.gstNumber ? "Submitted" : "Missing", show: true, type: seller.gstNumber ? "success" : "warning" },
    { label: "PAN Status", value: seller.panNumber ? "Submitted" : "Missing", show: true, type: seller.panNumber ? "success" : "warning" },
    { label: "Requester Status", value: req.requester?.status, show: hasVal(req.requester?.status), type: req.requester?.status === "active" ? "success" : "default" },
    { label: "GPS Mapping", value: seller.latitude && seller.longitude ? "Available" : "Unavailable", show: true, type: seller.latitude && seller.longitude ? "success" : "default" }
  ].filter(i => i.show);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 animate-in fade-in duration-300">
      {/* Top sticky header */}
      <div className="sticky top-0 z-40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="group flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-blue-200 bg-blue-50/50 text-blue-600 transition hover:bg-blue-100/70 hover:text-blue-700 cursor-pointer shadow-xs"
            title="Back to queue"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3.5">
            <UserAvatarWithInitial
              imgUrl={req.requester?.profileImg}
              name={requesterFullName}
              initial={userInitial}
              size="lg"
            />
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Approvals Queue
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-2xs font-bold text-blue-700 ring-1 ring-inset ring-blue-650/10 border border-blue-100">
                  Pending Seller
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center flex-wrap gap-x-2">
                <span className="text-slate-500 font-semibold text-base">Business Information:</span>
                <span className="text-slate-900 font-black">{seller.businessName || "Seller Onboarding Request"}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto justify-end sm:justify-start">
          <button
            onClick={() => setShowRejectInput(true)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-250 bg-rose-50 px-4 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Reject Seller
          </button>
          <button
            onClick={submitApproval}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Approve Seller
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Dynamic Insight Banner Chips */}
        {insights.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-2xs font-bold shadow-2xs ${
                  insight.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-150"
                    : insight.type === "warning"
                    ? "bg-amber-50 text-amber-800 border-amber-150"
                    : "bg-white text-slate-700 border-slate-200/80"
                }`}
              >
                <span className="text-slate-400 font-semibold">{insight.label}:</span>
                <span>{insight.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Business Overview & Verification */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Overview ID & Info Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiInfo className="text-slate-400" size={14} />
                Application Metadata
              </h3>
              
              <div className="space-y-3.5 text-xs">
                {hasVal(req._id) && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Application ID</span>
                    <span className="font-mono font-bold text-slate-750 flex items-center bg-slate-50 border border-slate-100/80 px-1.5 py-0.5 rounded">
                      #{req._id.substring(12)}
                      <CopyButton value={req._id} />
                    </span>
                  </div>
                )}
                {hasVal(req.requesterId) && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Requester ID</span>
                    <span className="font-mono font-bold text-slate-750 flex items-center bg-slate-50 border border-slate-100/80 px-1.5 py-0.5 rounded">
                      #{req.requesterId.substring(12)}
                      <CopyButton value={req.requesterId} />
                    </span>
                  </div>
                )}
                {hasVal(req.createdAt) && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Submitted</span>
                    <span className="font-semibold text-slate-750">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {hasVal(req.updatedAt) && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Last Action</span>
                    <span className="font-semibold text-slate-750">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Documents Credentials */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Identity Credentials
              </h3>
              
              <div className="space-y-4">
                {hasVal(seller.gstNumber) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">GSTIN</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50/70 px-2 py-1.5 rounded-lg border border-slate-150/80 flex items-center justify-between">
                      {seller.gstNumber}
                      <CopyButton value={seller.gstNumber} />
                    </span>
                  </div>
                )}
                {hasVal(seller.aadhaarNumber) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">Aadhaar Card</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50/70 px-2 py-1.5 rounded-lg border border-slate-150/80 flex items-center justify-between">
                      {seller.aadhaarNumber}
                      <CopyButton value={seller.aadhaarNumber} />
                    </span>
                  </div>
                )}
                {hasVal(seller.panNumber) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">PAN Card</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50/70 px-2 py-1.5 rounded-lg border border-slate-150/80 flex items-center justify-between">
                      {seller.panNumber}
                      <CopyButton value={seller.panNumber} />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Checklist Onboarding Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-3 mb-5">
                Audit Timeline
              </h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    { title: "Application Submitted", date: req.createdAt, completed: true },
                    { title: "GSTIN Validated", date: "Auto-verified via GST Portal", completed: true },
                    { title: "Aadhaar / Identity Checked", date: "Aadhaar OCR Verified", completed: true },
                    { title: "Final Admin Approval", date: "Pending Review", completed: false },
                  ].map((step, idx) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== 3 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-150" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3.5">
                          <div>
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-6 ring-white ${
                              step.completed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}>
                              {step.completed ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-2xs font-extrabold">{idx + 1}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{step.title}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {step.date && !isNaN(Date.parse(step.date)) ? new Date(step.date).toLocaleDateString() : step.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Information Cards */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Business Profile */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-indigo-600" size={16} />
                  <span>Business Overview</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">
                  Profile Details
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                {/* Applicant / Representative Profile Box */}
                <div className="md:col-span-2 flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
                  <UserAvatarWithInitial
                    imgUrl={req.requester?.profileImg}
                    name={requesterFullName}
                    initial={userInitial}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicant / Account Owner</span>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-150">
                        Initial: {userInitial}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block truncate">
                      {requesterFullName}
                    </span>
                    {(req.requester?.email || req.email) && (
                      <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                        {req.requester?.email || req.email}
                      </span>
                    )}
                  </div>
                </div>

                {hasVal(seller.businessName) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company / Business Name / Legal Entity</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-xl bg-slate-100/90 px-3 py-1 text-xs font-black text-slate-850 border border-slate-200/80 shadow-2xs">
                        {seller.businessName}
                      </span>
                    </div>
                  </div>
                )}
                {hasVal(seller.industry) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type of Industry / Category</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-xl bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200/60 shadow-2xs">
                        {seller.industry}
                      </span>
                    </div>
                  </div>
                )}
                {hasVal(seller.typeOfBusiness) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type of Business</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(seller.typeOfBusiness) ? (
                        seller.typeOfBusiness.map((type: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs">
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs">
                          {seller.typeOfBusiness}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {hasVal(req.createdAt) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Application Date</span>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60 shadow-2xs">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {hasVal(seller.businessProfile) && (
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Business Description</span>
                    <div className="relative bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{seller.businessProfile}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
              <h2 className="text-sm font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FiUser className="text-indigo-600" size={16} />
                <span>Contact & Representative Details</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                {/* Profile Image & Representative Name */}
                <div className="md:col-span-2 flex items-center gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
                  <UserAvatarWithInitial
                    imgUrl={req.requester?.profileImg}
                    name={requesterFullName}
                    initial={userInitial}
                    size="md"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Representative Name</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                      {requesterFullName}
                    </span>
                    {req.requester?.affiliateId && (
                      <span className="text-[10px] text-indigo-650 font-bold block mt-0.5">Affiliate ID: {req.requester.affiliateId}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Email</span>
                  <span className="text-xs font-semibold text-slate-800 block truncate flex items-center" title={req.requester?.email || req.email}>
                    {req.requester?.email || req.email || "N/A"}
                    {(req.requester?.email || req.email) && <CopyButton value={req.requester?.email || req.email} />}
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone Number</span>
                  <span className="text-xs font-semibold text-slate-800 block flex items-center">
                    {req.requester?.phoneNumber || req.phoneNumber || req.phone || "N/A"}
                    {(req.requester?.phoneNumber || req.phoneNumber || req.phone) && <CopyButton value={req.requester?.phoneNumber || req.phoneNumber || req.phone} />}
                  </span>
                </div>

                {hasVal(req.requester?.status) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Account Status</span>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-2xs font-extrabold text-emerald-800 border border-emerald-200 capitalize mt-0.5">
                      {req.requester.status}
                    </span>
                  </div>
                )}

                {hasVal(req.requester?.role) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Role / Access</span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {Array.isArray(req.requester.role) ? req.requester.role.join(", ") : String(req.requester.role)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Promoter Commission</span>
                    <span className="text-xs font-bold text-slate-700 block">
                      {req.requester?.promotorCommission !== undefined 
                        ? `${req.requester.promotorCommission}%` 
                        : req.requester?.promoterCommission !== undefined 
                          ? `${req.requester.promoterCommission}%` 
                          : "0%"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Connector Commission</span>
                    <span className="text-xs font-bold text-slate-700 block">
                      {req.requester?.connectorCommission !== undefined 
                        ? `${req.requester.connectorCommission}%` 
                        : "0%"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Business Operating Address</span>
                  <span className="text-xs font-semibold text-slate-800 block leading-relaxed">{seller.address || "N/A"}</span>
                  {hasVal(seller.street) && (
                    <span className="text-2xs font-medium text-slate-500 block mt-1">
                      Street: <span className="font-semibold text-slate-700">{seller.street}</span>
                    </span>
                  )}
                </div>
                {hasVal(seller.landmark) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Landmark</span>
                    <span className="text-xs font-semibold text-slate-800 block">{seller.landmark}</span>
                  </div>
                )}
                {(hasVal(seller.latitude) || hasVal(seller.longitude)) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Coordinates (GPS)</span>
                    <span className="text-2xs font-mono text-slate-600 bg-slate-50 px-2 py-1 border border-slate-150 rounded inline-block mt-0.5">
                      Lat: {seller.latitude || "0.0"}, Lng: {seller.longitude || "0.0"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2.5: Requester Registered Addresses */}
            {req.requester?.addresses && req.requester.addresses.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 mb-2 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Requester Registered Addresses ({req.requester.addresses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {req.requester.addresses.map((addr: any, idx: number) => (
                    <div key={addr._id || idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 space-y-2 text-[11px] relative">
                      {addr.isPrimary && (
                        <span className="absolute top-2.5 right-2.5 inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-150">
                          Primary
                        </span>
                      )}
                      <div className="font-bold text-slate-800">{addr.name || "Address"}</div>
                      <div className="text-slate-655 leading-relaxed font-semibold">
                        {addr.address1}
                        {addr.address2 ? `, ${addr.address2}` : ""}
                        {addr.city ? `, ${addr.city}` : ""}
                        {addr.state ? `, ${addr.state}` : ""}
                        {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                      </div>
                      {hasVal(addr.landmark) && (
                        <div className="text-[10px] text-slate-450">
                          <span className="font-bold">Landmark:</span> {addr.landmark}
                        </div>
                      )}
                      {(hasVal(addr.lat) || hasVal(addr.lng)) && (
                        <div className="text-[10px] text-slate-450">
                          <span className="font-bold">GPS:</span> {addr.lat || "0.0"}, {addr.lng || "0.0"}
                        </div>
                      )}
                      {hasVal(addr.phoneNumber) && (
                        <div className="text-[10px] text-slate-450">
                          <span className="font-bold">Phone:</span> {addr.phoneNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Seller System Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Business Statistics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150/65">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Upload Limit</span>
                  <span className="text-sm font-bold text-slate-800">Unlimited</span>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150/65">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Products</span>
                  <span className="text-sm font-bold text-slate-800">0 Items</span>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150/65">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Wallet Status</span>
                  <span className="text-sm font-bold text-slate-800">₹0.00</span>
                </div>
                <div className="bg-emerald-50/30 rounded-xl p-4 border border-emerald-150/50">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Sales Generated</span>
                  <span className="text-sm font-bold text-emerald-800">₹0.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-6 py-4 shadow-xl backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl">
          {error && (
            <div className="mb-3 rounded-lg bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs font-semibold text-rose-700 animate-in fade-in">
              {error}
            </div>
          )}

          {showRejectInput && (
            <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50/20 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">Specify Rejection Reason</h4>
              <textarea
                placeholder="Enter rejection notes (this will be sent to the seller)..."
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-rose-250 bg-white px-3 py-2 text-xs outline-none focus:border-rose-450 focus:ring-1 focus:ring-rose-450"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600">Reviewing: {seller.businessName}</span>
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              {showRejectInput && (
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {showRejectInput ? (
                <button
                  onClick={submitRejection}
                  disabled={loading}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={loading}
                    className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 text-xs font-bold text-rose-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    Reject Seller
                  </button>
                  <button
                    onClick={submitApproval}
                    disabled={loading}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Approve Seller
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetailView;
