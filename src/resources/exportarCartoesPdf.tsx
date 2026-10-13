
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

type ModoExportacao = 'pdf' | 'zip' | 'qr-zip';

interface Props {
  tipo: 'lote' | 'proprio';
  loteId?: Identifier;
  zip?: boolean;
  modo?: ModoExportacao;
  onClose: () => void;
}

const CARTOES_POR_PDF = 50;
const PAGE_SIZE = 1000;

const CUT_WIDTH = 86;
const CUT_HEIGHT = 54;
const BLEED = 3;
const PAGE_WIDTH = CUT_WIDTH + BLEED * 2;
const PAGE_HEIGHT = CUT_HEIGHT + BLEED * 2;
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
  onClose,
}: Props) => {
  const notify = useNotify();
  const gerouRef = useRef(false);
  const cancelRef = useRef(false);

  const [total, setTotal] = useState(0);
  const [atual, setAtual] = useState(0);

  const modoAtual: ModoExportacao = modo ?? (zip ? 'zip' : 'pdf');

  console.log('modoAtual', modoAtual);

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

    let parte = 1;
    let processados = 0;

    for (const grupo of grupos) {
      if (cancelRef.current) return;

      const pdf = new jsPDF({
        unit: 'mm',
        format: [PAGE_WIDTH, PAGE_HEIGHT],
        orientation: 'landscape',
        compress: false,
      });

      pdf.addFileToVFS('Poppins-Bold.ttf', PoppinsBold);
      pdf.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
      pdf.setFont('Poppins', 'bold');

      for (let i = 0; i < grupo.length; i++) {
        if (cancelRef.current) return;

        const cartao = grupo[i];

        if (i > 0) pdf.addPage();

        const url = `${QR_BASE_URL}${cartao.nano_id}`;

        pdf.addImage(frente, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

        const baseX = BLEED;
        const baseY = BLEED;
        const qrSize = 20;
        const qrX = baseX + SAFE_MARGIN;
        const qrY = baseY + CUT_HEIGHT - qrSize - SAFE_MARGIN;

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          qrX - 1,
          qrY - 1,
          qrSize + 2,
          qrSize + 2,
          2,
          2,
          'F',
        );

        const qr = await QRCode.toDataURL(url, {
          margin: 0,
          width: 300,
          errorCorrectionLevel: 'M',
        });

        pdf.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);

        const codeBoxWidth = 30;
        const codeBoxHeight = 5;
        const codeX = baseX + CUT_WIDTH - codeBoxWidth - SAFE_MARGIN;
        const codeY = baseY + CUT_HEIGHT - codeBoxHeight - SAFE_MARGIN;

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          codeX,
          codeY,
          codeBoxWidth,
          codeBoxHeight,
          2,
          2,
          'F',
        );

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          cartao.codigo_unico,
          codeX + codeBoxWidth / 2,
          codeY + 3.5,
          { align: 'center' },
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
