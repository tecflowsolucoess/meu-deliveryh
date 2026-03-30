'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Db, CustoOperacional } from '@/lib/types';

interface CustosViewProps {
  db: Db;
  saveCusto: (data: any, isEdit: boolean) => Promise<void>;
  deleteCusto: (id: string) => Promise<void>;
}

export function CustosView({ db, saveCusto, deleteCusto }: CustosViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<CustoOperacional | null>(null);
  const [newCusto, setNewCusto] = useState<Omit<CustoOperacional, 'id' | 'data'>>({ 
    descricao: '', 
    valor_total: 0, 
    dias: 30, 
    data_inicio: new Date().toLocaleDateString('en-CA') 
  });

  const handleSave = async () => {
    if (newCusto.dias <= 0) {
      alert('A duração deve ser de pelo menos 1 dia.');
      return;
    }

    await saveCusto(editingItem ? { ...newCusto, id: editingItem.id } : newCusto, !!editingItem);
    setShowAdd(false);
    setEditingItem(null);
    setNewCusto({ descricao: '', valor_total: 0, dias: 30, data_inicio: new Date().toLocaleDateString('en-CA') });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este custo? Isso afetará o cálculo de lucro retroativamente.')) return;
    await deleteCusto(id);
  };

  const handleEdit = (custo: CustoOperacional) => {
    setEditingItem(custo);
    setNewCusto({
      descricao: custo.descricao || '',
      valor_total: custo.valor_total || 0,
      dias: custo.dias || 1,
      data_inicio: custo.data_inicio || new Date().toLocaleDateString('en-CA')
    });
    setShowAdd(true);
  };

  return (
    <motion.div 
      key="custos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black tracking-tight">Custos Operacionais</h2>
        <button 
          onClick={() => {
            setEditingItem(null);
            setNewCusto({ descricao: '', valor_total: 0, dias: 30, data_inicio: new Date().toLocaleDateString('en-CA') });
            setShowAdd(!showAdd);
          }} 
          className="bg-gray-900 text-white p-2 rounded-full"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-4">
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">
            {editingItem ? 'Editar Custo' : 'Novo Custo'}
          </h3>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Descrição (Nome)</label>
            <input 
              placeholder="ex: Óleo, Gás, Embalagem" 
              value={newCusto.descricao}
              className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
              onChange={e => setNewCusto({...newCusto, descricao: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Valor Total</label>
              <input 
                type="number" 
                value={newCusto.valor_total}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewCusto({...newCusto, valor_total: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Duração (Dias)</label>
              <input 
                type="number" 
                value={newCusto.dias}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewCusto({...newCusto, dias: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Data de Início</label>
            <input 
              type="date" 
              value={newCusto.data_inicio}
              className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
              onChange={e => setNewCusto({...newCusto, data_inicio: e.target.value})}
            />
          </div>

          <button onClick={handleSave} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold">
            {editingItem ? 'Atualizar Custo' : 'Salvar Custo'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Histórico de Custos</h3>
        {db.custos.length === 0 ? (
          <p className="text-center py-8 text-gray-300 text-[10px] font-bold uppercase italic">Nenhum custo registrado</p>
        ) : (
          [...db.custos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((c: CustoOperacional) => (
            <div key={c.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100">
              <div className="flex-1">
                <p className="font-black text-gray-900">{c.descricao}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  {c.dias} dias • Início: {new Date(c.data_inicio).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-[9px] text-orange-500 font-bold uppercase mt-1">
                  Custo diário: R$ {(c.valor_total / (c.dias || 1)).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-sm font-black text-gray-900">R$ {c.valor_total.toFixed(2)}</p>
                </div>
                <button onClick={() => handleEdit(c)} className="text-blue-400 p-2 bg-blue-50 rounded-xl"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="text-red-400 p-2 bg-red-50 rounded-xl"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
