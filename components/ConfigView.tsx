import React from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function ConfigView() {
  const handleResetData = async () => {
    const confirmacao = window.confirm(
      "⚠️ ATENÇÃO: Isso apagará TODOS os pedidos, clientes e histórico do seu delivery. Confirma?"
    );

    if (confirmacao) {
      try {
        // Tenta apagar a tabela de pedidos. Se tiver outras (ex: clientes), adicione abaixo.
        const { error } = await supabase.from('pedidos').delete().neq('id', 0);
        
        if (error) throw error;

        alert("✅ Todos os dados foram resetados com sucesso!");
        window.location.reload();
      } catch (err: any) {
        alert("Erro ao resetar: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Configurações do Sistema</h1>
      
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4 text-red-700">
          <AlertTriangle size={24} />
          <h2 className="font-bold text-lg">Zona de Perigo</h2>
        </div>
        <p className="text-red-600 mb-4 text-sm">
          Use o botão abaixo apenas se quiser limpar todo o sistema para começar do zero.
        </p>
        <button 
          onClick={handleResetData}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          <Trash2 size={20} />
          Resetar Todos os Dados do App
        </button>
      </div>
    </div>
  );
}
