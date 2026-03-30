import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  onLogin?: (email: string) => void;
}

export default function LoginView({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solução Senior: Impede que o código continue se o supabase não existir
    if (!supabase) {
      alert("Conexão com o banco de dados não encontrada.");
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verifique seu e-mail ou tente logar!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user && onLogin) {
          onLogin(data.user.email || '');
        }
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isSignUp ? 'Criar Conta' : 'Acessar Sistema'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="E-mail" required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Senha" required
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="mt-6 w-full text-blue-500 text-sm font-medium hover:underline"
        >
          {isSignUp ? '← Voltar para Login' : 'Não tem conta? Crie agora'}
        </button>
      </div>
    </div>
  );
}
