'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Db, Produto } from '@/lib/types';

interface SimuladorViewProps {
  db: Db;
}

export function SimuladorView({ db }: SimuladorViewProps) {
  const [prodId, setProdId] = useState('');
  const [preco, setPreco] = useState(0);
  const [custoAdicional, setCustoAdicional] = useState(0);
  const [plataforma, setPlataforma] = useState<'ifood' | '99food'>('ifood');

  const prod = db.produtos.find((p: Produto) => p.id === prodId);
  const taxa = plataforma === 'ifood' ? 0.30 : 0.25;
  const custoBase = prod?.custo_total || 0;
  const custoTotal = custoBase + custoAdicional;
  const faturamentoLiquido = preco * (1 - taxa);
  const lucro = faturamentoLiquido - custoTotal;
  const margem = preco > 0 ? (lucro / preco) * 100 : 0;

  return (
    <motion.div 
      key="simulador"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-black tracking-tight">Simulador de Preço</h2>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Produto Base</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold"
              onChange={e => {
                const p = db.produtos.find((x: Produto) => x.id === e.target.value);
                setProdId(e.target.value);
                if (p) setPreco(plataforma === 'ifood' ? p.preco_ifood : p.preco_99food);
              }}
            >
              <option value="">Selecione um produto...</option>
              {db.produtos.map((p: Produto) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Preço de Venda</label>
              <input 
                type="number" 
                value={preco || 0}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-lg"
                onChange={e => setPreco(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Plataforma</label>
              <div className="flex bg-gray-50 rounded-2xl p-1 h-[60px]">
                <button 
                  onClick={() => setPlataforma('ifood')}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${plataforma === 'ifood' ? 'bg-red-500 text-white' : 'text-gray-400'}`}
                >
                  iFood
                </button>
                <button 
                  onClick={() => setPlataforma('99food')}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${plataforma === '99food' ? 'bg-yellow-400 text-black' : 'text-gray-400'}`}
                >
                  99Food
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400">Taxa Plataforma ({taxa*100}%)</span>
            <span className="font-bold text-red-500">- R$ {(preco * taxa).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-400">Custo de Produção</span>
            <span className="font-bold text-gray-600">R$ {custoTotal.toFixed(2)}</span>
          </div>
          <div className={`p-6 rounded-3xl flex justify-between items-center ${lucro >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>Lucro Estimado</p>
              <h4 className={`text-2xl font-black ${lucro >= 0 ? 'text-green-700' : 'text-red-700'}`}>R$ {lucro.toFixed(2)}</h4>
            </div>
            <div className={`px-4 py-2 rounded-xl font-black text-sm ${lucro >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {margem.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
