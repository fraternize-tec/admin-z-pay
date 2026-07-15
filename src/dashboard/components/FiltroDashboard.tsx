import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { ReactNode, useState } from "react";
import { useEvento } from "../../context/EventoContext";
import { atalhos, rangesIguais } from "../constants";

type Props = {
  evento: any;
  inicio: Date | null;
  fim: Date | null;
  setInicio: (value: Date | null) => void;
  setFim: (value: Date | null) => void;
  onAplicar: () => void;

  /** Ações extras exibidas antes do botão Aplicar */
  actions?: ReactNode;

  filters?: ReactNode;

  /** Oculta o botão Aplicar (opcional) */
  hideApplyButton?: boolean;
};

export const FiltroDashboard = ({
  evento,
  inicio,
  fim,
  setInicio,
  setFim,
  onAplicar,
  actions,
  filters,
  hideApplyButton = false,
}: Props) => {
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
              md: "repeat(2, minmax(0,1fr))",
            }}
            gap={2}
            mb={2}
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
                !isAdmin
                  ? inicioEvento
                  : undefined
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
                      setAtalhoSelecionado(
                        a.label
                      );
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
                      opacity: ativo
                        ? 1
                        : 0.8,

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

          {filters && (
            <>
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  mt: 3,
                  pt: 3,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  mb={2}
                >
                  Filtros adicionais
                </Typography>

                {filters}

              </Box>
            </>
          )}
          <Box
            display="flex"
            justifyContent="flex-end"
            gap={1}
            mt={3}
            flexWrap="wrap"
          >
            {actions}

            {!hideApplyButton && (
              <Button
                variant="contained"
                onClick={onAplicar}
              >
                Aplicar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};