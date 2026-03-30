'use client';

import React from 'react';
import { 
  Utensils, 
  Package, 
  BarChart3, 
  Settings, 
  DollarSign,
  Calculator
} from 'lucide-react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-600' : 'text-gray-400'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-orange-50' : ''}`}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
          size: 20, 
          strokeWidth: active ? 2.5 : 2 
        })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] max-w-md mx-auto">
      <NavButton 
        active={activeTab === 'cozinha'} 
        onClick={() => setActiveTab('cozinha')}
        icon={<Utensils />} 
        label="Cozinha" 
      />
      <NavButton 
        active={activeTab === 'gestao'} 
        onClick={() => setActiveTab('gestao')}
        icon={<Package />} 
        label="Gestão" 
      />
      <NavButton 
        active={activeTab === 'dashboard'} 
        onClick={() => setActiveTab('dashboard')}
        icon={<BarChart3 />} 
        label="Painel" 
      />
      <NavButton 
        active={activeTab === 'custos'} 
        onClick={() => setActiveTab('custos')}
        icon={<DollarSign />} 
        label="Custos" 
      />
      <NavButton 
        active={activeTab === 'simulador'} 
        onClick={() => setActiveTab('simulador')}
        icon={<Calculator />} 
        label="Simular" 
      />
      <NavButton 
        active={activeTab === 'config'} 
        onClick={() => setActiveTab('config')}
        icon={<Settings />} 
        label="Config" 
      />
    </nav>
  );
}
