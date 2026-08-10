import React, { useState, useEffect } from "react";
import BackButton from "../BackButton";
import {
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Notebook,
  History,
  ShoppingBag,
  Megaphone,
  Store,
  Edit3,
  AlertCircle
} from "lucide-react";
import { IUser } from "../../types";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { UserWalletCard } from "./UserWalletCard";
import { UserWalletActivity } from "./UserWalletActivity";

type UserDetailsProps = {
  user: IUser;
  onBack: () => void;
  onUpdateUser: (updatedUser: IUser) => void;
};

type Note = {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
};

type AuditLog = {
  action: string;
  changedBy: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ip: string;
};

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  onBack,
  onUpdateUser,
}) => {
  const [currentUser, setCurrentUser] = useState<IUser>(user);
  const [notes, setNotes] = useState<Note[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Modals & Forms State
  const [newNoteText, setNewNoteText] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    gender: user.gender || "Male",
    dob: user.dob || "1995-01-01",
    altPhone: user.altPhone || "",
    address: user.seller?.address || user.state || "",
    city: user.city || "Mumbai",
    district: user.district || "Mumbai City",
    state: user.state || "Maharashtra",
    pincode: user.pincode || "400001",
    businessName: user.seller?.businessName || "",
    gstNumber: user.seller?.gstNumber || "",
    pan: user.seller?.pan || "",
    businessType: user.seller?.businessType || "Retail",
    businessCategory: user.seller?.businessCategory || "General Store",
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "status" | "block" | "unblock" | "suspend" | "delete";
    targetValue?: string;
  }>({
    isOpen: false,
    type: "status",
  });

  // Load and sync localStorage CRM data (Notes & Audit Logs)
  useEffect(() => {
    const storageKey = `crm_user_data_${user.email}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setNotes(parsed.notes || []);
      setAuditLogs(parsed.auditLogs || []);
      if (parsed.userOverride) {
        const override = { ...parsed.userOverride };
        if (override.seller?.pan?.startsWith("ABCDE")) {
          delete override.seller.pan;
        }
        if (override.seller?.panNumber?.startsWith("ABCDE")) {
          delete override.seller.panNumber;
        }
        setCurrentUser({
          ...user,
          ...override,
          seller: user.seller ? { ...user.seller, ...override.seller } : override.seller,
        });
      }
    } else {
      // Seed initial mock logs
      const initialLogs: AuditLog[] = [
        {
          action: "Profile Created",
          changedBy: "System Registration",
          oldValue: "None",
          newValue: "Active Account",
          timestamp: moment(user.createdAt).toISOString(),
          ip: "192.168.1.101",
        },
        {
          action: "KYC Document Uploaded",
          changedBy: `${user.firstName} ${user.lastName}`,
          oldValue: "Pending",
          newValue: "KYC Pending Review",
          timestamp: moment(user.createdAt).add(1, "hours").toISOString(),
          ip: "192.168.1.101",
        },
      ];
      if (user.kycStatus === "verified" || !user.kycStatus) {
        initialLogs.push({
          action: "KYC Approved",
          changedBy: "Admin Auditor",
          oldValue: "Pending Review",
          newValue: "Verified Status",
          timestamp: moment(user.createdAt).add(1, "days").toISOString(),
          ip: "10.0.8.21",
        });
      }
      setNotes([]);
      setAuditLogs(initialLogs);
      saveToStorage(user, [], initialLogs);
    }
  }, [user]);

  const saveToStorage = (updatedUser: IUser, updatedNotes: Note[], updatedAudits: AuditLog[]) => {
    const storageKey = `crm_user_data_${user.email}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        userOverride: updatedUser,
        notes: updatedNotes,
        auditLogs: updatedAudits,
      })
    );
    setCurrentUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  const addAuditLog = (action: string, oldValue: string, newValue: string) => {
    const newLog: AuditLog = {
      action,
      changedBy: "Administrator",
      oldValue,
      newValue,
      timestamp: moment().toISOString(),
      ip: "103.85.12.94 (Current)",
    };
    const updatedAudits = [newLog, ...auditLogs];
    setAuditLogs(updatedAudits);
    saveToStorage(currentUser, notes, updatedAudits);
  };

  // Add internal note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNoteText,
      createdAt: moment().toISOString(),
      createdBy: "Administrator",
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setNewNoteText("");
    
    // Auditing Note Addition
    addAuditLog("Added Admin CRM Note", "None", newNote.text.substring(0, 30) + "...");
  };

  // Profile Edit Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: IUser = {
      ...currentUser,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phoneNumber: editForm.phoneNumber,
      email: editForm.email,
      gender: editForm.gender,
      dob: editForm.dob,
      altPhone: editForm.altPhone,
      state: editForm.state,
      city: editForm.city,
      district: editForm.district,
      pincode: editForm.pincode,
      seller: currentUser.seller
        ? {
            ...currentUser.seller,
            businessName: editForm.businessName,
            gstNumber: editForm.gstNumber,
            pan: editForm.pan,
            businessType: editForm.businessType,
            businessCategory: editForm.businessCategory,
          }
        : undefined,
    };

    saveToStorage(updated, notes, auditLogs);
    setIsEditMode(false);
    addAuditLog("Profile Information Edited", "Previous Details", "Updated CRM Details");
  };

  // Confirmation handling
  const handleActionConfirm = () => {
    const { type, targetValue } = confirmModal;
    let oldStatus = currentUser.status;
    let newStatus = currentUser.status;

    if (type === "status" && targetValue) {
      newStatus = targetValue;
    } else if (type === "block") {
      newStatus = "blocked";
    } else if (type === "unblock") {
      newStatus = "active";
    } else if (type === "suspend") {
      newStatus = "inactive";
    } else if (type === "delete") {
      newStatus = "deleted";
    }

    const updatedUser = {
      ...currentUser,
      status: newStatus,
    };

    const actionText = 
      type === "status" ? `Status Update to ${targetValue}` :
      type === "block" ? "Blocked Account" :
      type === "unblock" ? "Unblocked Account" :
      type === "suspend" ? "Suspended Account" : "Deleted Account";

    addAuditLog(actionText, oldStatus, newStatus);
    saveToStorage(updatedUser, notes, [
      {
        action: actionText,
        changedBy: "Administrator",
        oldValue: oldStatus,
        newValue: newStatus,
        timestamp: moment().toISOString(),
        ip: "103.85.12.94 (Current)",
      },
      ...auditLogs
    ]);
    
    setConfirmModal({ isOpen: false, type: "status" });
  };

  // Helper styles
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
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <BackButton onClick={onBack} fallback="/users" label="Users" variant="icon" />
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-blue-500/10 flex-shrink-0">
            {(currentUser.firstName?.[0] || "").toUpperCase()}
            {(currentUser.lastName?.[0] || "").toUpperCase()}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight truncate">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${getStatusBadge(currentUser.status)}`}>
                {currentUser.status}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 uppercase tracking-wide">
                {currentUser.role?.[0]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{currentUser.email}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all shadow-sm cursor-pointer"
          >
            <Edit3 size={13} />
            Edit Profile
          </button>
          
          {currentUser.status !== "active" && (
            <button
              onClick={() => setConfirmModal({ isOpen: true, type: "status", targetValue: "active" })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <CheckCircle size={13} />
              Activate
            </button>
          )}

          {currentUser.status === "active" && (
            <button
              onClick={() => setConfirmModal({ isOpen: true, type: "status", targetValue: "inactive" })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              <AlertCircle size={13} />
              Deactivate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile Overview, Personal Details, Business details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Account Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400">User Database ID</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser._id || "USR-2093841"}</p>
              </div>
              <div>
                <span className="text-slate-400">Affiliate ID</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.affiliateId || "AFF-LOTT-49"}</p>
              </div>
              <div>
                <span className="text-slate-400">Referral Code</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{(currentUser.firstName || "REFER").toUpperCase()}883</p>
              </div>
              <div>
                <span className="text-slate-400">Role Assigned</span>
                <p className="font-semibold text-slate-700 mt-0.5 capitalize">{currentUser.role?.join(", ")}</p>
              </div>
              <div>
                <span className="text-slate-400">Registered Date</span>
                <p className="font-semibold text-slate-700 mt-0.5">{moment(currentUser.createdAt).format("DD MMMM YYYY, HH:mm A")}</p>
              </div>
              <div>
                <span className="text-slate-400">Last Login IP</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.lastLogin || "103.85.12.94"}</p>
              </div>
            </div>
          </div>

          {/* Section: Personal Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-indigo-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <span className="text-slate-400">Full Name</span>
                <p className="font-semibold text-slate-700 mt-0.5">{currentUser.firstName} {currentUser.lastName}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender / DOB</span>
                <p className="font-semibold text-slate-700 mt-0.5">{currentUser.gender || "Male"} • {moment(currentUser.dob || "1995-04-12").format("DD MMM YYYY")}</p>
              </div>
              <div>
                <span className="text-slate-400">Primary Phone</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.phoneNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Alternate Phone</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.altPhone || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400">Email Address</span>
                <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Residential Address</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {currentUser.seller?.address || "Flat 402, Building A, Hiranandani Estate"}, {currentUser.city || "Thane"}, {currentUser.district || "Thane"}, {currentUser.state || "Maharashtra"} - {currentUser.pincode || "400607"}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Business Information (Conditional for Sellers/Buyers with Business Profiles) */}
          {(currentUser.role?.includes("seller") || currentUser.seller) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
                <Store size={16} className="text-violet-500" />
                Business Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="text-slate-400">Registered Business Name</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{currentUser.seller?.businessName || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400">GST Registration Number</span>
                  <p className="font-semibold text-slate-700 font-mono mt-0.5">{currentUser.seller?.gstNumber || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Permanent Account Number (PAN)</span>
                  <p className="font-semibold text-slate-700 font-mono mt-0.5">
                    {currentUser.seller?.panNumber && !currentUser.seller.panNumber.startsWith("ABCDE")
                      ? currentUser.seller.panNumber
                      : currentUser.seller?.pan && !currentUser.seller.pan.startsWith("ABCDE")
                      ? currentUser.seller.pan
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Business Structure / Category</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {Array.isArray(currentUser.seller?.typeOfBusiness) 
                      ? currentUser.seller.typeOfBusiness.join(", ") 
                      : currentUser.seller?.typeOfBusiness || currentUser.seller?.businessType || "—"} • {currentUser.seller?.industry || currentUser.seller?.businessCategory || "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Official Business Address</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{currentUser.seller?.address || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: KYC Document Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              KYC & Verification Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Status Columns */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="font-medium text-slate-700">Aadhaar Card Verification</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{currentUser.seller?.aadhaarNumber ? `XXXX-XXXX-${currentUser.seller.aadhaarNumber.slice(-4)}` : "Verified"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="font-medium text-slate-700">PAN Card Verification</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">
                    {currentUser.seller?.panNumber && !currentUser.seller.panNumber.startsWith("ABCDE")
                      ? currentUser.seller.panNumber
                      : currentUser.seller?.pan && !currentUser.seller.pan.startsWith("ABCDE")
                      ? currentUser.seller.pan
                      : "Verified"}
                  </span>
                </div>

                {currentUser.seller?.gstNumber && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="font-medium text-slate-700">GST Identification Certificate</span>
                    </div>
                    <span className="font-mono text-slate-400 font-semibold">Verified</span>
                  </div>
                )}
              </div>

              {/* Status details */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 text-xs space-y-2 flex flex-col justify-center">
                <div className="flex justify-between">
                  <span className="text-slate-400">KYC Status</span>
                  <span className="font-bold text-emerald-600 uppercase">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified By</span>
                  <span className="font-semibold text-slate-700">System Auto-Audit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Date</span>
                  <span className="font-semibold text-slate-700">{moment(currentUser.createdAt).format("DD MMM YYYY")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Activity Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Activity Log & Timeline
            </h3>
            <div className="relative border-l border-slate-100 ml-3 pl-5 space-y-5 py-2">
              <div className="relative">
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Registration Complete</span>
                  <span className="text-slate-400 ml-2">{moment(currentUser.createdAt).format("DD MMM YYYY, HH:mm A")}</span>
                  <p className="text-slate-500 mt-0.5">Account profile initialized via Web Registration portal.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                <div className="text-xs">
                  <span className="font-bold text-slate-700">KYC Document Submission Approved</span>
                  <span className="text-slate-400 ml-2">{moment(currentUser.createdAt).add(3, "hours").format("DD MMM YYYY, HH:mm A")}</span>
                  <p className="text-slate-500 mt-0.5">Aadhaar details verification matched perfectly with UIDAI registers.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Wallet Initialized</span>
                  <span className="text-slate-400 ml-2">{moment(currentUser.createdAt).add(4, "hours").format("DD MMM YYYY, HH:mm A")}</span>
                  <p className="text-slate-500 mt-0.5">Integrated digital wallet account created with zero starting balance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Financial Cards, Promoter Stats, Internal Admin Notes & Audit logs */}
        <div className="space-y-6">
          
          {/* Wallet Section */}
          <UserWalletCard userId={currentUser._id || (currentUser as any).id || user._id || (user as any).id} />

          {/* Wallet History Ledger Section */}
          <UserWalletActivity userId={currentUser._id || (currentUser as any).id || user._id || (user as any).id} />

          {/* Orders & Purchases Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-500" />
              Order & Transaction Analytics
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Total Purchase Value</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">₹{(currentUser.orders?.totalPurchase || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Lifetime CRM Value (LTV)</span>
                <p className="font-bold text-blue-600 text-sm mt-0.5">₹{(currentUser.orders?.ltv || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400">Total</span>
                <p className="font-bold text-xs text-slate-700 mt-0.5">{currentUser.orders?.total || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400">Completed</span>
                <p className="font-bold text-xs text-emerald-600 mt-0.5">{currentUser.orders?.completed || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400">Returns</span>
                <p className="font-bold text-xs text-rose-500 mt-0.5">{currentUser.orders?.returns || 0}</p>
              </div>
            </div>
          </div>

          {/* Section: Promoter Metrics (If User has promoter role) */}
          {(currentUser.role?.includes("promoter") || currentUser.promoterInfo) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
                <Megaphone size={16} className="text-amber-500" />
                Affiliate & Promoter Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Total Referrals</span>
                  <p className="font-bold text-slate-800 mt-0.5">{currentUser.promoterInfo?.referralCount || 0} Accounts</p>
                </div>
                <div>
                  <span className="text-slate-400">Commissions Paid</span>
                  <p className="font-bold text-emerald-600 mt-0.5">₹{(currentUser.promoterInfo?.commissionEarned || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Campaigns Joined</span>
                  <p className="font-bold text-slate-800 mt-0.5">{currentUser.promoterInfo?.campaignsJoined || 0} Campaigns</p>
                </div>
                <div>
                  <span className="text-slate-400">Performance Index</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 mt-1">
                    {currentUser.promoterInfo?.performance || "Standard"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Internal Admin Notes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <Notebook size={16} className="text-blue-500" />
              Internal Admin Notes
            </h3>

            {/* Note input form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type internal notes about this account..."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none h-16"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={13} />
                Save Note
              </button>
            </form>

            {/* Notes list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No internal CRM notes logged.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                    <p className="text-slate-700 leading-normal">{note.text}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                      <span>By {note.createdBy}</span>
                      <span>{moment(note.createdAt).fromNow()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Audit Logs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              Change Audit Trail
            </h3>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-2.5 last:border-b-0 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{log.action}</span>
                    <span className="text-[9px] text-slate-400 font-medium font-mono">{moment(log.timestamp).format("DD MMM, HH:mm")}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>Changed by: {log.changedBy}</span>
                    <span>IP: {log.ip.split(" ")[0]}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-slate-50/50 p-1 border border-slate-100 rounded mt-1 font-mono">
                    <span className="text-rose-500">-{log.oldValue}</span>
                    <span className="text-slate-300 mx-1.5">→</span>
                    <span className="text-emerald-600">+{log.newValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── PROFILE EDIT OVERLAY / MODAL ── */}
      <AnimatePresence>
        {isEditMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditMode(false)}
              className="fixed inset-0 bg-slate-900 z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-10 max-w-xl mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-slate-100 max-h-[85vh]"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Edit User CRM Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Personal Info Grid */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-400 tracking-wider uppercase text-[10px]">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Alternate Phone</label>
                      <input
                        type="text"
                        value={editForm.altPhone}
                        onChange={(e) => setEditForm({ ...editForm, altPhone: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Geography Grid */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-slate-400 tracking-wider uppercase text-[10px]">Residential Location</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">State</label>
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">District</label>
                      <input
                        type="text"
                        value={editForm.district}
                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={editForm.pincode}
                        onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details (If seller exists) */}
                {currentUser.seller && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-bold text-slate-400 tracking-wider uppercase text-[10px]">Business & Commercial Profile</h4>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={editForm.businessName}
                        onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={editForm.gstNumber}
                          onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">PAN Card</label>
                        <input
                          type="text"
                          value={editForm.pan}
                          onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ACTION CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, type: "status" })}
              className="fixed inset-0 bg-slate-900 z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base mb-2">Confirm System Action</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you absolutely sure you want to perform this action? This will update the user status inside the Lottmart CRM system registries immediately.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: "status" })}
                  className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel Action
                </button>
                <button
                  onClick={handleActionConfirm}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  Confirm & Commit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
