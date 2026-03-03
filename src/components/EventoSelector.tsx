import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
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

  // ✅ Se só existir 1 evento → mostrar nome fixo
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

  // ✅ Se tiver mais de 1 → mostrar seletor
  if (eventosDisponiveis.length > 1) {
    return (
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <Select
          value={eventoAtual?.id ?? ""}
          onChange={(e) => setEventoAtual(e.target.value)}
        >
          {eventosDisponiveis.map((ev) => (
            <MenuItem key={ev.id} value={ev.id}>
              {ev.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return null;
};