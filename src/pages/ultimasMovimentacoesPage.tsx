import { Box, Typography, Card, CardContent, Stack, CircularProgress, useMediaQuery, Chip, useTheme, Grid, Autocomplete, TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { EventoSelector } from "../components/EventoSelector";
import { useEvento } from "../context/EventoContext";
import { supabase } from "../lib/supabaseClient";
import { atalhos } from "../dashboard/constants";
import { exportarMovimentacoesPdf } from "../export/exportarMovimentacoesPdf";
import { exportarMovimentacoesCsv } from "../export/exportarMovimentacoesCsv";
import { exportarMovimentacoesExcel } from "../export/exportarMovimentacoesExcel";
import ExportMovimentacoesDialog, { ExportMovimentacoesOptions } from "../export/exportMovimentacoesDialog";
import { FiltroDashboard } from "../dashboard/components/FiltroDashboard";

type Movimentacao = {
  id: string;
  tipo: "recarga" | "consumo" | "devolucao" | "reset";

  criado_em: string;

  valor: number;

  codigo_cartao?: string;
  tipo_cartao?: string;

  pdv_nome?: string;
  caixa_nome?: string;
  operador_nome?: string;

  forma_pagamento?: string;
};

type OpcaoFiltro = {
  id: string;
  nome: string;
};

type FiltrosMovimentacao = {
  tipos: OpcaoFiltro[];
  formas_pagamento: OpcaoFiltro[];
  pdvs: OpcaoFiltro[];
  caixas: OpcaoFiltro[];
  operadores: OpcaoFiltro[];
};

type BuscaMovimentacoes = {
  inicio: Date | null;
  fim: Date | null;

  tipo: OpcaoFiltro | null;
  formaPagamento: OpcaoFiltro | null;
  pdv: OpcaoFiltro | null;
  caixa: OpcaoFiltro | null;
  operador: OpcaoFiltro | null;
};

// ============================================
// Página
// ============================================

export const UltimasMovimentacoesPage = () => {
  const { eventoAtual } = useEvento();

  const [loading, setLoading] = useState(false);

  const [movimentacoes, setMovimentacoes] = useState<
    Movimentacao[]
  >([]);

  const [filtros, setFiltros] =
    useState<FiltrosMovimentacao>({
      tipos: [],
      formas_pagamento: [],
      pdvs: [],
      caixas: [],
      operadores: [],
    });

  const rangeInicial = atalhos[0].getRange();

  const [filtrosPendentes, setFiltrosPendentes] =
    useState<BuscaMovimentacoes>({
      inicio: rangeInicial.inicio,
      fim: rangeInicial.fim,

      tipo: null,
      formaPagamento: null,
      pdv: null,
      caixa: null,
      operador: null,
    });

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<BuscaMovimentacoes>({
      inicio: rangeInicial.inicio,
      fim: rangeInicial.fim,

      tipo: null,
      formaPagamento: null,
      pdv: null,
      caixa: null,
      operador: null,
    });

  useEffect(() => {
    carregarFiltros();
  }, [eventoAtual?.id]);

  const carregarFiltros = async (
    busca: BuscaMovimentacoes = filtrosPendentes
  ) => {
    if (!eventoAtual) return;

    const { data } = await supabase.rpc(
      "rpc_dashboard_ultimas_movimentacoes_filtros",
      {
        p_evento: eventoAtual.id,
        p_tipo: busca.tipo?.id ?? null,
        p_forma_pagamento:
          busca.formaPagamento?.id ?? null,
        p_pdv: busca.pdv?.id ?? null,
        p_caixa: busca.caixa?.id ?? null,
      }
    );

    if (data) {
      setFiltros(data);
    }
  };

  const [exportDialogOpen, setExportDialogOpen] =
    useState(false);

  const buscarMovimentacoes = async (
    limite?: number | null
  ) => {
    if (!eventoAtual) return [];

    if (
      !filtrosAplicados.inicio ||
      !filtrosAplicados.fim
    ) {
      return [];
    }

    const { data, error } = await supabase.rpc(
      "rpc_dashboard_ultimas_movimentacoes_v2",
      {
        p_evento: eventoAtual.id,
        p_inicio: filtrosAplicados.inicio.toISOString(),
        p_fim: filtrosAplicados.fim.toISOString(),
        p_tipo: filtrosAplicados.tipo?.id ?? null,
        p_forma_pagamento:
          filtrosAplicados.formaPagamento?.id ?? null,
        p_pdv:
          filtrosAplicados.pdv?.id ?? null,
        p_caixa:
          filtrosAplicados.caixa?.id ?? null,
        p_operador:
          filtrosAplicados.operador?.id ?? null,
        p_limite: limite,
      }
    );

    if (error) {
      throw error;
    }

    return data ?? [];
  };

  const carregar = async () => {
    setLoading(true);

    try {
      setMovimentacoes(
        await buscarMovimentacoes(200)
      );
    } finally {
      setLoading(false);
    }
  };

  const carregarTodasMovimentacoes = () =>
    buscarMovimentacoes(null);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("ultimas-movimentacoes")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recargas",
        },
        carregar
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consumos",
        },
        carregar
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "devolucoes",
        },
        carregar
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cartao_resets",
        },
        carregar
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cancelamentos",
        },
        carregar
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    eventoAtual?.id,
    filtrosAplicados
  ]);


  return (
    <Box
      p={{ xs: 1.5, md: 3 }}
      minHeight="100vh"
    >
      <Box
        display="flex"
        flexDirection={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        gap={2}
        mb={2}
      >
        <Typography
          variant="h5"
          fontWeight={900}
        >
          Últimas Movimentações
        </Typography>

        <Button
          variant="outlined"
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
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Evento
            </Typography>

            <EventoSelector />
          </Stack>
        </CardContent>
      </Card>

      <FiltroDashboard
        evento={eventoAtual}
        inicio={filtrosPendentes.inicio}
        fim={filtrosPendentes.fim}
        setInicio={(inicio: any) =>
          setFiltrosPendentes((old) => ({
            ...old,
            inicio,
          }))
        }
        setFim={(fim: any) =>
          setFiltrosPendentes((old) => ({
            ...old,
            fim,
          }))
        }
        onAplicar={() =>
          setFiltrosAplicados(
            filtrosPendentes
          )
        }
        actions={
          <Button
            color="inherit"
            onClick={() => {
              const novo = {
              ...filtrosPendentes,

              tipo: null,
              formaPagamento: null,
              pdv: null,
              caixa: null,
              operador: null,
            };

              setFiltrosPendentes(novo);

              carregarFiltros(novo);
            }}
          >
            Limpar filtros
          </Button>
        }
        filters={
          <Grid container spacing={2}>

            {/* Tipo */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                options={filtros.tipos}
                value={filtrosPendentes.tipo}

                onChange={(_, v) => {

                  const novo = {
                    ...filtrosPendentes,

                    tipo: v,

                    formaPagamento:
                      v?.id === "recarga"
                        ? filtrosPendentes.formaPagamento
                        : null,

                    pdv:
                      v?.id === "consumo"
                        ? filtrosPendentes.pdv
                        : null,

                    caixa:
                      v?.id === "recarga" ||
                        v?.id === "devolucao"
                        ? filtrosPendentes.caixa
                        : null,

                    operador: null,
                  };

                  setFiltrosPendentes(novo);

                  carregarFiltros(novo);
                }}
                getOptionLabel={(o) => o.nome}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo"
                  />
                )}
              />
            </Grid>

            {/* Forma de pagamento */}
            {(!filtrosPendentes.tipo || filtrosPendentes.tipo.id === "recarga") && (
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  options={filtros.formas_pagamento}
                  value={filtrosPendentes.formaPagamento}
                  onChange={(_, v) => {

                    const novo = {
                      ...filtrosPendentes,
                      formaPagamento: v,
                      operador: null,
                    };

                    setFiltrosPendentes(novo);

                    carregarFiltros(novo);
                  }}
                  getOptionLabel={(o) => o.nome}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Forma de pagamento"
                    />
                  )}
                />
              </Grid>
            )}

            {/* PDV */}
            {(!filtrosPendentes.tipo ||
              filtrosPendentes.tipo.id === "consumo") && (
                <Grid size={{ xs: 12, md: 3 }}>
                  <Autocomplete
                    options={filtros.pdvs}
                    value={filtrosPendentes.pdv}
                    onChange={(_, v) => {

                      const novo = {
                        ...filtrosPendentes,
                        pdv: v,
                        operador: null,
                      };

                      setFiltrosPendentes(novo);

                      carregarFiltros(novo);
                    }}
                    getOptionLabel={(o) => o.nome}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="PDV"
                      />
                    )}
                  />
                </Grid>
              )}

            {/* Caixa */}
            {(!filtrosPendentes.tipo ||
              filtrosPendentes.tipo.id === "recarga" ||
              filtrosPendentes.tipo.id === "devolucao") && (
                <Grid size={{ xs: 12, md: 3 }}>
                  <Autocomplete
                    options={filtros.caixas}
                    value={filtrosPendentes.caixa}
                    onChange={(_, v) => {

                      const novo = {
                        ...filtrosPendentes,
                        caixa: v,
                        operador: null,
                      };

                      setFiltrosPendentes(novo);

                      carregarFiltros(novo);
                    }}
                    getOptionLabel={(o) => o.nome}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Caixa"
                      />
                    )}
                  />
                </Grid>
              )}

            {/* Operador */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                options={filtros.operadores}
                value={filtrosPendentes.operador}
                onChange={(_, v) => setFiltrosPendentes((old) => ({ ...old, operador: v }))}
                getOptionLabel={(o) => o.nome}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Operador"
                  />
                )}
              />
            </Grid>

          </Grid>
        }
      />

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          mt={10}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TabelaMovimentacoes
          data={movimentacoes}
        />
      )}
      <ExportMovimentacoesDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={async (
          options: ExportMovimentacoesOptions
        ) => {

          const movimentacoes =
            await carregarTodasMovimentacoes();

          if (!movimentacoes.length) {
            return;
          }

          switch (options.format) {

            case "pdf":
              await exportarMovimentacoesPdf(
                movimentacoes,
                filtrosAplicados.inicio!,
                filtrosAplicados.fim!,
                eventoAtual?.nome ?? "",
                {
                  tipo:
                    filtrosAplicados.tipo?.nome,

                  operador:
                    filtrosAplicados.operador?.nome,

                  caixa:
                    filtrosAplicados.caixa?.nome,

                  pdv:
                    filtrosAplicados.pdv?.nome,

                  formaPagamento:
                    filtrosAplicados.formaPagamento?.nome,
                }
              );
              break;

            case "csv":
              await exportarMovimentacoesCsv(
                movimentacoes,
                eventoAtual?.nome ?? ""
              );
              break;

            case "xlsx":
              await exportarMovimentacoesExcel(
                movimentacoes,
                eventoAtual?.nome ?? ""
              );
              break;
          }
        }}
      />
    </Box>

  );
};


// ============================================
// Tabela
// ============================================

const corChip = (
  tipo: Movimentacao["tipo"]
) => {
  switch (tipo) {
    case "recarga":
      return "success";

    case "consumo":
      return "error";

    case "devolucao":
      return "warning";

    case "reset":
      return "secondary";

    default:
      return "default";
  }
};

const labelTipo = (
  tipo: Movimentacao["tipo"]
) => {
  switch (tipo) {
    case "recarga":
      return "Recarga";

    case "consumo":
      return "Consumo";

    case "devolucao":
      return "Devolução";

    case "reset":
      return "Reset";

    default:
      return tipo;
  }
};

const TabelaMovimentacoes = ({
  data,
}: {
  data: Movimentacao[];
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

  if (mobile) {
    return (
      <Stack spacing={1.5}>
        {(data ?? []).map((m) => (
          <Card
            key={`${m.tipo}-${m.id}`}
            variant="outlined"
            sx={{
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Stack spacing={1.2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                  flexWrap="wrap"
                >
                  <Chip
                    label={labelTipo(m.tipo)}
                    color={corChip(m.tipo)}
                    size="small"
                  />

                  <Typography
                    fontWeight={800}
                    color={
                      m.valor >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {money(m.valor)}
                  </Typography>
                </Box>

                <Typography variant="body2">
                  <strong>Cartão:</strong>{" "}
                  {m.codigo_cartao ?? "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>Forma:</strong>{" "}
                  {m.forma_pagamento ?? "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>PDV:</strong>{" "}
                  {m.pdv_nome ?? "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>Caixa:</strong>{" "}
                  {m.caixa_nome ?? "—"}
                </Typography>

                <Typography variant="body2">
                  <strong>Operador:</strong>{" "}
                  {m.operador_nome ?? "—"}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {new Date(
                    m.criado_em
                  ).toLocaleString("pt-BR")}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={800}
          mb={2}
        >
          Movimentações
        </Typography>

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
                Cartão
              </th>

              <th style={{ padding: 8 }}>
                Forma
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
            {(data ?? []).map((m) => (
              <tr
                key={`${m.tipo}-${m.id}`}
              >
                <td style={{ padding: 8 }}>
                  <Chip
                    label={labelTipo(m.tipo)}
                    color={corChip(m.tipo)}
                    size="small"
                  />
                </td>

                <td style={{ padding: 8 }}>
                  <Stack spacing={0.3}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {m.codigo_cartao ??
                        "—"}
                    </Typography>
                  </Stack>
                </td>

                <td style={{ padding: 8 }}>
                  {m.forma_pagamento ??
                    "—"}
                </td>

                <td style={{ padding: 8 }}>
                  {m.pdv_nome ?? "—"}
                </td>

                <td style={{ padding: 8 }}>
                  {m.caixa_nome ?? "—"}
                </td>

                <td style={{ padding: 8 }}>
                  {m.operador_nome ?? "—"}
                </td>

                <td style={{ padding: 8 }}>
                  {new Date(
                    m.criado_em
                  ).toLocaleString("pt-BR")}
                </td>

                <td
                  style={{
                    padding: 8,
                    textAlign: "right",
                    fontWeight: 800,
                    color:
                      m.valor >= 0
                        ? theme.palette
                          .success.main
                        : theme.palette
                          .error.main,
                  }}
                >
                  {money(m.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </CardContent>
    </Card>

  );
};
