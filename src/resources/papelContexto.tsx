import {
  Create,
  SimpleForm,
  ReferenceInput,
  required,
  FormDataConsumer,
  useRedirect,
  TopToolbar,
  AutocompleteInput,
  useGetOne,
} from 'react-admin';
import { useLocation } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { EscopoSelector } from '../components/EscopoSelector';

const PapelContextoCreateActions = () => (
  <TopToolbar>
    <BackToListButtonNavigate />
  </TopToolbar>
);

export const PapelContextoCreate = () => {
  const { state } = useLocation();
  const redirect = useRedirect();

  return (
    <Create
      actions={<PapelContextoCreateActions />}
      transform={(data) => ({
        ...data,
        usuario_id: state?.usuario_id,
        evento_id: undefined,
      })}
      mutationOptions={{
        onSuccess: () => {
          redirect(`/usuarios/${state?.usuario_id}`);
        },
      }}
    >
      <SimpleForm>

        {/* USUÁRIO */}
        <div style={{ marginBottom: '1em' }}>
          <b>Usuário:</b> {state?.email ?? ''}
        </div>

        {/* PAPEL */}
        <ReferenceInput
          source="papel_id"
          reference="funcoes_sistema"
        >
          <AutocompleteInput
            optionText="codigo"
            validate={required()}
            fullWidth
          />
        </ReferenceInput>

        {/* ESCOPOS DINÂMICOS */}
        <FormDataConsumer>
          {({ formData }) => {

            if (!formData.papel_id) return null;

            return (
              <EscopoFromPapel papelId={formData.papel_id} />
            );
          }}
        </FormDataConsumer>

      </SimpleForm>
    </Create>
  );
};

const EscopoFromPapel = ({ papelId }: { papelId: string | number }) => {

  const { data: papel } = useGetOne(
    "funcoes_sistema",
    { id: papelId },
    { enabled: !!papelId }
  );

  console.log("Papel selecionado:", papel);

  if (!papel?.escopo_tipo) return null;

  return (
    <EscopoSelector fixedEscopo={papel.escopo_tipo} />
  );
};