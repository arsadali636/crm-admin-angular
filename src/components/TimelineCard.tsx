import React from "react";
import moment from "moment";
import { FiClock, FiPlusCircle, FiEdit3, FiUploadCloud, FiAward } from "react-icons/fi";

interface TimelineCardProps {
  product: any;
  req: any;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ product, req }) => {
  const formatTimestamp = (val: any) => {
    if (!val) return "Not Available";
    const date = moment(val);
    if (!date.isValid()) return "Not Available";
    return date.format("DD MMM YYYY, hh:mm A");
  };

  const status = req.status || "pending";

  // Timeline events definition
  const createdDate = product.masterDetails?.createdAt || product.createdAt || req.createdAt;
  const editedDate = product.updatedAt || product.masterDetails?.updatedAt;
  const documentsUploadedDate = product.createdAt || req.createdAt; 
  const approvalRequestedDate = req.createdAt;

  const events = [
    {
      title: "Product Listing Created",
      description: "Listing drafted by seller inside Seller Portal.",
      date: formatTimestamp(createdDate),
      icon: <FiPlusCircle size={14} />,
      completed: !!createdDate,
    },
    {
      title: "Documents Uploaded",
      description: "GST and commercial documents uploaded & validated.",
      date: formatTimestamp(documentsUploadedDate),
      icon: <FiUploadCloud size={14} />,
      completed: !!documentsUploadedDate,
    },
    {
      title: "Listing Edited / Refined",
      description: "Price models, lots, and MOQ metrics updated by seller.",
      date: editedDate ? formatTimestamp(editedDate) : "Auto-logged on draft completion",
      icon: <FiEdit3 size={14} />,
      completed: true,
    },
    {
      title: "Approval Requested",
      description: "Listing dispatched to Lottmart Admin approvals queue.",
      date: formatTimestamp(approvalRequestedDate),
      icon: <FiClock size={14} />,
      completed: !!approvalRequestedDate,
    },
    {
      title: `Current Workflow Status: ${status.toUpperCase()}`,
      description: status === "accept" 
        ? "Listing accepted and deployed to live marketplace." 
        : status === "reject" 
          ? "Listing rejected. Re-upload or correction requested."
          : "Listing is currently under admin validation review.",
      date: req.updatedAt ? formatTimestamp(req.updatedAt) : formatTimestamp(req.createdAt),
      icon: <FiAward size={14} />,
      completed: true,
      highlight: true,
      status: status,
    },
  ];

  const getStatusColor = (item: typeof events[0]) => {
    if (item.highlight) {
      if (item.status === "accept") return "bg-emerald-500 text-white ring-8 ring-emerald-50";
      if (item.status === "reject") return "bg-rose-500 text-white ring-8 ring-rose-50";
      return "bg-amber-500 text-white ring-8 ring-amber-50";
    }
    return item.completed ? "bg-indigo-600 text-white ring-8 ring-indigo-50" : "bg-slate-200 text-slate-500 ring-8 ring-slate-50";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <h2 className="text-md font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
        Product Lifecycle Audit Log
      </h2>

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
                      <p className={`text-xs font-bold ${event.highlight ? "text-slate-900" : "text-slate-800"}`}>
                        {event.title}
                      </p>
                      <p className="text-2xs text-slate-400 mt-0.5 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right text-3xs font-semibold whitespace-nowrap text-slate-400">
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

export default TimelineCard;
