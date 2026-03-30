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
  descricao: string;
  valor_total: number;
  data: string;
  data_inicio: string;
  dias: number;
}

export interface Db {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  estoque: Estoque[];
  vendas: Venda[];
  custos: CustoOperacional[];
  supabaseStatus?: 'connected' | 'error' | 'not_configured';
}
