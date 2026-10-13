
import QRCode from 'qrcode';

interface GerarQrCodePngParams {
  url: string;
}

export async function gerarQrCodePng({
  url,
}: GerarQrCodePngParams): Promise<Blob> {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
    type: 'image/png',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  const resposta = await fetch(dataUrl);
  return resposta.blob();
}
