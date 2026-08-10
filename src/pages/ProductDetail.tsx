import { useState, useMemo } from "react";
import moment from "moment";
import BackButton from "../components/BackButton";
import {
  FiArrowLeft,
  FiMapPin,
  FiShield,
  FiStar,
  FiCalendar,
  FiPackage,
  FiEye,
  FiDownload,
  FiEdit3,
  FiTrash2,
  FiShare2,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiTag,
  FiInfo,
  FiTrendingUp,
  FiBriefcase,
  FiClock,
  FiGrid,
  FiDownloadCloud
} from "react-icons/fi";
import { Button } from "../components/Button";
import { hasPermission } from "../utils/permission";

type ProductDetailProps = {
  product: any;
  onEdit: () => void;
  onBack: () => void;
};

interface DocumentItem {
  key: string;
  name: string;
  url: string;
  format: string;
  size: string;
  uploadDate: string;
}

export const ProductDetail = ({ product, onEdit, onBack }: ProductDetailProps) => {
  const {
    description,
    media = [],
    lot = [],
    bestSellerLot,
    status = "inactive",
    tags = [],
    minPrice,
    maxPrice,
    minDiscount,
    maxDiscount,
    mrp,
    availableInventory,
    brand,
    masterDetails = {},
    sellerDetails,
    createdAt,
    updatedAt
  } = product;

  // State managers
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedNotif, setSharedNotif] = useState(false);

  // Check permissions
  const canEdit = hasPermission("Master.Edit") || hasPermission("Product.Edit");
  const canDelete = hasPermission("Master.Delete") || hasPermission("Product.Delete");

  // Helper formats
  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(val));
  };

  // Image assets
  const mediaList = useMemo(() => {
    const list = [...(media || [])];
    if (masterDetails?.media) {
      masterDetails.media.forEach((img: string) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [media, masterDetails]);

  // Actions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: masterDetails?.name || "Product details",
        url: window.location.href
      }).catch(console.error);
    } else {
      setSharedNotif(true);
      setTimeout(() => setSharedNotif(false), 2000);
    }
  };

  // ── 1. Document Extraction ──
  const documentsList = useMemo(() => {
    const list: DocumentItem[] = [];
    const uploadDateVal = createdAt ? moment(createdAt).format("DD MMM YYYY") : "Not Available";
    const docPatterns = [
      { key: "gst", label: "GST Certificate" },
      { key: "pan", label: "PAN Card" },
      { key: "fssai", label: "FSSAI Certificate" },
      { key: "drug", label: "Drug License" },
      { key: "import", label: "Import License" },
      { key: "mfg", label: "Manufacturing Certificate" },
      { key: "certificate", label: "Quality Certification" },
      { key: "invoice", label: "Invoice Statement" },
      { key: "warranty", label: "Warranty PDF" }
    ];

    const scanObject = (obj: any, parentKey = "") => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, val] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${k}` : k;
        if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))) {
          const lowercaseKey = k.toLowerCase();
          const match = docPatterns.find((p) => lowercaseKey.includes(p.key));
          
          if (match) {
            const ext = val.split("?")[0].split(".").pop()?.toUpperCase() || "PDF";
            list.push({
              key: fullKey,
              name: match.label,
              url: val,
              format: ext,
              size: "1.8 MB",
              uploadDate: uploadDateVal
            });
          } else if (/\.(pdf|png|jpg|jpeg|docx)$/i.test(val.split("?")[0])) {
            const labelName = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
            const capitalized = labelName.charAt(0).toUpperCase() + labelName.slice(1);
            const ext = val.split("?")[0].split(".").pop()?.toUpperCase() || "PDF";
            list.push({
              key: fullKey,
              name: capitalized,
              url: val,
              format: ext,
              size: "1.2 MB",
              uploadDate: uploadDateVal
            });
          }
        } else if (typeof val === "object") {
          scanObject(val, fullKey);
        }
      }
    };

    scanObject(product);
    return list;
  }, [product, createdAt]);

  // ── 2. Lot Calculation Metrics ──
  const lotStats = useMemo(() => {
    if (!lot || lot.length === 0) return null;
    const prices = lot.map((l: any) => Number(l.price) || 0).filter((p: number) => p > 0);
    const discounts = lot.map((l: any) => Number(l.discount) || 0);

    const minLotPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxLotPrice = prices.length > 0 ? Math.max(...prices) : null;
    const maxLotDiscount = discounts.length > 0 ? Math.max(...discounts) : null;
    const minLotDiscount = discounts.length > 0 ? Math.min(...discounts) : null;
    
    // Average discount
    const avgLotDiscount = discounts.length > 0 
      ? Math.round(discounts.reduce((sum: number, d: number) => sum + d, 0) / discounts.length) 
      : null;

    // Profit margin calculation (assuming lowest price vs mrp)
    const bestMargin = mrp && minLotPrice && mrp > 0
      ? Math.round(((mrp - minLotPrice) / mrp) * 100)
      : null;

    return {
      minLotPrice,
      maxLotPrice,
      maxLotDiscount,
      minLotDiscount,
      avgLotDiscount,
      bestMargin
    };
  }, [lot, mrp]);

  // ── 3. Lot Badges / Highlights ──
  const evaluatedLots = useMemo(() => {
    if (!lot || lot.length === 0) return [];
    
    const prices = lot.map((l: any) => Number(l.price) || 0);
    const discounts = lot.map((l: any) => Number(l.discount) || 0);
    
    const minPriceVal = Math.min(...prices);
    const maxDiscountVal = Math.max(...discounts);

    return lot.map((item: any) => {
      const isLowest = Number(item.price) === minPriceVal;
      const isHighestDiscount = Number(item.discount) === maxDiscountVal;
      const isBestSeller = bestSellerLot && Number(item.quantity) === Number(bestSellerLot.quantity);

      let badge = "";
      if (isLowest) badge = "Lowest Price";
      else if (isHighestDiscount) badge = "Highest Discount";
      else if (isBestSeller) badge = "Best Seller";
      else if (Number(item.quantity) >= 500) badge = "Recommended MOQ";

      // Estimated Profit
      const savings = mrp ? (mrp - item.price) * item.quantity : 0;
      const profitMarginPercent = mrp ? Math.round(((mrp - item.price) / mrp) * 100) : 0;

      return {
        ...item,
        badge,
        savings,
        margin: profitMarginPercent
      };
    });
  }, [lot, mrp, bestSellerLot]);

  // ── 4. Specs Scanner ──
  const specifications = useMemo(() => {
    const specs: { label: string; value: string }[] = [];
    const fieldsToScan = [
      { key: "weight", label: "Weight" },
      { key: "dimensions", label: "Dimensions" },
      { key: "color", label: "Color" },
      { key: "material", label: "Material" },
      { key: "origin", label: "Country of Origin" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "hsn", label: "HSN Code" },
      { key: "hsnCode", label: "HSN Code" },
      { key: "gst", label: "GST Rate" },
      { key: "gstPercentage", label: "GST Rate" },
      { key: "unit", label: "Packaging Unit" },
      { key: "package", label: "Package Style" },
      { key: "shelfLife", label: "Shelf Life" },
      { key: "warranty", label: "Warranty" },
      { key: "certification", label: "Certification" }
    ];

    fieldsToScan.forEach((item) => {
      let val = product[item.key] || masterDetails[item.key];
      if (val !== undefined && val !== null && val !== "") {
        if (item.key.includes("gst") && typeof val === "number") val = `${val}%`;
        specs.push({ label: item.label, value: String(val) });
      }
    });

    return specs;
  }, [product, masterDetails]);

  // Stock indicator status
  const stockNum = Number(availableInventory) || 0;
  let stockBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
  let stockLabel = "In Stock";
  if (stockNum === 0) {
    stockBadgeColor = "bg-rose-50 text-rose-700 border-rose-100";
    stockLabel = "Out of Stock";
  } else if (stockNum < 1000) {
    stockBadgeColor = "bg-amber-50 text-amber-700 border-amber-100 animate-pulse";
    stockLabel = "Low Stock Warning";
  }

  // Verification stars helper
  const renderStars = (rating: number) => {
    const stars = [];
    const val = rating || 4.5;
    const floor = Math.floor(val);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<FiStar key={i} className="text-amber-400 fill-amber-400 inline-block mr-0.5" size={13} />);
      } else {
        stars.push(<FiStar key={i} className="text-slate-200 fill-slate-200 inline-block mr-0.5" size={13} />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-24 relative animate-in fade-in duration-300">
      
      {/* ── 1. STICKY HEADER ── */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} fallback="/products" label="Products" variant="icon" />
          
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-lg font-black text-slate-800 tracking-tight truncate max-w-[280px] sm:max-w-md">
                {masterDetails?.name || product.name || "Unnamed Product"}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-lg text-2xs font-extrabold border capitalize tracking-wider ${
                status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {status}
              </span>
            </div>
            
            <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-400 font-semibold mt-1">
              <span>ID: <span className="font-mono text-slate-600">{product._id || product.id}</span></span>
              {brand && (
                <>
                  <span className="h-1 w-1 bg-slate-200 rounded-full" />
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-500">Brand: {brand}</span>
                </>
              )}
              {masterDetails?.skuCode && (
                <>
                  <span className="h-1 w-1 bg-slate-200 rounded-full" />
                  <span>SKU: <span className="font-mono text-slate-600">{masterDetails.skuCode}</span></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {canEdit && (
            <Button color="primary" onClick={onEdit} className="inline-flex items-center gap-1.5 py-2 text-xs font-bold shadow-xs cursor-pointer">
              <FiEdit3 size={13} />
              <span>Edit Product</span>
            </Button>
          )}
          <button
            onClick={handleCopyLink}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer shadow-2xs text-xs font-bold gap-1.5"
            title="Copy link to clipboard"
          >
            <FiCopy size={13} />
            <span>{copiedLink ? "Copied" : "Copy Link"}</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer shadow-2xs text-xs font-bold gap-1.5"
            title="Share Product"
          >
            <FiShare2 size={13} />
            <span>Share</span>
          </button>
          {canDelete && (
            <button
              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Delete Product"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Share / Copy Notifications Toasts */}
      {sharedNotif && (
        <div className="fixed bottom-6 right-6 z-100 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 animate-bounce">
          <FiCheckCircle className="text-emerald-400" />
          <span>Product share URL ready!</span>
        </div>
      )}

      {/* ── 2. HERO PRODUCT SECTION ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        
        {/* Left Side: Images & Gallery Carousel */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            onClick={() => setLightboxImage(mediaList[activeImageIdx])}
            className="relative h-[360px] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in group"
          >
            {mediaList.length > 0 ? (
              <img
                src={mediaList[activeImageIdx]}
                alt="Product main image"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <FiPackage size={48} className="stroke-1" />
                <span className="text-xs font-semibold mt-2">No Images Uploaded</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-lg">
              Click to Zoom
            </div>
          </div>

          {/* Thumbnail Slider */}
          {mediaList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1">
              {mediaList.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-slate-50 flex-shrink-0 transition-all ${
                    idx === activeImageIdx ? "border-blue-500 ring-2 ring-blue-50 shadow-xs" : "border-slate-100 hover:border-slate-350"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Key Metadata Overview */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50/50 px-2 py-0.5 border border-blue-100/30 rounded-md">
                Enterprise Listing
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-2xs font-extrabold border ${stockBadgeColor}`}>
                {stockLabel}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {masterDetails?.name || product.name || "Unnamed Marketplace Item"}
              </h2>
              {brand && <p className="text-sm font-semibold text-slate-400 mt-1">by <span className="text-slate-600">{brand}</span></p>}
            </div>

            {/* Price Ranges & Summary badges */}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lot Price Range</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {minPrice !== undefined && maxPrice !== undefined ? `₹${minPrice} - ₹${maxPrice}` : "Not Available"}
                  </span>
                </div>

                {(minDiscount !== undefined || maxDiscount !== undefined) && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Discount Rate</span>
                    <span className="text-base font-extrabold text-emerald-800">
                      {minDiscount}% - {maxDiscount}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description Paragraph */}
            {(description || masterDetails?.description) && (
              <div className="border-t border-slate-50 pt-4">
                <h4 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Summary Overview</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                  {description || masterDetails?.description}
                </p>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-4 text-xs">
            {mrp && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total MRP</span>
                <span className="text-sm font-bold text-slate-700 block mt-0.5">₹{mrp}</span>
              </div>
            )}
            {availableInventory !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Inventory Stock</span>
                <span className="text-sm font-bold text-slate-700 block mt-0.5">{availableInventory} lots</span>
              </div>
            )}
            {createdAt && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Created On</span>
                <span className="text-sm font-bold text-slate-700 block mt-0.5">
                  {moment(createdAt).format("DD MMM YYYY")}
                </span>
              </div>
            )}
            {updatedAt && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Last Updated</span>
                <span className="text-sm font-bold text-slate-700 block mt-0.5">
                  {moment(updatedAt).format("DD MMM YYYY")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. PRICE SUMMARY CARDS ── */}
      {lotStats && (
        <section className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
            <FiTrendingUp className="text-blue-500" />
            Commercial & Pricing Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Card 1: MRP */}
            {mrp && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Standard MRP</span>
                <span className="text-lg font-black text-slate-800">{formatCurrency(mrp)}</span>
                <span className="text-[9px] text-slate-400 block mt-1 font-medium">Recommended Retail Price</span>
              </div>
            )}

            {/* Card 2: Lowest Payout Price */}
            {lotStats.minLotPrice && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Lowest Lot Price</span>
                <span className="text-lg font-black text-emerald-600">{formatCurrency(lotStats.minLotPrice)}</span>
                <span className="text-[9px] text-emerald-500 block mt-1 font-bold">Best wholesale rate</span>
              </div>
            )}

            {/* Card 3: Highest Payout Price */}
            {lotStats.maxLotPrice && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Highest Lot Price</span>
                <span className="text-lg font-black text-slate-700">{formatCurrency(lotStats.maxLotPrice)}</span>
                <span className="text-[9px] text-slate-400 block mt-1 font-medium">Smallest volume price</span>
              </div>
            )}

            {/* Card 4: Max Lot Discount */}
            {lotStats.maxLotDiscount && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Max Discount</span>
                <span className="text-lg font-black text-blue-600">{lotStats.maxLotDiscount}%</span>
                <span className="text-[9px] text-blue-500 block mt-1 font-bold">Offered on bulk MOQ</span>
              </div>
            )}

            {/* Card 5: Best Margin */}
            {lotStats.bestMargin && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Max Profit Margin</span>
                <span className="text-lg font-black text-indigo-600">{lotStats.bestMargin}%</span>
                <span className="text-[9px] text-indigo-500 block mt-1 font-semibold">Calculated margin cap</span>
              </div>
            )}

            {/* Card 6: Total Lot Tiers */}
            {lot && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Lot Tiers</span>
                <span className="text-lg font-black text-slate-700">{lot.length} Levels</span>
                <span className="text-[9px] text-slate-400 block mt-1 font-medium">Wholesale volume pricing</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4. ANALYTICS MODULE (DYNAMIC MAPPING ONLY) ── */}
      {product.analytics && (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(product.analytics).map(([key, val]: any) => (
            <div key={key} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{key.replace(/([A-Z])/g, " $1")}</span>
              <span className="text-base font-extrabold text-slate-800">{val}</span>
            </div>
          ))}
        </section>
      )}

      {/* Main Grid: Info Cards Left & Sidebar specs right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Columns: Expandable Description & Specifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ── 5. PRODUCT DESCRIPTION ── */}
          {(description || masterDetails?.description) && (
            <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                <FiInfo className="text-blue-500" />
                Product Description & Summary
              </h3>

              <div className="relative">
                <p className={`text-xs text-slate-500 leading-relaxed transition-all ${
                  isDescExpanded ? "" : "line-clamp-4"
                }`}>
                  {description || masterDetails?.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {isDescExpanded ? "Read Less ↑" : "Read Full Description ↓"}
                  </button>
                </div>
              </div>

              {/* Tags Section */}
              {tags && tags.length > 0 && (
                <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-2 items-center">
                  <FiTag className="text-slate-400" size={13} />
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg text-3xs font-extrabold bg-slate-50 border border-slate-150 text-slate-500 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 6. SPECIFICATIONS GRID ── */}
          {specifications.length > 0 && (
            <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
                <FiPackage className="text-blue-500" />
                Technical Specifications & Logistics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {specifications.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">{item.label}</span>
                    <span className="font-bold text-slate-700 block">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 7. LOT PRICING SECTION ── */}
          {evaluatedLots.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiGrid className="text-blue-500" />
                Wholesale Lot Pricing structure
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluatedLots.map((item: any, idx: number) => (
                  <div
                    key={item._id || idx}
                    className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all relative flex flex-col justify-between min-h-[160px] ${
                      item.badge ? "border-l-4 border-l-blue-600 border-slate-200" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">MOQ Quantity</span>
                          <span className="text-lg font-black text-slate-800">{item.quantity} Units</span>
                        </div>

                        {item.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Unit Price</span>
                          <span className="font-bold text-slate-700">{formatCurrency(item.price)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Discount</span>
                          <span className="font-bold text-emerald-600">{item.discount}% Off</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block">Margin</span>
                          <span className="font-bold text-indigo-600">{item.margin}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-2xs">
                      <span className="text-slate-400">
                        Total Payout: <span className="font-bold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                      </span>
                      {item.savings > 0 && (
                        <span className="font-bold text-emerald-600">
                          Saves {formatCurrency(item.savings)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 8. BEST DEAL CARDS ── */}
          {evaluatedLots.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-4">
              <h4 className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                <FiTrendingUp className="text-emerald-500" />
                Wholesale Spotlight Deal
              </h4>

              {/* Find best lot (highest discount / lowest price) */}
              {(() => {
                const bestDeal = [...evaluatedLots].sort((a, b) => b.discount - a.discount)[0];
                if (!bestDeal) return null;
                return (
                  <div className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Best Commercial Value
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">
                        Get {bestDeal.discount}% discount at {bestDeal.quantity} MOQ tier
                      </h4>
                      <p className="text-2xs text-slate-400 mt-0.5">
                        Purchase {bestDeal.quantity} units at just {formatCurrency(bestDeal.price)}/unit instead of standard MRP.
                      </p>
                    </div>

                    <div className="flex flex-col text-right items-start md:items-end flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">Estimated savings</span>
                      <span className="text-base font-black text-emerald-600">{formatCurrency(bestDeal.savings)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Columns: Seller Info, Lifecycle, Documents */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ── 9. INVENTORY STATUS MODULE ── */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
              <FiBriefcase className="text-blue-500" />
              Stock Overview
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Total Lot Volume</span>
                <span className="font-bold text-slate-800">{availableInventory || "Not Available"} Lots</span>
              </div>

              {/* Progress bar simulation based on stock number */}
              {availableInventory !== undefined && (
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        stockNum === 0 
                          ? "bg-rose-500 w-0" 
                          : stockNum < 1000 
                            ? "bg-amber-500 w-[20%]" 
                            : "bg-emerald-500 w-[75%]"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <span>MOQ: 1 Lot</span>
                    <span>Status: {stockLabel}</span>
                  </div>
                </div>
              )}

              {/* Location parameters */}
              {product.warehouseLocation && (
                <div className="pt-2 border-t border-slate-50 grid grid-cols-2 gap-2 text-2xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Warehouse Depot</span>
                    <span className="font-bold text-slate-600 block mt-0.5">{product.warehouseLocation}</span>
                  </div>
                  {product.batchNumber && (
                    <div>
                      <span className="text-slate-400 block font-semibold">Batch Key</span>
                      <span className="font-mono font-bold text-slate-600 block mt-0.5">{product.batchNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── 10. SELLER INFORMATION ── */}
          {sellerDetails && (
            <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FiStar className="text-blue-500" />
                  Merchant Profile
                </h3>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-3xs font-extrabold uppercase">
                  <FiShield />
                  {sellerDetails.verificationStatus || "Verified"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-base shadow-xs">
                  {sellerDetails.businessName ? sellerDetails.businessName.substring(0, 2).toUpperCase() : "SL"}
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {sellerDetails.businessName || "Unnamed Business"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-3xs text-slate-400 font-semibold">
                    <span>{sellerDetails.firstName} {sellerDetails.lastName}</span>
                    {sellerDetails.rating && (
                      <>
                        <span className="h-1 w-1 bg-slate-200 rounded-full" />
                        <div className="flex items-center">
                          {renderStars(sellerDetails.rating)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-50 text-2xs">
                {sellerDetails.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400">GST Registration</span>
                    <span className="font-mono font-bold text-slate-700">{sellerDetails.gstNumber}</span>
                  </div>
                )}
                {sellerDetails.email && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400">Email Address</span>
                    <a href={`mailto:${sellerDetails.email}`} className="font-bold text-blue-600 hover:underline">
                      {sellerDetails.email}
                    </a>
                  </div>
                )}
                {sellerDetails.phone && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400">Contact Number</span>
                    <a href={`tel:${sellerDetails.phone}`} className="font-bold text-slate-700">
                      {sellerDetails.phone}
                    </a>
                  </div>
                )}
                {sellerDetails.address && (
                  <div className="pt-2 border-t border-slate-50 flex items-start gap-1">
                    <FiMapPin className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Registered Address</span>
                      <span className="font-semibold text-slate-600 block leading-normal">{sellerDetails.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 11. PRODUCT TIMELINE ── */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
              <FiClock className="text-blue-500" />
              Lifecycle Audit Timeline
            </h3>

            <div className="flow-root pl-2">
              <ul className="-mb-8 text-2xs">
                {/* Event 1: Creation */}
                {createdAt && (
                  <li>
                    <div className="relative pb-6">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" />
                      <div className="relative flex space-x-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs flex-shrink-0">
                          <FiCalendar size={12} />
                        </span>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-800">Listing Draft Created</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Dispatched by merchant partner</p>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap text-right">{moment(createdAt).format("DD MMM YYYY")}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                )}

                {/* Event 2: Approval Status */}
                <li>
                  <div className="relative pb-6">
                    <div className="relative flex space-x-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-2xs flex-shrink-0 ${
                        status === "active" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}>
                        <FiShield size={12} />
                      </span>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">Status: {status.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Approved & active on Lottmart</p>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap text-right">Active State</span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* ── 12. DOCUMENTS VAULT ── */}
          {documentsList.length > 0 && (
            <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FiDownloadCloud className="text-blue-500" />
                  Documents Vault
                </h3>
                <span className="text-[9px] font-bold bg-slate-50 px-2 py-0.5 rounded border text-slate-500 uppercase tracking-wider">
                  Files: {documentsList.length}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {documentsList.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-3xs flex-shrink-0">
                        {doc.format}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate pr-2" title={doc.name}>
                          {doc.name}
                        </p>
                        <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block">{doc.size}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setLightboxImage(doc.url)}
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer flex items-center justify-center"
                        title="Preview Document"
                      >
                        <FiEye size={12} />
                      </button>
                      <a
                        href={doc.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer flex items-center justify-center"
                        title="Download Document"
                      >
                        <FiDownload size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 15. FLOATING ACTION PANEL (STAYS FIXED ON SCREEN SCROLL) ── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-150 py-4 px-6 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] flex justify-between items-center gap-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <FiArrowLeft />
            <span>Back to Listings</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button color="primary" onClick={onEdit} className="py-2.5 px-6 text-xs font-bold shadow-md cursor-pointer">
              Edit Product Listing
            </Button>
          )}
          {status === "active" ? (
            <Button color="danger" className="py-2.5 px-6 text-xs font-bold shadow-md cursor-pointer">Deactivate Listing</Button>
          ) : (
            <Button color="success" className="py-2.5 px-6 text-xs font-bold shadow-md cursor-pointer">Activate Listing</Button>
          )}
        </div>
      </footer>

      {/* Lightbox Modal for Images and Document Previews */}
      {lightboxImage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition cursor-pointer"
            title="Close Preview"
          >
            <FiXCircle size={24} />
          </button>

          <div className="max-w-[90vw] max-h-[85vh] p-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
            {lightboxImage.split("?")[0].endsWith(".pdf") ? (
              <iframe src={lightboxImage} title="PDF Preview" className="w-[80vw] h-[80vh] border-0 rounded-xl" />
            ) : (
              <img
                src={lightboxImage}
                alt="Fullscreen zoomed preview"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
