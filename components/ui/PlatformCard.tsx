import React from 'react';
import { Venda } from '@/lib/types';

export function PlatformCard({ name, color, vendas }: { name: string, color: string, vendas: Venda[] }) {
  const faturamento = vendas.reduce((acc, v) => acc + v.valor_venda, 0);
  const lucro = vendas.reduce((acc, v) => acc + v.lucro_real, 0);
  
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs font-black uppercase tracking-widest">{name}</span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Faturamento</span>
          <span className="text-sm font-black">R$ {faturamento.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Lucro</span>
          <span className="text-sm font-black text-green-600">R$ {lucro.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Pedidos</span>
          <span className="text-sm font-black">{vendas.length}</span>
        </div>
      </div>
    </div>
  );
}
