import React from 'react';
import { supabase } from '@/lib/supabase';

// Aqui avisamos ao arquivo que ele pode receber a função de Logout do app principal
interface ConfigProps {
  onLogout?: () => void;
}

export default function ConfigView({ onLogout }: ConfigProps) {
  const handleResetData = async () => {
    const confirmacao = window.confirm(
      "⚠️ ATENÇÃO: Isso apagará TODOS os pedidos e histórico. Confirma?"
    );

    if (confirmacao) {
      try {
        const { error } = await supabase.from('pedidos').delete().neq('id', 0);
        if (error) throw error;
        alert("✅ Todos os dados foram resetados!");
        window.location.reload();
      } catch (err: any) {
        alert("Erro ao resetar: " + err.message);
      }
    }
  };

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout(); // Aqui chamamos a função que o page.tsx está pedindo
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-black font-sans">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Configurações do Delivery</h1>
      
      <div className="space-y-6">
        {/* Botão de Logout */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-2">Sua Conta</h2>
          <p className="text-gray-600 mb-4 text-sm">Deseja sair do sistema?</p>
          <button 
            onClick={handleLogoutClick}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors"
          >
            Sair do App (Logout)
          </button>
        </div>

        {/* Botão de Reset */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-bold text-lg text-red-700 mb-2 text-left">Zona de Perigo</h2>
          <p className="text-red-600 mb-4 text-sm">Cuidado: Isso apaga todo o histórico de vendas.</p>
          <button 
            onClick={handleResetData}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-md"
          >
            Resetar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
}
