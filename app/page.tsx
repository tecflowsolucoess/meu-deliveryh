'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Utensils, 
  Package, 
  BarChart3, 
  Settings, 
  Plus, 
  Minus, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight,
  Trash2,
  Save,
  Calculator,
  X,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Types ---
interface Ingrediente {
  id: string;
  nome: string;
  unidade: string;
}

interface Estoque {
  ingrediente_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
}

interface ReceitaItem {
  ingrediente_id: string;
  quantidade: number;
}

interface Produto {
  id: string;
  nome: string;
  custo_total: number;
  preco_ifood: number;
  preco_99food: number;
  receita: ReceitaItem[];
}

interface Venda {
  id: string;
  produto_id: string;
  quantidade: number;
  origem: 'ifood' | '99food';
  data: string;
  valor_venda: number;
  lucro_real: number;
}

interface CustoOperacional {
  id: string;
  tipo: string;
  nome: string;
  quantidade: number;
  valor_total: number;
  data: string;
  data_inicio: string;
  dias: number;
}

// --- Helper Components ---

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
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

function StatCard({ title, value, subValue, icon, color }: { title: string, value: string, subValue?: string, icon: React.ReactNode, color: string }) {
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

function Toast({ message, visible }: { message: string, visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm"
        >
          <CheckCircle2 size={18} className="text-green-400" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface Db {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  estoque: Estoque[];
  vendas: Venda[];
  custos: CustoOperacional[];
  supabaseStatus?: 'connected' | 'error' | 'not_configured';
}

// --- Main App Component ---

export default function MeuDeliveryApp() {
  const [activeTab, setActiveTab] = useState<'cozinha' | 'gestao' | 'dashboard' | 'simulador' | 'custos'>('cozinha');
  const [db, setDb] = useState<Db>({ produtos: [], ingredientes: [], estoque: [], vendas: [], custos: [] });
  
  const [origem, setOrigem] = useState<'ifood' | '99food'>('ifood');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDb({
        produtos: Array.isArray(data.produtos) ? data.produtos : [],
        ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes : [],
        estoque: Array.isArray(data.estoque) ? data.estoque : [],
        vendas: Array.isArray(data.vendas) ? data.vendas : [],
        custos: Array.isArray(data.custos) ? data.custos : [],
        supabaseStatus: data.supabaseStatus || 'not_configured',
      });
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const registrarVenda = async (produtoId: string, quantidade: number) => {
    const produto = db.produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'venda',
        data: { produto_id: produtoId, quantidade, origem }
      })
    });

    if (res.ok) {
      const lucroUnitario = origem === 'ifood' 
        ? (produto.preco_ifood * 0.7 - produto.custo_total) 
        : (produto.preco_99food * 0.75 - produto.custo_total);
      
      showToast(`Venda registrada! Lucro: R$ ${(lucroUnitario * quantidade).toFixed(2)}`);
      fetchData();
    }
  };

  // Cálculos de Resumo
  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = db.vendas.filter(v => v.data.startsWith(hoje));
  const faturamentoHoje = vendasHoje.reduce((acc, v) => acc + v.valor_venda, 0);
  const lucroBrutoHoje = vendasHoje.reduce((acc, v) => acc + v.lucro_real, 0);
  
  // Custo operacional diário (DILUÍDO e ATIVO)
  const custoDiarioTotal = db.custos.reduce((acc: number, c: CustoOperacional) => {
    const dataInicio = new Date((c.data_inicio || c.data.split('T')[0]) + 'T00:00:00');
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + (c.dias - 1));
    
    const hojeDate = new Date(hoje + 'T12:00:00');
    
    if (hojeDate >= dataInicio && hojeDate <= dataFim) {
      return acc + (c.valor_total / (c.dias || 1));
    }
    return acc;
  }, 0);

  const lucroRealHoje = lucroBrutoHoje - custoDiarioTotal;
  const custoPorPedido = vendasHoje.length > 0 ? custoDiarioTotal / vendasHoje.length : custoDiarioTotal;

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f5f5f5] gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"
      />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando Delivery...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 font-sans text-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-xl text-white">
            <Utensils size={18} strokeWidth={3} />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-gray-900">DELIVERY<span className="text-orange-500">PRO</span></h1>
        </div>
        <div className="flex bg-gray-100 rounded-2xl p-1 border border-gray-200">
          <button 
            onClick={() => setOrigem('ifood')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${origem === 'ifood' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}
          >
            iFood
          </button>
          <button 
            onClick={() => setOrigem('99food')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${origem === '99food' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400'}`}
          >
            99Food
          </button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Dashboard Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            title="Faturamento Hoje" 
            value={`R$ ${faturamentoHoje.toFixed(2)}`} 
            subValue={`${vendasHoje.length} pedidos`}
            icon={<TrendingUp />} 
            color="bg-green-50 text-green-600"
          />
          <StatCard 
            title="Lucro Real Hoje" 
            value={`R$ ${lucroRealHoje.toFixed(2)}`} 
            subValue={`Custo Fixo: R$ ${custoDiarioTotal.toFixed(2)}`}
            icon={<DollarSign />} 
            color={lucroRealHoje >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}
          />
          <StatCard 
            title="Pedidos" 
            value={vendasHoje.length.toString()} 
            icon={<Package />} 
            color="bg-orange-50 text-orange-600"
          />
          <StatCard 
            title="Custo por Pedido" 
            value={`R$ ${custoPorPedido.toFixed(2)}`} 
            subValue="Diluído"
            icon={<AlertTriangle />} 
            color="bg-gray-50 text-gray-600"
          />
        </div>

        {lucroRealHoje < 0 && vendasHoje.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center gap-3"
          >
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-red-700 leading-tight">
              ALERTA: O lucro bruto de hoje ainda não cobre os custos operacionais fixos. 
              Faltam R$ {Math.abs(lucroRealHoje).toFixed(2)} para o ponto de equilíbrio.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'cozinha' && <CozinhaView db={db} registrarVenda={registrarVenda} origem={origem} />}
          {activeTab === 'gestao' && <GestaoView db={db} fetchData={fetchData} />}
          {activeTab === 'custos' && <CustosView db={db} fetchData={fetchData} />}
          {activeTab === 'dashboard' && <DashboardView db={db} />}
          {activeTab === 'simulador' && <SimuladorView db={db} />}
        </AnimatePresence>
      </main>

      <Toast visible={toast.visible} message={toast.message} />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavButton active={activeTab === 'cozinha'} onClick={() => setActiveTab('cozinha')} icon={<Utensils />} label="Cozinha" />
        <NavButton active={activeTab === 'gestao'} onClick={() => setActiveTab('gestao')} icon={<Package />} label="Produtos" />
        <NavButton active={activeTab === 'custos'} onClick={() => setActiveTab('custos')} icon={<Settings />} label="Custos" />
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 />} label="Lucro" />
        <NavButton active={activeTab === 'simulador'} onClick={() => setActiveTab('simulador')} icon={<Calculator />} label="Simular" />
      </nav>
    </div>
  );
}

// --- Sub-Views ---

function CozinhaView({ db, registrarVenda, origem }: { db: Db, registrarVenda: (id: string, qty: number) => void, origem: string }) {
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
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
          <Clock size={12} /> {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {db.produtos.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Package size={32} />
          </div>
          <p className="text-gray-400 font-bold text-sm mb-6">Nenhum produto cadastrado para venda.</p>
          <button className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200">
            Ir para Gestão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {db.produtos.map((produto: Produto) => {
            const vendasProd = db.vendas.filter((v: Venda) => v.produto_id === produto.id && v.data.startsWith(hoje));
            const totalVendido = vendasProd.reduce((acc: number, v: Venda) => acc + v.quantidade, 0);
            const lucroUnitario = origem === 'ifood' 
              ? (produto.preco_ifood * 0.7 - produto.custo_total) 
              : (produto.preco_99food * 0.75 - produto.custo_total);

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
                      onClick={() => registrarVenda(produto.id, qty)}
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
                <div key={v.id} className="bg-white/60 p-3 rounded-2xl flex justify-between items-center border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${v.origem === 'ifood' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                    <div>
                      <p className="text-xs font-black">{p?.nome || 'Produto'}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {v.quantidade} un</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-green-600">+ R$ {v.lucro_real.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{v.origem}</p>
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

function GestaoView({ db, fetchData }: { db: Db, fetchData: () => void }) {
  const [view, setView] = useState<'menu' | 'produtos' | 'estoque' | 'ingredientes'>('menu');
  const [showAddProduto, setShowAddProduto] = useState(false);
  const [showAddIngrediente, setShowAddIngrediente] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);

  // Form states
  const [newProd, setNewProd] = useState<Produto>({ id: '', nome: '', custo_total: 0, preco_ifood: 0, preco_99food: 0, receita: [] });
  const [newIng, setNewIng] = useState({ nome: '', unidade: 'g' });

  const handleAddProduto = async () => {
    const method = editingItem ? 'PUT' : 'POST';
    await fetch('/api/data', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'produto', data: editingItem ? { ...newProd, id: editingItem.id } : newProd })
    });
    setShowAddProduto(false);
    setEditingItem(null);
    setNewProd({ id: '', nome: '', custo_total: 0, preco_ifood: 0, preco_99food: 0, receita: [] });
    fetchData();
  };

  const handleDeleteProduto = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await fetch('/api/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'produto', id })
    });
    fetchData();
  };

  const handleAddIngrediente = async () => {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ingrediente', data: newIng })
    });
    setShowAddIngrediente(false);
    setNewIng({ nome: '', unidade: 'g' });
    fetchData();
  };

  const updateEstoque = async (ingId: string, atual: number, min: number) => {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'update_estoque', 
        data: { ingrediente_id: ingId, quantidade_atual: atual, quantidade_minima: min } 
      })
    });
    fetchData();
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
                  onClick={handleAddProduto}
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
                onClick={handleAddIngrediente}
                className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold"
              >
                Salvar Ingrediente
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {db.ingredientes.map((i: Ingrediente) => (
              <div key={i.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="font-bold text-sm">{i.nome}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{i.unidade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CustosView({ db, fetchData }: { db: Db, fetchData: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<CustoOperacional | null>(null);
  const [newCusto, setNewCusto] = useState<Omit<CustoOperacional, 'id' | 'data'>>({ tipo: 'Fixo', nome: '', quantidade: 1, valor_total: 0, dias: 30, data_inicio: new Date().toISOString().split('T')[0] });

  const handleSave = async () => {
    if (newCusto.dias <= 0) {
      alert('A duração deve ser de pelo menos 1 dia.');
      return;
    }

    const method = editingItem ? 'PUT' : 'POST';
    await fetch('/api/data', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'custo', 
        data: editingItem ? { ...newCusto, id: editingItem.id } : newCusto 
      })
    });
    setShowAdd(false);
    setEditingItem(null);
    setNewCusto({ tipo: 'Fixo', nome: '', quantidade: 1, valor_total: 0, dias: 30, data_inicio: new Date().toISOString().split('T')[0] });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este custo? Isso afetará o cálculo de lucro retroativamente.')) return;
    await fetch('/api/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'custo', id })
    });
    fetchData();
  };

  const handleEdit = (custo: CustoOperacional) => {
    setEditingItem(custo);
    setNewCusto({
      tipo: custo.tipo || 'Fixo',
      nome: custo.nome || '',
      quantidade: custo.quantidade || 0,
      valor_total: custo.valor_total || 0,
      dias: custo.dias || 1,
      data_inicio: custo.data_inicio || new Date().toISOString().split('T')[0]
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
            setNewCusto({ tipo: 'Fixo', nome: '', quantidade: 1, valor_total: 0, dias: 30, data_inicio: new Date().toISOString().split('T')[0] });
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
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Custo</label>
            <div className="grid grid-cols-2 gap-2">
              {['Fixo', 'Variável', 'Manutenção', 'Insumo'].map(t => (
                <button 
                  key={t}
                  onClick={() => setNewCusto({...newCusto, tipo: t})}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${newCusto.tipo === t ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Data de Início</label>
              <input 
                type="date" 
                value={newCusto.data_inicio}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewCusto({...newCusto, data_inicio: e.target.value})}
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
            <label className="text-[10px] font-bold text-gray-400 uppercase">Descrição</label>
            <input 
              placeholder="ex: Aluguel, Internet, Óleo" 
              value={newCusto.nome}
              className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
              onChange={e => setNewCusto({...newCusto, nome: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Quantidade</label>
              <input 
                type="number" 
                value={newCusto.quantidade}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewCusto({...newCusto, quantidade: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Valor Total</label>
              <input 
                type="number" 
                value={newCusto.valor_total}
                className="w-full p-3 bg-gray-50 rounded-2xl border-none font-bold"
                onChange={e => setNewCusto({...newCusto, valor_total: Number(e.target.value)})}
              />
            </div>
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
                <p className="font-black text-gray-900">{c.nome}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  {c.quantidade} un • {c.tipo} • {c.dias} dias
                </p>
                <p className="text-[9px] text-orange-500 font-bold uppercase mt-1">
                  Custo diário: R$ {(c.valor_total / (c.dias || 1)).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-sm font-black text-gray-900">R$ {c.valor_total.toFixed(2)}</p>
                  <p className="text-[9px] text-gray-400 font-bold">{new Date(c.data).toLocaleDateString('pt-BR')}</p>
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

function DashboardView({ db }: { db: Db }) {
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
      faturamento: vDia.reduce((acc: number, v: any) => acc + v.valor_venda, 0)
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

  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-black tracking-tight">Análise de Lucro</h2>

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
            <span className="text-sm font-bold text-gray-400">📉 Custo Operacional (Dia)</span>
            <span className="text-lg font-black text-red-400">- R$ {custoDiarioHoje.toFixed(2)}</span>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest">✅ Lucro Líquido REAL</span>
            <span className={`text-2xl font-black ${(lucroBrutoHoje - custoDiarioHoje) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {(lucroBrutoHoje - custoDiarioHoje).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SimuladorView({ db }: { db: Db }) {
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

function MenuCard({ title, desc, icon, onClick, alert }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void, alert?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 text-left active:scale-[0.98] transition-all relative overflow-hidden group"
    >
      {alert && <div className="absolute top-0 right-0 w-12 h-12 bg-red-500 rotate-45 translate-x-6 -translate-y-6 flex items-end justify-center pb-1"><AlertTriangle size={12} className="text-white" /></div>}
      <div className="p-4 bg-gray-50 rounded-3xl group-hover:bg-orange-50 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-black text-lg text-gray-900">{title}</h4>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{desc}</p>
      </div>
      <div className="bg-gray-50 p-2 rounded-xl text-gray-300 group-hover:text-orange-500 transition-colors">
        <ChevronRight size={20} />
      </div>
    </button>
  );
}
