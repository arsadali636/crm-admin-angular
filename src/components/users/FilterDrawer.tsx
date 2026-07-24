import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";

export type FilterState = {
  role: string;
  status: string;
  verification: string;
  state: string;
  city: string;
  district: string;
  pincode: string;
  businessCategory: string;
  registerDateStart: string;
  registerDateEnd: string;
  walletMin: string;
  walletMax: string;
  orderCountMin: string;
  orderCountMax: string;
  ltvMin: string;
  ltvMax: string;
  referralCountMin: string;
  referralCountMax: string;
  affiliateId: string;
  gstNumber: string;
  hasBusiness: boolean | null;
  hasWallet: boolean | null;
};

export const initialFilters: FilterState = {
  role: "",
  status: "",
  verification: "",
  state: "",
  city: "",
  district: "",
  pincode: "",
  businessCategory: "",
  registerDateStart: "",
  registerDateEnd: "",
  walletMin: "",
  walletMax: "",
  orderCountMin: "",
  orderCountMax: "",
  ltvMin: "",
  ltvMax: "",
  referralCountMin: "",
  referralCountMax: "",
  affiliateId: "",
  gstNumber: "",
  hasBusiness: null,
  hasWallet: null,
};

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
};

// Predetermined state to cities data seed matching mock locations
const STATE_CITIES_CATALOG: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Thane", "Pune", "Nagpur", "Nashik"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "Central Delhi"],
  "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur", "Agra", "Varanasi"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
};

const STATES_LIST = Object.keys(STATE_CITIES_CATALOG);

/* ═══════════════════════════════════════════════════
   SUBCOMPONENT: SEARCHABLE AUTOCOMPLETE DROPDOWN
   ═══════════════════════════════════════════════════ */
interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  isLoading?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Autocomplete on blur: check if search query matches an option
        const match = options.find(
          (opt) => opt.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (match) {
          onChange(match);
        } else {
          setSearchQuery(value);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [value, searchQuery, options]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  return (
    <div ref={dropdownRef} className="relative flex flex-col space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? "Select State first..." : placeholder}
          value={isOpen ? searchQuery : value}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchQuery(value);
            }
          }}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchQuery(value);
            }
          }}
          disabled={disabled}
          className={`w-full text-xs border border-slate-200 rounded-xl p-2.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 ${
            disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"
          }`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 pointer-events-none">
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronDown size={14} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-20 left-0 right-0 top-full mt-1 max-h-36 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 space-y-0.5"
          >
            {filteredOptions.length === 0 ? (
              <p className="p-2 text-slate-400 text-center text-xs">No matches found</p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input focus loss
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ${
                    value === opt ? "bg-blue-50/50 text-blue-600" : "text-slate-600"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT: STREAMLINED FILTER DRAWER
   ═══════════════════════════════════════════════════ */
export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  // Sync state when open
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  // Handle simulated loader and dependencies when State changes
  const handleStateChange = (selectedState: string) => {
    setIsCitiesLoading(true);
    setLocalFilters((prev) => ({
      ...prev,
      state: selectedState,
      city: "", // Clear selected city immediately on state change
    }));

    setTimeout(() => {
      setIsCitiesLoading(false);
    }, 400); // 400ms mock delay
  };

  const handleChange = (key: keyof FilterState, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(initialFilters);
    onResetFilters();
  };

  const availableCities = useMemo(() => {
    if (!localFilters.state) return [];
    return STATE_CITIES_CATALOG[localFilters.state] || [];
  }, [localFilters.state]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 z-50 cursor-pointer backdrop-blur-[1px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col h-screen max-h-screen border-l border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 text-base">Filter Users</h3>
                <p className="text-[11px] text-slate-400 font-medium">Quickly find users using essential filters.</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Filters Form */}
            <form onSubmit={handleApply} className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* PRIMARY ESSENTIAL FILTERS SECTION */}
              <div className="space-y-4">
                {/* 2-Column desktop grid for primary controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role Dropdown */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Role</label>
                    <select
                      value={localFilters.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 cursor-pointer transition-all"
                    >
                      <option value="">All Roles</option>
                      <option value="user">Buyer / User</option>
                      <option value="seller">Seller</option>
                      <option value="promoter">Promoter</option>
                      <option value="connector">Connector</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</label>
                    <select
                      value={localFilters.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 cursor-pointer transition-all"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blocked">Blocked</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Searchable State Dropdown */}
                  <SearchableDropdown
                    label="State"
                    placeholder="e.g. Maharashtra"
                    value={localFilters.state}
                    onChange={handleStateChange}
                    options={STATES_LIST}
                  />

                  {/* Searchable City Dropdown */}
                  <SearchableDropdown
                    label="City"
                    placeholder="e.g. Mumbai"
                    value={localFilters.city}
                    onChange={(val) => handleChange("city", val)}
                    options={availableCities}
                    disabled={!localFilters.state}
                    isLoading={isCitiesLoading}
                  />
                </div>
              </div>



            </form>

            {/* Sticky Bottom Actions Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0 relative z-10">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow hover:shadow-md cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                Apply Filters
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
