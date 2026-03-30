import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Aqui avisamos que o LoginView agora aceita o "onLogin"
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
    setLoading(true);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert('Erro: ' + error.message);
      else alert('Verifique seu e-mail ou tente logar!');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('Erro: ' + error.message);
      } else if (data.user && onLogin) {
        // Se deu tudo certo, avisamos ao app que estamos logados
        onLogin(data.user.email || '');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-black font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isSignUp ? 'Criar Conta no Delivery' : 'Entrar no Sistema'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium text-gray-600">E-mail</label>
            <input 
              type="email" placeholder="seu@email.com" required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 font-medium text-gray-600">Senha</label>
            <input 
              type="password" placeholder="Sua senha secreta" required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Cadastrar Agora' : 'Entrar')}
          </button>
        </form>
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="mt-6 w-full text-blue-500 text-sm font-medium hover:underline"
        >
          {isSignUp ? '← Já tem conta? Faça login' : 'Não tem conta? Clique aqui para criar'}
        </button>
      </div>
    </div>
  );
}
