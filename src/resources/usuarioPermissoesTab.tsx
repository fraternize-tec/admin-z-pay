import {
  ReferenceManyField,
  Datagrid,
  TextField,
  useRecordContext,
} from 'react-admin';
import { EscopoField } from './escopoField';

export const UsuarioPermissoesTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <ReferenceManyField
      reference="vw_usuario_permissoes_detalhe"
      target="usuario_id"
      perPage={100}
      sort={{ field: 'categoria', order: 'ASC' }}
    >
      <Datagrid
        bulkActionButtons={false}
        rowStyle={(record) => ({
          backgroundColor:
            record.origem === 'direta' ? '#1e293b' : undefined,
        })}
      >
        <TextField source="categoria" label="Categoria" />
        <TextField source="permissao" label="Permissão" />

        <TextField
          source="origem"
          label="Origem"
        />

        <TextField
          source="papel_codigo"
          label="Papel"
          emptyText="—"
        />

        <EscopoField />
      </Datagrid>
    </ReferenceManyField>
  );
};
