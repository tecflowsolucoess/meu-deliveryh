'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, ChefHat } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin(username);
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-gray-200">
            <ChefHat size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">MeuDelivery</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Gestão Profissional</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Usuário</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="Sua senha"
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
          >
            ENTRAR NO PAINEL
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          Esqueceu sua senha? Entre em contato com o suporte
        </p>
      </motion.div>
    </div>
  );
}
