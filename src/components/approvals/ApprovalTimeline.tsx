import React from "react";
import moment from "moment";
import { FiClock, FiPlusCircle, FiEdit3, FiUploadCloud, FiAward } from "react-icons/fi";

interface ApprovalTimelineProps {
  product: any;
  req: any;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ product, req }) => {
  const formatTimestamp = (val: any) => {
    if (!val) return "Not Available";
    const date = moment(val);
    if (!date.isValid()) return "Not Available";
    return date.format("DD MMM YYYY, hh:mm A");
  };

  const status = req.status || "pending";

  const createdDate = product?.masterDetails?.createdAt || product?.createdAt || req.createdAt;
  const editedDate = product?.updatedAt || product?.masterDetails?.updatedAt;
  const documentsUploadedDate = product?.createdAt || req.createdAt; 
  const approvalRequestedDate = req.createdAt;

  const events = [
    {
      title: "Application Created",
      description: req.type === "seller_onboarding" 
        ? "Seller account application submitted by merchant." 
        : "Listing drafted by seller inside Seller Portal.",
      date: formatTimestamp(createdDate),
      icon: <FiPlusCircle size={12} />,
      completed: !!createdDate,
    },
    {
      title: "Credentials Submitted",
      description: req.type === "seller_onboarding"
        ? "Business GST and PAN numbers uploaded for verify check."
        : "GST and commercial documents uploaded & validated.",
      date: formatTimestamp(documentsUploadedDate),
      icon: <FiUploadCloud size={12} />,
      completed: !!documentsUploadedDate,
    },
    {
      title: "Listing Edited / Refined",
      description: "Pricing plans, inventory logs, and MOQ updated by seller.",
      date: editedDate ? formatTimestamp(editedDate) : "Auto-logged on draft completion",
      icon: <FiEdit3 size={12} />,
      completed: !!editedDate,
      hide: req.type === "seller_onboarding", // hide for seller type if not useful
    },
    {
      title: "Approvals Queue Dispatch",
      description: "Listing dispatched to Lottmart Admin approvals queue.",
      date: formatTimestamp(approvalRequestedDate),
      icon: <FiClock size={12} />,
      completed: !!approvalRequestedDate,
    },
    {
      title: `Workflow Status: ${status.toUpperCase()}`,
      description: status === "accept" 
        ? "Listing accepted and deployed to live marketplace." 
        : status === "reject" 
          ? "Request rejected. Re-upload or corrections requested."
          : "Application is currently under admin verification review.",
      date: req.updatedAt ? formatTimestamp(req.updatedAt) : formatTimestamp(req.createdAt),
      icon: <FiAward size={12} />,
      completed: true,
      highlight: true,
      status: status,
    },
  ].filter(event => !event.hide);

  const getStatusColor = (item: typeof events[0]) => {
    if (item.highlight) {
      if (item.status === "accept") return "bg-emerald-550 text-white ring-8 ring-emerald-50";
      if (item.status === "reject") return "bg-rose-550 text-white ring-8 ring-rose-50";
      return "bg-amber-550 text-white ring-8 ring-amber-50";
    }
    return item.completed ? "bg-indigo-600 text-white ring-8 ring-indigo-50" : "bg-slate-200 text-slate-500 ring-8 ring-slate-50";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <h3 className="text-xs font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2 tracking-tight">
        <span className="h-2 w-2 rounded-full bg-slate-800" />
        Application Timeline
      </h3>

      <div className="flow-root pl-2">
        <ul className="-mb-8">
          {events.map((event, idx) => (
            <li key={idx}>
              <div className="relative pb-8">
                {idx !== events.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-150"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${getStatusColor(event)}`}>
                      {event.icon}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                    <div>
                      <p className={`text-xs font-bold ${event.highlight ? "text-slate-900" : "text-slate-850"}`}>
                        {event.title}
                      </p>
                      <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed font-semibold">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right text-[9px] font-bold whitespace-nowrap text-slate-400">
                      {event.date}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApprovalTimeline;
