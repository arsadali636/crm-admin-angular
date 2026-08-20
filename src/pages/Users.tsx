import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { IUser } from "../types";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  ShoppingCart,
  Store,
  Megaphone,
  ShieldCheck,
  Search,
  ChevronDown,
  Download,
  UserPlus,
  RefreshCw,
  SlidersHorizontal,
  MoreVertical,
  Eye,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Columns,
  Upload,
  Wallet,
  History as HistoryIcon
} from "lucide-react";

// Import custom subcomponents
import { UserStatsCard } from "../components/users/UserStatsCard";
import { FilterDrawer, FilterState, initialFilters } from "../components/users/FilterDrawer";
import { UserDetails } from "../components/users/UserDetails";
import { PromoterManageCommissionDrawer } from "../components/users/PromoterManageCommissionDrawer";
import { FaCoins } from "react-icons/fa";

/* ═══════════════════════════════════════════════════
   ROLE BADGES MAP
   ═══════════════════════════════════════════════════ */
const ROLE_BADGE_MAP: Record<string, string> = {
  user: "bg-blue-50 text-blue-700 border-blue-200/80",
  buyer: "bg-blue-50 text-blue-700 border-blue-200/80",
  seller: "bg-violet-50 text-violet-700 border-violet-200/80",
  promoter: "bg-amber-50 text-amber-700 border-amber-200/80",
  connector: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  admin: "bg-rose-50 text-rose-700 border-rose-200/80",
};

const RoleBadge = ({ role }: { role: string }) => {
  const r = role.toLowerCase();
  const colors = ROLE_BADGE_MAP[r] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${colors}`}>
      {role}
    </span>
  );
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "inactive":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "blocked":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200/80";
  }
};

/* ═══════════════════════════════════════════════════
   MAIN USERS PAGE
   ═══════════════════════════════════════════════════ */
const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Selected User for Detail View (read from query param ?userId=<id>)
  const userIdParam = searchParams.get("userId");

  // Filter Drawer & State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilters);
  const [activeCardFilter, setActiveCardFilter] = useState<string>("");

  // Search input
  const searchInput = searchParams.get("search") || "";

  // Dynamic Wallet Balances Map (userId -> balance)
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState<keyof IUser | "name" | "wallet" | "orders" | "registered" | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Promoter Commission Drawer State
  const [manageCommissionState, setManageCommissionState] = useState<{
    isOpen: boolean;
    user: IUser | null;
    initialTab: "add" | "history";
  }>({ isOpen: false, user: null, initialTab: "history" });

  // Column Visibility
  const [columnVisibility, setColumnVisibility] = useState({
    avatar: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    business: true,
    location: true,
    wallet: true,
    orders: true,
    registered: true,
    lastLogin: true,
    totalCommission: false,
    pendingCommission: false,
    scheduledCommission: false,
    releasedCommission: false,
  });
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  // Row dropdown menus
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "user",
    businessName: "",
    gstNumber: "",
    aadhaarNumber: "",
  });

  // Import Mock Dialog State
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Close row menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch profiles from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const url = getCompleteUrlV1("profile/getAllProfiles");
      const res = await httpClient.get(url);
      const json = await res.json();
      const rawData = json.data ?? [];

      // Map API Data cleanly without static mock generators
      const enriched: IUser[] = rawData.map((u: any) => {
        const id = u._id || u.id || Math.random().toString(36).substr(2, 9);

        // Roles formatting
        let rolesArray: string[] = [];
        if (Array.isArray(u.role)) {
          rolesArray = u.role;
        } else if (typeof u.role === "string") {
          rolesArray = [u.role];
        } else {
          rolesArray = ["user"];
        }

        // Map API fields directly
        const userObj: IUser = {
          _id: id,
          role: rolesArray,
          email: u.email || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          affiliateId: u.affiliateId || u.referralCode || undefined,
          phoneNumber: u.phoneNumber || u.phone || "",
          createdAt: u.createdAt || "",
          status: u.status || "active",
          gender: u.gender || undefined,
          dob: u.dob || undefined,
          altPhone: u.altPhone || u.alternatePhone || undefined,
          state: u.state || u.location?.state || undefined,
          city: u.city || u.location?.city || undefined,
          district: u.district || u.location?.district || undefined,
          pincode: u.pincode || u.location?.pincode || undefined,
          kycStatus: u.kycStatus || (u.isKycVerified ? "verified" : undefined),
          lastLogin: u.lastLogin || u.lastLoginIp || undefined,
          wallet: u.wallet ? {
            balance: Number(u.wallet.balance || u.wallet.walletBalance || 0),
            locked: Number(u.wallet.locked || u.wallet.lockedBalance || 0),
            earnings: Number(u.wallet.earnings || u.wallet.lifetimeEarnings || 0),
            withdrawals: Number(u.wallet.withdrawals || 0),
            pendingWithdrawals: Number(u.wallet.pendingWithdrawals || 0),
          } : (u.walletBalance !== undefined ? {
            balance: Number(u.walletBalance || 0),
            locked: Number(u.walletLocked || 0),
            earnings: Number(u.walletEarnings || 0),
            withdrawals: Number(u.withdrawals || 0),
            pendingWithdrawals: Number(u.pendingWithdrawals || 0),
          } : undefined),
          orders: u.orders ? {
            total: Number(u.orders.total || 0),
            completed: Number(u.orders.completed || 0),
            pending: Number(u.orders.pending || 0),
            cancelled: Number(u.orders.cancelled || 0),
            returns: Number(u.orders.returns || 0),
            totalPurchase: Number(u.orders.totalPurchase || 0),
            ltv: Number(u.orders.ltv || 0),
          } : (u.totalOrders !== undefined ? {
            total: Number(u.totalOrders || 0),
            completed: Number(u.completedOrders || 0),
            pending: Number(u.pendingOrders || 0),
            cancelled: Number(u.cancelledOrders || 0),
            returns: Number(u.returns || 0),
            totalPurchase: Number(u.totalPurchase || 0),
            ltv: Number(u.ltv || 0),
          } : undefined),
          promoterInfo: u.promoterInfo || undefined,
          seller: u.seller
            ? {
                ...u.seller,
                businessName: u.seller.businessName || u.businessName || "",
                address: u.seller.address || u.businessAddress || "",
                aadhaarNumber: u.seller.aadhaarNumber || "",
                gstNumber: u.seller.gstNumber || u.gstin || "",
                pan: u.seller.panNumber || u.seller.pan || u.seller.panCard || "",
                panNumber: u.seller.panNumber || u.seller.pan || u.seller.panCard || "",
                typeOfBusiness: u.seller.typeOfBusiness,
                industry: u.seller.industry,
                businessType: Array.isArray(u.seller.typeOfBusiness) 
                  ? u.seller.typeOfBusiness.join(", ") 
                  : u.seller.typeOfBusiness || u.seller.businessType || "",
                businessCategory: u.seller.industry || u.seller.businessCategory || "",
                verificationStatus: u.seller.verificationStatus || "verified",
              }
            : undefined,
        };

        // Overlay with any localStorage admin updates
        const storageKey = `crm_user_data_${userObj.email}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.userOverride) {
            if (parsed.userOverride.seller?.pan?.startsWith("ABCDE")) {
              delete parsed.userOverride.seller.pan;
            }
            if (parsed.userOverride.seller?.panNumber?.startsWith("ABCDE")) {
              delete parsed.userOverride.seller.panNumber;
            }
            return {
              ...userObj,
              ...parsed.userOverride,
              seller: userObj.seller ? { ...userObj.seller, ...parsed.userOverride.seller } : parsed.userOverride.seller,
            };
          }
        }

        return userObj;
      });

      // Include newly created users from localStorage
      const customUsersJson = localStorage.getItem("crm_custom_users");
      const customUsers: IUser[] = customUsersJson ? JSON.parse(customUsersJson) : [];
      
      setAllUsers([...customUsers, ...enriched]);
    } catch (err) {
      console.error("Failed to load profiles", err);
      showToast("Failed to refresh user list.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Dynamically fetch live wallet balances from API for listed users
  useEffect(() => {
    if (allUsers.length === 0) return;

    let isMounted = true;
    const fetchDynamicWalletBalances = async () => {
      const newBalances: Record<string, number> = {};

      await Promise.all(
        allUsers.map(async (u) => {
          const uid = u._id || (u as any).id;
          if (!uid) return;
          try {
            const res = await httpClient.get(getCompleteUrlV1("wallet", { userId: uid }));
            if (res.ok) {
              const json = await res.json();
              if (json.data?.balance !== undefined) {
                newBalances[uid] = Number(json.data.balance) || 0;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch dynamic wallet balance for user ${uid}`, err);
          }
        })
      );

      if (isMounted && Object.keys(newBalances).length > 0) {
        setWalletBalances((prev) => ({ ...prev, ...newBalances }));
      }
    };

    fetchDynamicWalletBalances();

    return () => {
      isMounted = false;
    };
  }, [allUsers]);

  // Compute stats for KPI cards
  const stats = useMemo(() => {
    const total = allUsers.length;
    const buyers = allUsers.filter(u => u.role?.some(r => r.toLowerCase() === "user" || r.toLowerCase() === "buyer")).length;
    const sellers = allUsers.filter(u => u.role?.some(r => r.toLowerCase() === "seller")).length;
    const promoters = allUsers.filter(u => u.role?.some(r => r.toLowerCase() === "promoter")).length;
    const connectors = allUsers.filter(u => u.role?.some(r => r.toLowerCase() === "connector")).length;
    const admins = allUsers.filter(u => u.role?.some(r => r.toLowerCase() === "admin")).length;
    
    // Growth Trend Mock values
    const newThisWeek = allUsers.filter(u => moment().diff(moment(u.createdAt), "days") <= 7).length;
    const active = allUsers.filter(u => u.status === "active").length;
    const inactive = allUsers.filter(u => u.status === "inactive").length;
    const pendingApproval = allUsers.filter(u => u.status === "pending" || u.kycStatus === "pending").length;
    const blocked = allUsers.filter(u => u.status === "blocked").length;
    const verified = allUsers.filter(u => u.kycStatus === "verified").length;

    return {
      total,
      buyers,
      sellers,
      promoters,
      connectors,
      admins,
      newThisWeek,
      active,
      inactive,
      pendingApproval,
      blocked,
      verified,
    };
  }, [allUsers]);

  // Global search input handler
  const handleSearch = (value: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value) p.set("search", value);
      else p.delete("search");
      return p;
    });
    setCurrentPage(1);
  };

  // Filter apply handlers
  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveFilters(initialFilters);
    setActiveCardFilter("");
    setCurrentPage(1);
  };

  // Select User Row
  const handleSelectUser = (id: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("userId", id);
      return p;
    });
  };

  // Update profile handler (triggered from detail changes)
  const handleUpdateUser = (updatedUser: IUser) => {
    // If it's a custom user, update in custom user list
    const customUsersJson = localStorage.getItem("crm_custom_users");
    let customUsers: IUser[] = customUsersJson ? JSON.parse(customUsersJson) : [];
    const customIdx = customUsers.findIndex(u => u.email === updatedUser.email);
    if (customIdx > -1) {
      customUsers[customIdx] = updatedUser;
      localStorage.setItem("crm_custom_users", JSON.stringify(customUsers));
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.email === updatedUser.email ? updatedUser : u))
    );
  };

  // KPI Card Filter toggle
  const handleCardClick = (cardType: string) => {
    if (activeCardFilter === cardType) {
      setActiveCardFilter(""); // Toggle off
    } else {
      setActiveCardFilter(cardType);
    }
    setCurrentPage(1);
  };

  // Add User Form Submission
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: IUser = {
      _id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
      firstName: addUserForm.firstName,
      lastName: addUserForm.lastName,
      email: addUserForm.email,
      phoneNumber: addUserForm.phoneNumber,
      role: [addUserForm.role],
      createdAt: moment().toISOString(),
      status: "active",
      affiliateId: `AFF-NEW-${Math.floor(10 + Math.random() * 89)}`,
      kycStatus: "verified",
      state: "Maharashtra",
      city: "Mumbai",
      district: "Mumbai",
      pincode: "400001",
      wallet: { balance: 0, locked: 0, earnings: 0, withdrawals: 0, pendingWithdrawals: 0 },
      orders: { total: 0, completed: 0, pending: 0, cancelled: 0, returns: 0, totalPurchase: 0, ltv: 0 },
      seller: addUserForm.role === "seller" ? {
        businessName: addUserForm.businessName || "New Merchant Store",
        gstNumber: addUserForm.gstNumber || "27AAACCC1111A1Z",
        aadhaarNumber: addUserForm.aadhaarNumber || "000000000000",
      } : undefined,
    };

    // Save to custom local storage users
    const customUsersJson = localStorage.getItem("crm_custom_users");
    const customUsers: IUser[] = customUsersJson ? JSON.parse(customUsersJson) : [];
    customUsers.unshift(newUser);
    localStorage.setItem("crm_custom_users", JSON.stringify(customUsers));

    // Update state
    setAllUsers((prev) => [newUser, ...prev]);
    setIsAddUserOpen(false);
    setAddUserForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "user",
      businessName: "",
      gstNumber: "",
      aadhaarNumber: "",
    });
    showToast(`User ${newUser.firstName} added successfully!`);
  };

  // Mock Import CRM list
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsImportOpen(false);
    showToast("Processing CSV batch import of 15 users...");
    setTimeout(() => {
      showToast("Batch import complete! 15 users added to CRM registers.", "success");
      fetchUsers();
    }, 1500);
  };

  // Export filtered users to CSV
  const handleExportCSV = () => {
    const headers = [
      "User ID", "First Name", "Last Name", "Email", "Phone", "Role", 
      "Status", "Business Name", "GST", "State", "City", "Wallet Balance", 
      "Total Orders", "LTV", "Registered"
    ];
    const rows = filteredUsers.map((u) => [
      u._id || "-",
      u.firstName,
      u.lastName,
      u.email,
      u.phoneNumber,
      u.role?.join("; "),
      u.status,
      u.seller?.businessName || "-",
      u.seller?.gstNumber || "-",
      u.state || "-",
      u.city || "-",
      walletBalances[u._id || (u as any).id || ""] !== undefined
        ? walletBalances[u._id || (u as any).id || ""]
        : (u.wallet?.balance || 0),
      u.orders?.total || 0,
      u.orders?.ltv || 0,
      moment(u.createdAt).format("DD-MM-YYYY")
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lottmart_crm_users_${moment().format("YYYYMMDD_HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CRM User List exported to CSV successfully.");
  };

  // Admin action triggers (Block, Unblock, Reset Password, Delete)
  const executeRowAction = (u: IUser, actionType: "block" | "unblock" | "activate" | "deactivate" | "reset-password" | "delete") => {
    setOpenRowMenuId(null);
    let updatedUser = { ...u };
    let toastMessage = "";

    if (actionType === "block") {
      updatedUser.status = "blocked";
      toastMessage = `User ${u.firstName} blocked successfully.`;
    } else if (actionType === "unblock") {
      updatedUser.status = "active";
      toastMessage = `User ${u.firstName} unblocked.`;
    } else if (actionType === "activate") {
      updatedUser.status = "active";
      toastMessage = `User ${u.firstName} activated.`;
    } else if (actionType === "deactivate") {
      updatedUser.status = "inactive";
      toastMessage = `User ${u.firstName} deactivated.`;
    } else if (actionType === "reset-password") {
      toastMessage = `Security reset link emailed to ${u.email}`;
    } else if (actionType === "delete") {
      // Filter out from state
      setAllUsers(prev => prev.filter(item => item.email !== u.email));
      const customUsersJson = localStorage.getItem("crm_custom_users");
      if (customUsersJson) {
        const parsed: IUser[] = JSON.parse(customUsersJson);
        const filtered = parsed.filter(item => item.email !== u.email);
        localStorage.setItem("crm_custom_users", JSON.stringify(filtered));
      }
      showToast(`User ${u.firstName} permanently deleted from CRM registries.`);
      return;
    }

    if (actionType !== "reset-password") {
      handleUpdateUser(updatedUser);
      // Record in local audits
      const storageKey = `crm_user_data_${u.email}`;
      const savedData = localStorage.getItem(storageKey);
      const parsed = savedData ? JSON.parse(savedData) : { notes: [], auditLogs: [] };
      const newAudit = {
        action: `CRM Quick Action: ${actionType.toUpperCase()}`,
        changedBy: "Administrator",
        oldValue: u.status,
        newValue: updatedUser.status,
        timestamp: moment().toISOString(),
        ip: "103.85.12.94",
      };
      localStorage.setItem(storageKey, JSON.stringify({
        ...parsed,
        userOverride: updatedUser,
        auditLogs: [newAudit, ...parsed.auditLogs],
      }));
    }

    showToast(toastMessage);
  };

  /* ═══════════════════════════════════════════════════
     FILTER & SORT LOGIC
     ═══════════════════════════════════════════════════ */
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // 1. Global text search
      if (searchInput) {
        const query = searchInput.toLowerCase();
        const matchesName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesPhone = u.phoneNumber?.toLowerCase().includes(query);
        const matchesAffiliate = u.affiliateId?.toLowerCase().includes(query);
        const matchesBusiness = u.seller?.businessName?.toLowerCase().includes(query);
        const matchesGST = u.seller?.gstNumber?.toLowerCase().includes(query);
        const matchesId = u._id?.toLowerCase().includes(query);

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesAffiliate && !matchesBusiness && !matchesGST && !matchesId) {
          return false;
        }
      }

      // 2. Active KPI card filters
      if (activeCardFilter) {
        if (activeCardFilter === "total") {
          // No filter
        } else if (activeCardFilter === "buyers") {
          if (!u.role?.some(r => r.toLowerCase() === "user" || r.toLowerCase() === "buyer")) return false;
        } else if (activeCardFilter === "sellers") {
          if (!u.role?.some(r => r.toLowerCase() === "seller")) return false;
        } else if (activeCardFilter === "promoters") {
          if (!u.role?.some(r => r.toLowerCase() === "promoter")) return false;
        } else if (activeCardFilter === "connectors") {
          if (!u.role?.some(r => r.toLowerCase() === "connector")) return false;
        } else if (activeCardFilter === "admins") {
          if (!u.role?.some(r => r.toLowerCase() === "admin")) return false;
        } else if (activeCardFilter === "newThisWeek") {
          if (moment().diff(moment(u.createdAt), "days") > 7) return false;
        } else if (activeCardFilter === "active") {
          if (u.status !== "active") return false;
        } else if (activeCardFilter === "inactive") {
          if (u.status !== "inactive") return false;
        } else if (activeCardFilter === "pendingApproval") {
          if (u.status !== "pending" && u.kycStatus !== "pending") return false;
        } else if (activeCardFilter === "blocked") {
          if (u.status !== "blocked") return false;
        } else if (activeCardFilter === "verified") {
          if (u.kycStatus !== "verified") return false;
        }
      }

      // 3. Drawer Advanced filters
      const df = activeFilters;
      if (df.role && !u.role?.some(r => r.toLowerCase() === df.role)) return false;
      if (df.status && u.status !== df.status) return false;
      if (df.verification && u.kycStatus !== df.verification) return false;
      if (df.state && !u.state?.toLowerCase().includes(df.state.toLowerCase())) return false;
      if (df.city && !u.city?.toLowerCase().includes(df.city.toLowerCase())) return false;
      if (df.district && !u.district?.toLowerCase().includes(df.district.toLowerCase())) return false;
      if (df.pincode && u.pincode !== df.pincode) return false;
      if (df.businessCategory && !u.seller?.businessCategory?.toLowerCase().includes(df.businessCategory.toLowerCase())) return false;
      if (df.affiliateId && !u.affiliateId?.toLowerCase().includes(df.affiliateId.toLowerCase())) return false;
      if (df.gstNumber && !u.seller?.gstNumber?.toLowerCase().includes(df.gstNumber.toLowerCase())) return false;

      // Flags
      if (df.hasBusiness === true && !u.seller) return false;
      if (df.hasBusiness === false && u.seller) return false;
      if (df.hasWallet === true && !u.wallet) return false;
      if (df.hasWallet === false && u.wallet) return false;

      // Numeric ranges
      const uBal = walletBalances[u._id || (u as any).id || ""] !== undefined
        ? walletBalances[u._id || (u as any).id || ""]
        : (u.wallet?.balance || 0);
      if (df.walletMin && uBal < Number(df.walletMin)) return false;
      if (df.walletMax && uBal > Number(df.walletMax)) return false;
      if (df.orderCountMin && (u.orders?.total || 0) < Number(df.orderCountMin)) return false;
      if (df.orderCountMax && (u.orders?.total || 0) > Number(df.orderCountMax)) return false;
      if (df.ltvMin && (u.orders?.ltv || 0) < Number(df.ltvMin)) return false;
      if (df.ltvMax && (u.orders?.ltv || 0) > Number(df.ltvMax)) return false;
      if (df.referralCountMin && (u.promoterInfo?.referralCount || 0) < Number(df.referralCountMin)) return false;
      if (df.referralCountMax && (u.promoterInfo?.referralCount || 0) > Number(df.referralCountMax)) return false;

      // Date Range
      if (df.registerDateStart && moment(u.createdAt).isBefore(moment(df.registerDateStart))) return false;
      if (df.registerDateEnd && moment(u.createdAt).isAfter(moment(df.registerDateEnd))) return false;

      return true;
    });
  }, [allUsers, searchInput, activeCardFilter, activeFilters, walletBalances]);

  // Sort Logic
  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortField === "name") {
        aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
        bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortField === "wallet") {
        const idA = a._id || (a as any).id || "";
        const idB = b._id || (b as any).id || "";
        aVal = walletBalances[idA] !== undefined ? walletBalances[idA] : (a.wallet?.balance || 0);
        bVal = walletBalances[idB] !== undefined ? walletBalances[idB] : (b.wallet?.balance || 0);
      } else if (sortField === "orders") {
        aVal = a.orders?.total || 0;
        bVal = b.orders?.total || 0;
      } else if (sortField === "registered") {
        aVal = moment(a.createdAt).valueOf();
        bVal = moment(b.createdAt).valueOf();
      } else {
        aVal = (a[sortField as keyof IUser] || "").toString().toLowerCase();
        bVal = (b[sortField as keyof IUser] || "").toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination Logic
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  const toggleSort = (field: keyof IUser | "name" | "wallet" | "orders" | "registered") => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Matched details user
  const selectedUser = useMemo(() => {
    if (!userIdParam) return null;
    return allUsers.find((u) => u._id === userIdParam) || null;
  }, [allUsers, userIdParam]);

  // If a user profile details deep link is active, render UserDetails page
  if (selectedUser) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
        <UserDetails
          user={selectedUser}
          onBack={() => {
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              p.delete("userId");
              return p;
            });
          }}
          onUpdateUser={handleUpdateUser}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ── TOAST NOTIFICATIONS ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <CheckCircle size={15} className={toast.type === "success" ? "text-emerald-500" : "text-rose-500"} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Users Management</h1>
          <p className="text-xs text-slate-400">Manage Buyers, Sellers, Promoters, Connectors and Admins inside the Lottmart ecosystem.</p>
        </div>

        {/* Global Toolbar Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <UserPlus size={14} />
            Add User
          </button>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            <Download size={14} />
            Export
          </button>
          
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            <Upload size={14} />
            Import
          </button>
          
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
            title="Refresh CRM Registry"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── KPI ANALYTICS GRID ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <UserStatsCard
          title="Total Users"
          count={stats.total}
          icon={UsersIcon}
          trend={{ value: 12, isPositive: true }}
          subtitle="vs last month"
          isActive={activeCardFilter === "total"}
          onClick={() => handleCardClick("total")}
          gradientClass="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700"
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <UserStatsCard
          title="Buyers"
          count={stats.buyers}
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
          subtitle="vs last month"
          isActive={activeCardFilter === "buyers"}
          onClick={() => handleCardClick("buyers")}
          gradientClass="bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700"
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-600"
        />
        <UserStatsCard
          title="Sellers"
          count={stats.sellers}
          icon={Store}
          trend={{ value: 5, isPositive: true }}
          subtitle="vs last month"
          isActive={activeCardFilter === "sellers"}
          onClick={() => handleCardClick("sellers")}
          gradientClass="bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700"
          iconBgClass="bg-violet-50"
          iconColorClass="text-violet-600"
        />
        <UserStatsCard
          title="Promoters"
          count={stats.promoters}
          icon={Megaphone}
          trend={{ value: 15, isPositive: true }}
          subtitle="vs last month"
          isActive={activeCardFilter === "promoters"}
          onClick={() => handleCardClick("promoters")}
          gradientClass="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
        <UserStatsCard
          title="Connectors"
          count={stats.connectors}
          icon={Briefcase}
          trend={{ value: 3, isPositive: true }}
          subtitle="vs last month"
          isActive={activeCardFilter === "connectors"}
          onClick={() => handleCardClick("connectors")}
          gradientClass="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
        <UserStatsCard
          title="Admins"
          count={stats.admins}
          icon={ShieldCheck}
          isActive={activeCardFilter === "admins"}
          onClick={() => handleCardClick("admins")}
          gradientClass="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800"
          iconBgClass="bg-slate-100"
          iconColorClass="text-slate-600"
        />
        <UserStatsCard
          title="New This Week"
          count={stats.newThisWeek}
          icon={UsersIcon}
          trend={{ value: 18, isPositive: true }}
          subtitle="Recent Registrations"
          isActive={activeCardFilter === "newThisWeek"}
          onClick={() => handleCardClick("newThisWeek")}
          gradientClass="bg-gradient-to-br from-blue-500 to-cyan-500"
          iconBgClass="bg-cyan-50"
          iconColorClass="text-cyan-600"
        />
        <UserStatsCard
          title="Active Users"
          count={stats.active}
          icon={CheckCircle}
          trend={{ value: 94, isPositive: true }}
          subtitle="Of total database"
          isActive={activeCardFilter === "active"}
          onClick={() => handleCardClick("active")}
          gradientClass="bg-gradient-to-br from-emerald-500 to-teal-500"
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />
        <UserStatsCard
          title="Inactive Users"
          count={stats.inactive}
          icon={AlertCircle}
          isActive={activeCardFilter === "inactive"}
          onClick={() => handleCardClick("inactive")}
          gradientClass="bg-gradient-to-br from-slate-400 to-slate-500"
          iconBgClass="bg-slate-50"
          iconColorClass="text-slate-500"
        />

      </div>

      {/* ── TOOLBAR & SEARCH SECTION ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Search & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Global search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, affiliate ID, GST, business name..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
          </div>

          {/* Open Filter Drawer */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              JSON.stringify(activeFilters) !== JSON.stringify(initialFilters)
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters Drawer
            {JSON.stringify(activeFilters) !== JSON.stringify(initialFilters) && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Reset Filters shortcut */}
          {(JSON.stringify(activeFilters) !== JSON.stringify(initialFilters) || activeCardFilter) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Column visibility dropdown controller */}
        <div className="relative">
          <button
            onClick={() => setIsColMenuOpen(!isColMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            <Columns size={14} />
            Columns
            <ChevronDown size={12} />
          </button>

          <AnimatePresence>
            {isColMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsColMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 p-2.5 space-y-1.5 text-xs text-slate-700"
                >
                  <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider px-2 py-0.5 border-b border-slate-50 mb-1">Toggle Columns</p>
                  {Object.keys(columnVisibility).map((col) => (
                    <label key={col} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded-lg cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={columnVisibility[col as keyof typeof columnVisibility]}
                        onChange={(e) =>
                          setColumnVisibility((prev) => ({ ...prev, [col]: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                      />
                      {col === "ltv" ? "LTV" : col.replace(/([A-Z])/g, " $1")}
                    </label>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── DATA TABLE REDESIGN ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                {columnVisibility.avatar && <th className="px-5 py-3.5 text-left w-12"></th>}
                {columnVisibility.name && (
                  <th className="px-5 py-3.5 text-left cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort("name")}>
                    User Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                )}
                {columnVisibility.email && <th className="px-5 py-3.5 text-left">Email</th>}
                {columnVisibility.phone && <th className="px-5 py-3.5 text-left">Phone</th>}
                {columnVisibility.role && <th className="px-5 py-3.5 text-left">Role</th>}
                {columnVisibility.status && <th className="px-5 py-3.5 text-left">Status</th>}
                {columnVisibility.business && <th className="px-5 py-3.5 text-left">Business</th>}
                {columnVisibility.location && <th className="px-5 py-3.5 text-left">Location</th>}
                {columnVisibility.wallet && (
                  <th className="px-5 py-3.5 text-left cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort("wallet")}>
                    Wallet Balance {sortField === "wallet" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                )}
                {columnVisibility.orders && (
                  <th className="px-5 py-3.5 text-left cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort("orders")}>
                    Orders {sortField === "orders" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                )}
                {columnVisibility.registered && (
                  <th className="px-5 py-3.5 text-left cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort("registered")}>
                    Registered {sortField === "registered" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                )}
                {columnVisibility.lastLogin && <th className="px-5 py-3.5 text-left">Last Login</th>}
                <th className="px-5 py-3.5 text-center w-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-5 py-12 text-center text-slate-400">
                    <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UsersIcon size={20} />
                    </div>
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => (
                  <tr
                    key={u.email + "-" + idx}
                    className="hover:bg-blue-50/20 group transition-colors duration-150"
                  >
                    {columnVisibility.avatar && (
                      <td className="px-5 py-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {(u.firstName?.[0] || "").toUpperCase()}
                          {(u.lastName?.[0] || "").toUpperCase()}
                        </div>
                      </td>
                    )}
                    {columnVisibility.name && (
                      <td className="px-5 py-3 font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSelectUser(u._id || "")}>
                        {u.firstName} {u.lastName}
                      </td>
                    )}
                    {columnVisibility.email && <td className="px-5 py-3 text-slate-600 font-mono">{u.email}</td>}
                    {columnVisibility.phone && <td className="px-5 py-3 text-slate-500 font-mono">{u.phoneNumber}</td>}
                    {columnVisibility.role && (
                      <td className="px-5 py-3">
                        <RoleBadge role={u.role?.[0] || "user"} />
                      </td>
                    )}
                    {columnVisibility.status && (
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border tracking-wide uppercase ${getStatusBadge(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                    )}
                    {columnVisibility.business && (
                      <td className="px-5 py-3 text-slate-600">
                        {u.seller?.businessName ? (
                          <div>
                            <p className="font-semibold text-slate-700">{u.seller.businessName}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{u.seller.gstNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}
                    {columnVisibility.location && (
                      <td className="px-5 py-3 text-slate-500">
                        {u.city}, {u.state}
                      </td>
                    )}
                    {columnVisibility.wallet && (
                      <td className="px-5 py-3 font-bold text-slate-700">
                        ₹{(
                          walletBalances[u._id || (u as any).id || ""] !== undefined
                            ? walletBalances[u._id || (u as any).id || ""]
                            : (u.wallet?.balance || 0)
                        ).toLocaleString()}
                      </td>
                    )}
                    {columnVisibility.orders && (
                      <td className="px-5 py-3 text-slate-600">
                        <span className="font-semibold">{u.orders?.total || 0}</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span className="text-blue-600 font-bold text-[10px]">₹{(u.orders?.ltv || 0).toLocaleString()}</span>
                      </td>
                    )}
                    {columnVisibility.registered && (
                      <td className="px-5 py-3 text-slate-500">
                        {moment(u.createdAt).format("DD MMM YYYY")}
                      </td>
                    )}
                    {columnVisibility.lastLogin && <td className="px-5 py-3 font-mono text-slate-400">{u.lastLogin || "—"}</td>}
                    
                    {/* Row Context Menu Actions */}
                    <td className="px-5 py-3 text-center relative">
                      <button
                        onClick={() => setOpenRowMenuId(openRowMenuId === u.email ? null : u.email)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openRowMenuId === u.email && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenRowMenuId(null)} />
                          <div
                            ref={rowMenuRef}
                            className="absolute right-6 top-6 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5 w-48 text-left space-y-0.5 text-xs text-slate-700"
                          >
                            {/* Standard Actions */}
                            <button
                              onClick={() => {
                                setOpenRowMenuId(null);
                                handleSelectUser(u._id || "");
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye size={13} />
                              View User
                            </button>

                            <button
                              onClick={() => {
                                setOpenRowMenuId(null);
                                handleSelectUser(u._id || "");
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <Wallet size={13} />
                              View Wallet
                            </button>

                            <button
                              onClick={() => {
                                setOpenRowMenuId(null);
                                handleSelectUser(u._id || "");
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <ShoppingCart size={13} />
                              View Orders
                            </button>

                            {/* PROMOTER ONLY ACTIONS */}
                            {(u.role || []).some((r) => typeof r === "string" && r.toLowerCase() === "promoter") && (
                              <>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setOpenRowMenuId(null);
                                    setManageCommissionState({ isOpen: true, user: u, initialTab: "add" });
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <FaCoins size={13} className="text-amber-500" />
                                  Manage Commission
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenRowMenuId(null);
                                    setManageCommissionState({ isOpen: true, user: u, initialTab: "history" });
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <HistoryIcon size={13} className="text-amber-600" />
                                  Commission History
                                </button>
                              </>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            {u.status !== "active" && (
                              <button
                                onClick={() => executeRowAction(u, "activate")}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-emerald-600 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <CheckCircle size={13} />
                                Activate User
                              </button>
                            )}

                            {u.status === "active" && (
                              <button
                                onClick={() => executeRowAction(u, "deactivate")}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <AlertCircle size={13} />
                                Deactivate
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── TABLE PAGINATION FOOTER ── */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 bg-white rounded px-2 py-1 text-slate-600 font-semibold cursor-pointer focus:outline-none"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span>of {sortedUsers.length} total results</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white font-semibold cursor-pointer"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER DRAWER COMPONENT ── */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* ── ADD USER OVERLAY MODAL ── */}
      <AnimatePresence>
        {isAddUserOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUserOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-16 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Add User Account</h3>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">First Name</label>
                    <input
                      type="text"
                      value={addUserForm.firstName}
                      onChange={(e) => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={addUserForm.lastName}
                      onChange={(e) => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addUserForm.phoneNumber}
                    onChange={(e) => setAddUserForm({ ...addUserForm, phoneNumber: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Account Role</label>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                  >
                    <option value="user">Buyer / User</option>
                    <option value="seller">Seller</option>
                    <option value="promoter">Promoter</option>
                    <option value="connector">Connector</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {addUserForm.role === "seller" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3.5 pt-2 border-t border-slate-100"
                  >
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={addUserForm.businessName}
                        onChange={(e) => setAddUserForm({ ...addUserForm, businessName: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={addUserForm.gstNumber}
                          onChange={(e) => setAddUserForm({ ...addUserForm, gstNumber: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Aadhaar Card</label>
                        <input
                          type="text"
                          value={addUserForm.aadhaarNumber}
                          onChange={(e) => setAddUserForm({ ...addUserForm, aadhaarNumber: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4 -mx-5 -mb-5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BATCH IMPORT OVERLAY MODAL ── */}
      <AnimatePresence>
        {isImportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportOpen(false)}
              className="fixed inset-0 bg-slate-900 z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 text-center"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Upload size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base mb-2">Import CSV CRM Dataset</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Upload a structured comma-separated values (.csv) spreadsheet file matching Lottmart CRM fields to bulk register new accounts.
              </p>
              
              <div className="flex flex-col gap-2">
                <label className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow cursor-pointer">
                  <Upload size={14} />
                  Choose CSV File
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="w-full px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PROMOTER MANAGE COMMISSION DRAWER ── */}
      <PromoterManageCommissionDrawer
        isOpen={manageCommissionState.isOpen}
        user={manageCommissionState.user}
        initialTab={manageCommissionState.initialTab}
        onClose={() => setManageCommissionState((prev) => ({ ...prev, isOpen: false, user: null }))}
      />
    </div>
  );
};

export default Users;
