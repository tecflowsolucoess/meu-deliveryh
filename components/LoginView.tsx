// Substitua o conteúdo de LoginView.tsx por este
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
      if (error) alert(error.message);
      else alert('Verifique seu e-mail para confirmar o cadastro!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('Erro ao entrar: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Criar Conta' : 'Entrar no Delivery'}</h2>
        <input 
          type="email" placeholder="Seu e-mail" 
          className="w-full p-2 mb-4 border rounded text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Sua senha" 
          className="w-full p-2 mb-6 border rounded text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
        </button>
        <p className="mt-4 text-center cursor-pointer text-blue-500" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Já tem conta? Entre aqui' : 'Não tem conta? Clique aqui para criar'}
        </p>
      </form>
    </div>
  );
}
