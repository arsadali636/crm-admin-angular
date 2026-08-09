import React, { useState } from "react";
import { FiCode, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from "react-icons/fi";

interface JsonDebugViewerProps {
  data: any;
}

export const JsonDebugViewer: React.FC<JsonDebugViewerProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md text-slate-200 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3.5 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5 font-mono text-xs font-bold text-emerald-400">
          <FiCode size={16} />
          <span>Developer Raw API Response Inspector</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 font-sans px-2 py-0.5 rounded border border-slate-700">
            {isOpen ? "Expanded" : "Collapsed"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <FiCheck size={12} className="text-emerald-400" /> Copied JSON
                </>
              ) : (
                <>
                  <FiCopy size={12} /> Copy JSON
                </>
              )}
            </button>
          )}
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 max-h-96 overflow-y-auto font-mono text-[11px] text-emerald-300 leading-relaxed scrollbar-thin">
          <pre>{jsonString}</pre>
        </div>
      )}
    </div>
  );
};

export default JsonDebugViewer;
