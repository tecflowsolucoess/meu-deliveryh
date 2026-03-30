import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

export interface Ingrediente {
  id: string;
  nome: string;
  unidade: string;
}

export interface Estoque {
  ingrediente_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
}

export interface ReceitaItem {
  ingrediente_id: string;
  quantidade: number;
}

export interface Produto {
  id: string;
  nome: string;
  custo_total: number;
  preco_ifood: number;
  preco_99food: number;
  receita: ReceitaItem[];
}

export interface Venda {
  id: string;
  produto_id: string;
  quantidade: number;
  origem: 'ifood' | '99food';
  data: string;
  valor_venda: number;
  lucro_real: number;
}

export interface CustoOperacional {
  id: string;
  tipo: string;
  nome: string;
  quantidade: number;
  valor_total: number;
  data: string;
  data_inicio: string;
  dias: number;
}

export interface Database {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  estoque: Estoque[];
  vendas: Venda[];
  custos: CustoOperacional[];
}

const initialData: Database = {
  produtos: [],
  ingredientes: [],
  estoque: [],
  vendas: [],
  custos: [],
};

export function getDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  const parsed = JSON.parse(data);
  
  return {
    produtos: parsed.produtos || [],
    ingredientes: parsed.ingredientes || [],
    estoque: parsed.estoque || [],
    vendas: parsed.vendas || [],
    custos: parsed.custos || [],
  };
}

export function saveDb(data: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
