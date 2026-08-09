import React from "react";
import { FiSearch, FiCalendar, FiChevronDown, FiUser } from "react-icons/fi";
import { AdminRequestsType, RequestStatus } from "../../types";

interface ApprovalFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  status: RequestStatus;
  onStatusChange: (status: RequestStatus) => void;
  type: AdminRequestsType;
  onTypeChange: (type: AdminRequestsType) => void;
  sortOrder: "newest" | "oldest" | "priority";
  onSortChange: (sort: "newest" | "oldest" | "priority") => void;
  priorityFilter: string;
  onPriorityChange: (prio: string) => void;
  reviewerFilter: string;
  onReviewerChange: (reviewer: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  sellerCounts: { sellers: number; products: number };
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  sortOrder,
  onSortChange,
  priorityFilter,
  onPriorityChange,
  reviewerFilter,
  onReviewerChange,
  categoryFilter,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  sellerCounts,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      
      {/* Moderation Type Tabs */}
      <div className="flex border-b border-slate-100 max-w-fit gap-1 bg-slate-50/80 p-1.5 rounded-xl self-start">
        <button
          onClick={() => onTypeChange(AdminRequestsType.sellerOnboarding)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            type === AdminRequestsType.sellerOnboarding
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Seller Onboarding ({sellerCounts.sellers})
        </button>
        <button
          onClick={() => onTypeChange(AdminRequestsType.productApproval)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            type === AdminRequestsType.productApproval
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Product Listings ({sellerCounts.products})
        </button>
      </div>

      {/* Primary Row: Search & Status / Sort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full">
        {/* Global Search */}
        <div className="relative md:col-span-2">
          <FiSearch className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search request ID, business name, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50/50 rounded-xl border border-slate-200 outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as RequestStatus)}
            className="w-full h-11 pl-4 pr-10 text-xs bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:bg-white cursor-pointer appearance-none font-semibold text-slate-700"
          >
            <option value="pending">Status: Pending</option>
            <option value="accept">Status: Approved</option>
            <option value="reject">Status: Rejected</option>
          </select>
          <FiChevronDown className="absolute right-3.5 top-4 text-slate-450 pointer-events-none" />
        </div>

        {/* Sort Controls */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full h-11 pl-4 pr-10 text-xs bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:bg-white cursor-pointer appearance-none font-semibold text-slate-700"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priority">Sort: High Priority</option>
          </select>
          <FiChevronDown className="absolute right-3.5 top-4 text-slate-450 pointer-events-none" />
        </div>
      </div>

      {/* Advanced Filter Row (Collapsible / Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-100 w-full">
        {/* Category Filter */}
        {type === AdminRequestsType.productApproval && (
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-10 pl-4 pr-10 text-xs bg-slate-50/30 border border-slate-150 rounded-xl outline-none focus:border-slate-350 cursor-pointer appearance-none text-slate-600 font-medium"
            >
              <option value="">All Categories</option>
              <option value="groceries">Groceries</option>
              <option value="apparel">Apparel</option>
              <option value="electronics">Electronics</option>
              <option value="wellness">Health & Wellness</option>
            </select>
            <FiChevronDown className="absolute right-3.5 top-3.5 text-slate-450 pointer-events-none" />
          </div>
        )}

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full h-10 pl-4 pr-10 text-xs bg-slate-50/30 border border-slate-150 rounded-xl outline-none focus:border-slate-350 cursor-pointer appearance-none text-slate-600 font-medium"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority Only</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <FiChevronDown className="absolute right-3.5 top-3.5 text-slate-450 pointer-events-none" />
        </div>

        {/* Reviewer Filter */}
        <div className="relative">
          <select
            value={reviewerFilter}
            onChange={(e) => onReviewerChange(e.target.value)}
            className="w-full h-10 pl-8 pr-10 text-xs bg-slate-50/30 border border-slate-150 rounded-xl outline-none focus:border-slate-350 cursor-pointer appearance-none text-slate-600 font-medium"
          >
            <option value="">All Reviewers</option>
            <option value="self">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <FiUser className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          <FiChevronDown className="absolute right-3.5 top-3.5 text-slate-450 pointer-events-none" />
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full h-10 pl-8 pr-10 text-xs bg-slate-50/30 border border-slate-150 rounded-xl outline-none focus:border-slate-350 cursor-pointer appearance-none text-slate-600 font-medium"
          >
            <option value="">Any Submission Date</option>
            <option value="today">Submitted Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
          <FiCalendar className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          <FiChevronDown className="absolute right-3.5 top-3.5 text-slate-450 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ApprovalFilters;
