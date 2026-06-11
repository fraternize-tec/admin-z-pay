import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  TextInput,
  SimpleForm,
  ReferenceManyField,
  ReferenceField,
  CreateButton,
  TabbedShowLayout,
  Tab,
  Show,
  useRecordContext,
  BulkDeleteButton,
  Create,
  required,
  ReferenceInput,
  FormDataConsumer,
  useDataProvider,
  useNotify,
  AutocompleteInput,
  useGetOne,
  FunctionField,
  useUpdate,
  useRefresh,
  useRedirect,
  useDelete,
  Confirm,
} from 'react-admin';

import { UsuarioPermissoesTab } from './usuarioPermissoesTab';
import { EscopoSelector } from '../components/EscopoSelector';
import { useSearchParams } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { Box, Chip, Button } from '@mui/material';
import { UsuariosDatagrid } from '../components/UsuariosDatagrid';
import { SmartToolbar } from '../components/SmartToolbar';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';


const usuarioFilters = [
  <TextInput source="nome" label="Nome" alwaysOn />,
  <TextInput source="email" label="Email" alwaysOn />
];

const UsuarioActions = () => {
  return (
    <SmartToolbar>
      <BackToListButtonNavigate />
    </SmartToolbar>
  );
};

/* ================= LIST ================= */
export const UsuarioList = () => (
  <List filters={usuarioFilters} perPage={25}>
    <UsuariosDatagrid />
  </List>
  //   <List resource="vw_usuarios_visiveis" filters={usuarioFilters} perPage={25}>
  //   <UsuariosDatagrid />
  // </List>
);

const StatusVigenciaField = (props: any) => {

  const record = useRecordContext();

  if (!record) return null;

  const now = new Date();

  const inicio = record.inicio ? new Date(record.inicio) : null;
  const fim = record.fim ? new Date(record.fim) : null;

  let label = "Ativo";
  let color: "success" | "warning" | "default" = "success";

  if (inicio && inicio > now) {
    label = "Futuro";
    color = "warning";
  }

  if (fim && fim < now) {
    label = "Encerrado";
    color = "default";
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
    />
  );
};

const EncerrarPermissaoButton = (props: any) => {

  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const handleClick = () => {
    update(
      "papel_contexto",
      {
        id: record.id,
        data: {
          fim: new Date()
        },
        previousData: record
      },
      {
        onSuccess: () => {
          notify("Permissão encerrada");
          refresh();
        }
      }
    );
  };

  return (
    <Button
      variant="outlined"
      color="warning"
      onClick={handleClick}
      disabled={isLoading || record.fim}
    >
      Encerrar
    </Button>
  );
};

/* ================= PAPÉIS TAB ================= */
const UsuarioPapeisTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <>
      <CreateButton
        resource="papel_contexto"
        label="Adicionar papel"
        state={{ usuario_id: record.id, email: record.email }}
        sx={{ mb: 2 }}
      />


      <ReferenceManyField
        reference="papel_contexto"
        target="usuario_id"
        sort={{ field: "inicio", order: "DESC" }}
      >
        <Datagrid bulkActionButtons={<BulkDeleteButton />}>

          <StatusVigenciaField label="Status" />

          <ReferenceField
            source="papel_id"
            reference="funcoes_sistema"
            label="Papel"
          >
            <TextField source="codigo" />
          </ReferenceField>

          <ReferenceFieldWithEscopoSelector label="Escopo" />

          <DateField source="inicio" label="Início" />
          <DateField source="fim" label="Fim" />

          <EncerrarPermissaoButton label="Ações" />

        </Datagrid>
      </ReferenceManyField>
    </>
  );
};

const ReferenceFieldWithEscopoSelector = (props: any) => {
  const record = useRecordContext();
  const { data: funcao } = useGetOne(
    "funcoes_sistema",
    { id: record?.papel_id },
    { enabled: !!record?.papel_id }
  );

  return (
    <ReferenceField
      source="escopo_id"
      reference={
        funcao?.escopo_tipo === "evento"
          ? "eventos"
          : funcao?.escopo_tipo === "pdv"
            ? "pontos_de_venda"
            : "caixas"
      }
      label="Escopo"
    >
      <TextField source="nome" />
    </ReferenceField>
  );
};
export const ToggleUsuarioButton = () => {
    const record = useRecordContext();

    const [open, setOpen] = useState(false);

    const [update, { isPending }] = useUpdate();

    const notify = useNotify();
    const refresh = useRefresh();

    if (!record) return null;

    const handleConfirm = () => {
        update(
            'usuarios',
            {
                id: record.id,
                data: {
                    ativo: !record.ativo,
                },
                previousData: record,
            },
            {
                onSuccess: () => {
                    notify('Usuário atualizado');
                    refresh();
                    setOpen(false);
                },
                onError: (error) => {
                    notify(
                        error instanceof Error
                            ? error.message
                            : 'Erro ao atualizar usuário',
                        { type: 'error' }
                    );

                    setOpen(false);
                },
            }
        );
    };

    const ativando = !record.ativo;

    return (
        <>
            <Button
                color={record.ativo ? 'warning' : 'success'}
                onClick={() => setOpen(true)}
                disabled={isPending}
                size="small"
            >
                {record.ativo
                    ? 'Desativar Usuário'
                    : 'Ativar Usuário'}
            </Button>

            <Confirm
                isOpen={open}
                title={
                    ativando
                        ? 'Ativar usuário'
                        : 'Desativar usuário'
                }
                content={
                    <>
                        <strong>{record.nome}</strong>
                        <br />
                        <br />

                        {ativando
                            ? 'O usuário será reativado e poderá acessar o sistema novamente.'
                            : 'O usuário será desativado e perderá acesso ao sistema.'}

                        <br />
                        <br />
                        Deseja continuar?
                    </>
                }
                onConfirm={handleConfirm}
                onClose={() => setOpen(false)}
                loading={isPending}
            />
        </>
    );
};

export const ReenviarConviteButton = () => {

  const record = useRecordContext()
  const notify = useNotify()
  const dataProvider = useDataProvider()

  const handleClick = async () => {
    if (!record) {
      notify("Registro não encontrado", { type: "error" });
      return;
    }

    try {

      await dataProvider.create("reenviar-convite", {
        data: { email: record.email }
      })

      notify("Convite reenviado com sucesso", { type: "info" })

    } catch (e) {

      notify(e instanceof Error ? e.message : "Erro desconhecido", { type: "error" })

    }
  }

return (
  <Button
    size="small"
    onClick={handleClick}
  >
    Reenviar convite
  </Button>
);
}
export const RemoverPermissaoButton = () => {
    const record = useRecordContext();

    const [open, setOpen] = useState(false);

    const [deleteOne, { isPending }] = useDelete();

    const notify = useNotify();
    const refresh = useRefresh();

    if (!record?.papel_contexto_id) {
        return null;
    }

    const handleConfirm = () => {
        deleteOne(
            'papel_contexto',
            {
                id: record.papel_contexto_id,
            },
            {
                onSuccess: () => {
                    notify('Permissão removida com sucesso', { type: 'success' });
                    refresh();
                    setOpen(false);
                },
                onError: (error) => {
                    const message =
                        error instanceof Error
                            ? error.message
                            : undefined;

                    notify(
                        message ?? 'Erro ao remover acesso',
                        { type: 'error' }
                    );

                    setOpen(false);
                },
            }
        );
    };

    return (
        <>
            <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setOpen(true)}
                disabled={isPending}
            >
                Remover Permissão
            </Button>

            <Confirm
                isOpen={open}
                title="Remover permissão"
                content={
                    <>
                        <strong>Atenção!</strong>
                        <br />
                        O vínculo deste operador com esta permissão será removido.
                        <br />
                        <br />
                        Operador: <strong>{record.nome}</strong>
                        <br />
                        <br />
                        Deseja continuar?
                    </>
                }
                onConfirm={handleConfirm}
                onClose={() => setOpen(false)}
                loading={isPending}
            />
        </>
    );
};

/* ================= EDIT ================= */
export const UsuarioEdit = () => (
  <Edit actions={<UsuarioActions />}>
    <>
      {/* FORMULÁRIO */}
      <SimpleForm>
        <TextInput source="nome" fullWidth />
        <TextInput source="email" fullWidth disabled />

        <Box mb={2}>
          <FunctionField
            label="Status"
            render={(record) =>
              record.ativo ? (
                <Chip label="Ativo" color="success" size="small" />
              ) : (
                <Chip label="Inativo" color="error" size="small" />
              )
            }
          />
        </Box>

        <Box mt={1} display="flex" gap={1}>
          <RemoverPermissaoButton />
          <ToggleUsuarioButton />
          <ReenviarConviteButton />
        </Box>

      </SimpleForm>

      {/* VISUALIZAÇÕES */}
      <Show actions={false}>
        <TabbedShowLayout>
          <Tab label="Papéis e Contextos">
            <UsuarioPapeisTab />
          </Tab>

          <Tab label="Permissões Efetivas">
            <UsuarioPermissoesTab />
          </Tab>
        </TabbedShowLayout>
      </Show>
    </>
  </Edit>
);

export const UsuarioCreate = () => {

  const [searchParams] = useSearchParams();
  const caixa_id = searchParams.get("caixa_id");
  const pdv_id = searchParams.get("pdv_id");

  const notify = useNotify();
  const redirect = useRedirect();

  const { data: caixa } = useGetOne(
    "caixas",
    { id: caixa_id },
    { enabled: !!caixa_id }
  );

  const { data: pdv } = useGetOne(
    "pontos_de_venda",
    { id: pdv_id },
    { enabled: !!pdv_id }
  );

  const eventoId =
    caixa?.evento_id ??
    pdv?.evento_id;

  return (
    <Create
      actions={<UsuarioActions />}
      mutationOptions={{
        onSuccess: () => {

          notify("Usuário criado com sucesso", { type: "success" });

          if (caixa_id) {
            redirect(`/caixas/${caixa_id}`);
            return;
          }

          if (pdv_id) {
            redirect(`/pontos_de_venda/${pdv_id}`);
            return;
          }

          redirect("list", "usuarios");
        }
      }}
    >
      <SimpleForm
        defaultValues={{
          ...(caixa && {
            papel_id: "4a43dbb0-ac8a-432e-9d9c-baaf77694b9a",
            escopo_tipo: "caixa",
            escopo_id: caixa_id
          }),
          ...(pdv && {
            papel_id: "c011b799-a414-4132-96dc-7f33aa145325",
            escopo_tipo: "pdv",
            escopo_id: pdv_id
          }),
          ...(eventoId && {
            evento_id: eventoId
          })

        }}
      >

        <TextInput
          source="email"
          fullWidth
          validate={required()}
          parse={(value) =>
            value ? value.trim().toLowerCase() : value
          }
        />

        {/* PAPEL */}
        {caixa_id ? (
          <>
            <TextInput
              source="papel_codigo"
              label="Papel"
              defaultValue="OPERADOR_CAIXA"
              disabled
              fullWidth
            />
          </>
        ) : pdv_id ? (
          <>
            <TextInput
              source="papel_codigo"
              label="Papel"
              defaultValue="OPERADOR_PDV"
              disabled
              fullWidth
            />
          </>
        ) : (
          <ReferenceInput
            source="papel_id"
            reference="funcoes_sistema"
            perPage={50}
          >
            <AutocompleteInput optionText="codigo" fullWidth />
          </ReferenceInput>
        )}

        <FormDataConsumer>
          {({ formData }) => {

            const papel_id = formData?.papel_id;

            const { data: funcao } = useGetOne(
              "funcoes_sistema",
              { id: papel_id },
              { enabled: !!papel_id }
            );

            const escopoFromFuncao = funcao?.escopo_tipo;

            return (
              <EscopoSelector
                fixedEscopo={caixa ? "caixa" : pdv ? "pdv" : escopoFromFuncao}
                fixedEscopoId={caixa?.id ?? pdv?.id}
                fixedEventoId={eventoId}
              />
            );
          }}
        </FormDataConsumer>

      </SimpleForm>
    </Create>
  );
};