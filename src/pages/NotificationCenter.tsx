import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  AlertCircle,
  User,
  Store,
  Box,
  ShoppingBag,
  CreditCard,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Shield,
  Percent,
  Activity,
  Layers
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { STATIC_NOTIFICATIONS, StaticNotification } from "../constants/staticNotifications";

export default function NotificationCenter() {
  const navigate = useNavigate();
  
  // UI states: 'list' | 'loading' | 'empty'
  const [uiState, setUiState] = useState<"list" | "loading" | "empty">("list");
  
  // Search and filter dummy states (purely static)
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Selected notification for the right side drawer
  const [selectedNotif, setSelectedNotif] = useState<StaticNotification | null>(null);

  // Map module category to icon, color and label
  const getModuleIconInfo = (module: string) => {
    switch (module) {
      case "user":
        return {
          icon: <User size={16} />,
          color: "bg-teal-50 text-teal-600 border border-teal-100",
          label: "User Module"
        };
      case "seller":
        return {
          icon: <Store size={16} />,
          color: "bg-amber-50 text-amber-600 border border-amber-100",
          label: "Seller Module"
        };
      case "product":
        return {
          icon: <Box size={16} />,
          color: "bg-purple-50 text-purple-600 border border-purple-100",
          label: "Product Module"
        };
      case "order":
        return {
          icon: <ShoppingBag size={16} />,
          color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          label: "Order Module"
        };
      case "wallet":
        return {
          icon: <CreditCard size={16} />,
          color: "bg-indigo-50 text-indigo-600 border border-indigo-100",
          label: "Wallet Module"
        };
      case "promoter":
        return {
          icon: <Percent size={16} />,
          color: "bg-pink-50 text-pink-600 border border-pink-100",
          label: "Promoter Module"
        };
      case "connector":
        return {
          icon: <Layers size={16} />,
          color: "bg-cyan-50 text-cyan-600 border border-cyan-100",
          label: "Connector Module"
        };
      case "deals":
        return {
          icon: <Activity size={16} />,
          color: "bg-rose-50 text-rose-600 border border-rose-100",
          label: "Deals Module"
        };
      case "system":
        return {
          icon: <Shield size={16} />,
          color: "bg-red-50 text-red-600 border border-red-100",
          label: "System Alert"
        };
      default:
        return {
          icon: <AlertCircle size={16} />,
          color: "bg-slate-50 text-slate-600 border border-slate-100",
          label: "Alert"
        };
    }
  };

  return (
    <div className="p-4 space-y-6 relative min-h-screen">
      {/* ── Breadcrumb and Header ── */}
      <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Notifications", to: "/notifications" },
            ]}
          />
          <h2 className="text-xl font-bold text-slate-800 mt-2">Notifications</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Track all important platform activities across Lottmart.</p>
        </div>

        {/* View State Switcher (for static UI demonstration) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50 self-stretch md:self-auto justify-between">
          <button
            onClick={() => setUiState("list")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              uiState === "list"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Active List
          </button>
          <button
            onClick={() => setUiState("loading")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              uiState === "loading"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Skeleton Loader
          </button>
          <button
            onClick={() => setUiState("empty")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              uiState === "empty"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

      {/* ── Metrics Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Notifications Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15 transition-transform group-hover:scale-110 duration-500">
            <Inbox size={120} />
          </div>
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-blue-100">Total Alerts</p>
          <h3 className="text-3xl font-black mt-2">24</h3>
          <p className="text-[11px] text-blue-50 mt-1.5 font-medium">Accumulated historical logs</p>
        </div>

        {/* Unread Alerts Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-slate-800 transition-transform group-hover:scale-110 duration-500">
            <AlertCircle size={120} />
          </div>
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Unread Logs</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">12</h3>
          <p className="text-[11px] text-blue-600 mt-1.5 font-semibold">Requires admin attention</p>
        </div>

        {/* High Priority Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-slate-800 transition-transform group-hover:scale-110 duration-500">
            <Shield size={120} />
          </div>
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">High Priority</p>
          <h3 className="text-3xl font-bold text-red-500 mt-2">6</h3>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Critical system/business events</p>
        </div>

        {/* Today's Notifications Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-slate-800 transition-transform group-hover:scale-110 duration-500">
            <Activity size={120} />
          </div>
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Today's Alerts</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">8</h3>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Triggered in the last 24 hours</p>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">All Modules</option>
              <option value="user">Users</option>
              <option value="seller">Sellers</option>
              <option value="product">Products</option>
              <option value="order">Orders</option>
              <option value="wallet">Wallet</option>
              <option value="promoter">Promoter</option>
              <option value="connector">Connector</option>
              <option value="deals">Deals</option>
              <option value="system">System Alerts</option>
            </select>
            <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={10} />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
            <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={10} />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={10} />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <Calendar className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={12} />
            <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={10} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer" title="Refresh Panel">
            <RefreshCw size={14} />
          </button>
          <button className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer">
            Mark All Read
          </button>
        </div>
      </div>

      {/* ── Main View Switching ── */}
      {uiState === "loading" && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 bg-slate-200 rounded-md w-28" />
                  <div className="h-5 bg-slate-200 rounded-md w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uiState === "empty" && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 px-4 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 border border-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Notifications Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
            When key business actions or errors take place in the Lottmart ecosystem, they will be logged here.
          </p>
        </div>
      )}

      {uiState === "list" && (
        <div className="space-y-4">
          {/* Notifications Card List */}
          <div className="space-y-3.5">
            {STATIC_NOTIFICATIONS.map((notif) => {
              const info = getModuleIconInfo(notif.module);
              const isUnread = notif.readStatus === "unread";
              
              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotif(notif)}
                  className={`bg-white border hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex gap-4 cursor-pointer relative group ${
                    isUnread ? "border-l-4 border-l-blue-600" : "border-slate-100"
                  }`}
                >
                  {/* Icon Block */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                    {info.icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{notif.title}</h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap sm:text-right">{notif.createdTime}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">{notif.description}</p>

                    {/* Metadata & Pills */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-lg uppercase">
                          {info.label}
                        </span>

                        {notif.entityName && (
                          <span className="text-[10px] font-medium text-slate-600 bg-blue-50/50 border border-blue-100/30 px-2.5 py-0.5 rounded-lg">
                            Target: <span className="font-bold">{notif.entityName}</span>
                          </span>
                        )}
                        
                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                            notif.priority === "high"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : notif.priority === "medium"
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                              : "bg-slate-50 text-slate-500 border border-slate-100"
                          }`}
                        >
                          {notif.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Detail CTA Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotif(notif);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination Controls ── */}
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">Showing 1-12 of 24 notifications</span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer" disabled>
                <ChevronLeft size={14} />
              </button>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Right Side Drawer Detail Panel ── */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-all duration-300 animate-in fade-in">
          {/* Transparent Backdrop Cover (click to close) */}
          <div className="absolute inset-0" onClick={() => setSelectedNotif(null)} />

          {/* Drawer Window */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-50 border-l border-slate-100 transition-transform duration-300 translate-x-0 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getModuleIconInfo(selectedNotif.module).color}`}>
                  {getModuleIconInfo(selectedNotif.module).icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Alert Details</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{selectedNotif.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Description Block */}
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-800 leading-snug">{selectedNotif.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  {selectedNotif.description}
                </p>
              </div>

              {/* Specs List */}
              <div className="space-y-4 pt-2">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Metadata Parameters</h5>
                
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                  {/* Module Parameter */}
                  <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                    <span className="font-semibold text-slate-400">Target Module</span>
                    <span className="font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {selectedNotif.module}
                    </span>
                  </div>

                  {/* Event Type Parameter */}
                  <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                    <span className="font-semibold text-slate-400">Event Action</span>
                    <span className="font-bold text-slate-700 font-mono text-[10px]">
                      {selectedNotif.eventType}
                    </span>
                  </div>

                  {/* Entity ID / Target Name Parameter */}
                  {selectedNotif.entityName && (
                    <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                      <span className="font-semibold text-slate-400">Entity Reference</span>
                      <span className="font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">
                        {selectedNotif.entityName}
                      </span>
                    </div>
                  )}

                  {/* Triggered Time Parameter */}
                  <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                    <span className="font-semibold text-slate-400">Occurred At</span>
                    <span className="font-medium text-slate-600">{selectedNotif.createdTime}</span>
                  </div>

                  {/* Priority Parameter */}
                  <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                    <span className="font-semibold text-slate-400">Level Priority</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedNotif.priority === "high"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : selectedNotif.priority === "medium"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}
                    >
                      {selectedNotif.priority}
                    </span>
                  </div>

                  {/* Read Status Parameter */}
                  <div className="flex justify-between items-center p-3.5 bg-slate-50/20">
                    <span className="font-semibold text-slate-400">Status</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedNotif.readStatus === "unread"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {selectedNotif.readStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Redirect Bar */}
            <div className="border-t border-slate-100 p-6 bg-slate-50/50 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedNotif(null);
                  navigate(selectedNotif.redirectUrl);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Navigate to Workspace Page</span>
              </button>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Dismiss Details Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
