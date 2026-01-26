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

interface Props {
  tipo: 'lote' | 'proprio';
  loteId?: Identifier;
  zip?: boolean;
  onClose: () => void;
}

const CARTOES_POR_PDF = 100;
const PAGE_SIZE = 1000;

const CARD_WIDTH = 90;
const CARD_HEIGHT = 60;
const SAFE_MARGIN = 7;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const GAP = 5;
const MARGIN_X = 10;
const MARGIN_Y = 10;

const ARTE_PROPRIO_URL =
  'https://aazveowyyfmpdfwwjiqp.supabase.co/storage/v1/object/public/cartoes-artes/proprios/frente.png';

/* -------------------------------------------------- */
/* 🔥 BUSCA PAGINADA (remove limite 1000 do Supabase) */
/* -------------------------------------------------- */
async function buscarTodosCartoes(queryBase: any) {
  let page = 0;
  let all: any[] = [];

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await queryBase.range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);

    if (data.length < PAGE_SIZE) break;

    page++;
  }

  return all;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const tick = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => resolve())
  );

export const ExportarCartoesPdf = ({
  tipo,
  loteId,
  zip = false,
  onClose,
}: Props) => {
  const notify = useNotify();
  const gerouRef = useRef(false);
  const cancelRef = useRef(false);

  const [total, setTotal] = useState(0);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (gerouRef.current) return;
    gerouRef.current = true;
    gerarPdf();
    // eslint-disable-next-line
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const gerarPdf = async () => {
    try {
      /* ---------------- BUSCA CARTÕES ---------------- */
      let query = supabase
        .from('meios_acesso')
        .select('codigo_unico, nano_id');

      if (tipo === 'lote') query = query.eq('lote_id', loteId);
      if (tipo === 'proprio')
        query = query.eq('tipo_cartao', 'emergencial').is('lote_id', null);

      const cartoes = await buscarTodosCartoes(query);

      if (!cartoes.length) {
        notify('Nenhum cartão encontrado', { type: 'warning' });
        onClose();
        return;
      }

      setTotal(cartoes.length);

      /* ---------------- ARTE ---------------- */
      let arteFrenteUrl: string;

      if (tipo === 'lote') {
        const { data: lote } = await supabase
          .from('lotes_cartoes')
          .select('arte_frente_url')
          .eq('id', loteId)
          .single();

        if (!lote?.arte_frente_url) {
          notify('Arte do lote não encontrada', { type: 'warning' });
          onClose();
          return;
        }

        arteFrenteUrl = lote.arte_frente_url;
      } else {
        arteFrenteUrl = ARTE_PROPRIO_URL;
      }

      const frente = await fetch(arteFrenteUrl)
        .then((r) => r.blob())
        .then(blobToBase64);

      const grupos = chunkArray(cartoes, CARTOES_POR_PDF);
      const zipFile = zip ? new JSZip() : null;

      let parte = 1;
      let processados = 0;

      /* ---------------- GERAÇÃO ---------------- */
      for (const grupo of grupos) {
        if (cancelRef.current) return;

        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

        pdf.addFileToVFS('Poppins-Bold.ttf', PoppinsBold);
        pdf.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
        pdf.setFont('Poppins', 'bold');

        let x = MARGIN_X;
        let y = MARGIN_Y;

        for (const cartao of grupo) {
          if (cancelRef.current) return;

          const url = `https://cards.zpay.fraternize.com.br/card/${cartao.nano_id}`;

          // fundo
          pdf.addImage(frente, 'PNG', x, y, CARD_WIDTH, CARD_HEIGHT);

          /* ================= QR ================= */
          const qrSize = 24;
          const qrPadding = 1.5;

          const qrX = x + SAFE_MARGIN;
          const qrY = y + CARD_HEIGHT - qrSize - SAFE_MARGIN;

          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(
            qrX - qrPadding,
            qrY - qrPadding,
            qrSize + qrPadding * 2,
            qrSize + qrPadding * 2,
            2,
            2,
            'F'
          );

          const qr = await QRCode.toDataURL(url, {
            margin: 0,
            width: 300,
            errorCorrectionLevel: 'M',
          });

          pdf.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);

          /* ================= CÓDIGO ================= */
          const codeBoxWidth = 33;
          const codeBoxHeight = 5;

          const codeX =
            x + CARD_WIDTH - codeBoxWidth - SAFE_MARGIN + 2;

          const codeY =
            y + CARD_HEIGHT - codeBoxHeight - SAFE_MARGIN + 2;

          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(
            codeX,
            codeY,
            codeBoxWidth,
            codeBoxHeight,
            2,
            2,
            'F'
          );

          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);

          pdf.text(
            cartao.codigo_unico,
            codeX + codeBoxWidth / 2,
            codeY + 4,
            { align: 'center' }
          );

          /* ================= GRID ================= */
          x += CARD_WIDTH + GAP;

          if (x + CARD_WIDTH > PAGE_WIDTH) {
            x = MARGIN_X;
            y += CARD_HEIGHT + GAP;
          }

          if (y + CARD_HEIGHT > PAGE_HEIGHT) {
            pdf.addPage();
            x = MARGIN_X;
            y = MARGIN_Y;
          }

          /* ================= PROGRESSO ================= */
          processados++;
          setAtual(processados);

          // 🔥 permite render da barra
          await tick();
        }


        const nome =
          tipo === 'lote'
            ? `cartoes-lote-${loteId}-parte-${parte}.pdf`
            : `cartoes-proprios-parte-${parte}.pdf`;

        if (zipFile) {
          zipFile.file(nome, pdf.output('blob'));
        } else {
          pdf.save(nome);
        }

        parte++;
      }

      if (zipFile && !cancelRef.current) {
        const blob = await zipFile.generateAsync({ type: 'blob' });
        saveAs(
          blob,
          tipo === 'lote'
            ? `cartoes-lote-${loteId}.zip`
            : `cartoes-proprios.zip`
        );
      }

      if (!cancelRef.current) {
        notify('Exportação concluída', { type: 'success' });
      }

      onClose();
    } catch (e) {
      console.error(e);
      notify('Erro ao gerar PDF', { type: 'error' });
      onClose();
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerando cartões</DialogTitle>

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
