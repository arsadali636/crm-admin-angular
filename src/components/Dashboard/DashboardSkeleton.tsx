import React from "react";

export const KpiSkeleton: React.FC = () => (
  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm animate-pulse flex flex-col justify-between h-[120px]">
    <div className="flex justify-between items-start">
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="h-7 bg-slate-200 rounded w-3/4 my-2"></div>
    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
  </div>
);

export const ActionSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm animate-pulse flex items-center justify-between">
    <div className="space-y-2 flex-1 pr-4">
      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
      <div className="h-3.5 bg-slate-100 rounded w-2/3"></div>
    </div>
    <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 animate-pulse space-y-4">
    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
          <div className="flex items-center space-x-3 w-1/2">
            <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm animate-pulse space-y-4">
    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
    <div className="h-20 bg-slate-100 rounded"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 rounded w-full"></div>
      <div className="h-3 bg-slate-100 rounded w-5/6"></div>
    </div>
  </div>
);
