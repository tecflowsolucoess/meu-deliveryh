'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Db, Venda, CustoOperacional } from '@/lib/types';

interface DashboardViewProps {
  db: Db;
}

export function DashboardView({ db }: DashboardViewProps) {
  const vendas = db.vendas || [];
  const custos = db.custos || [];
  const hoje = new Date().toISOString().split('T')[0];
  
  // Agrupar lucro por dia (últimos 7 dias)
  const dataGrafico = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const vDia = vendas.filter((v: Venda) => v.data.startsWith(dateStr));
    const lucroBruto = vDia.reduce((acc: number, v: Venda) => acc + v.lucro_real, 0);
    
    // Custo diluído para este dia específico
    const custoDiario = custos.reduce((acc: number, c: CustoOperacional) => {
      const dataInicio = new Date((c.data_inicio || c.data.split('T')[0]) + 'T00:00:00');
      const dataFim = new Date(dataInicio);
      dataFim.setDate(dataFim.getDate() + (c.dias - 1));
      
      const checkDate = new Date(dateStr + 'T12:00:00');
      
      if (checkDate >= dataInicio && checkDate <= dataFim) {
        return acc + (c.valor_total / (c.dias || 1));
      }
      return acc;
    }, 0);
    
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      lucro: lucroBruto - custoDiario,
      faturamento: vDia.reduce((acc: number, v: Venda) => acc + v.valor_venda, 0)
    };
  }).reverse();

  // Stats de Hoje para o Dashboard
  const vendasHoje = vendas.filter((v: Venda) => v.data.startsWith(hoje));
  const faturamentoHoje = vendasHoje.reduce((acc: number, v: Venda) => acc + v.valor_venda, 0);
  const lucroBrutoHoje = vendasHoje.reduce((acc: number, v: Venda) => acc + v.lucro_real, 0);
  const custoDiarioHoje = custos.reduce((acc: number, c: CustoOperacional) => {
    const dataInicio = new Date((c.data_inicio || c.data.split('T')[0]) + 'T00:00:00');
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + (c.dias - 1));
    
    const hojeDate = new Date(hoje + 'T12:00:00');
    if (hojeDate >= dataInicio && hojeDate <= dataFim) {
      return acc + (c.valor_total / (c.dias || 1));
    }
    return acc;
  }, 0);

  // Detalhamento de Produtos
  const produtosVendidos = vendasHoje.reduce((acc: Record<string, { qtd: number, valor: number }>, v: Venda) => {
    const p = db.produtos.find(prod => prod.id === v.produto_id);
    const nome = p?.nome || 'Desconhecido';
    if (!acc[nome]) acc[nome] = { qtd: 0, valor: 0 };
    acc[nome].qtd += v.quantidade;
    acc[nome].valor += v.valor_venda;
    return acc;
  }, {});

  // Detalhamento de Custos
  const custosDetalhados = custos.filter(c => {
    const dataInicio = new Date((c.data_inicio || c.data.split('T')[0]) + 'T00:00:00');
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + (c.dias - 1));
    const hojeDate = new Date(hoje + 'T12:00:00');
    return hojeDate >= dataInicio && hojeDate <= dataFim;
  });

  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-black tracking-tight">Análise Financeira</h2>

      <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Resumo Hoje</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400">💰 Faturamento</span>
            <span className="text-lg font-black">R$ {faturamentoHoje.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400">📈 Lucro Bruto</span>
            <span className="text-lg font-black text-green-400">R$ {lucroBrutoHoje.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400">📉 Custos do Dia</span>
            <span className="text-lg font-black text-red-400">- R$ {custoDiarioHoje.toFixed(2)}</span>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest text-gray-400">✅ Lucro Líquido</span>
            <span className={`text-2xl font-black ${(lucroBrutoHoje - custoDiarioHoje) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {(lucroBrutoHoje - custoDiarioHoje).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Lucro Líquido (7 Dias)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#999' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#999' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                cursor={{ fill: '#f9f9f9' }}
              />
              <Bar dataKey="lucro" radius={[6, 6, 0, 0]}>
                {dataGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.lucro >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detalhamento do Dia */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package size={14} /> Produtos Vendidos
          </h3>
          <div className="space-y-3">
            {Object.keys(produtosVendidos).length === 0 ? (
              <p className="text-center py-4 text-gray-300 text-[10px] font-bold uppercase">Nenhuma venda hoje</p>
            ) : (
              Object.entries(produtosVendidos).map(([nome, data]: [string, any]) => (
                <div key={nome} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-sm font-bold text-gray-700">{nome} ({data.qtd}x)</span>
                  <span className="text-sm font-black text-gray-900">R$ {data.valor.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> Custos do Dia
          </h3>
          <div className="space-y-3">
            {custosDetalhados.length === 0 ? (
              <p className="text-center py-4 text-gray-300 text-[10px] font-bold uppercase">Nenhum custo ativo hoje</p>
            ) : (
              custosDetalhados.map(c => (
                <div key={c.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-sm font-bold text-gray-700">{c.descricao}</span>
                  <span className="text-sm font-black text-red-500">R$ {(c.valor_total / (c.dias || 1)).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-black uppercase text-gray-400">Total Diário</span>
              <span className="text-lg font-black text-red-600">R$ {custoDiarioHoje.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
