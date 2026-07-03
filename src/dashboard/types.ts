// dashboard/types.ts

export interface FinanceiroResumo {
    valor_bruto_recebido: number;
    taxas_arrecadadas: number;
    cortesias: number;
    valor_liquido_cartoes: number;
    total_consumido: number;
    devolucoes: number;
    saldo_evento: number;
}

export interface CartoesStats {
    total_cartoes: number;

    cartoes_utilizados: number;
    cartoes_disponiveis: number;

    cartoes_evento_total: number;
    cartoes_evento_utilizados: number;

    cartoes_emergenciais_total: number;
    cartoes_emergenciais_utilizados: number;
}

export interface TaxasStats {
    total_taxas: number;
}

export interface ItemResumo {
    item_nome: string;
    valor_unitario: number;
    quantidade: number;
    valor_total: number;
}

export interface ItemOperadorResumo {
    item_nome: string;
    quantidade: number;
    valor_total: number;
}

export interface FormaPagamentoResumo {
    forma: string;
    total: number;
}

export interface OperadorResumo {
    operador_nome: string;

    total_recargas?: number;
    qtd_recargas?: number;

    valor_total?: number;
    qtd_vendas?: number;

    total_taxas?: number;
    cartoes_utilizados?: number;
    itens_vendidos?: number;

    formas_pagamento?: FormaPagamentoResumo[];

    itens?: ItemOperadorResumo[];
}

export interface CaixaResumo {
    nome_caixa: string;

    total_recargas?: number;
    total_taxas?: number;

    cartoes_utilizados?: number;

    formas_pagamento: FormaPagamentoResumo[];
}

export interface PdvResumo {
    nome_pdv: string;

    total_vendas?: number;

    itens: ItemResumo[];
}

export interface DashboardEvento {

    financeiro: FinanceiroResumo;

    cartoes: CartoesStats;

    taxas: TaxasStats;

    itens_por_pdv: PdvResumo[];

    recargas_por_caixa: CaixaResumo[];

    recargas_por_operador: OperadorResumo[];

}

export interface DashboardPdv {

    resumo: {

        valor_vendido: number;

        quantidade_vendas: number;

        ticket_medio: number;

        itens_vendidos: number;

        operadores: number;

    };

    itens: ItemResumo[];

    operadores: OperadorResumo[];

    vendas_por_hora?: {

        hora: string;

        total: number;

    }[];

}

