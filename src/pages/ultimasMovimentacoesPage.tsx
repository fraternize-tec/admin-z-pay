import { Box, Typography, Card, CardContent, Stack, CircularProgress, useMediaQuery, Chip, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { EventoSelector } from "../components/EventoSelector";
import { useEvento } from "../context/EventoContext";
import { supabase } from "../lib/supabaseClient";
import { FiltroPeriodo } from "../resources/dashboard";
import { atalhos } from "../dashboard/constants";

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


// ============================================
// Página
// ============================================

export const UltimasMovimentacoesPage = () => {
  const { eventoAtual } = useEvento();

  const [loading, setLoading] = useState(false);

  const [movimentacoes, setMovimentacoes] = useState<
    Movimentacao[]
  >([]);

  const rangeInicial = atalhos[0].getRange();

  const [inicio, setInicio] = useState<Date | null>(
    rangeInicial.inicio
  );

  const [fim, setFim] = useState<Date | null>(
    rangeInicial.fim
  );

  const carregar = async () => {
    if (!eventoAtual) return;
    if (!inicio || !fim) return;

    setLoading(true);

    const { data, error } = await supabase.rpc(
      "rpc_dashboard_ultimas_movimentacoes",
      {
        p_evento: eventoAtual.id,
        p_inicio: inicio.toISOString(),
        p_fim: fim.toISOString(),
        p_limite: 200,
      }
    );

    if (!error) {
      setMovimentacoes(data ?? []);
    }

    setLoading(false);
  };

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
  }, [eventoAtual?.id, inicio, fim]);

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

      <FiltroPeriodo
        evento={eventoAtual}
        inicio={inicio}
        fim={fim}
        setInicio={setInicio}
        setFim={setFim}
        onAplicar={carregar}
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