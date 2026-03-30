'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Package } from 'lucide-react';
import { Db, Produto, Venda } from '@/lib/types';

interface CozinhaViewProps {
  db: Db;
  registrarVenda: (id: string, qty: number, plataforma: 'ifood' | '99food') => void;
}

export function CozinhaView({ db, registrarVenda }: CozinhaViewProps) {
  const [plataforma, setPlataforma] = useState<'ifood' | '99food'>('ifood');
  const hoje = new Date().toISOString().split('T')[0];
  
  const vendasRecentes = [...db.vendas]
    .filter(v => v.data.startsWith(hoje))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <motion.div 
      key="cozinha"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          Cozinha <span className="text-orange-500 text-sm font-bold bg-orange-50 px-2 py-0.5 rounded-lg">LIVE</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setPlataforma('ifood')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${plataforma === 'ifood' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400'}`}
            >
              iFood
            </button>
            <button 
              onClick={() => setPlataforma('99food')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${plataforma === '99food' ? 'bg-yellow-400 text-black shadow-sm' : 'text-gray-400'}`}
            >
              99Food
            </button>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
            <Clock size={12} /> {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {db.produtos.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Package size={32} />
          </div>
          <p className="text-gray-400 font-bold text-sm mb-6">Nenhum produto cadastrado para venda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {db.produtos.map((produto: Produto) => {
            const vendasProd = db.vendas.filter((v: Venda) => v.produto_id === produto.id && v.data.startsWith(hoje));
            const totalVendido = vendasProd.reduce((acc: number, v: Venda) => acc + v.quantidade, 0);
            const lucroUnitario = plataforma === 'ifood' 
              ? (produto.preco_ifood * 0.70) - produto.custo_total
              : (produto.preco_99food * 0.75) - produto.custo_total;
            
            return (
              <div key={produto.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-black text-xl leading-tight text-gray-900">{produto.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Lucro/Un:</span>
                      <span className="text-xs font-black text-green-600">R$ {lucroUnitario.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                      {totalVendido} VENDIDOS
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 5].map(qty => (
                    <button
                      key={qty}
                      onClick={() => registrarVenda(produto.id, qty, plataforma)}
                      className="bg-gray-50 hover:bg-orange-500 hover:text-white active:scale-95 transition-all py-4 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-0.5 group/btn"
                    >
                      <span className="text-2xl font-black tracking-tighter">+{qty}</span>
                      <span className="text-[9px] font-bold uppercase opacity-40 group-hover/btn:opacity-100">Vender</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendas Recentes */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Vendas Recentes (Hoje)</h3>
        <div className="space-y-2">
          {vendasRecentes.length === 0 ? (
            <p className="text-center py-8 text-gray-300 text-[10px] font-bold uppercase italic">Nenhuma venda registrada hoje</p>
          ) : (
            vendasRecentes.map((v: Venda) => {
              const p = db.produtos.find((prod: Produto) => prod.id === v.produto_id);
              return (
                <div key={v.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${v.origem === 'ifood' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                    <div>
                      <p className="text-xs font-black text-gray-900">{p?.nome || 'Produto Excluído'}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{v.quantidade}x • {v.origem}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-600">+ R$ {v.lucro_real.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase">{new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
