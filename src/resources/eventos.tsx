import { useMediaQuery } from '@mui/material';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  DateTimeInput,
  BooleanInput,
  SelectInput,
  required,
  SimpleList,
  TopToolbar,
  usePermissions,
  Toolbar,
  SaveButton,
  DeleteButton,
  Button,
  useRecordContext,
} from 'react-admin';
import { BackToListButton } from '../components/BackToListButton';
import { can } from '../auth/useCan';
import { useNavigate } from 'react-router';
import CreditCardIcon from '@mui/icons-material/CreditCard';

/* ========= LIST ========= */

const EventoEditActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  return (
    <TopToolbar>
      <BackToListButton />

      <Button
        label="Lotes de cartões"
        startIcon={<CreditCardIcon />}
        onClick={() =>
          navigate(`/eventos/${record.id}/lotes-cartoes`)
        }
      />
    </TopToolbar>
  );
};

export const EventoList = () => {
  const isSmall = useMediaQuery('(max-width:600px)');

  return (
    <List>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.nome}
          secondaryText={(record) => record.data_inicio}
          tertiaryText={(record) => record.localidade}
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="nome" />
          <TextField source="localidade" />
          <DateField source="inicio" />
          <DateField source="fim" />
          <TextField source="tipo_evento" />
          <BooleanField source="ativo" />
        </Datagrid>
      )}
    </List>
  );
};

/* ========= CREATE ========= */
export const EventoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="nome" validate={required()} fullWidth />
      <TextInput source="descricao" multiline fullWidth />
      <TextInput source="localidade" fullWidth />

      <SelectInput
        source="tipo_evento"
        choices={[
          { id: 'fixo', name: 'Fixo' },
          { id: 'indefinido', name: 'Indefinido' },
        ]}
      />

      <DateTimeInput source="inicio" />
      <DateTimeInput source="fim" />
      <BooleanInput source="ativo" defaultValue />
    </SimpleForm>
  </Create>
);

const EventoEditToolbar = () => {
  const { permissions } = usePermissions();

  return (
    <Toolbar>
      <SaveButton />
      {can(permissions, 'rbac.manage') && <DeleteButton />}
    </Toolbar>
  );
};

/* ========= EDIT ========= */
export const EventoLotesButton = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  return (
    <Button
      label="Lotes de cartões"
      startIcon={<CreditCardIcon />}
      onClick={() =>
        navigate(`/eventos/${record.id}/lotes-cartoes`)
      }
    />
  );
};

export const EventoEdit = () => (
  <Edit actions={<EventoEditActions />}>
    <SimpleForm toolbar={<EventoEditToolbar />}>
      <TextInput source="nome" fullWidth />
      <TextInput source="descricao" multiline fullWidth />
      <TextInput source="localidade" fullWidth />

      <SelectInput
        source="tipo_evento"
        choices={[
          { id: 'fixo', name: 'Fixo' },
          { id: 'indefinido', name: 'Indefinido' },
        ]}
      />

      <DateTimeInput source="inicio" />
      <DateTimeInput source="fim" />
      <BooleanInput source="ativo" />
    </SimpleForm>
  </Edit>
);
