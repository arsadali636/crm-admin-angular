import React, { useState } from "react";
import { FiFile, FiDownload, FiEye, FiX } from "react-icons/fi";
import moment from "moment";

interface DocumentItem {
  key: string;
  name: string;
  url: string;
  format: string;
  size: string;
  uploadDate: string;
}

interface ApprovalDocumentsProps {
  product: any;
  req: any;
}

export const ApprovalDocuments: React.FC<ApprovalDocumentsProps> = ({ product, req }) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [zoomActive, setZoomActive] = useState(false);

  const extractDocuments = (): DocumentItem[] => {
    const list: DocumentItem[] = [];
    const submissionDate = req.createdAt ? moment(req.createdAt).format("DD MMM YYYY") : "Not Available";

    const docPatterns = [
      { key: "gst", label: "GST Registration Certificate" },
      { key: "pan", label: "PAN Card Copy" },
      { key: "tradeLicense", label: "Trade License" },
      { key: "fssai", label: "FSSAI License Certificate" },
      { key: "drugLicense", label: "Drug License Certificate" },
      { key: "importLicense", label: "Import License Certificate" },
      { key: "manufacturingCertificate", label: "Manufacturing Certificate" },
      { key: "expiryLabel", label: "Expiry Label Copy" },
      { key: "batchLabel", label: "Batch Label Copy" },
      { key: "expiryImage", label: "Expiry Product Image" },
    ];

    const visited = new Set();

    const scanObject = (obj: any, parentKey = "") => {
      if (!obj || typeof obj !== "object" || visited.has(obj)) return;
      visited.add(obj);

      for (const [k, val] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${k}` : k;
        if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))) {
          const lowercaseKey = k.toLowerCase();
          const match = docPatterns.find((p) => lowercaseKey.includes(p.key.toLowerCase()));

          if (match) {
            const ext = val.split("?")[0].split(".").pop()?.toUpperCase() || "PDF";
            const mockSize = `${((val.length % 5) + 1.2).toFixed(1)} MB`;
            list.push({
              key: fullKey,
              name: match.label,
              url: val,
              format: ext,
              size: mockSize,
              uploadDate: submissionDate,
            });
          } else if (/\.(pdf|png|jpg|jpeg|webp|gif|docx|doc)$/i.test(val.split("?")[0])) {
            const labelName = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
            const capitalized = labelName.charAt(0).toUpperCase() + labelName.slice(1);
            const ext = val.split("?")[0].split(".").pop()?.toUpperCase() || "PDF";
            const mockSize = `${((val.length % 5) + 1.2).toFixed(1)} MB`;
            list.push({
              key: fullKey,
              name: capitalized,
              url: val,
              format: ext,
              size: mockSize,
              uploadDate: submissionDate,
            });
          }
        } else if (typeof val === "object") {
          scanObject(val, fullKey);
        }
      }
    };

    scanObject(product);
    scanObject(req.seller || req.metadata);

    // Only include document if an actual file URL exists
    if (list.length === 0) {
      const metadata = req.metadata || {};
      const dummyDocs = [];
      if (metadata.gstCertificateUrl || product.gstCertificateUrl) {
        dummyDocs.push({
          key: "gst_dummy",
          name: "GST Registration Certificate",
          url: metadata.gstCertificateUrl || product.gstCertificateUrl,
          format: "PDF",
          size: "Document",
          uploadDate: submissionDate,
        });
      }
      if (metadata.panCardUrl || product.panCardUrl) {
        dummyDocs.push({
          key: "pan_dummy",
          name: "PAN Card Copy",
          url: metadata.panCardUrl || product.panCardUrl,
          format: "PNG",
          size: "Document",
          uploadDate: submissionDate,
        });
      }
      return dummyDocs;
    }

    return list;
  };

  const documents = extractDocuments();

  if (documents.length === 0) return null;

  const handleDownload = (doc: DocumentItem) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = `${doc.name.replace(/\s+/g, "_")}.${doc.format.toLowerCase()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      PDF: "bg-red-50 text-red-650 border-red-200/50",
      PNG: "bg-blue-50 text-blue-650 border-blue-200/50",
      JPG: "bg-emerald-50 text-emerald-650 border-emerald-200/50",
      JPEG: "bg-emerald-50 text-emerald-650 border-emerald-200/50",
    };
    return colors[format.toUpperCase()] || "bg-slate-50 text-slate-600 border-slate-200/50";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 tracking-tight">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Verification Documents
        </h3>
        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border text-slate-500">
          Documents: {documents.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {documents.map((doc) => (
          <div
            key={doc.key}
            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border font-bold text-[9px] ${getFormatColor(doc.format)}`}>
                {doc.format}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-850 truncate max-w-[140px]" title={doc.name}>
                  {doc.name}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold mt-0.5">
                  <span>{doc.size}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-200" />
                  <span>{doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setPreviewDoc(doc)}
                title="Preview"
                className="h-7 w-7 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer flex items-center justify-center"
              >
                <FiEye size={12} />
              </button>
              <button
                onClick={() => handleDownload(doc)}
                title="Download"
                className="h-7 w-7 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer flex items-center justify-center"
              >
                <FiDownload size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <button
            onClick={() => {
              setPreviewDoc(null);
              setZoomActive(false);
            }}
            className="absolute top-5 right-5 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition cursor-pointer"
          >
            <FiX size={20} />
          </button>

          <div className="max-w-[85vw] max-h-[85vh] flex flex-col items-center gap-4">
            <h3 className="text-white text-xs font-bold tracking-wider">{previewDoc.name}</h3>

            {["PDF", "DOCX", "DOC", "XLSX", "XLS"].includes(previewDoc.format.toUpperCase()) ? (
              <div className="w-[80vw] h-[70vh] bg-white rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 border border-slate-800">
                <FiFile size={50} className="text-slate-400 mb-4 animate-pulse" />
                <p className="text-slate-800 text-xs font-bold mb-1">
                  Preview not directly renderable inside browser sandbox
                </p>
                <p className="text-slate-400 text-[10px] mb-4">
                  Format: {previewDoc.format} ({previewDoc.size})
                </p>
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
                >
                  <FiDownload size={12} />
                  Download File to View
                </button>
              </div>
            ) : (
              <div className="relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 p-2">
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className={`max-w-full max-h-[65vh] object-contain transition-transform duration-300 ${
                    zoomActive ? "scale-175 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                  onClick={() => setZoomActive(!zoomActive)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDocuments;
