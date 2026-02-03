import {
  useNotify,
} from "react-admin";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField as MuiTextField,
  Box,
  Autocomplete,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useState } from "react";
import { CancelarDialog } from "../components/CancelarDialog";
import { supabase } from "../lib/supabaseClient";

export default function HistoricoCartaoOperacional() {
  const notify = useNotify();

  const [meioId, setMeioId] = useState<string | null>(null);
  const [cartao, setCartao] = useState<any>(null);
  const [extrato, setExtrato] = useState<any[]>([]);
  const [cancelar, setCancelar] = useState<any>(null);
  const [opcoes, setOpcoes] = useState<any[]>([]);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchor);

  // ============================
  // 🔎 busca cartão
  // ============================
  async function carregarCartao(id: string) {
    const { data, error } = await supabase
      .from("meios_acesso")
      .select(`
        id,
        codigo_unico,
        saldo,
        bloqueado,
        evento:evento_id ( nome )
      `)
      .eq("id", id)
      .single();

    if (error) {
      notify("Erro ao carregar cartão", { type: "error" });
      return;
    }

    setCartao(data);
  }

  // ============================
  // 📜 extrato
  // ============================
  async function carregarExtrato(id: string) {
    const { data } = await supabase
      .from("vw_extrato_meio_acesso")
      .select("*")
      .eq("meio_id", id)
      .order("criado_em", { ascending: false });

    setExtrato(data || []);
  }

  useEffect(() => {
    if (!meioId) return;
    refreshTela();
  }, [meioId]);

  function onCancelado() {
    refreshTela();
    setCancelar(null);
  }

  const [loading, setLoading] = useState(false);

  async function refreshTela() {
    if (!meioId) return;
    setLoading(true);
    await Promise.all([
      carregarCartao(meioId),
      carregarExtrato(meioId),
    ]);
    setLoading(false);
  }

  const ultimaRecargaId = extrato
    .filter(i => i.tipo === 'recarga' && !i.cancelado)
    .sort(
      (a, b) =>
        new Date(b.criado_em).getTime() -
        new Date(a.criado_em).getTime()
    )[0]?.operacao_id;

  return (
    <Box p={2}>
      {/* ===================== */}
      {/* 🔎 BUSCAR CARTÃO      */}
      {/* ===================== */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">🔎 Buscar cartão</Typography>

          <Autocomplete
            options={opcoes}
            getOptionLabel={(option: any) => option.codigo_unico}
            onChange={(_, value) => setMeioId(value?.id ?? null)}
            onInputChange={async (_, value) => {
              if (value.length < 3) return;

              const { data } = await supabase
                .from("meios_acesso")
                .select("id, codigo_unico")
                .ilike("codigo_unico", `%${value}%`)
                .limit(10);

              setOpcoes(data || []);
            }}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Código do cartão"
                placeholder="Digite ao menos 3 caracteres"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* ===================== */}
      {/* 💳 CARTÃO             */}
      {/* ===================== */}
      {cartao && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography variant="caption">Cartão</Typography>
                <Typography variant="h6">{cartao.codigo_unico}</Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="caption">Evento</Typography>
                <Typography>{cartao.evento?.nome}</Typography>
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="caption">Status</Typography>
                <Chip
                  label={cartao.bloqueado ? "Bloqueado" : "Ativo"}
                  color={cartao.bloqueado ? "error" : "success"}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="caption">Saldo</Typography>
                <Typography
                  variant="h5"
                  color={cartao.saldo < 0 ? "error" : "primary"}
                >
                  R$ {cartao.saldo.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={2} textAlign="right">
                <IconButton
                  onClick={refreshTela}
                  title="Atualizar dados do cartão"
                >
                  <RefreshIcon
                    sx={{ animation: loading ? "spin 1s linear infinite" : "none" }}
                  />
                </IconButton>

                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  title="Ações do cartão"
                >
                  <MoreVertIcon />
                </IconButton>

                <Menu
                  anchorEl={menuAnchor}
                  open={openMenu}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      notify("Bloquear/desbloquear ainda não implementado", {
                        type: "info",
                      });
                    }}
                  >
                    <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                    {cartao.bloqueado ? "Desbloquear cartão" : "Bloquear cartão"}
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      notify("Resetar ainda não implementado", {
                        type: "warning",
                      });
                    }}
                    sx={{ color: "warning.main" }}
                  >
                    <RestartAltIcon fontSize="small" sx={{ mr: 1 }} />
                    Resetar cartão
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ===================== */}
      {/* 📜 HISTÓRICO          */}
      {/* ===================== */}
      {cartao && (
        <Card>
          <CardContent>
            <Typography variant="h6">📜 Histórico financeiro</Typography>
            <Divider sx={{ my: 1 }} />

            <List>
              {extrato.map((item) => (
                <ListItem
                  key={`${item.tipo}-${item.operacao_id}`}
                  sx={{
                    opacity:
                      item.cancelado && item.valor === 0
                        ? 0.6           // cancelado total
                        : 1             // parcial ou normal
                  }}
                  secondaryAction={
                    !item.cancelado &&
                    item.tipo !== "taxa" &&
                    (item.tipo !== "recarga" || item.operacao_id === ultimaRecargaId) && (
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() =>
                          setCancelar({
                            tipo: item.tipo,
                            id: item.operacao_id,
                          })
                        }
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={`${labelTipo(item.tipo)} • ${formatDate(item.criado_em)}`}
                    secondary={
                      item.cancelado && (
                        <Chip
                          label={
                            item.cancelamento_tipo === 'parcial'
                              ? 'Cancelado parcialmente'
                              : 'Cancelado'
                          }
                          size="small"
                          color={
                            item.cancelamento_tipo === 'parcial'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      )
                    }
                  />


                  <Typography
                    fontWeight="bold"
                    color={
                      item.valor >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {item.valor >= 0 ? "+" : ""}
                    {item.valor.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* ===================== */}
      {/* ❌ CANCELAR           */}
      {/* ===================== */}
      {cancelar && (
        <CancelarDialog
          open
          tipo={cancelar.tipo}
          record={{ id: cancelar.id }}
          onClose={() => setCancelar(null)}
          onSuccess={onCancelado}
        />
      )}
    </Box>
  );
}

// ============================
// helpers
// ============================
function labelTipo(tipo: string) {
  return {
    recarga: "Recarga",
    consumo: "Consumo",
    taxa: "Taxa",
  }[tipo] || tipo;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}
