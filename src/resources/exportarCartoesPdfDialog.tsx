import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Slider,
  Box,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export type ModoExportacao = 'pdf' | 'zip' | 'qr-zip';

export interface ConfiguracaoExportacao {
  modo: ModoExportacao;
  larguraMm: number;
  alturaMm: number;
  qrSizeMm: number;
  qrXmm: number;
  qrYmm: number;
  codigoFontSizePt: number;
  codigoXmm: number;
  codigoYmm: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (configuracao: ConfiguracaoExportacao) => void;
  arteFrenteUrl?: string;
}

const LARGURA_PADRAO = 86;
const ALTURA_PADRAO = 54;
const QR_SIZE_PADRAO = 20;
const QR_X_PADRAO = 4;
const QR_Y_PADRAO = 30;
const CODIGO_FONT_SIZE_PADRAO = 10;
const CODIGO_X_PADRAO = 52;
const CODIGO_Y_PADRAO = 45;
const CODIGO_BOX_WIDTH_MM = 30;
const CODIGO_BOX_HEIGHT_MM = 5;
const QR_BASE_URL = 'https://cards.zpay.fraternize.com.br/card/';

export const ExportarCartoesPdfDialog = ({
  open,
  onClose,
  onConfirm,
  arteFrenteUrl,
}: Props) => {
  const [modo, setModo] = useState<ModoExportacao>('pdf');
  const [larguraMm, setLarguraMm] = useState(LARGURA_PADRAO);
  const [alturaMm, setAlturaMm] = useState(ALTURA_PADRAO);
  const [qrSizeMm, setQrSizeMm] = useState(QR_SIZE_PADRAO);
  const [qrXmm, setQrXmm] = useState(QR_X_PADRAO);
  const [qrYmm, setQrYmm] = useState(QR_Y_PADRAO);
  const [codigoFontSizePt, setCodigoFontSizePt] = useState(CODIGO_FONT_SIZE_PADRAO);
  const [codigoXmm, setCodigoXmm] = useState(CODIGO_X_PADRAO);
  const [codigoYmm, setCodigoYmm] = useState(CODIGO_Y_PADRAO);
  const [qrPreview, setQrPreview] = useState('');

  const geraPdf = modo === 'pdf' || modo === 'zip';
  const qrSizeMax = Math.max(10, Math.min(40, larguraMm, alturaMm));
  const qrSizeValido = Number.isFinite(qrSizeMm) && qrSizeMm >= 10 && qrSizeMm <= qrSizeMax;
  const dimensoesValidas =
    Number.isFinite(larguraMm) &&
    Number.isFinite(alturaMm) &&
    larguraMm >= 50 &&
    larguraMm <= 300 &&
    alturaMm >= 30 &&
    alturaMm <= 200;
  const posicaoQrValida =
    Number.isFinite(qrXmm) &&
    Number.isFinite(qrYmm) &&
    qrXmm >= 0 &&
    qrYmm >= 0 &&
    qrXmm + qrSizeMm <= larguraMm &&
    qrYmm + qrSizeMm <= alturaMm;
  const codigoFontSizeValido =
    Number.isFinite(codigoFontSizePt) && codigoFontSizePt >= 4 && codigoFontSizePt <= 24;
  const posicaoCodigoValida =
    Number.isFinite(codigoXmm) &&
    Number.isFinite(codigoYmm) &&
    codigoXmm >= 0 &&
    codigoYmm >= 0 &&
    codigoXmm + CODIGO_BOX_WIDTH_MM <= larguraMm &&
    codigoYmm + CODIGO_BOX_HEIGHT_MM <= alturaMm;
  const configuracaoValida =
    dimensoesValidas && qrSizeValido && posicaoQrValida &&
    codigoFontSizeValido && posicaoCodigoValida;

  useEffect(() => {
    let ativo = true;

    QRCode.toDataURL(`${QR_BASE_URL}PREVIA-123`, {
      margin: 0,
      width: 300,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((url) => {
        if (ativo) setQrPreview(url);
      })
      .catch(() => {
        if (ativo) setQrPreview('');
      });

    return () => {
      ativo = false;
    };
  }, []);

  const handleLarguraChange = (valor: number) => {
    setLarguraMm(valor);
    setQrXmm(Math.max(0, Math.min(qrXmm, valor - qrSizeMm)));
    setCodigoXmm(Math.max(0, Math.min(codigoXmm, valor - CODIGO_BOX_WIDTH_MM)));
  };

  const handleAlturaChange = (valor: number) => {
    setAlturaMm(valor);
    setQrYmm(Math.max(0, Math.min(qrYmm, valor - qrSizeMm)));
    setCodigoYmm(Math.max(0, Math.min(codigoYmm, valor - CODIGO_BOX_HEIGHT_MM)));
  };

  const handleQrSizeChange = (valor: number) => {
    setQrSizeMm(valor);
    setQrXmm(Math.max(0, Math.min(qrXmm, larguraMm - valor)));
    setQrYmm(Math.max(0, Math.min(qrYmm, alturaMm - valor)));
  };

  const handleConfirmar = () => {
    if (geraPdf && !configuracaoValida) return;

    onConfirm({
      modo,
      larguraMm,
      alturaMm,
      qrSizeMm,
      qrXmm,
      qrYmm,
      codigoFontSizePt,
      codigoXmm,
      codigoYmm,
    });
  };

  const previewCardWidth = '100%';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Exportar cartões</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box>
            <Typography sx={{ mb: 1 }}>
              Como deseja gerar os arquivos?
            </Typography>
            <RadioGroup
              value={modo}
              onChange={(event) =>
                setModo(event.target.value as ModoExportacao)
              }
            >
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label="PDFs separados"
              />
              <FormControlLabel
                value="zip"
                control={<Radio />}
                label="ZIP com todos os PDFs"
              />
              <FormControlLabel
                value="qr-zip"
                control={<Radio />}
                label="ZIP com QR Codes em PNG"
              />
            </RadioGroup>
          </Box>

          {geraPdf && (
            <>
              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Tamanho do cartão
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Largura"
                    type="number"
                    size="small"
                    fullWidth
                    value={larguraMm}
                    onChange={(event) => handleLarguraChange(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 50, max: 300, step: 1 },
                      input: {
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      },
                    }}
                    error={!Number.isFinite(larguraMm) || larguraMm < 50 || larguraMm > 300}
                  />

                  <TextField
                    label="Altura"
                    type="number"
                    size="small"
                    fullWidth
                    value={alturaMm}
                    onChange={(event) => handleAlturaChange(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 30, max: 200, step: 1 },
                      input: {
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      },
                    }}
                    error={!Number.isFinite(alturaMm) || alturaMm < 30 || alturaMm > 200}
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Padrão: 86 × 54 mm. A sangria de 3 mm por lado será mantida.
                </Typography>

                <Button
                  size="small"
                  onClick={() => {
                    setLarguraMm(LARGURA_PADRAO);
                    setAlturaMm(ALTURA_PADRAO);
                    setQrSizeMm(QR_SIZE_PADRAO);
                    setQrXmm(QR_X_PADRAO);
                    setQrYmm(QR_Y_PADRAO);
                    setCodigoFontSizePt(CODIGO_FONT_SIZE_PADRAO);
                    setCodigoXmm(CODIGO_X_PADRAO);
                    setCodigoYmm(CODIGO_Y_PADRAO);
                  }}
                  sx={{ mt: 0.5, px: 0 }}
                >
                  Restaurar configurações padrão
                </Button>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  QR Code
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Tamanho"
                    type="number"
                    size="small"
                    fullWidth
                    value={qrSizeMm}
                    onChange={(event) => handleQrSizeChange(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 10, max: qrSizeMax, step: 1 },
                      input: {
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      },
                    }}
                    error={!qrSizeValido}
                    helperText={`Entre 10 e ${qrSizeMax} mm`}
                  />

                  <TextField
                    label="Posição X (esquerda)"
                    type="number"
                    size="small"
                    fullWidth
                    value={qrXmm}
                    onChange={(event) => setQrXmm(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, max: Math.max(0, larguraMm - qrSizeMm), step: 0.5 },
                      input: {
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      },
                    }}
                    error={!Number.isFinite(qrXmm) || qrXmm < 0 || qrXmm + qrSizeMm > larguraMm}
                  />

                  <TextField
                    label="Posição Y (topo)"
                    type="number"
                    size="small"
                    fullWidth
                    value={qrYmm}
                    onChange={(event) => setQrYmm(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, max: Math.max(0, alturaMm - qrSizeMm), step: 0.5 },
                      input: {
                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                      },
                    }}
                    error={!Number.isFinite(qrYmm) || qrYmm < 0 || qrYmm + qrSizeMm > alturaMm}
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  X é a distância da borda esquerda e Y é a distância da borda superior da área final do cartão, sem contar a sangria.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Texto do código
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Tamanho da fonte"
                    type="number"
                    size="small"
                    fullWidth
                    value={codigoFontSizePt}
                    onChange={(event) => setCodigoFontSizePt(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 4, max: 24, step: 0.5 },
                      input: { endAdornment: <InputAdornment position="end">pt</InputAdornment> },
                    }}
                    error={!codigoFontSizeValido}
                    helperText="Entre 4 e 24 pt"
                  />
                  <TextField
                    label="Posição X (esquerda)"
                    type="number"
                    size="small"
                    fullWidth
                    value={codigoXmm}
                    onChange={(event) => setCodigoXmm(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, max: Math.max(0, larguraMm - CODIGO_BOX_WIDTH_MM), step: 0.5 },
                      input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> },
                    }}
                    error={!Number.isFinite(codigoXmm) || codigoXmm < 0 || codigoXmm + CODIGO_BOX_WIDTH_MM > larguraMm}
                  />
                  <TextField
                    label="Posição Y (topo)"
                    type="number"
                    size="small"
                    fullWidth
                    value={codigoYmm}
                    onChange={(event) => setCodigoYmm(Number(event.target.value))}
                    slotProps={{
                      htmlInput: { min: 0, max: Math.max(0, alturaMm - CODIGO_BOX_HEIGHT_MM), step: 0.5 },
                      input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> },
                    }}
                    error={!Number.isFinite(codigoYmm) || codigoYmm < 0 || codigoYmm + CODIGO_BOX_HEIGHT_MM > alturaMm}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  X e Y posicionam a caixa branca do código a partir da borda esquerda e do topo do cartão, sem contar a sangria. A caixa mede 30 × 5 mm.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                  Pré-visualização
                </Typography>

                <Box
                  sx={{
                    width: previewCardWidth,
                    maxWidth: 650,
                    mx: 'auto',
                    aspectRatio: `${larguraMm} / ${alturaMm}`,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: '#f5f5f5',
                    boxShadow: 2,
                  }}
                >
                  {arteFrenteUrl && (
                    <Box
                      component="img"
                      src={arteFrenteUrl}
                      alt="Arte da frente do cartão"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                      }}
                    />
                  )}

                  {!arteFrenteUrl && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        color: 'text.secondary',
                        fontSize: 14,
                      }}
                    >
                      Arte do cartão não disponível para prévia
                    </Box>
                  )}

                  {qrPreview && configuracaoValida && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${((qrXmm - 1) / larguraMm) * 100}%`,
                        top: `${((qrYmm - 1) / alturaMm) * 100}%`,
                        width: `${((qrSizeMm + 2) / larguraMm) * 100}%`,
                        aspectRatio: '1 / 1',
                        boxSizing: 'border-box',
                        bgcolor: '#fff',
                        borderRadius: '4px',
                        padding: `${(1 / (qrSizeMm + 2)) * 100}%`,
                      }}
                    >
                      <Box
                        component="img"
                        src={qrPreview}
                        alt="Prévia do QR Code"
                        sx={{ display: 'block', width: '100%', height: '100%' }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${(codigoXmm / larguraMm) * 100}%`,
                      top: `${(codigoYmm / alturaMm) * 100}%`,
                      width: `${(CODIGO_BOX_WIDTH_MM / larguraMm) * 100}%`,
                      height: `${(CODIGO_BOX_HEIGHT_MM / alturaMm) * 100}%`,
                      minHeight: 12,
                      bgcolor: '#fff',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: `clamp(7px, ${(codigoFontSizePt / 10) * 1.6}vw, 24px)`,
                    }}
                  >
                    ZPAY00001
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Prévia ilustrativa: o QR Code e o código exibidos são exemplos. Tamanho e posição de ambos serão aplicados na exportação.
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirmar}
          disabled={geraPdf && !configuracaoValida}
        >
          Gerar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
