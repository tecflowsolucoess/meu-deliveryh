'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Utensils, 
  Package, 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  Edit2, 
  X, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Db, Produto, Ingrediente, Estoque, ReceitaItem } from '@/lib/types';

interface GestaoViewProps {
  db: Db;
  saveProduto: (data: any, isEdit: boolean) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  saveIngrediente: (data: any) => Promise<void>;
  deleteIngrediente: (id: string) => Promise<void>;
  updateEstoque: (id: string, atual: number, min: number) => Promise<void>;
}

function MenuCard({ title, desc, icon, onClick, alert }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void, alert?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-all w-full text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-3xl bg-gray-50 group-hover:bg-orange-50 transition-colors">
          {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-gray-900 uppercase tracking-tight">{title}</h3>
            {alert && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{desc}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
    </button>
  );
}

export function GestaoView({ db, saveProduto, deleteProduto, saveIngrediente, deleteIngrediente, updateEstoque }: GestaoViewProps) {
  const [view, setView] = useState<'menu' | 'produtos' | 'estoque' | 'ingredientes'>('menu');
  const [showAddProduto, setShowAddProduto] = useState(false);
  const [showAddIngrediente, setShowAddIngrediente] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);

  // Form states
  const [newProd, setNewProd] = useState<Produto>({ id: '', nome: '', custo_total: 0, preco_ifood: 0, preco_99food: 0, receita: [] });
  const [newIng, setNewIng] = useState({ nome: '', unidade: 'g' });

  const handleSaveProduto = async () => {
    await saveProduto(editingItem ? { ...newProd, id: editingItem.id } : newProd, !!editingItem);
    setShowAddProduto(false);
    setEditingItem(null);
    setNewProd({ id: '', nome: '', custo_total: 0, preco_ifood: 0, preco_99food: 0, receita: [] });
  };

  const handleDeleteProduto = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await deleteProduto(id);
  };

  const handleSaveIngrediente = async () => {
    await saveIngrediente(newIng);
    setShowAddIngrediente(false);
    setNewIng({ nome: '', unidade: 'g' });
  };

  return (
    <motion.div 
      key="gestao"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {view === 'menu' && (
        <div className="grid grid-cols-1 gap-4">
          <MenuCard 
            title="Produtos" 
            desc="Gerenciar cardápio e receitas" 
            icon={<Utensils className="text-orange-500" />} 
            onClick={() => setView('produtos')} 
          />
          <MenuCard 
            title="Estoque" 
            desc="Controle de quantidades e alertas" 
            icon={<Package className="text-blue-500" />} 
            onClick={() => setView('estoque')} 
            alert={db.estoque.some((e: Estoque) => e.quantidade_atual <= e.quantidade_minima)}
          />
          <MenuCard 
            title="Ingredientes" 
            desc="Cadastro de insumos básicos" 
            icon={<Settings className="text-gray-500" />} 
            onClick={() => setView('ingredientes')} 
          />
        </div>
      )}

      {view === 'produtos' && (
        <div className="space-y-4">
          <button onClick={() => setView('menu')} className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Minus className="w-3 h-3 rotate-90" /> VOLTAR
          </button>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Produtos</h3>
            <button onClick={() => { setEditingItem(null); setNewProd({ id: '', nome: '', custo_total: 0, preco_ifood: 0, preco_99food: 0, receita: [] }); setShowAddProduto(true); }} className="bg-orange-500 text-white p-2 rounded-full">
              <Plus size={20} />
            </button>
          </div>

          {showAddProduto && (
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100 space-y-4">
              <h4 className="font-bold text-sm uppercase text-gray-400">{editingItem ? 'Editar Produto' : 'Novo Produto'}</h4>
              <input 
                placeholder="Nome do Produto" 
                value={newProd.nome}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold"
                onChange={e => setNewProd({...newProd, nome: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Custo Total (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newProd.custo_total || 0}
                    className="w-full p-3 bg-gray-50 rounded-2xl border-none"
                    onChange={e => setNewProd({...newProd, custo_total: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Preço iFood (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newProd.preco_ifood || 0}
                    className="w-full p-3 bg-gray-50 rounded-2xl border-none"
                    onChange={e => setNewProd({...newProd, preco_ifood: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Preço 99Food (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newProd.preco_99food || 0}
                    className="w-full p-3 bg-gray-50 rounded-2xl border-none"
                    onChange={e => setNewProd({...newProd, preco_99food: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* Recipe Editor */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Receita (Ingredientes)</label>
                <div className="space-y-2">
                  {newProd.receita.map((item: ReceitaItem, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select 
                        value={item.ingrediente_id}
                        className="flex-1 p-2 bg-gray-50 rounded-xl text-xs"
                        onChange={e => {
                          const newRec = [...newProd.receita];
                          newRec[idx].ingrediente_id = e.target.value;
                          setNewProd({...newProd, receita: newRec});
                        }}
                      >
                        <option value="">Selecione...</option>
                        {db.ingredientes.map((ing: Ingrediente) => (
                          <option key={ing.id} value={ing.id}>{ing.nome} ({ing.unidade})</option>
                        ))}
                      </select>
                      <input 
                        type="number"
                        placeholder="Qtd"
                        value={item.quantidade || 0}
                        className="w-20 p-2 bg-gray-50 rounded-xl text-xs"
                        onChange={e => {
                          const newRec = [...newProd.receita];
                          newRec[idx].quantidade = Number(e.target.value);
                          setNewProd({...newProd, receita: newRec});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newRec = newProd.receita.filter((_: ReceitaItem, i: number) => i !== idx);
                          setNewProd({...newProd, receita: newRec});
                        }}
                        className="p-2 text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setNewProd({...newProd, receita: [...newProd.receita, { ingrediente_id: '', quantidade: 0 }]})}
                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 uppercase"
                  >
                    + Adicionar Ingrediente
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProduto}
                  className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200"
                >
                  {editingItem ? 'Salvar Alterações' : 'Salvar Produto'}
                </button>
                <button 
                  onClick={() => { setShowAddProduto(false); setEditingItem(null); }}
                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {db.produtos.map((p: Produto) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                <div>
                  <p className="font-bold">{p.nome}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Custo: R$ {p.custo_total.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-xs font-bold text-red-500">iF: R$ {p.preco_ifood.toFixed(2)}</p>
                    <p className="text-xs font-bold text-yellow-600">99: R$ {p.preco_99food.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingItem(p);
                      setNewProd({ ...p });
                      setShowAddProduto(true);
                    }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduto(p.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'estoque' && (
        <div className="space-y-4">
          <button onClick={() => setView('menu')} className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Minus className="w-3 h-3 rotate-90" /> VOLTAR
          </button>
          <h3 className="font-bold text-lg">Controle de Estoque</h3>
          
          <div className="space-y-3">
            {db.estoque.map((e: Estoque) => {
              const ing = db.ingredientes.find((i: Ingrediente) => i.id === e.ingrediente_id);
              const isLow = e.quantidade_atual <= e.quantidade_minima;
              return (
                <div key={e.ingrediente_id} className={`bg-white p-4 rounded-2xl border ${isLow ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {isLow && <AlertTriangle size={16} className="text-red-500" />}
                      <p className="font-bold">{ing?.nome || 'Desconhecido'}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md uppercase">{ing?.unidade}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Atual</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateEstoque(e.ingrediente_id, e.quantidade_atual - 10, e.quantidade_minima)} className="p-1 bg-gray-100 rounded-lg"><Minus size={14}/></button>
                        <span className={`font-black text-lg ${isLow ? 'text-red-600' : ''}`}>{e.quantidade_atual}</span>
                        <button onClick={() => updateEstoque(e.ingrediente_id, e.quantidade_atual + 10, e.quantidade_minima)} className="p-1 bg-gray-100 rounded-lg"><Plus size={14}/></button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mínimo</label>
                      <input 
                        type="number" 
                        value={e.quantidade_minima}
                        className="w-full bg-transparent border-b border-gray-200 font-bold text-sm focus:outline-none"
                        onChange={(ev) => updateEstoque(e.ingrediente_id, e.quantidade_atual, Number(ev.target.value))}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'ingredientes' && (
        <div className="space-y-4">
          <button onClick={() => setView('menu')} className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <Minus className="w-3 h-3 rotate-90" /> VOLTAR
          </button>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Ingredientes</h3>
            <button onClick={() => setShowAddIngrediente(true)} className="bg-gray-800 text-white p-2 rounded-full">
              <Plus size={20} />
            </button>
          </div>

          {showAddIngrediente && (
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-4">
              <input 
                placeholder="Nome do Ingrediente" 
                className="w-full p-3 bg-gray-50 rounded-2xl border-none"
                onChange={e => setNewIng({...newIng, nome: e.target.value})}
              />
              <select 
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewIng({...newIng, unidade: e.target.value})}
              >
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilos (kg)</option>
                <option value="un">Unidade (un)</option>
              </select>
              <button 
                onClick={handleSaveIngrediente}
                className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold"
              >
                Salvar Ingrediente
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {db.ingredientes.map((i: Ingrediente) => (
              <div key={i.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Package size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{i.nome}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{i.unidade}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(`Deseja excluir o ingrediente "${i.nome}"?`)) {
                      deleteIngrediente(i.id);
                    }
                  }}
                  className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
