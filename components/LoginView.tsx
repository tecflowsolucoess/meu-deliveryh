import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginView() {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="E-mail" required
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Senha" required
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            {loading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 w-full text-blue-600 text-sm">
          {isSignUp ? 'Já tem conta? Logue aqui' : 'Não tem conta? Crie agora'}
        </button>
      </div>
    </div>
  );
}
