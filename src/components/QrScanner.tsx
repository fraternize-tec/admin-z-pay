import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

export function QrScanner({ onResult, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  const lastScanRef = useRef<string | null>(null);
  const lockRef = useRef(false);

  const [status, setStatus] = useState("Aponte a câmera para o QRCode");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (!result) return;

        const text = result.getText();

        // evita leitura repetida
        if (lockRef.current) return;

        if (text === lastScanRef.current) return;

        lockRef.current = true;
        lastScanRef.current = text;

        setStatus("QR Code detectado");

        onResult(text);

        // desbloqueia leitura depois de 2s
        setTimeout(() => {
          lockRef.current = false;
        }, 2000);
      })
      .then((controls) => {
        controlsRef.current = controls;
      });

    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <Box p={2}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          borderRadius: 8,
        }}
      />

      <Typography mt={2} textAlign="center">
        {status}
      </Typography>

      <Box mt={2} textAlign="center">
        <Button variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      </Box>
    </Box>
  );
}