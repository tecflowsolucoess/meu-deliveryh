import React from 'react';
import { supabase } from '@/lib/supabase';

export default function ConfigView() {
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Configurações</h1>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="font-bold text-lg text-red-700 mb-2">Zona de Perigo</h2>
        <p className="text-red-600 mb-4 text-sm">Apagar todo o histórico do sistema.</p>
        <button 
          onClick={handleResetData}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700"
        >
          Resetar Todos os Dados
        </button>
      </div>
    </div>
  );
}
