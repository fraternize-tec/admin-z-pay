
import { Identifier, useNotify } from 'react-admin';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { PoppinsBold } from '../fonts/Poppins-Bold';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { gerarQrCodePng } from '../utils/gerarQrCodePng';
import { ModoExportacao } from './exportarCartoesPdfDialog';

interface Props {
  tipo: 'lote' | 'proprio';
  loteId?: Identifier;
  zip?: boolean;
  modo?: ModoExportacao;
  larguraMm?: number;
  alturaMm?: number;
  qrSizeMm?: number;
  qrXmm?: number;
  qrYmm?: number;
  codigoFontSizePt?: number;
  codigoXmm?: number;
  codigoYmm?: number;
  onClose: () => void;
}

const CARTOES_POR_PDF = 50;
const PAGE_SIZE = 1000;

const LARGURA_PADRAO = 86;
const ALTURA_PADRAO = 54;
const BLEED = 3;
const SAFE_MARGIN = 4;

const ARTE_PROPRIO_URL =
  'https://api.zpay.fraternize.com.br/storage/v1/object/public/cartoes-artes/proprios/frente.png';

const QR_BASE_URL = 'https://cards.zpay.fraternize.com.br/card/';

interface Cartao {
  codigo_unico: string;
  nano_id: string;
}

async function buscarTodosCartoes(queryBase: any): Promise<Cartao[]> {
  let page = 0;
  let all: Cartao[] = [];

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await queryBase.range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data as Cartao[]);

    if (data.length < PAGE_SIZE) break;

    page++;
  }

  return all;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

const tick = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export const ExportarCartoesPdf = ({
  tipo,
  loteId,
  zip = false,
  modo,
  larguraMm = LARGURA_PADRAO,
  alturaMm = ALTURA_PADRAO,
  qrSizeMm,
  qrXmm,
  qrYmm,
  codigoFontSizePt,
  codigoXmm,
  codigoYmm,
  onClose,
}: Props) => {
  const notify = useNotify();
  const gerouRef = useRef(false);
  const cancelRef = useRef(false);

  const [total, setTotal] = useState(0);
  const [atual, setAtual] = useState(0);

  const modoAtual: ModoExportacao = modo ?? (zip ? 'zip' : 'pdf');

  const pageWidth = larguraMm + BLEED * 2;
  const pageHeight = alturaMm + BLEED * 2;

  useEffect(() => {
    if (gerouRef.current) return;

    gerouRef.current = true;
    gerarExportacao();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const buscarCartoes = async (): Promise<Cartao[]> => {
    let query = supabase
      .from('meios_acesso')
      .select('codigo_unico, nano_id')
      .order('codigo_unico', { ascending: true });

    if (tipo === 'lote') {
      query = query.eq('lote_id', loteId);
    }

    if (tipo === 'proprio') {
      query = query
        .eq('tipo_cartao', 'emergencial')
        .is('lote_id', null);
    }

    return buscarTodosCartoes(query);
  };

  const gerarQrCodesZip = async (cartoes: Cartao[]) => {
    const zipFile = new JSZip();

    for (const cartao of cartoes) {
      if (cancelRef.current) return;

      const url = `${QR_BASE_URL}${cartao.nano_id}`;
      const png = await gerarQrCodePng({ url });

      if (cancelRef.current) return;

      zipFile.file(`${cartao.codigo_unico}.png`, png);

      setAtual((valor) => valor + 1);
      await tick();
    }

    if (cancelRef.current) return;

    const blob = await zipFile.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    if (cancelRef.current) return;

    saveAs(
      blob,
      tipo === 'lote'
        ? `qrcodes-lote-${loteId}.zip`
        : 'qrcodes-cartoes-proprios.zip',
    );
  };

  const gerarPdfs = async (cartoes: Cartao[]) => {
    let arteFrenteUrl: string;

    if (tipo === 'lote') {
      const { data: lote, error } = await supabase
        .from('lotes_cartoes')
        .select('arte_frente_url')
        .eq('id', loteId)
        .single();

      if (error) throw error;

      if (!lote?.arte_frente_url) {
        notify('Arte do lote não encontrada', { type: 'warning' });
        onClose();
        return;
      }

      arteFrenteUrl = lote.arte_frente_url;
    } else {
      arteFrenteUrl = ARTE_PROPRIO_URL;
    }

    const respostaArte = await fetch(arteFrenteUrl);

    if (!respostaArte.ok) {
      throw new Error('Não foi possível carregar a arte do cartão.');
    }

    const frente = await blobToBase64(await respostaArte.blob());
    const grupos = chunkArray(cartoes, CARTOES_POR_PDF);
    const zipFile = modoAtual === 'zip' ? new JSZip() : null;

    // Mantém a proporção dos elementos em relação ao menor lado.
    // No tamanho padrão, scale = 1 e os valores originais são preservados.
    const scale = Math.min(
      larguraMm / LARGURA_PADRAO,
      alturaMm / ALTURA_PADRAO,
    );

    const qrSize = qrSizeMm ?? 20;
    const qrPosX = qrXmm ?? SAFE_MARGIN;
    const qrPosY = qrYmm ?? alturaMm - qrSize - SAFE_MARGIN;
    const safeMargin = Math.min(SAFE_MARGIN * scale, larguraMm * 0.08, alturaMm * 0.08);
    const codeBoxWidth = Math.min(30, larguraMm);
    const codeBoxHeight = Math.min(5, alturaMm * 0.15);
    const codePosX = codigoXmm ?? larguraMm - codeBoxWidth - SAFE_MARGIN;
    const codePosY = codigoYmm ?? alturaMm - codeBoxHeight - SAFE_MARGIN;
    const cornerRadius = Math.min(2 * scale, codeBoxHeight / 2);
    const fontSize = codigoFontSizePt ?? Math.max(6, 10 * scale);

    let parte = 1;
    let processados = 0;

    for (const grupo of grupos) {
      if (cancelRef.current) return;

      const pdf = new jsPDF({
        unit: 'mm',
        format: [pageWidth, pageHeight],
        orientation: pageWidth >= pageHeight ? 'landscape' : 'portrait',
        compress: false,
      });

      pdf.addFileToVFS('Poppins-Bold.ttf', PoppinsBold);
      pdf.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
      pdf.setFont('Poppins', 'bold');

      for (let i = 0; i < grupo.length; i++) {
        if (cancelRef.current) return;

        const cartao = grupo[i];

        if (i > 0) pdf.addPage([pageWidth, pageHeight]);

        const url = `${QR_BASE_URL}${cartao.nano_id}`;

        // Arte ocupando toda a página, incluindo a sangria.
        pdf.addImage(frente, 'PNG', 0, 0, pageWidth, pageHeight);

        const baseX = BLEED;
        const baseY = BLEED;

        // Posição X/Y medida a partir do canto superior esquerdo da área final,
        // sem contar a sangria. A prévia utiliza o mesmo sistema de coordenadas.
        const qrX = baseX + qrPosX;
        const qrY = baseY + qrPosY;
        const qrPadding = 1;

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          qrX - qrPadding,
          qrY - qrPadding,
          qrSize + qrPadding * 2,
          qrSize + qrPadding * 2,
          Math.min(cornerRadius, qrSize / 8),
          Math.min(cornerRadius, qrSize / 8),
          'F',
        );

        const qr = await QRCode.toDataURL(url, {
          margin: 0,
          width: 300,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        pdf.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);

        const codeX = baseX + codePosX;
        const codeY = baseY + codePosY;

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          codeX,
          codeY,
          codeBoxWidth,
          codeBoxHeight,
          cornerRadius,
          cornerRadius,
          'F',
        );

        pdf.setFontSize(fontSize);
        pdf.setTextColor(0, 0, 0);

        pdf.text(
          cartao.codigo_unico,
          codeX + codeBoxWidth / 2,
          codeY + codeBoxHeight * 0.7,
          {
            align: 'center',
            baseline: 'alphabetic',
            maxWidth: Math.max(1, codeBoxWidth - 2 * scale),
          },
        );

        processados++;
        setAtual(processados);
        await tick();
      }

      const nome =
        tipo === 'lote'
          ? `cartoes-lote-${loteId}-parte-${parte}.pdf`
          : `cartoes-proprios-parte-${parte}.pdf`;

      const blob = pdf.output('blob');

      if (zipFile) {
        zipFile.file(nome, blob, {
          compression: 'DEFLATE',
          compressionOptions: { level: 9 },
        });
      } else {
        saveAs(blob, nome);
      }

      parte++;
    }

    if (zipFile && !cancelRef.current) {
      const blob = await zipFile.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      saveAs(
        blob,
        tipo === 'lote'
          ? `cartoes-lote-${loteId}.zip`
          : 'cartoes-proprios.zip',
      );
    }
  };

  const gerarExportacao = async () => {
    try {
      const cartoes = await buscarCartoes();

      if (cancelRef.current) return;

      if (!cartoes.length) {
        notify('Nenhum cartão encontrado', { type: 'warning' });
        onClose();
        return;
      }

      setTotal(cartoes.length);

      if (modoAtual === 'qr-zip') {
        await gerarQrCodesZip(cartoes);
      } else {
        await gerarPdfs(cartoes);
      }

      if (!cancelRef.current) {
        notify('Exportação concluída', { type: 'success' });
      }

      onClose();
    } catch (e) {
      console.error(e);
      notify(
        modoAtual === 'qr-zip'
          ? 'Erro ao gerar os QR Codes em PNG'
          : 'Erro ao gerar PDF',
        { type: 'error' },
      );
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {modoAtual === 'qr-zip'
          ? 'Gerando QR Codes em PNG'
          : 'Gerando cartões'}
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 1 }}>
          {atual} de {total} cartões
        </Typography>

        <LinearProgress
          variant="determinate"
          value={total ? (atual / total) * 100 : 0}
        />

        <Button
          sx={{ mt: 3 }}
          color="error"
          variant="outlined"
          onClick={() => {
            cancelRef.current = true;
            onClose();
          }}
        >
          Cancelar geração
        </Button>
      </DialogContent>
    </Dialog>
  );
};
