import {
  Typography,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";

import { useEvento } from "../context/EventoContext";

export const EventoSelector = () => {
  const {
    eventoAtual,
    eventosDisponiveis,
    setEventoAtual,
    loading,
  } = useEvento();

  if (loading) return null;

  // Se só existir 1 evento
  if (eventosDisponiveis.length === 1 && eventoAtual) {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: "action.hover",
          display: "inline-block",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {eventoAtual.nome}
        </Typography>
      </Box>
    );
  }

  // Se tiver mais de 1
  if (eventosDisponiveis.length > 1) {
    return (
      <Autocomplete
        size="small"
        sx={{ minWidth: 280 }}
        options={eventosDisponiveis}
        value={eventoAtual ?? null}
        getOptionLabel={(option) => option.nome || ""}
        isOptionEqualToValue={(option, value) =>
          option.id === value.id
        }
        onChange={(_, value) => {
          setEventoAtual(value?.id ?? "");
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Selecionar evento"
          />
        )}
      />
    );
  }

  return null;
};