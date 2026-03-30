'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Database, LogOut, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';

interface ConfigViewProps {
  onLogout: () => void;
}

export function ConfigView({ onLogout }: ConfigViewProps) {
  const handleReset = async () => {
    if (!confirm('Deseja realmente resetar TODOS os dados? Esta ação não pode ser desfeita.')) return;
    
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset' })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
    }
  };

  return (
    <motion.div 
      key="config"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-black tracking-tight">Configurações</h2>

      <div className="space-y-3">
        <button 
          onClick={onLogout}
          className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 text-left active:scale-[0.98] transition-all group"
        >
          <div className="p-4 bg-red-50 rounded-3xl group-hover:bg-red-100 transition-colors">
            <LogOut size={24} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-lg text-gray-900">Sair da Conta</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Encerrar sessão atual</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <button 
          onClick={handleReset}
          className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 text-left active:scale-[0.98] transition-all group"
        >
          <div className="p-4 bg-orange-50 rounded-3xl group-hover:bg-orange-100 transition-colors">
            <Trash2 size={24} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-lg text-gray-900">Limpar Dados</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Resetar banco de dados</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex gap-4">
          <AlertTriangle className="text-orange-500 shrink-0" size={24} />
          <div>
            <h4 className="font-black text-orange-800 text-sm uppercase">Aviso de Segurança</h4>
            <p className="text-xs text-orange-700 font-medium leading-relaxed mt-1">
              Seus dados estão sendo salvos localmente e no Supabase (se configurado). 
              Certifique-se de fazer backup regularmente.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Versão 2.0.0 • Produção</p>
      </div>
    </motion.div>
  );
}
