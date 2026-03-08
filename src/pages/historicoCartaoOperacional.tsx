import {
  Confirm,
  useGetIdentity,
  useNotify,
  usePermissions,
} from "react-admin";
import {
  Card,
  CardContent,
  Typography,
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
  Dialog,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useEffect, useState } from "react";
import { CancelarDialog } from "../components/CancelarDialog";
import { supabase } from "../lib/supabaseClient";
import { DevolucaoDialog } from "../components/DevolucaoDialog";
import { can } from "../auth/useCan";
import { formatBRL } from "../utils/formatters";
import { QrScanner } from "../components/QrScanner";


export default function HistoricoCartaoOperacional() {
  const { permissions } = usePermissions();
  const { data: identity } = useGetIdentity();
  const notify = useNotify();

  const [meioId, setMeioId] = useState<string | null>(null);
  const [cartao, setCartao] = useState<any>(null);
  const [extrato, setExtrato] = useState<any[]>([]);
  const [cancelar, setCancelar] = useState<any>(null);
  const [opcoes, setOpcoes] = useState<any[]>([]);
  const [devolverOpen, setDevolverOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchor);


  const Field = ({ label, children }: any) => (
    <Box display="flex" flexDirection="column" gap={0.5} width="100%">
      <Typography variant="caption">{label}</Typography>
      {children}
    </Box>
  );
  // ============================
  // 🔎 busca cartão
  // ============================
  async function carregarCartao(id: string) {
    const { data, error } = await supabase
      .rpc("get_meio_acesso_admin", { p_id: id })
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

  async function toggleBloqueio() {
    if (!cartao) return;

    try {
      setActionLoading(true);

      const { data, error } = await supabase.functions.invoke("bloquear-cartao", {
        body: {
          cartao_id: cartao.id,
          bloquear: !cartao.bloqueado,
        },
      });

      if (error) throw error;

      notify(
        cartao.bloqueado
          ? "Cartão desbloqueado com sucesso"
          : "Cartão bloqueado com sucesso",
        { type: "success" }
      );

      refreshTela();
    } catch (e) {
      notify("Erro ao alterar status do cartão", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function resetarCartao() {
    if (!cartao) return;

    try {
      setActionLoading(true);

      const { data, error } = await supabase.functions.invoke("resetar-cartao", {
        body: {
          cartao_id: cartao.id,
        },
      });

      if (error) throw error;

      notify("Cartão resetado com sucesso", { type: "success" });

      refreshTela();
    } catch (e) {
      notify("Erro ao resetar cartão", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function buscarPorCodigo(codigo: string) {
    const { data } = await supabase
      .rpc("search_meios_acesso", { p_codigo: codigo });

    if (!data || data.length === 0) {
      notify("Cartão não encontrado", { type: "warning" });
      return;
    }

    setMeioId(data[0].id);
  }

  return (
    <Box p={2}>
      {/* ===================== */}
      {/* 🔎 BUSCAR CARTÃO      */}
      {/* ===================== */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography sx={{ mb: 2 }} variant="h6">🔎 Buscar cartão</Typography>

          <Autocomplete
            options={opcoes}
            getOptionLabel={(option: any) => option.codigo_unico}
            onChange={(_, value) => setMeioId(value?.id ?? null)}
            onInputChange={async (_, value) => {
              if (value.length < 3) return;

              const { data } = await supabase
                .rpc("search_meios_acesso", { p_codigo: value });

              setOpcoes(data || []);
            }}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Código do cartão"
                placeholder="Digite ou escaneie"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      <IconButton onClick={() => setScanOpen(true)}>
                        <QrCodeScannerIcon />
                      </IconButton>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
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
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Cartão */}
              <Box sx={{ flex: "1 1 180px" }}>
                <Field label="Cartão">
                  <Typography variant="h6">{cartao.codigo_unico}</Typography>
                </Field>
              </Box>

              {/* Evento */}
              <Box sx={{ flex: "1 1 180px" }}>
                <Field label="Evento">
                  <Typography>{cartao.evento?.nome}</Typography>
                </Field>
              </Box>

              {/* Status */}
              <Box sx={{ flex: "0 0 140px" }}>
                <Field label="Status">
                  <Chip
                    label={cartao.bloqueado ? "Bloqueado" : "Ativo"}
                    color={cartao.bloqueado ? "error" : "success"}
                    size="small"
                    sx={{ width: "fit-content" }}
                  />
                </Field>
              </Box>

              {/* Saldo */}
              <Box sx={{ flex: "0 0 180px" }}>
                <Field label="Saldo">
                  <Typography
                    variant="h5"
                    color={cartao.saldo < 0 ? "error" : "primary"}
                  >
                    {formatBRL(cartao.saldo)}
                  </Typography>
                </Field>
              </Box>

              {/* Ações */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <IconButton onClick={refreshTela} title="Atualizar dados do cartão">
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
                  {can(permissions, "devolver.saldo") && (
                    <MenuItem
                      onClick={() => {
                        setMenuAnchor(null);
                        setDevolverOpen(true);
                      }}
                      sx={{ color: "error.main" }}
                    >
                      💸 Devolver saldo
                    </MenuItem>
                  )}
                  {can(permissions, "bloquear.cartao") && (
                    <MenuItem
                      onClick={() => {
                        setMenuAnchor(null);
                        toggleBloqueio();
                      }}
                      disabled={actionLoading}
                    >
                      <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                      {cartao.bloqueado ? "Desbloquear cartão" : "Bloquear cartão"}
                    </MenuItem>
                  )}

                  {can(permissions, "resetar.cartao") && (
                    <MenuItem
                      onClick={() => {
                        setMenuAnchor(null);
                        setResetConfirm(true);
                      }}
                      sx={{ color: "warning.main" }}
                    >
                      <RestartAltIcon fontSize="small" sx={{ mr: 1 }} />
                      Resetar cartão
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            </Box>
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
                    item.tipo !== "devolucao" &&
                    item.tipo !== "reset" &&
                    (item.tipo !== "recarga" || item.recarga_cancelavel) && (
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
                        <CancelIcon sx={{ fontSize: 24 }} />
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
                    {formatBRL(item.valor)}
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


      {cartao && identity && (
        <DevolucaoDialog
          open={devolverOpen}
          meioId={cartao.id}
          saldoAtual={cartao.saldo}
          operadorId={identity.id.toString()}
          caixaId={null}
          onClose={() => setDevolverOpen(false)}
          onSuccess={refreshTela}
        />
      )}

      <Confirm
        isOpen={resetConfirm}
        title="Resetar cartão"
        content={
          <>
            <strong>Atenção!</strong>
            <br />
            Esta ação irá:
            <ul>
              <li>Zerar o saldo do cartão</li>
              <li>Remover vínculo com o usuário</li>
              <li>Manter o cartão ativo para novo uso</li>
            </ul>
            Deseja continuar?
          </>
        }
        onConfirm={() => {
          setResetConfirm(false);
          resetarCartao();
        }}
        onClose={() => setResetConfirm(false)}
      />

      <Dialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <QrScanner
          onResult={(raw: string) => {
            setScanOpen(false);

            let codigo = raw;

            try {
              const url = new URL(raw);

              if (url.pathname.startsWith("/card/")) {
                codigo = url.pathname.split("/card/")[1];
              }
            } catch {
              // não era URL, mantém valor original
            }

            buscarPorCodigo(codigo);
          }}
          onClose={() => setScanOpen(false)}
        />
      </Dialog>
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
    devolucao: "Devolução",
    reset: "Reset de cartão",
  }[tipo] || tipo;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}
