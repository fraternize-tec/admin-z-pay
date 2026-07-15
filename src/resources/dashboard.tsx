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
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { supabase } from "../lib/supabaseClient";
import { exportarDashboardPdf } from "../export/exportarDashboardPdf";
import { useEvento } from "../context/EventoContext";
import { EventoSelector } from "../components/EventoSelector";
import { filtrarDashboardData } from "../export/filtrarDashboardData";
import { exportarDashboardCsv } from "../export/exportarDashboardCsv";
import { exportarDashboardExcel } from "../export/exportarDashboardExcel";
import ExportDialog, { ExportOptions } from "../export/ExportDialog";
import { TabelaItens } from "../dashboard/components/TabelaItens";
import { ResumoFinanceiro } from "../dashboard/components/ResumoFinanceiro";
import { CardsOperacionais } from "../dashboard/components/CardsOperacionais";
import { atalhos } from "../dashboard/constants";
import { FiltroDashboard } from "../dashboard/components/FiltroDashboard";

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
  total_cartoes: number;

  cartoes_utilizados: number;
  cartoes_disponiveis: number;

  cartoes_evento_total: number;
  cartoes_evento_utilizados: number;

  cartoes_emergenciais_total: number;
  cartoes_emergenciais_utilizados: number;
};

type TaxasStats = {
  total_taxas: number;
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
  itens_por_pdv: PDV[];
  recargas_por_caixa: Caixa[];
  recargas_por_operador: Operador[];
};


// ============================
// Cards
// ============================

const CardMetrica = ({
  titulo,
  valor,
  subtitulo,
  cor,
}: {
  titulo: string;
  valor: number | string;
  subtitulo?: string;
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
      <Typography
        variant="caption"
        sx={{
          opacity: 0.7,
          lineHeight: 1.2,
        }}
      >
        {titulo}
      </Typography>

      <Typography
        variant="h5"
        fontWeight={800}
        mt={0.5}
      >
        {typeof valor === "number"
          ? valor.toLocaleString("pt-BR")
          : valor}
      </Typography>

      {subtitulo && (
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {subtitulo}
        </Typography>
      )}
    </CardContent>
  </Card>
);

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

      <FiltroDashboard evento={eventoAtual} inicio={inicio} fim={fim} setInicio={setInicio} setFim={setFim} onAplicar={carregar} />

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
        <TabelaItens titulo="Vendas por PDV"
          grupos={
            data.itens_por_pdv.map(pdv => ({
              titulo: pdv.nome_pdv,
              total: pdv.total_vendas,
              itens: pdv.itens,
            }))
          } />
      </Box>

      <Divider sx={{ my: 4 }} />

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