import { Identifier, useNotify } from 'react-admin';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { PoppinsBold } from '../fonts/Poppins-Bold';

interface Props {
  loteId: Identifier;
  onClose: () => void;
}

// dimensões cartão
const CARD_WIDTH = 90;
const CARD_HEIGHT = 60;

// área segura
const SAFE_MARGIN = 7;

// página
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const GAP = 5;
const MARGIN_X = 10;
const MARGIN_Y = 10;

export const ExportarCartoesPdf = ({ loteId, onClose }: Props) => {
  const notify = useNotify();
  const gerouRef = useRef(false);

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
      const { data: cartoes } = await supabase
        .from('meios_acesso')
        .select('codigo_unico, nano_id')
        .eq('lote_id', loteId);

      const { data: lote } = await supabase
        .from('lotes_cartoes')
        .select('arte_frente_url, arte_verso_url')
        .eq('id', loteId)
        .single();

      if (!cartoes?.length || !lote) {
        notify('Dados insuficientes', { type: 'warning' });
        onClose();
        return;
      }

      const frente = await fetch(lote.arte_frente_url)
        .then(r => r.blob())
        .then(blobToBase64);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

      pdf.addFileToVFS('Poppins-Bold.ttf', PoppinsBold);
      pdf.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');

      pdf.setFont('Poppins', 'bold');

      // =====================
      // FRENTE
      // =====================
      let x = MARGIN_X;
      let y = MARGIN_Y;

      for (const cartao of cartoes) {
        const url = `https://cards.zpay.fraternize.com.br/card/${cartao.nano_id}`;

        // fundo
        pdf.addImage(frente, 'PNG', x, y, CARD_WIDTH, CARD_HEIGHT);

        // QR box
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

        // código
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

        pdf.setFont('Poppins', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);

        pdf.text(
          cartao.codigo_unico,
          codeX + codeBoxWidth / 2,
          codeY + 4,
          { align: 'center' }
        );


        // grid
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
      }

      pdf.save(`cartoes-lote-${loteId}.pdf`);
      notify('PDF gerado com sucesso', { type: 'success' });
      onClose();

    } catch (e) {
      console.error(e);
      notify('Erro ao gerar PDF', { type: 'error' });
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerando PDF</DialogTitle>
      <DialogContent>
        Gerando cartões...
        <Button onClick={onClose} sx={{ mt: 2 }}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
