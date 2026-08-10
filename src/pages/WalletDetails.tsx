import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import BackButton from "../components/BackButton";
import { walletStore, WalletAccount, WalletTransaction, WithdrawalRequest } from "../utils/walletStore";
import { WalletManualOperationModal } from "../components/WalletManualOperationModal";
import moment from "moment";
import {
  User,
  Activity,
  Clock,
  Percent,
  PlusCircle,
  MinusCircle,
  FileText,
  AlertCircle,
  CornerDownRight,
  TrendingUp,
  Tag,
  Send,
} from "lucide-react";

// Mock campaigns / deals
const MOCK_DEALS = [
  { campaign: "Summer Mega Festival Payout", joinedDate: "2026-05-01", earnings: 45000, status: "Active" },
  { campaign: "Super Seller Payout Boost", joinedDate: "2026-05-15", earnings: 25000, status: "Active" },
  { campaign: "Referral Drive Q2", joinedDate: "2026-06-01", earnings: 15000, status: "Active" },
  { campaign: "Welcome Payout", joinedDate: "2025-10-15", earnings: 500, status: "Completed" },
];

export const WalletDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const walletId = searchParams.get("id") || "";

  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Notes state
  const [notes, setNotes] = useState<Array<{ id: string; text: string; author: string; date: string }>>([]);
  const [newNote, setNewNote] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"credit" | "debit">("credit");

  const loadData = () => {
    const list = walletStore.getAccounts();
    const match = list.find((a) => a.id === walletId) || list[0]; // Fallback to first if not found
    setAccount(match || null);

    if (match) {
      const txs = walletStore.getTransactions().filter((t) => t.walletId === match.id);
      setTransactions(txs);

      const wdrs = walletStore.getWithdrawals().filter((w) => w.walletId === match.id);
      setWithdrawals(wdrs);

      // Load notes specific to this wallet from localStorage
      const savedNotes = localStorage.getItem(`wallet_notes_${match.id}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        const initialNotes = [
          {
            id: "note-1",
            text: "Account registered and initial compliance verification cleared.",
            author: "System Admin",
            date: match.createdDate,
          },
          {
            id: "note-2",
            text: "First withdrawal request approved successfully.",
            author: "Finance Team",
            date: moment(match.createdDate).add(30, "days").toISOString(),
          },
        ];
        setNotes(initialNotes);
        localStorage.setItem(`wallet_notes_${match.id}`, JSON.stringify(initialNotes));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [walletId]);

  // Aggregate stats specific to this user
  const stats = useMemo(() => {
    if (!account) return { thisMonth: 0, thisWeek: 0 };

    const commissions = transactions.filter((t) => t.category === "commission" && t.status === "Completed");

    const startOfMonth = moment().startOf("month");
    const startOfWeek = moment().startOf("week");

    const thisMonth = commissions
      .filter((c) => moment(c.createdAt).isSameOrAfter(startOfMonth))
      .reduce((s, c) => s + c.amount, 0);

    const thisWeek = commissions
      .filter((c) => moment(c.createdAt).isSameOrAfter(startOfWeek))
      .reduce((s, c) => s + c.amount, 0);

    return { thisMonth, thisWeek };
  }, [account, transactions]);

  // Ledger generation (Running Balance)
  const ledger = useMemo(() => {
    if (!account) return [];
    // Sort transactions chronologically to calculate running balance
    const sorted = [...transactions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let currentBalance = 0;

    return sorted.map((t) => {
      const isCredit = t.type === "credit";
      currentBalance += isCredit ? t.amount : -t.amount;
      return {
        ...t,
        runningBalance: currentBalance,
      };
    }).reverse(); // Display most recent first
  }, [account, transactions]);

  // Notes Submission
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !account) return;

    const note = {
      id: `note-${Date.now()}`,
      text: newNote,
      author: "Super Admin",
      date: new Date().toISOString(),
    };

    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(`wallet_notes_${account.id}`, JSON.stringify(updated));
    setNewNote("");
  };

  // Toggle freeze
  const handleFreezeToggle = () => {
    if (!account) return;
    walletStore.toggleWalletFreeze(account.id);
    loadData();
  };

  const handleOpenModal = (type: "credit" | "debit") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (!account) {
    return (
      <div className="p-16 text-center bg-white rounded-xl border border-slate-100 shadow-sm max-w-md mx-auto mt-20">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-sm font-bold text-slate-800">Wallet Account Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">Please go back to the Accounts panel and try again.</p>
        <button
          onClick={() => navigate("/wallet/accounts")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer"
        >
          Go to Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-6">
      {/* ── BREADCRUMB & BACK ACTION ── */}
      <div className="bg-white rounded-xl px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallback="/wallet/accounts" label="Wallet Accounts" variant="icon" />
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Wallet Accounts", to: "/wallet/accounts" },
              { label: `Wallet ID: ${account.id}`, to: `/wallet/details?id=${account.id}` },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFreezeToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              account.status === "Active"
                ? "bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100/80"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80"
            }`}
          >
            {account.status === "Active" ? "Freeze Wallet" : "Unfreeze Wallet"}
          </button>
        </div>
      </div>

      {/* ── User Overview Summary ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
            {account.userName[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{account.userName}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                account.role === "promoter"
                  ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                  : account.role === "seller"
                  ? "bg-violet-50 text-violet-700 border border-violet-200/50"
                  : "bg-blue-50 text-blue-700 border border-blue-200/50"
              }`}>
                {account.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{account.userEmail} • ID: {account.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal("credit")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer animate-in fade-in"
          >
            <PlusCircle size={14} />
            <span>Manual Credit</span>
          </button>
          <button
            onClick={() => handleOpenModal("debit")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200/60 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
          >
            <MinusCircle size={14} />
            <span>Manual Debit</span>
          </button>
        </div>
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Available */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
          <p className="text-lg font-black text-emerald-600">₹{account.availableBalance.toLocaleString()}</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payout</span>
          <p className="text-lg font-black text-amber-600">₹{account.pendingBalance.toLocaleString()}</p>
        </div>

        {/* Locked */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locked Balance</span>
          <p className="text-lg font-black text-rose-600">₹{account.lockedBalance.toLocaleString()}</p>
        </div>

        {/* Lifetime */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Earnings</span>
          <p className="text-lg font-black text-slate-700">₹{account.lifetimeEarnings.toLocaleString()}</p>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</span>
          <p className="text-lg font-black text-blue-600">₹{stats.thisMonth.toLocaleString()}</p>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Week</span>
          <p className="text-lg font-black text-violet-600">₹{stats.thisWeek.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Tabs and Content Area ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Tabs (Horizontal Scrollable) */}
        <div className="border-b border-slate-100 bg-slate-50/50 overflow-x-auto flex gap-1 p-2 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: <User size={14} /> },
            { id: "transactions", label: "Transactions", icon: <Activity size={14} /> },
            { id: "commission", label: "Commission Paid", icon: <Percent size={14} /> },
            { id: "withdrawals", label: "Withdrawals", icon: <Clock size={14} /> },
            { id: "referrals", label: "Referral Earnings", icon: <Tag size={14} /> },
            { id: "deals", label: "Joined Campaigns", icon: <TrendingUp size={14} /> },
            { id: "ledger", label: "Account Ledger", icon: <CornerDownRight size={14} /> },
            { id: "notes", label: "Internal Notes", icon: <FileText size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-50">Profile Specifications</h3>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs text-slate-600 font-medium">
                  <div>
                    <span className="text-slate-400">Registered Name</span>
                    <p className="text-slate-700 font-bold mt-0.5">{account.userName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">User Email Address</span>
                    <p className="text-slate-700 font-bold mt-0.5">{account.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account Access Role</span>
                    <p className="mt-0.5 font-bold uppercase text-slate-700">{account.role}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Wallet Account Status</span>
                    <p className="mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        account.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>{account.status}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Activation Date</span>
                    <p className="text-slate-700 font-bold mt-0.5">{moment(account.createdDate).format("DD MMMM YYYY")}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Session Activity</span>
                    <p className="text-slate-700 font-bold mt-0.5">{moment(account.lastTransaction).format("DD MMM YYYY, HH:mm A")}</p>
                  </div>
                </div>
              </div>

              {/* Settlement Accounts */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-50">Banking & Settlement Setup</h3>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs text-slate-600 font-medium">
                  <div>
                    <span className="text-slate-400">Clearing Bank</span>
                    <p className="text-slate-700 font-bold mt-0.5">State Bank of India (SBI)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Bank Account Number</span>
                    <p className="text-slate-700 font-mono font-bold mt-0.5">XXXX-XXXX-4567</p>
                  </div>
                  <div>
                    <span className="text-slate-400">IFS Code (IFSC)</span>
                    <p className="text-slate-700 font-mono font-bold mt-0.5">SBIN0001048</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Registered UPI ID</span>
                    <p className="text-slate-700 font-mono font-bold mt-0.5">{account.userName.toLowerCase().replace(/\s/g, "")}@oksbi</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Reference/Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{tx.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{tx.reference}</td>
                        <td className="px-4 py-3 uppercase text-[10px] font-semibold text-slate-400">{tx.category}</td>
                        <td className={`px-4 py-3 text-right font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-slate-600"}`}>
                          {tx.type === "credit" ? "+" : "-"} ₹{tx.amount}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            tx.type === "credit" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}>{tx.type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{moment(tx.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 text-xs font-semibold">No transactions recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* COMMISSION TAB */}
          {activeTab === "commission" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Reference/Details</th>
                    <th className="px-4 py-3 text-right">Commission Payout</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Cleared At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {transactions.filter((t) => t.category === "commission").length > 0 ? (
                    transactions
                      .filter((t) => t.category === "commission")
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-400">{tx.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{tx.reference}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">+ ₹{tx.amount}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                              Cleared
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{moment(tx.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-400 text-xs font-semibold">No commission earnings logged</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === "withdrawals" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Settlement Method</th>
                    <th className="px-4 py-3 text-right">Requested Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payout Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {withdrawals.length > 0 ? (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{w.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{w.bankName}</p>
                          <span className="text-[9px] text-slate-400 font-mono font-semibold">{w.upi || w.accountNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">₹{w.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            w.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : w.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : w.status === "Processing"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{moment(w.requestedDate).format("DD MMM YYYY, hh:mm A")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-400 text-xs font-semibold">No withdrawals requested</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* REFERRAL EARNINGS TAB */}
          {activeTab === "referrals" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/40 border border-blue-200/50 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Total Referral Payout</h4>
                  <p className="text-[11px] text-slate-400">Paid commissions generated by direct user signups.</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-600">₹1,500.00</p>
                  <span className="text-[10px] text-emerald-600 font-bold">12 Active referrals</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Referred User</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Incentive</th>
                      <th className="px-4 py-3">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">Rohan Sen (rohan.s@gmail.com)</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold">Active</span></td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">+ ₹100</td>
                      <td className="px-4 py-3 text-slate-400">22 Jun 2026</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">Pooja Patel (pooja.p@outlook.com)</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold">Active</span></td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">+ ₹100</td>
                      <td className="px-4 py-3 text-slate-400">20 Jun 2026</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">Kabir Mehta (k.mehta@yahoo.com)</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold">Inactive</span></td>
                      <td className="px-4 py-3 text-right font-bold text-slate-400">₹0</td>
                      <td className="px-4 py-3 text-slate-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JOINED DEALS TAB */}
          {activeTab === "deals" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Campaign Payout Name</th>
                    <th className="px-4 py-3">Joined On</th>
                    <th className="px-4 py-3 text-right">Net Earned</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {MOCK_DEALS.map((deal, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-800">{deal.campaign}</td>
                      <td className="px-4 py-3 text-slate-400">{moment(deal.joinedDate).format("DD MMM YYYY")}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{deal.earnings.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          deal.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>{deal.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LEDGER TAB */}
          {activeTab === "ledger" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-500 font-medium flex items-center gap-2">
                <AlertCircle size={15} className="text-slate-400 flex-shrink-0" />
                <span>The Account Ledger represents the official double-entry running balance audit trail for this wallet.</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Reference ID</th>
                      <th className="px-4 py-3">Activity Description</th>
                      <th className="px-4 py-3 text-right">Debit (-)</th>
                      <th className="px-4 py-3 text-right">Credit (+)</th>
                      <th className="px-4 py-3 text-right">Audit Balance</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 font-mono">
                    {ledger.length > 0 ? (
                      ledger.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 text-[11px]">
                          <td className="px-4 py-3 font-bold text-slate-400">{row.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 font-sans">{row.reference}</td>
                          <td className="px-4 py-3 text-right text-rose-600 font-bold">
                            {row.type === "debit" ? `- ₹${row.amount}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                            {row.type === "credit" ? `+ ₹${row.amount}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            ₹{row.runningBalance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-sans">
                            {moment(row.createdAt).format("DD MMM YYYY, HH:mm:ss")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-400 text-xs font-semibold font-sans">No ledger entries found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal admin note for this wallet account..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Post Note</span>
                </button>
              </form>

              {/* Notes Timeline */}
              <div className="relative border-l border-slate-100 pl-6 ml-4 space-y-5">
                {notes.map((note) => (
                  <div key={note.id} className="relative">
                    {/* Circle bullet */}
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white ring-4 ring-slate-50" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">{note.author}</span>
                        <span className="text-[10px] text-slate-400">{moment(note.date).format("DD MMM YYYY, hh:mm A")}</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-xl">
                        {note.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Operation Popup Modal */}
      <WalletManualOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        initialWalletId={account.id}
        initialType={modalType}
      />
    </div>
  );
};
