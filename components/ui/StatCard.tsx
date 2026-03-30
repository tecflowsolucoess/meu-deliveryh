import React from 'react';

export function StatCard({ title, value, subValue, icon, color }: { title: string, value: string, subValue?: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>
          {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tight">{value}</span>
        {subValue && <span className="text-[10px] font-bold text-gray-400">{subValue}</span>}
      </div>
    </div>
  );
}
