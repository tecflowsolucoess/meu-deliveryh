import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Produto, Venda } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const [
          { data: produtos, error: pError },
          { data: ingredientes, error: iError },
          { data: estoque, error: eError },
          { data: vendas, error: vError },
          { data: custos, error: cError }
        ] = await Promise.all([
          supabase.from('produtos').select('*'),
          supabase.from('ingredientes').select('*'),
          supabase.from('estoque').select('*'),
          supabase.from('vendas').select('*'),
          supabase.from('custos').select('*')
        ]);

        if (!pError && !iError && !eError && !vError && !cError) {
          return NextResponse.json({
            produtos: produtos || [],
            ingredientes: ingredientes || [],
            estoque: estoque || [],
            vendas: vendas || [],
            custos: custos || [],
            supabaseStatus: 'connected'
          });
        } else {
          const errors = [
            pError && { table: 'produtos', ...pError },
            iError && { table: 'ingredientes', ...iError },
            eError && { table: 'estoque', ...eError },
            vError && { table: 'vendas', ...vError },
            cError && { table: 'custos', ...cError }
          ].filter(Boolean);
          
          console.error('Supabase query errors, falling back to local DB:', JSON.stringify(errors, null, 2));
          
          const db = getDb();
          return NextResponse.json({
            ...db,
            supabaseStatus: 'error',
            supabaseErrors: errors
          });
        }
      } catch (error) {
        console.error('Supabase connection error, falling back to local DB:', error);
      }
    }

    const db = getDb();
    return NextResponse.json(db);
  } catch (error) {
    console.error('Fatal error in GET /api/data:', error);
    return NextResponse.json({
      produtos: [],
      ingredientes: [],
      estoque: [],
      vendas: [],
      custos: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    
    if (isSupabaseConfigured && supabase) {
      try {
        if (type === 'venda') {
          const { produto_id, quantidade, origem } = data;
          const { data: produto, error: pError } = await supabase.from('produtos').select('*').eq('id', produto_id).single();
          if (pError || !produto) throw new Error('Produto não encontrado');

          if (produto.receita && Array.isArray(produto.receita)) {
            await Promise.all(produto.receita.map(async (item: any) => {
              const { data: est } = await supabase!.from('estoque').select('quantidade_atual').eq('ingrediente_id', item.ingrediente_id).maybeSingle();
              const quantidadeAtual = est?.quantidade_atual || 0;
              await supabase!.from('estoque').upsert({ 
                ingrediente_id: item.ingrediente_id,
                quantidade_atual: quantidadeAtual - (item.quantidade * quantidade)
              });
            }));
          }

          const taxa = origem === 'ifood' ? 0.30 : 0.25;
          const preco = origem === 'ifood' ? produto.preco_ifood : produto.preco_99food;
          const lucro = preco - (preco * taxa) - produto.custo_total;

          const novaVenda = {
            id: crypto.randomUUID(),
            produto_id,
            quantidade,
            origem,
            data: new Date().toISOString(),
            valor_venda: preco * quantidade,
            lucro_real: lucro * quantidade,
          };

          const { error: vError } = await supabase.from('vendas').insert([novaVenda]);
          if (vError) throw vError;
          return NextResponse.json(novaVenda);
        }

        if (type === 'custo') {
          const novoCusto = {
            ...data,
            id: crypto.randomUUID(),
            data: new Date().toISOString(),
          };
          const { error } = await supabase.from('custos').insert([novoCusto]);
          if (error) throw error;
          return NextResponse.json(novoCusto);
        }

        if (type === 'produto') {
          const novoProduto = { ...data, id: crypto.randomUUID() };
          const { error } = await supabase.from('produtos').insert([novoProduto]);
          if (error) throw error;
          return NextResponse.json(novoProduto);
        }

        if (type === 'ingrediente') {
          const novoIngrediente = { ...data, id: crypto.randomUUID() };
          const { error: iError } = await supabase.from('ingredientes').insert([novoIngrediente]);
          if (iError) throw iError;
          
          await supabase.from('estoque').insert([{
            ingrediente_id: novoIngrediente.id,
            quantidade_atual: 0,
            quantidade_minima: 100,
          }]);
          
          return NextResponse.json(novoIngrediente);
        }

        if (type === 'update_estoque') {
          const { ingrediente_id, quantidade_atual, quantidade_minima } = data;
          const { data: est, error } = await supabase.from('estoque').upsert({ ingrediente_id, quantidade_atual, quantidade_minima }).select().single();
          if (error) throw error;
          return NextResponse.json(est);
        }
      } catch (error: any) {
        console.error('Supabase error during POST:', error?.message || error);
      }
    }

    // Fallback to local DB
    const db = getDb();
    if (type === 'venda') {
      const { produto_id, quantidade, origem } = data;
      const produto = db.produtos.find(p => p.id === produto_id);
      if (!produto) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });

      produto.receita.forEach(item => {
        const est = db.estoque.find(e => e.ingrediente_id === item.ingrediente_id);
        if (est) est.quantidade_atual -= item.quantidade * quantidade;
      });

      const taxa = origem === 'ifood' ? 0.30 : 0.25;
      const preco = origem === 'ifood' ? produto.preco_ifood : produto.preco_99food;
      const lucro = preco - (preco * taxa) - produto.custo_total;

      const novaVenda: Venda = {
        id: crypto.randomUUID(),
        produto_id,
        quantidade,
        origem,
        data: new Date().toISOString(),
        valor_venda: preco * quantidade,
        lucro_real: lucro * quantidade,
      };
      db.vendas.push(novaVenda);
      saveDb(db);
      return NextResponse.json(novaVenda);
    }

    if (type === 'custo') {
      const novoCusto = { ...data, id: crypto.randomUUID(), data: new Date().toISOString() };
      db.custos.push(novoCusto);
      saveDb(db);
      return NextResponse.json(novoCusto);
    }

    if (type === 'produto') {
      const novoProduto: Produto = { ...data, id: crypto.randomUUID() };
      db.produtos.push(novoProduto);
      saveDb(db);
      return NextResponse.json(novoProduto);
    }

    if (type === 'ingrediente') {
      const novoIngrediente = { ...data, id: crypto.randomUUID() };
      db.ingredientes.push(novoIngrediente);
      db.estoque.push({ ingrediente_id: novoIngrediente.id, quantidade_atual: 0, quantidade_minima: 100 });
      saveDb(db);
      return NextResponse.json(novoIngrediente);
    }

    if (type === 'update_estoque') {
      const { ingrediente_id, quantidade_atual, quantidade_minima } = data;
      const est = db.estoque.find(e => e.ingrediente_id === ingrediente_id);
      if (est) {
        est.quantidade_atual = quantidade_atual;
        est.quantidade_minima = quantidade_minima;
      }
      saveDb(db);
      return NextResponse.json(est);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fatal error in POST /api/data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    if (isSupabaseConfigured && supabase) {
      try {
        const table = type === 'produto' ? 'produtos' : type === 'custo' ? 'custos' : '';
        if (table) {
          const { error } = await supabase.from(table).update(data).eq('id', data.id);
          if (error) throw error;
          return NextResponse.json({ success: true });
        }
      } catch (error: any) {
        console.error('Supabase error during PUT:', error?.message || error);
      }
    }

    const db = getDb();
    if (type === 'produto') {
      const idx = db.produtos.findIndex(p => p.id === data.id);
      if (idx !== -1) db.produtos[idx] = { ...db.produtos[idx], ...data };
    } else if (type === 'custo') {
      const idx = db.custos.findIndex(c => c.id === data.id);
      if (idx !== -1) db.custos[idx] = { ...db.custos[idx], ...data };
    }
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type, id } = await req.json();
    if (isSupabaseConfigured && supabase) {
      try {
        const table = type === 'produto' ? 'produtos' : type === 'custo' ? 'custos' : '';
        if (table) {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          return NextResponse.json({ success: true });
        }
      } catch (error: any) {
        console.error('Supabase error during DELETE:', error?.message || error);
      }
    }

    const db = getDb();
    if (type === 'produto') {
      db.produtos = db.produtos.filter(p => p.id !== id);
    } else if (type === 'custo') {
      db.custos = db.custos.filter(c => c.id !== id);
    }
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
