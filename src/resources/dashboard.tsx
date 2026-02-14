import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabase } from "../lib/supabaseClient";

// ============================
// Tipagens alinhadas com a RPC v3
// ============================

type Cards = {
  total_recargas: number;
  total_consumos: number;
  saldo: number;
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
  quantidade: number;
  valor_total?: number;
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
  formas_pagamento: FormaPagamento[];
};

type DashboardData = {
  cards: Cards;
  ultimas_transacoes: UltimaTransacao[];
  itens_por_pdv: PDV[];
  recargas_por_caixa: Caixa[];
};

// ============================
// Cards financeiros (neutros ao tema)
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

const CardsResumo = ({ data }: { data: Cards }) => (
  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
    <CardFinanceiro titulo="Recargas" valor={data.total_recargas} cor="#00c853" />
    <CardFinanceiro titulo="Consumos" valor={data.total_consumos} cor="#ff1744" />
    <CardFinanceiro titulo="Saldo" valor={data.saldo} cor="#2979ff" />
  </Box>
);

// ============================
// PDV → Accordion detalhado
// ============================

const TabelaPDV = ({ data }: { data: PDV[] }) => (
  <Card sx={{ borderRadius: 4, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={800} mb={2}>
        Vendas por PDV
      </Typography>

      {(data ?? []).map((pdv, i) => (
        <Accordion key={i} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Typography fontWeight={700}>{pdv.nome_pdv}</Typography>
              <Typography fontWeight={700} color="primary">
                {(pdv.total_vendas ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            {!pdv.itens?.length && (
              <Typography variant="body2" color="text.secondary">
                Nenhum item vendido no período
              </Typography>
            )}

            {!!pdv.itens?.length && (
              <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 6 }}>Item</th>
                    <th style={{ textAlign: "right", padding: 6 }}>Qtd</th>
                    <th style={{ textAlign: "right", padding: 6 }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {pdv.itens.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 6 }}>{item.item_nome}</td>
                      <td style={{ padding: 6, textAlign: "right" }}>{item.quantidade}</td>
                      <td style={{ padding: 6, textAlign: "right" }}>
                        {(item.valor_total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </CardContent>
  </Card>
);

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
// Filtro de período
// ============================

const FiltroPeriodo = ({ inicio, fim, setInicio, setFim, onAplicar }: any) => (
  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
    <TextField type="datetime-local" label="Início" value={inicio} onChange={(e) => setInicio(e.target.value)} InputLabelProps={{ shrink: true }} />
    <TextField type="datetime-local" label="Fim" value={fim} onChange={(e) => setFim(e.target.value)} InputLabelProps={{ shrink: true }} />
    <Button variant="contained" onClick={onAplicar}>Aplicar</Button>
  </Box>
);

// ============================
// Página principal
// ============================

export const DashboardFinanceiroEvento = ({ eventoId }: { eventoId: string }) => {
  const [data, setData] = useState<DashboardData | null>(null);

  const [inicio, setInicio] = useState(new Date(Date.now() - 86400000).toISOString().slice(0, 16));
  const [fim, setFim] = useState(new Date().toISOString().slice(0, 16));

  const carregar = async () => {
    const { data } = await supabase.rpc("rpc_dashboard_evento", {
      p_evento: eventoId,
      p_inicio: new Date(inicio).toISOString(),
      p_fim: new Date(fim).toISOString(),
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
  }, [eventoId]);

  if (!data)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3} minHeight="100vh">
      <Typography variant="h5" fontWeight={900} mb={2}>
        Relatório Financeiro do Evento
      </Typography>

      <FiltroPeriodo inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onAplicar={carregar} />

      <CardsResumo data={data.cards} />

      <Divider sx={{ my: 4 }} />

      <Box display="flex" flexDirection="column" gap={4}>
        <TabelaCaixa data={data.recargas_por_caixa} />
        <TabelaPDV data={data.itens_por_pdv} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <TabelaUltimas data={data.ultimas_transacoes} />
    </Box>
  );
};
