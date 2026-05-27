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
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { supabase } from "../lib/supabaseClient";
import { exportarDashboardPdf } from "../export/exportarDashboardPdf";
import { useEvento } from "../context/EventoContext";
import { EventoSelector } from "../components/EventoSelector";
import { filtrarDashboardData } from "../export/filtrarDashboardData";
import { exportarDashboardCsv } from "../export/exportarDashboardCsv";
import { exportarDashboardExcel } from "../export/exportarDashboardExcel";
import ExportDialog, { ExportOptions } from "../export/ExportDialog";

// ============================
// Tipagens
// ============================
type FinanceiroResumo = {
  valor_bruto_recebido: number;
  taxas_arrecadadas: number;
  cortesias: number;
  valor_liquido_cartoes: number;
  total_consumido: number;
  devolucoes: number;
  saldo_evento: number;
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
  financeiro: FinanceiroResumo;
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
    getRange: () => {
      const now = new Date();

      const inicio = new Date(now);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date(now);
      fim.setHours(23, 59, 59, 999);

      return { inicio, fim };
    },
  },
  {
    label: "Última hora",
    getRange: () => {
      const now = new Date();

      return {
        inicio: new Date(now.getTime() - 60 * 60 * 1000),
        fim: now,
      };
    },
  },
  {
    label: "Últimas 12 horas",
    getRange: () => {
      const now = new Date();

      return {
        inicio: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        fim: now,
      };
    },
  },
  {
    label: "Últimos 7 dias",
    getRange: () => {
      const now = new Date();

      const inicio = new Date(now);
      inicio.setDate(now.getDate() - 7);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date(now);
      fim.setHours(23, 59, 59, 999);

      return { inicio, fim };
    },
  },
  {
    label: "Últimos 30 dias",
    getRange: () => {
      const now = new Date();

      const inicio = new Date(now);
      inicio.setDate(now.getDate() - 30);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date(now);
      fim.setHours(23, 59, 59, 999);

      return { inicio, fim };
    },
  },
];

const rangesIguais = (
  aInicio: Date | null,
  aFim: Date | null,
  bInicio: Date,
  bFim: Date
) => {
  if (!aInicio || !aFim) return false;

  return (
    Math.abs(aInicio.getTime() - bInicio.getTime()) < 1000 &&
    Math.abs(aFim.getTime() - bFim.getTime()) < 1000
  );
};

const CardsOperacionais = ({
  cartoes,
}: {
  cartoes: CartoesStats;
}) => {
  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: "1fr",
        sm: "repeat(2,1fr)",
        md: "repeat(3,1fr)",
      }}
      gap={2}
      mb={2}
    >
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
    </Box>
  );
};

// ============================
// Cards
// ============================

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
      borderRadius: 2,
      flex: 1,
      minWidth: {
        xs: "100%",
        sm: 200,
      },
      border: "1px solid",
      borderColor: "divider",
      position: "relative",
      overflow: "hidden",
      transition: "all .2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 2,
      },
    }}
  >
    {/* accent bar */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 4,
        height: "100%",
        bgcolor: cor,
      }}
    />

    <CardContent sx={{ py: 2, pl: 3 }}>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {titulo}
      </Typography>

      <Typography variant="h5" fontWeight={800} mt={0.5}>
        {valor.toLocaleString("pt-BR")}
      </Typography>
    </CardContent>
  </Card>
);

const ResumoFinanceiro = ({ data }: { data: FinanceiroResumo }) => {
  const theme = useTheme();

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const items = [
    {
      label: "Recebido Bruto",
      value: data.valor_bruto_recebido,
      color: theme.palette.info.main,
    },
    {
      label: "Taxas do Evento",
      value: data.taxas_arrecadadas,
      color: theme.palette.warning.main,
      oculto: data.taxas_arrecadadas === 0, // esconde se for zero
    },
    {
      label: "Cortesias",
      value: data.cortesias,
      color: theme.palette.success.main,
      oculto: data.cortesias === 0,
    },
    {
      label: "Carregado em Cartões",
      value: data.valor_liquido_cartoes,
      color: theme.palette.primary.main,
    },
    {
      label: "Consumido",
      value: data.total_consumido,
      color: theme.palette.error.main,
    },
    {
      label: "Devoluções",
      value: data.devolucoes,
      color: theme.palette.error.light,
      oculto: data.devolucoes === 0,
    },
    {
      label: "Saldo em Circulação",
      value: data.saldo_evento,
      color: theme.palette.success.main,
      destaque: true,
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        mb: 3,
        bgcolor: "background.paper", // ✅ adapta ao tema
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary" }}
        >
          Resumo Financeiro
        </Typography>

        <Box
          mt={3}
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2,1fr)",
            md: "repeat(auto-fit, minmax(180px,1fr))"
          }}
          gap={{ xs: 1.5, md: 2 }}
        >
          {items.map((item, i) => (
            !item.oculto && (
              <Box
                key={i}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all .2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2],
                  },
                  borderLeft: `3px solid ${item.color}`
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  {item.label}
                </Typography>

                <Typography
                  variant={item.destaque ? "h5" : "h6"}
                  fontWeight={800}
                  sx={{
                    color: item.color,
                    mt: 0.5,
                  }}
                >
                  {money(item.value)}
                </Typography>
              </Box>
            )
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================
// Filtro de período brasileiro
// ============================

const FiltroPeriodo = ({
  evento,
  inicio,
  fim,
  setInicio,
  setFim,
  onAplicar,
}: any) => {
  const { isAdmin } = useEvento();

  const inicioEvento = evento?.inicio
    ? new Date(evento.inicio)
    : undefined;

  const [atalhoSelecionado, setAtalhoSelecionado] =
    useState("Hoje");

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={ptBR}
    >
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            mb={2}
          >
            Período de análise
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              md: "repeat(3,minmax(0,1fr)) auto",
            }}
            gap={2}
            mb={2}
            alignItems="start"
          >
            <DateTimePicker
              label="Data inicial"
              value={inicio}
              onChange={(v) => {
                setAtalhoSelecionado("");

                if (
                  !isAdmin &&
                  inicioEvento &&
                  v &&
                  v < inicioEvento
                ) {
                  setInicio(inicioEvento);
                  return;
                }

                setInicio(v);
              }}
              minDateTime={
                !isAdmin ? inicioEvento : undefined
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    minWidth: 0,
                  },
                },
              }}
            />

            <DateTimePicker
              label="Data final"
              value={fim}
              onChange={(v) => {
                setAtalhoSelecionado("");
                setFim(v);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    minWidth: 0,
                  },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={onAplicar}
              fullWidth
              sx={{
                height: 40,
                minWidth: 0,
              }}
            >
              Aplicar
            </Button>
          </Box>

          <Box
            sx={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              pb: 1,
            }}
          >
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1}
            >
              {atalhos.map((a) => {
                const range = a.getRange();

                const ativo =
                  atalhoSelecionado === a.label ||
                  rangesIguais(
                    inicio,
                    fim,
                    range.inicio,
                    range.fim
                  );

                return (
                  <Button
                    key={a.label}
                    size="small"
                    variant={
                      ativo
                        ? "contained"
                        : "text"
                    }
                    color={
                      ativo
                        ? "primary"
                        : "inherit"
                    }
                    onClick={() => {
                      const r = a.getRange();

                      setInicio(r.inicio);
                      setFim(r.fim);
                      setAtalhoSelecionado(a.label);
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      flexShrink: 0,

                      minWidth: "unset",

                      px: 1.5,
                      py: 0.5,

                      fontSize: "0.8rem",
                      fontWeight: 600,

                      boxShadow: "none",

                      opacity: ativo ? 1 : 0.8,

                      "&:hover": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    {a.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

// ============================
// PDV → Accordion detalhado
// ============================

const TabelaPDV = ({
  data,
}: {
  data: PDV[];
}) => {
  const theme = useTheme();

  const mobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={800}
          mb={2}
        >
          Vendas por PDV
        </Typography>

        {(data ?? []).map((pdv, i) => {
          const itensAgrupados =
            Object.values(
              pdv.itens.reduce(
                (acc: any, item) => {
                  if (
                    !acc[item.item_nome]
                  ) {
                    acc[item.item_nome] =
                      [];
                  }

                  acc[
                    item.item_nome
                  ].push(item);

                  return acc;
                },
                {}
              )
            );

          return (
            <Accordion
              key={i}
              disableGutters
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon />
                }
                sx={{
                  "& .MuiAccordionSummary-content":
                  {
                    minWidth: 0,
                  },
                }}
              >
                <Box
                  display="flex"
                  flexDirection={{
                    xs: "column",
                    sm: "row",
                  }}
                  gap={1}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  width="100%"
                >
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {pdv.nome_pdv}
                  </Typography>

                  <Typography
                    fontWeight={700}
                    color="primary"
                  >
                    {money(
                      pdv.total_vendas ??
                      0
                    )}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  px: {
                    xs: 1,
                    sm: 2,
                  },
                }}
              >
                {mobile ? (
                  <Stack spacing={1.2}>
                    {itensAgrupados.map(
                      (
                        grupo: any,
                        idx
                      ) => {
                        const mudouPreco =
                          grupo.length >
                          1;

                        return grupo.map(
                          (
                            item: ItemPDV,
                            j: number
                          ) => (
                            <Card
                              key={`${idx}-${j}`}
                              variant="outlined"
                              sx={{
                                borderRadius: 1,
                              }}
                            >
                              <CardContent
                                sx={{
                                  py: 1.5,
                                  "&:last-child":
                                  {
                                    pb: 1.5,
                                  },
                                }}
                              >
                                <Stack
                                  spacing={
                                    1
                                  }
                                >
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    gap={1}
                                  >
                                    <Box
                                      minWidth={
                                        0
                                      }
                                    >
                                      <Typography
                                        fontWeight={
                                          700
                                        }
                                        sx={{
                                          wordBreak:
                                            "break-word",
                                        }}
                                      >
                                        {
                                          item.item_nome
                                        }
                                      </Typography>

                                      {mudouPreco &&
                                        j ===
                                        0 && (
                                          <Chip
                                            size="small"
                                            color="warning"
                                            label="preço alterado"
                                            sx={{
                                              mt: 0.5,
                                            }}
                                          />
                                        )}
                                    </Box>

                                    <Typography
                                      fontWeight={
                                        800
                                      }
                                    >
                                      {money(
                                        item.valor_total
                                      )}
                                    </Typography>
                                  </Box>

                                  <Box
                                    display="grid"
                                    gridTemplateColumns="repeat(2,1fr)"
                                    gap={
                                      1
                                    }
                                  >
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Preço
                                      </Typography>

                                      <Typography variant="body2">
                                        {money(
                                          item.valor_unitario
                                        )}
                                      </Typography>
                                    </Box>

                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Quantidade
                                      </Typography>

                                      <Typography variant="body2">
                                        {
                                          item.quantidade
                                        }
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          )
                        );
                      }
                    )}
                  </Stack>
                ) : (
                  <Box
  component="table"
  sx={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,

    "& thead th": {
      fontSize: 12,
      fontWeight: 700,
      color: "text.secondary",
      backgroundColor: "action.hover",
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody td": {
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody tr:last-child td": {
      borderBottom: "none",
    },

    "& tbody tr:hover": {
      backgroundColor: "action.hover",
    },
  }}
>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign:
                              "left",
                            padding: 8,
                          }}
                        >
                          Item
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                            padding: 8,
                          }}
                        >
                          Preço
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                            padding: 8,
                          }}
                        >
                          Qtd
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                            padding: 8,
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {itensAgrupados.map(
                        (
                          grupo: any,
                          idx
                        ) => {
                          const mudouPreco =
                            grupo.length >
                            1;

                          return grupo.map(
                            (
                              item: ItemPDV,
                              j: number
                            ) => (
                              <tr
                                key={`${idx}-${j}`}
                              >
                                <td
                                  style={{
                                    padding: 8,
                                  }}
                                >
                                  {j ===
                                    0 && (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={
                                          1
                                        }
                                        flexWrap="wrap"
                                      >
                                        {
                                          item.item_nome
                                        }

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

                                <td
                                  style={{
                                    padding: 8,
                                    textAlign:
                                      "right",
                                  }}
                                >
                                  {money(
                                    item.valor_unitario
                                  )}
                                </td>

                                <td
                                  style={{
                                    padding: 8,
                                    textAlign:
                                      "right",
                                  }}
                                >
                                  {
                                    item.quantidade
                                  }
                                </td>

                                <td
                                  style={{
                                    padding: 8,
                                    textAlign:
                                      "right",
                                    fontWeight: 700,
                                  }}
                                >
                                  {money(
                                    item.valor_total
                                  )}
                                </td>
                              </tr>
                            )
                          );
                        }
                      )}
                    </tbody>
                  </Box>
                )}
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

const TabelaCaixa = ({
  data,
}: {
  data: Caixa[];
}) => {
  const theme = useTheme();

  const mobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={800}
          mb={2}
        >
          Recargas por Caixa
        </Typography>

        {(data ?? []).map((cx, i) => (
          <Accordion
            key={i}
            disableGutters
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "& .MuiAccordionSummary-content": {
                  minWidth: 0,
                },
              }}
            >
              <Box
                display="flex"
                flexDirection={{
                  xs: "column",
                  sm: "row",
                }}
                gap={1}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                width="100%"
              >
                <Typography
                  fontWeight={700}
                  sx={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {cx.nome_caixa}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {cx.cartoes_utilizados ?? 0} cartões
                </Typography>

                <Typography
                  fontWeight={700}
                  color="success.main"
                >
                  {money(
                    cx.total_recargas ?? 0
                  )}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: { xs: 1, sm: 2 },
              }}
            >
              {mobile ? (
                <Stack spacing={1.2}>
                  {(cx.formas_pagamento ?? []).map(
                    (fp, idx) => (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                        }}
                      >
                        <CardContent
                          sx={{
                            py: 1.5,
                            "&:last-child": {
                              pb: 1.5,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={1}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {fp.forma}
                            </Typography>

                            <Typography
                              fontWeight={700}
                            >
                              {money(fp.total)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  )}
                </Stack>
              ) : (
                <Box
  component="table"
  sx={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,

    "& thead th": {
      fontSize: 12,
      fontWeight: 700,
      color: "text.secondary",
      backgroundColor: "action.hover",
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody td": {
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody tr:last-child td": {
      borderBottom: "none",
    },

    "& tbody tr:hover": {
      backgroundColor: "action.hover",
    },
  }}
>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: 8,
                        }}
                      >
                        Forma
                      </th>

                      <th
                        style={{
                          textAlign: "right",
                          padding: 8,
                        }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(cx.formas_pagamento ??
                      []).map((fp, idx) => (
                        <tr key={idx}>
                          <td
                            style={{
                              padding: 8,
                            }}
                          >
                            {fp.forma}
                          </td>

                          <td
                            style={{
                              padding: 8,
                              textAlign:
                                "right",
                              fontWeight: 700,
                            }}
                          >
                            {money(fp.total)}
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
};

const TabelaOperador = ({
  data,
}: {
  data: Operador[];
}) => {
  const theme = useTheme();

  const mobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={800}
          mb={2}
        >
          Recargas por Operador
        </Typography>

        {(data ?? []).map((op, i) => (
          <Accordion
            key={i}
            disableGutters
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "& .MuiAccordionSummary-content":
                {
                  minWidth: 0,
                },
              }}
            >
              <Box
                display="flex"
                flexDirection={{
                  xs: "column",
                  sm: "row",
                }}
                gap={1}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
                width="100%"
              >
                <Box minWidth={0}>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {op.operador_nome}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {op.qtd_recargas}{" "}
                    recargas •{" "}
                    {op.cartoes_utilizados ??
                      0}{" "}
                    cartões
                  </Typography>
                </Box>

                <Typography
                  fontWeight={700}
                  color="success.main"
                >
                  {money(
                    op.total_recargas
                  )}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: { xs: 1, sm: 2 },
              }}
            >
              {mobile ? (
                <Stack spacing={1.2}>
                  {(op.formas_pagamento ??
                    []).map((fp, idx) => (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                        }}
                      >
                        <CardContent
                          sx={{
                            py: 1.5,
                            "&:last-child":
                            {
                              pb: 1.5,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={1}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {fp.forma}
                            </Typography>

                            <Typography
                              fontWeight={700}
                            >
                              {money(
                                fp.total
                              )}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Stack>
              ) : (
                  <Box
  component="table"
  sx={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,

    "& thead th": {
      fontSize: 12,
      fontWeight: 700,
      color: "text.secondary",
      backgroundColor: "action.hover",
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody td": {
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody tr:last-child td": {
      borderBottom: "none",
    },

    "& tbody tr:hover": {
      backgroundColor: "action.hover",
    },
  }}
>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign:
                              "left",
                            padding: 8,
                          }}
                        >
                          Forma
                        </th>

                        <th
                          style={{
                            textAlign:
                              "right",
                            padding: 8,
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {(op.formas_pagamento ??
                        []).map(
                          (fp, idx) => (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: 8,
                                }}
                              >
                                {
                                  fp.forma
                                }
                              </td>

                              <td
                                style={{
                                  padding: 8,
                                  textAlign:
                                    "right",
                                  fontWeight: 700,
                                }}
                              >
                                {money(
                                  fp.total
                                )}
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================
// Últimas transações
// ============================

const badgeColor = (tipo: string) =>
  tipo === "recarga" ? "success" : "error";

const TabelaUltimas = ({
  data,
}: {
  data: UltimaTransacao[];
}) => {
  const theme = useTheme();

  const mobile = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={800}
          mb={2}
        >
          Movimentações Recentes
        </Typography>

        {/* MOBILE */}
        {mobile ? (
          <Stack spacing={1.5}>
            {(data ?? []).map((t, i) => (
              <Card
                key={i}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                }}
              >
                <CardContent
                  sx={{
                    "&:last-child": {
                      pb: 2,
                    },
                  }}
                >
                  <Stack spacing={1.2}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Chip
                        label={t.tipo}
                        color={badgeColor(t.tipo)}
                        size="small"
                      />

                      <Typography
                        fontWeight={800}
                        color={
                          t.valor >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {money(t.valor)}
                      </Typography>
                    </Box>

                    <Typography variant="body2">
                      <strong>PDV:</strong>{" "}
                      {t.pdv_nome ?? "—"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Caixa:</strong>{" "}
                      {t.caixa_nome ?? "—"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Operador:</strong>{" "}
                      {t.operador_nome ?? "—"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        t.criado_em
                      ).toLocaleString("pt-BR")}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          /* DESKTOP */
          <Box
  component="table"
  sx={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,

    "& thead th": {
      fontSize: 12,
      fontWeight: 700,
      color: "text.secondary",
      backgroundColor: "action.hover",
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody td": {
      borderBottom: "1px solid",
      borderColor: "divider",
    },

    "& tbody tr:last-child td": {
      borderBottom: "none",
    },

    "& tbody tr:hover": {
      backgroundColor: "action.hover",
    },
  }}
>
            <thead>
              <tr>
                <th
                  style={{
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Tipo
                </th>

                <th style={{ padding: 8 }}>
                  PDV
                </th>

                <th style={{ padding: 8 }}>
                  Caixa
                </th>

                <th style={{ padding: 8 }}>
                  Operador
                </th>

                <th style={{ padding: 8 }}>
                  Data
                </th>

                <th
                  style={{
                    padding: 8,
                    textAlign: "right",
                  }}
                >
                  Valor
                </th>
              </tr>
            </thead>

            <tbody>
              {(data ?? []).map((t, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>
                    <Chip
                      label={t.tipo}
                      color={badgeColor(t.tipo)}
                      size="small"
                    />
                  </td>

                  <td style={{ padding: 8 }}>
                    {t.pdv_nome ?? "—"}
                  </td>

                  <td style={{ padding: 8 }}>
                    {t.caixa_nome ?? "—"}
                  </td>

                  <td style={{ padding: 8 }}>
                    {t.operador_nome ?? "—"}
                  </td>

                  <td style={{ padding: 8 }}>
                    {new Date(
                      t.criado_em
                    ).toLocaleString("pt-BR")}
                  </td>

                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    {money(t.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ============================
// Página principal
// ============================

export const DashboardFinanceiroEvento = () => {
  const { eventoAtual } = useEvento();
  const [data, setData] = useState<DashboardData | null>(null);

  const now = new Date();

  const rangeInicial = atalhos[0].getRange();

  const [inicio, setInicio] = useState<Date | null>(
    rangeInicial.inicio
  );

  const [fim, setFim] = useState<Date | null>(
    rangeInicial.fim
  );

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const carregar = async () => {
    if (!inicio || !fim) return;
    if (!eventoAtual) return null;

    const { data } = await supabase.rpc("rpc_dashboard_evento", {
      p_evento: eventoAtual.id,
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
  }, [eventoAtual?.id, inicio, fim]);


  if (!data)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      p={{ xs: 1.5, md: 3 }}
      minHeight="100vh"
      width="100%"
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={2}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{
            fontSize: {
              xs: "1.4rem",
              md: "2rem",
            }
          }}
        >
          Relatório Financeiro
        </Typography>

        <Button
          variant="outlined"
          sx={{
            width: { xs: "100%", sm: "auto" }
          }}
          onClick={() => setExportDialogOpen(true)}
        >
          Exportar
        </Button>
      </Box>

      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Evento
            </Typography>

            <EventoSelector />
          </Stack>
        </CardContent>
      </Card>

      <FiltroPeriodo evento={eventoAtual} inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onAplicar={carregar} />

      <ResumoFinanceiro data={data.financeiro} />

      <Box mb={3}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ mb: 1, opacity: 0.7 }}
        >
          Indicadores Operacionais
        </Typography>

        <CardsOperacionais cartoes={data.cartoes} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box display="flex" flexDirection="column" gap={4}>
        <TabelaCaixa data={data.recargas_por_caixa} />
        <TabelaOperador data={data.recargas_por_operador} />
        <TabelaPDV data={data.itens_por_pdv} />
      </Box>

      <Divider sx={{ my: 4 }} />

      <TabelaUltimas data={data.ultimas_transacoes} />

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        data={data}
        onExport={async (options: ExportOptions) => {
          const filtered = filtrarDashboardData(data, options);

          if (options.format === "pdf") {
            await exportarDashboardPdf(
              filtered,
              inicio!,
              fim!,
              eventoAtual?.nome ?? ""
            );
          }

          if (options.format === "csv") {
            await exportarDashboardCsv(
              filtered,
              eventoAtual?.nome ?? ""
            );
          }

          if (options.format === "xlsx") {
            await exportarDashboardExcel(
              filtered,
              eventoAtual?.nome ?? ""
            );
          }
        }}
      />
    </Box>
  );
};