'use client';

import { useState, useEffect, useCallback } from 'react';
import { Db } from '@/lib/types';

export function useData() {
  const [db, setDb] = useState<Db>({ produtos: [], ingredientes: [], estoque: [], vendas: [], custos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setDb({
        produtos: Array.isArray(data.produtos) ? data.produtos : [],
        ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes : [],
        estoque: Array.isArray(data.estoque) ? data.estoque : [],
        vendas: Array.isArray(data.vendas) ? data.vendas : [],
        custos: Array.isArray(data.custos) ? data.custos : [],
        supabaseStatus: data.supabaseStatus
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarVenda = async (produto_id: string, quantidade: number, origem: 'ifood' | '99food') => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'venda', data: { produto_id, quantidade, origem } })
      });
      if (!res.ok) throw new Error('Erro ao registrar venda');
      const novaVenda = await res.json();
      await fetchData();
      return novaVenda;
    } catch (err: any) {
      console.error('Error registering sale:', err);
      throw err;
    }
  };

  const updateEstoque = async (ingrediente_id: string, quantidade_atual: number, quantidade_minima: number) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_estoque', data: { ingrediente_id, quantidade_atual, quantidade_minima } })
      });
      if (!res.ok) throw new Error('Erro ao atualizar estoque');
      await fetchData();
    } catch (err: any) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const saveCusto = async (data: any, isEdit: boolean) => {
    try {
      const res = await fetch('/api/data', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custo', data })
      });
      if (!res.ok) throw new Error('Erro ao salvar custo');
      await fetchData();
    } catch (err: any) {
      console.error('Error saving cost:', err);
      throw err;
    }
  };

  const deleteCusto = async (id: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custo', id })
      });
      if (!res.ok) throw new Error('Erro ao excluir custo');
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting cost:', err);
      throw err;
    }
  };

  const saveProduto = async (data: any, isEdit: boolean) => {
    try {
      const res = await fetch('/api/data', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'produto', data })
      });
      if (!res.ok) throw new Error('Erro ao salvar produto');
      await fetchData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      throw err;
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'produto', id })
      });
      if (!res.ok) throw new Error('Erro ao excluir produto');
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const saveIngrediente = async (data: any) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ingrediente', data })
      });
      if (!res.ok) throw new Error('Erro ao salvar ingrediente');
      await fetchData();
    } catch (err: any) {
      console.error('Error saving ingredient:', err);
      throw err;
    }
  };

  const deleteIngrediente = async (id: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ingrediente', id })
      });
      if (!res.ok) throw new Error('Erro ao excluir ingrediente');
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting ingredient:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    db, 
    loading, 
    error, 
    fetchData, 
    registrarVenda, 
    updateEstoque, 
    saveCusto, 
    deleteCusto, 
    saveProduto, 
    deleteProduto, 
    saveIngrediente,
    deleteIngrediente
  };
}
