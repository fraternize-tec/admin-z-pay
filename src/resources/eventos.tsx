import { Card, CardContent, Typography, useMediaQuery } from '@mui/material';
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
  FormDataConsumer,
  NumberInput,
  useGetList,
} from 'react-admin';
import { BackToListButton } from '../components/BackToListButton';
import { can } from '../auth/useCan';
import { useNavigate } from 'react-router';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { EventoTaxaPrimeiraRecarga } from './eventoTaxa';

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

      <Button
        label="Cartões emergenciais"
        startIcon={<CreditCardIcon />}
        onClick={() =>
          navigate(`/eventos/${record.id}/cartoes-emergenciais`)
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
const transformEventoCreate = (data: any) => {
  const {
    taxa_ativa,
    taxa_valor,
    taxa_descricao,
    ...evento
  } = data;

  return {
    p_evento: evento,
    p_taxa: {
      ativa: taxa_ativa ?? false,
      valor: taxa_valor ?? 0,
      descricao: taxa_descricao ?? 'Taxa de ativação do cartão',
    },
  };
};

export const EventoCreate = () => (
  <Create
    mutationMode="pessimistic"
    transform={transformEventoCreate}
    mutationOptions={{
      meta: {
        rpc: 'create_evento_com_taxa',
      },
    }}
  >
    <SimpleForm>
      {/* EVENTO */}
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

      {/* TAXA */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Taxa da primeira recarga
          </Typography>

          <BooleanInput
            source="taxa_ativa"
            label="Cobrar taxa na primeira recarga"
          />

          <FormDataConsumer>
            {({ formData }) =>
              formData.taxa_ativa && (
                <>
                  <NumberInput
                    source="taxa_valor"
                    label="Valor da taxa"
                    min={0}
                    step={0.01}
                    fullWidth
                  />

                  <TextInput
                    source="taxa_descricao"
                    defaultValue="Taxa de ativação do cartão"
                    fullWidth
                  />
                </>
              )
            }
          </FormDataConsumer>
        </CardContent>
      </Card>
    </SimpleForm>
  </Create>
);

const transformEventoUpdate = (data: any) => {
  const {
    id,
    taxa_ativa,
    taxa_valor,
    taxa_descricao,
    ...evento
  } = data;

  return {
    p_evento_id: id,
    p_evento: evento,
    p_taxa: {
      ativa: taxa_ativa,
      valor: taxa_valor,
      descricao: taxa_descricao,
    },
  };
};


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
  <Edit
    mutationMode="pessimistic"
    transform={transformEventoUpdate}
    redirect='list'
    mutationOptions={{
      meta: {
        rpc: 'update_evento_com_taxa',
      },
    }}
    actions={<EventoEditActions />}
  >
    <EventoEditForm />
  </Edit>
);

export const EventoEditForm = () => {
  const record = useRecordContext();

  const { data: taxa, isLoading } = useGetList(
    'evento_taxa_primeira_recarga',
    {
      filter: { evento_id: record?.id },
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: !!record?.id }
  );

  if (!record || isLoading) return null;

  const taxaData = taxa?.[0];

  return (
    <SimpleForm
      defaultValues={{
        taxa_ativa: taxaData?.ativa,
        taxa_valor: taxaData?.valor,
        taxa_descricao: taxaData?.descricao,
      }}
    >
      {/* EVENTO */}
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

      {/* TAXA */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Taxa da primeira recarga
          </Typography>

          <BooleanInput
            source="taxa_ativa"
            label="Cobrar taxa na primeira recarga"
          />

          <FormDataConsumer>
            {({ formData }) =>
              formData.taxa_ativa && (
                <>
                  <NumberInput
                    source="taxa_valor"
                    label="Valor da taxa"
                    min={0}
                    step={0.01}
                    fullWidth
                  />

                  <TextInput
                    source="taxa_descricao"
                    fullWidth
                  />
                </>
              )
            }
          </FormDataConsumer>
        </CardContent>
      </Card>
    </SimpleForm>
  );
};
