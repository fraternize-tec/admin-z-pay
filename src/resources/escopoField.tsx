import { useRecordContext, ReferenceField, TextField } from 'react-admin';

export const EscopoField = () => {
  const record = useRecordContext();
  if (!record) return null;

  if (record.escopo_tipo === 'global') {
    return <TextField source="escopo_tipo" label="Escopo" />;
  }

  if (record.escopo_tipo === 'evento') {
    return (
      <ReferenceField
        source="escopo_id"
        reference="eventos"
        label="Escopo"
      >
        <TextField source="nome" />
      </ReferenceField>
    );
  }

  if (record.escopo_tipo === 'pdv') {
    return (
      <ReferenceField
        source="escopo_id"
        reference="pontos_de_venda"
        label="Escopo"
      >
        <TextField source="nome" />
      </ReferenceField>
    );
  }

  if (record.escopo_tipo === 'caixa') {
          return (
      <ReferenceField
        source="escopo_id"
        reference="caixas"
        label="Escopo"
      >
        <TextField source="nome" />
      </ReferenceField>
    );
  }

  return null;
};
