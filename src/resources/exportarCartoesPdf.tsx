// exportarCartoesPdf.tsx
import { Identifier, useNotify } from 'react-admin';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { supabase } from '../lib/supabaseClient';

interface Props {
  loteId: Identifier;
  onClose: () => void;
}

export const ExportarCartoesPdf = ({ loteId, onClose }: Props) => {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gerarPdf();
    // eslint-disable-next-line
  }, []);

  const gerarPdf = async () => {
    try {
      // 1️⃣ buscar cartões do lote
      const { data: cartoes, error } = await supabase
        .from('meios_acesso')
        .select('codigo_unico, nano_id')
        .eq('lote_id', loteId);

      if (error) throw error;

      if (!cartoes || cartoes.length === 0) {
        notify('Nenhum cartão encontrado', { type: 'warning' });
        onClose();
        return;
      }

      // 2️⃣ criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let x = 10;
      let y = 10;
      const cardWidth = 90;
      const cardHeight = 55;

      for (let i = 0; i < cartoes.length; i++) {
        const cartao = cartoes[i];

        const url = `https://cards.zpay.fraternize.com.br/card/${cartao.nano_id}`;

        const qr = await QRCode.toDataURL(url);

        pdf.rect(x, y, cardWidth, cardHeight);

        pdf.text(cartao.codigo_unico, x + 5, y + 10);
        pdf.addImage(qr, 'PNG', x + 5, y + 15, 30, 30);

        x += cardWidth + 5;

        if (x + cardWidth > 210) {
          x = 10;
          y += cardHeight + 5;
        }

        if (y + cardHeight > 297) {
          pdf.addPage();
          x = 10;
          y = 10;
        }
      }

      // 3️⃣ download
      pdf.save(`cartoes-lote-${loteId}.pdf`);

      notify('PDF gerado com sucesso', { type: 'success' });
      onClose();
    } catch (err) {
      console.error(err);
      notify('Erro ao gerar PDF', { type: 'error' });
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerando PDF</DialogTitle>
      <DialogContent>
        {loading ? 'Gerando cartões...' : 'Concluído'}
        <Button onClick={onClose} sx={{ mt: 2 }}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
