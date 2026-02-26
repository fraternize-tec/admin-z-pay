import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { supabase } from "../lib/supabaseClient";
import { exportarDashboardPdf } from "./exportarDashboardPdf";

// ============================
// Tipagens
// ============================

type Cards = {
  total_recargas: number;
  total_consumos: number;
  saldo: number;
};

type CartoesStats = {
  total_cartoes_utilizados: number;
  cartoes_evento: number;
  cartoes_emergenciais: number;
};

type TaxasStats = {
  total_taxas: number;
};

type UltimaTransacao = {
  tipo: string;
  criado_em: string;
  valor: number;
  pdv_nome?: string;
  caixa_nome?: string;
  operador_nome?: string;
};

type ItemPDV = {
  item_nome: string;
  valor_unitario: number;
  quantidade: number;
  valor_total: number;
};

type PDV = {
  nome_pdv: string;
  total_vendas?: number;
  itens: ItemPDV[];
};

type FormaPagamento = {
  forma: string;
  total: number;
};

type Caixa = {
  nome_caixa: string;
  total_recargas?: number;
  total_taxas?: number;        // novo
  cartoes_utilizados?: number; // novo
  formas_pagamento: FormaPagamento[];
};

type Operador = {
  operador_nome: string;
  total_recargas: number;
  qtd_recargas: number;
  total_taxas?: number;
  cartoes_utilizados?: number;
  formas_pagamento: {
    forma: string;
    total: number;
  }[];
};

type DashboardData = {
  cards: Cards;
  cartoes: CartoesStats;
  taxas: TaxasStats;
  ultimas_transacoes: UltimaTransacao[];
  itens_por_pdv: PDV[];
  recargas_por_caixa: Caixa[];
  recargas_por_operador: Operador[];
};


const atalhos = [
  {
    label: "Hoje",
    getRange: () => ({
      inicio: startOfDay(new Date()),
      fim: endOfDay(new Date()),
    }),
  },
  {
    label: "Ontem",
    getRange: () => {
      const d = subDays(new Date(), 1);
      return { inicio: startOfDay(d), fim: endOfDay(d) };
    },
  },
  {
    label: "Últimos 7 dias",
    getRange: () => ({
      inicio: startOfDay(subDays(new Date(), 6)),
      fim: endOfDay(new Date()),
    }),
  },
  {
    label: "Últimos 30 dias",
    getRange: () => ({
      inicio: startOfDay(subDays(new Date(), 29)),
      fim: endOfDay(new Date()),
    }),
  },
];

const CardsOperacionais = ({
  cartoes,
  taxas,
}: {
  cartoes: CartoesStats;
  taxas: TaxasStats;
}) => {
  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const possuiTaxa = (taxas?.total_taxas ?? 0) > 0;

  return (
    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
      <CardMetrica
        titulo="Cartões Utilizados"
        valor={cartoes.total_cartoes_utilizados}
        cor="#6a1b9a"
      />

      <CardMetrica
        titulo="Cartões do Evento"
        valor={cartoes.cartoes_evento}
        cor="#00838f"
      />

      <CardMetrica
        titulo="Cartões Emergenciais"
        valor={cartoes.cartoes_emergenciais}
        cor="#ef6c00"
      />

      {possuiTaxa && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 1,
            flex: 1,
            minWidth: 200,
            borderTop: "3px solid #c62828",
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Taxas Arrecadadas
            </Typography>

            <Typography variant="h5" fontWeight={700} mt={0.5}>
              {money(taxas.total_taxas)}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// ============================
// Cards
// ============================

const CardFinanceiro = ({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) => (
  <Card sx={{ borderRadius: 4, boxShadow: 2, flex: 1, minWidth: 240, borderTop: `4px solid ${cor}` }}>
    <CardContent>
      <Typography variant="overline" sx={{ opacity: 0.7 }}>
        {titulo}
      </Typography>
      <Typography variant="h4" fontWeight={800} mt={1}>
        {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </Typography>
    </CardContent>
  </Card>
);

const CardMetrica = ({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: number;
  cor: string;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 1,
      flex: 1,
      minWidth: 200,
      borderTop: `3px solid ${cor}`,
    }}
  >
    <CardContent sx={{ py: 2 }}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {titulo}
      </Typography>

      <Typography variant="h5" fontWeight={700} mt={0.5}>
        {valor.toLocaleString("pt-BR")}
      </Typography>
    </CardContent>
  </Card>
);

const CardsResumo = ({ data }: { data: Cards }) => (
  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
    <CardFinanceiro titulo="Recargas" valor={data.total_recargas} cor="#00c853" />
    <CardFinanceiro titulo="Consumos" valor={data.total_consumos} cor="#ff1744" />
    <CardFinanceiro titulo="Saldo" valor={data.saldo} cor="#2979ff" />
  </Box>
);

// ============================
// Filtro de período brasileiro
// ============================

const FiltroPeriodo = ({ inicio, fim, setInicio, setFim, onAplicar }: any) => (
  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
    <Card sx={{ mb: 3, borderRadius: 4, boxShadow: 1 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} mb={2}>
          Período de análise
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" mb={2}>
          <DateTimePicker
            label="Data inicial"
            value={inicio}
            onChange={(v) => setInicio(v)}
            slotProps={{ textField: { size: "small" } }}
          />

          <DateTimePicker
            label="Data final"
            value={fim}
            onChange={(v) => setFim(v)}
            slotProps={{ textField: { size: "small" } }}
          />

          <Button variant="contained" onClick={onAplicar} sx={{ height: 40 }}>
            Aplicar
          </Button>
        </Stack>

        {/* Atalhos rápidos */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {atalhos.map((a) => (
            <Button
              key={a.label}
              size="small"
              variant="outlined"
              onClick={() => {
                const r = a.getRange();
                setInicio(r.inicio);
                setFim(r.fim);
              }}
            >
              {a.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  </LocalizationProvider>
);

// ============================
// PDV → Accordion detalhado
// ============================

const TabelaPDV = ({ data }: { data: PDV[] }) => {
  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Vendas por PDV
        </Typography>

        {(data ?? []).map((pdv, i) => {
          // agrupa por nome do item
          const itensAgrupados = Object.values(
            pdv.itens.reduce((acc: any, item) => {
              if (!acc[item.item_nome]) acc[item.item_nome] = [];
              acc[item.item_nome].push(item);
              return acc;
            }, {})
          );

          return (
            <Accordion key={i} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Typography fontWeight={700}>
                    {pdv.nome_pdv}
                  </Typography>

                  <Typography fontWeight={700} color="primary">
                    {money(pdv.total_vendas ?? 0)}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box component="table" width="100%">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 6 }}>
                        Item
                      </th>
                      <th style={{ textAlign: "right", padding: 6 }}>
                        Preço
                      </th>
                      <th style={{ textAlign: "right", padding: 6 }}>
                        Qtd
                      </th>
                      <th style={{ textAlign: "right", padding: 6 }}>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {itensAgrupados.map((grupo: any, idx) => {
                      const mudouPreco = grupo.length > 1;

                      return grupo.map((item: ItemPDV, j: number) => (
                        <tr key={`${idx}-${j}`}>
                          <td style={{ padding: 6 }}>
                            {j === 0 && (
                              <Box display="flex" alignItems="center" gap={1}>
                                {item.item_nome}

                                {mudouPreco && (
                                  <Chip
                                    size="small"
                                    color="warning"
                                    label="preço alterado"
                                  />
                                )}
                              </Box>
                            )}
                          </td>

                          <td style={{ padding: 6, textAlign: "right" }}>
                            {money(item.valor_unitario)}
                          </td>

                          <td style={{ padding: 6, textAlign: "right" }}>
                            {item.quantidade}
                          </td>

                          <td style={{ padding: 6, textAlign: "right" }}>
                            {money(item.valor_total)}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ============================
// Caixa → Accordion detalhado
// ============================

const TabelaCaixa = ({ data }: { data: Caixa[] }) => (
  <Card sx={{ borderRadius: 4, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={800} mb={2}>
        Recargas por Caixa
      </Typography>

      {(data ?? []).map((cx, i) => (
        <Accordion key={i} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Typography fontWeight={700}>{cx.nome_caixa}</Typography>
              <Typography variant="caption" color="text.secondary">
                {cx.cartoes_utilizados ?? 0} cartões 
                {(cx.total_taxas ?? 0) > 0 && (
                  <>
                    •{" "}
                    {(cx.total_taxas ?? 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })} em taxas
                  </>
                )}
              </Typography>
              <Typography fontWeight={700} color="success.main">
                {(cx.total_recargas ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Forma</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(cx.formas_pagamento ?? []).map((fp, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 6 }}>{fp.forma}</td>
                    <td style={{ padding: 6, textAlign: "right" }}>
                      {fp.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </CardContent>
  </Card>
);

const TabelaOperador = ({ data }: { data: Operador[] }) => (
  <Card sx={{ borderRadius: 4, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={800} mb={2}>
        Recargas por Operador
      </Typography>

      {(data ?? []).map((op, i) => (
        <Accordion key={i} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box>
                <Typography fontWeight={700}>
                  {op.operador_nome}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {op.qtd_recargas} recargas • {op.cartoes_utilizados ?? 0} cartões 
                  {(op.total_taxas ?? 0) > 0 && (
                    <>
                      •{" "}
                      {(op.total_taxas ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })} em taxas
                    </>
                  )}
                </Typography>
              </Box>

              <Typography fontWeight={700} color="success.main">
                {op.total_recargas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box component="table" width="100%">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Forma</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(op.formas_pagamento ?? []).map((fp, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 6 }}>{fp.forma}</td>
                    <td style={{ padding: 6, textAlign: "right" }}>
                      {fp.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </CardContent>
  </Card>
);

// ============================
// Últimas transações
// ============================

const badgeColor = (tipo: string) => (tipo === "recarga" ? "success" : "error");

const TabelaUltimas = ({ data }: { data: UltimaTransacao[] }) => (
  <Card sx={{ borderRadius: 4, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={800} mb={2}>
        Movimentações Recentes
      </Typography>

      <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: 8, textAlign: "left" }}>Tipo</th>
            <th style={{ padding: 8 }}>PDV</th>
            <th style={{ padding: 8 }}>Caixa</th>
            <th style={{ padding: 8 }}>Operador</th>
            <th style={{ padding: 8 }}>Data</th>
            <th style={{ padding: 8, textAlign: "right" }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((t, i) => (
            <tr key={i}>
              <td style={{ padding: 8 }}>
                <Chip label={t.tipo} color={badgeColor(t.tipo)} size="small" />
              </td>
              <td style={{ padding: 8 }}>{t.pdv_nome ?? "—"}</td>
              <td style={{ padding: 8 }}>{t.caixa_nome ?? "—"}</td>
              <td style={{ padding: 8 }}>{t.operador_nome ?? "—"}</td>
              <td style={{ padding: 8 }}>{new Date(t.criado_em).toLocaleString("pt-BR")}</td>
              <td style={{ padding: 8, textAlign: "right", fontWeight: 800 }}>
                {t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </CardContent>
  </Card>
);

// ============================
// Página principal
// ============================

export const DashboardFinanceiroEvento = ({ eventoId }: { eventoId: string }) => {
  const [data, setData] = useState<DashboardData | null>(null);

  const [inicio, setInicio] = useState<Date | null>(startOfDay(new Date()));
  const [fim, setFim] = useState<Date | null>(endOfDay(new Date()));

  const carregar = async () => {
    if (!inicio || !fim) return;

    const { data } = await supabase.rpc("rpc_dashboard_evento", {
      p_evento: eventoId,
      p_inicio: inicio.toISOString(),
      p_fim: fim.toISOString(),
    });

    setData(data);
  };

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("dashboard-financeiro")
      .on("postgres_changes", { event: "*", schema: "public", table: "recargas" }, carregar)
      .on("postgres_changes", { event: "*", schema: "public", table: "consumos" }, carregar)
      .on("postgres_changes", { event: "*", schema: "public", table: "cancelamentos" }, carregar)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, inicio, fim]);

  if (!data)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3} minHeight="100vh">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={900}>
          Relatório Financeiro do Evento
        </Typography>

        <Button
          variant="outlined"
          onClick={() =>
            exportarDashboardPdf(data, inicio!, fim!)
          }
        >
          Exportar PDF
        </Button>
      </Box>

      <FiltroPeriodo inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onAplicar={carregar} />

      <CardsResumo data={data.cards} />

      <Typography
        variant="overline"
        sx={{ opacity: 0.6, ml: 1 }}
      >
        Indicadores Operacionais
      </Typography>

      <CardsOperacionais
        cartoes={data.cartoes}
        taxas={data.taxas}
      />

      <Divider sx={{ my: 4 }} />

      <Box display="flex" flexDirection="column" gap={4}>
        <TabelaCaixa data={data.recargas_por_caixa} />
        <TabelaOperador data={data.recargas_por_operador} />
        <TabelaPDV data={data.itens_por_pdv} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <TabelaUltimas data={data.ultimas_transacoes} />
    </Box>
  );
};
