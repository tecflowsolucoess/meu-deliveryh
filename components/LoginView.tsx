import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function LoginView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) alert('Erro no cadastro: ' + error.message);
      else alert('Conta criada! Verifique seu e-mail ou tente fazer login.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('Erro ao entrar: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isSignUp ? 'Criar Nova Conta' : 'Acessar Delivery'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" required placeholder="exemplo@email.com"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Cadastrar Agora' : 'Entrar no Sistema')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Clique aqui para criar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
