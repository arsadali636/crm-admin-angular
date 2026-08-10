import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { walletStore, WalletAccount } from "../utils/walletStore";
import { WalletManualOperationModal } from "../components/WalletManualOperationModal";
import moment from "moment";
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  Eye,
  Lock,
  Unlock,
  PlusCircle,
  MinusCircle,
  Users,
  CheckCircle,
  AlertOctagon,
  TrendingUp,
} from "lucide-react";

// Role-badge mapping
const ROLE_BADGE_MAP: Record<string, string> = {
  user: "bg-blue-50 text-blue-700 border-blue-200/80",
  seller: "bg-violet-50 text-violet-700 border-violet-200/80",
  promoter: "bg-amber-50 text-amber-700 border-amber-200/80",
  admin: "bg-rose-50 text-rose-700 border-rose-200/80",
};

const RoleBadge = ({ role }: { role: string }) => {
  const r = role.toLowerCase();
  const colors = ROLE_BADGE_MAP[r] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${colors}`}>
      {role}
    </span>
  );
};

export const WalletAccounts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"credit" | "debit">("credit");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const loadAccounts = () => {
    setAccounts(walletStore.getAccounts());
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter ? acc.role === roleFilter : true;
      const matchStatus = statusFilter ? acc.status === statusFilter : true;

      return matchSearch && matchRole && matchStatus;
    });
  }, [accounts, searchQuery, roleFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === "Active").length;
    const frozen = accounts.filter((a) => a.status === "Frozen").length;
    const totalLifetime = accounts.reduce((s, a) => s + a.lifetimeEarnings, 0);

    return { total, active, frozen, totalLifetime };
  }, [accounts]);

  // Actions
  const handleFreezeToggle = (id: string) => {
    walletStore.toggleWalletFreeze(id);
    loadAccounts();
  };

  const handleOpenModal = (walletId: string, type: "credit" | "debit") => {
    setSelectedWalletId(walletId);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const headers = [
      "Wallet ID",
      "User",
      "Email",
      "Role",
      "Available Balance",
      "Pending Balance",
      "Locked Balance",
      "Lifetime Earnings",
      "Status",
      "Last Transaction",
    ];
    const rows = filteredAccounts.map((a) => [
      a.id,
      a.userName,
      a.userEmail,
      a.role,
      a.availableBalance,
      a.pendingBalance,
      a.lockedBalance,
      a.lifetimeEarnings,
      a.status,
      moment(a.lastTransaction).format("DD MMM YYYY HH:mm"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lottmart-wallets-${moment().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 space-y-6">
      {/* ── Breadcrumb ── */}
      <div className="bg-white rounded-xl px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-slate-100 flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Wallet Accounts", to: "/wallet/accounts" },
          ]}
        />
        <button
          onClick={() => {
            setSelectedWalletId("");
            setModalType("credit");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Manual Operation</span>
        </button>
      </div>

      {/* ── Mini Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Accounts</span>
            <p className="text-2xl font-extrabold text-slate-800">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Wallets</span>
            <p className="text-2xl font-extrabold text-slate-800 text-emerald-600">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Frozen Wallets</span>
            <p className="text-2xl font-extrabold text-slate-800 text-rose-600">{stats.frozen}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Net Earnings</span>
            <p className="text-2xl font-extrabold text-slate-800">₹{stats.totalLifetime.toLocaleString("en-IN")}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl px-5 py-4 border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search wallet ID, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2 border border-slate-200 bg-white text-xs rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all font-semibold text-slate-600"
          >
            <option value="">All Roles</option>
            <option value="promoter">Promoter</option>
            <option value="seller">Seller</option>
            <option value="user">User / Buyer</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2 border border-slate-200 bg-white text-xs rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all font-semibold text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Frozen">Frozen</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white text-xs rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer ml-auto"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ── Table Grid ── */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider text-left">
                <th className="px-5 py-4">Wallet ID</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4 text-right">Available Bal</th>
                <th className="px-5 py-4 text-right">Pending Bal</th>
                <th className="px-5 py-4 text-right">Locked Bal</th>
                <th className="px-5 py-4 text-right">Lifetime Earnings</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Payout</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAccounts.map((acc, idx) => (
                <tr
                  key={acc.id}
                  className={`group transition-colors hover:bg-blue-50/20 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                  }`}
                >
                  {/* Wallet ID */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    {acc.id}
                  </td>

                  {/* User Profile */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {acc.userName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[13px]">{acc.userName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{acc.userEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-4">
                    <RoleBadge role={acc.role} />
                  </td>

                  {/* Available Balance */}
                  <td className="px-5 py-4 text-right font-bold text-emerald-600">
                    ₹{acc.availableBalance.toLocaleString("en-IN")}
                  </td>

                  {/* Pending Balance */}
                  <td className="px-5 py-4 text-right font-semibold text-amber-600">
                    ₹{acc.pendingBalance.toLocaleString("en-IN")}
                  </td>

                  {/* Locked Balance */}
                  <td className="px-5 py-4 text-right font-semibold text-rose-600">
                    ₹{acc.lockedBalance.toLocaleString("en-IN")}
                  </td>

                  {/* Lifetime Earnings */}
                  <td className="px-5 py-4 text-right font-bold text-slate-800">
                    ₹{acc.lifetimeEarnings.toLocaleString("en-IN")}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        acc.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                          : "bg-red-50 text-red-700 border-red-200/50"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${acc.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      {acc.status}
                    </span>
                  </td>

                  {/* Last Transaction */}
                  <td className="px-5 py-4 text-slate-400 text-[11px] font-semibold">
                    {moment(acc.lastTransaction).format("DD MMM YYYY, hh:mm A")}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/wallet/details?id=${acc.id}`, { state: { from: location.pathname + location.search } })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleFreezeToggle(acc.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          acc.status === "Active"
                            ? "hover:bg-red-50 text-red-600"
                            : "hover:bg-emerald-50 text-emerald-600"
                        }`}
                        title={acc.status === "Active" ? "Freeze Wallet" : "Unfreeze Wallet"}
                      >
                        {acc.status === "Active" ? <Lock size={15} /> : <Unlock size={15} />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(acc.id, "credit")}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer"
                        title="Manual Credit"
                      >
                        <PlusCircle size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(acc.id, "debit")}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Manual Debit"
                      >
                        <MinusCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-slate-400 text-[11px] font-bold flex justify-between bg-slate-50/20">
          <span>Showing {filteredAccounts.length} Wallet Accounts</span>
          <span>Lottmart Admin Portal</span>
        </div>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="md:hidden space-y-4">
        {filteredAccounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-start pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {acc.userName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{acc.userName}</p>
                  <p className="text-[10px] text-slate-400">{acc.id} | {acc.userEmail}</p>
                </div>
              </div>
              <RoleBadge role={acc.role} />
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] font-medium text-slate-500">
              <div>
                <span>Available Balance</span>
                <p className="text-xs font-bold text-emerald-600">₹{acc.availableBalance.toLocaleString()}</p>
              </div>
              <div>
                <span>Pending Balance</span>
                <p className="text-xs font-bold text-amber-600">₹{acc.pendingBalance.toLocaleString()}</p>
              </div>
              <div>
                <span>Locked Balance</span>
                <p className="text-xs font-bold text-rose-600">₹{acc.lockedBalance.toLocaleString()}</p>
              </div>
              <div>
                <span>Lifetime Earnings</span>
                <p className="text-xs font-bold text-slate-700">₹{acc.lifetimeEarnings.toLocaleString()}</p>
              </div>
              <div>
                <span>Status</span>
                <p>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${acc.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {acc.status}
                  </span>
                </p>
              </div>
              <div>
                <span>Last Payout</span>
                <p className="text-[10px] text-slate-600">{moment(acc.lastTransaction).format("DD MMM YYYY")}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-50">
              <button
                onClick={() => navigate(`/wallet/details?id=${acc.id}`, { state: { from: location.pathname + location.search } })}
                className="flex-1 py-1.5 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all cursor-pointer"
              >
                View
              </button>
              <button
                onClick={() => handleFreezeToggle(acc.id)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                  acc.status === "Active" ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                {acc.status === "Active" ? "Freeze" : "Unfreeze"}
              </button>
              <button
                onClick={() => handleOpenModal(acc.id, "credit")}
                className="flex-1 py-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center transition-all cursor-pointer"
              >
                Credit
              </button>
              <button
                onClick={() => handleOpenModal(acc.id, "debit")}
                className="flex-1 py-1.5 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-all cursor-pointer"
              >
                Debit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Operation Popup Modal */}
      <WalletManualOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadAccounts}
        initialWalletId={selectedWalletId}
        initialType={modalType}
      />
    </div>
  );
};
