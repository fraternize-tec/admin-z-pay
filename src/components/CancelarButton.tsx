import {
  Button,
  useNotify,
  useRefresh,
} from "react-admin";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import { CancelarDialog } from "./CancelarDialog";

export function CancelarButton({
  tipo,
  record,
}: {
  tipo: "recarga" | "consumo";
  record: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Cancelar"
        color="error"
        onClick={() => setOpen(true)}
      >
        <CancelIcon />
      </Button>

      <CancelarDialog
        open={open}
        onClose={() => setOpen(false)}
        tipo={tipo}
        record={record}
      />
    </>
  );
}
