import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  useRecordContext,
} from "react-admin";
import { CancelarButton } from "../components/CancelarButton";
import { Chip } from "@mui/material";

export function ExtratoMeioAcesso(props: any) {
  return (
    <List
      {...props}
      filters={false}
      perPage={50}
      sort={{ field: "criado_em", order: "DESC" }}
    >
      <Datagrid rowClick={false}>
        <TipoField />
        <NumberField source="valor" />
        <DateField source="criado_em" showTime />
        <StatusField />
        <AcoesField />
      </Datagrid>
    </List>
  );
}

function TipoField() {
  const record = useRecordContext();

  if (!record) return null;

  const map: any = {
    recarga: "Recarga",
    consumo: "Consumo",
    taxa: "Taxa"
  };

  return <span>{map[record.tipo]}</span>;
}

function StatusField() {
  const record = useRecordContext();

  if (!record) return null;

  if (record.cancelado) {
    return <Chip label="Cancelado" color="error" size="small" />;
  }

  return <Chip label="Ativo" color="success" size="small" />;
}

function AcoesField() {
  const record = useRecordContext();

  if (!record) return null;

  if (record.tipo === "taxa") return null;
  if (record.cancelado) return null;

  return (
    <CancelarButton
      tipo={record.tipo}
      record={{ id: record.operacao_id }}
    />
  );
}

