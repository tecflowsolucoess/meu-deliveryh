'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useData } from '@/lib/hooks/useData';
import { Navbar } from '@/components/Navbar';
import { Toast } from '@/components/ui/Toast';
import { CozinhaView } from '@/components/CozinhaView';
import { GestaoView } from '@/components/GestaoView';
import { DashboardView } from '@/components/DashboardView';
import { CustosView } from '@/components/CustosView';
import { SimuladorView } from '@/components/SimuladorView';
import ConfigView from '@/components/ConfigView';
import LoginView from '@/components/LoginView';

export default function MeuDeliveryApp() {
  const { 
    db, 
    loading, 
    error, 
    registrarVenda, 
    saveProduto, 
    deleteProduto, 
    saveIngrediente, 
    deleteIngrediente, 
    saveCusto, 
    deleteCusto,
    updateEstoque
  } = useData();

  const [activeTab, setActiveTab] = useState('cozinha');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('delivery_session');
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
    setIsReady(true);
  }, []);

  const handleLogin = (user: string) => {
    localStorage.setItem('delivery_session', user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_session');
    setIsLoggedIn(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRegistrarVenda = async (produtoId: string, quantidade: number, plataforma: 'ifood' | '99food') => {
    try {
      await registrarVenda(produtoId, quantidade, plataforma);
      showToast(`Venda registrada: ${quantidade}x no ${plataforma === 'ifood' ? 'iFood' : '99Food'}`);
    } catch (err) {
      showToast('Erro ao registrar venda', 'error');
    }
  };

  if (!isReady) return null;

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carregando Painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900 selection:bg-orange-100">
      <main className="max-w-md mx-auto p-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'cozinha' && (
            <CozinhaView 
              db={db} 
              registrarVenda={handleRegistrarVenda} 
            />
          )}
          {activeTab === 'gestao' && (
            <GestaoView 
              db={db} 
              saveProduto={saveProduto}
              deleteProduto={deleteProduto}
              saveIngrediente={saveIngrediente}
              deleteIngrediente={deleteIngrediente}
              updateEstoque={updateEstoque}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardView db={db} />
          )}
          {activeTab === 'custos' && (
            <CustosView 
              db={db} 
              saveCusto={saveCusto}
              deleteCusto={deleteCusto}
            />
          )}
          {activeTab === 'simulador' && (
            <SimuladorView db={db} />
          )}
          {activeTab === 'config' && (
            <ConfigView onLogout={handleLogout} />
          )}
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
