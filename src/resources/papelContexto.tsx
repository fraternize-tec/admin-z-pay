import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  required,
  FormDataConsumer,
  useRedirect,
  TextField,
  TopToolbar,
  AutocompleteInput,
} from 'react-admin';
import { useLocation } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';

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
        evento_id: undefined, // 🔥 remove campo auxiliar
      })}
      mutationOptions={{
        onSuccess: () => {
          redirect(`/usuarios/${state?.usuario_id}`);
        },
      }}
    >
      <SimpleForm>

        {/* USUÁRIO */}
        <div style={{ marginBottom: '1em' }}><b>Usuário:</b> {state?.email ?? ''}</div>

        {/* PAPEL */}
        <ReferenceInput source="papel_id" reference="funcoes_sistema">
          <SelectInput optionText="codigo" validate={required()} />
        </ReferenceInput>

        {/* ESCOPO */}
        <SelectInput
          source="escopo_tipo"
          label="Escopo"
          choices={[
            { id: "global", name: "Global" },
            { id: "evento", name: "Evento" },
            { id: "pdv", name: "PDV" },
            { id: "caixa", name: "Caixa" },
          ]}
          validate={required()}
        />

        <FormDataConsumer>
          {({ formData }) => {

            if (!formData.escopo_tipo) return null;

            return (
              <>
                {/* EVENTO */}
                {formData.escopo_tipo === "evento" && (
                  <ReferenceInput
                    source="escopo_id"
                    reference="eventos"
                    label="Evento"
                    perPage={50}
                  >
                    <AutocompleteInput optionText="nome" debounce={350} sx={{ minWidth: 250, maxWidth: 500 }} />
                  </ReferenceInput>
                )}

                {/* PDV */}
                {formData.escopo_tipo === "pdv" && (
                  <>
                    <ReferenceInput
                      source="evento_id" // campo auxiliar
                      reference="eventos"
                      label="Evento"
                      perPage={50}
                    >
                      <AutocompleteInput optionText="nome" debounce={350} sx={{ minWidth: 250, maxWidth: 500 }} />
                    </ReferenceInput>

                    {formData.evento_id && (
                      <ReferenceInput
                        source="escopo_id"
                        reference="pontos_de_venda"
                        filter={{ evento_id: formData.evento_id }}
                        label="PDV"
                      >
                        <AutocompleteInput optionText="nome" debounce={350} sx={{ minWidth: 250, maxWidth: 500 }} />
                      </ReferenceInput>
                    )}
                  </>
                )}

                {/* CAIXA */}
                {formData.escopo_tipo === "caixa" && (
                  <>
                    <ReferenceInput
                      source="evento_id" // campo auxiliar
                      reference="eventos"
                      label="Evento"
                    >
                      <AutocompleteInput optionText="nome" debounce={350} sx={{ minWidth: 250, maxWidth: 500 }} />
                    </ReferenceInput>

                    {formData.evento_id && (
                      <ReferenceInput
                        source="escopo_id"
                        reference="caixas"
                        filter={{ evento_id: formData.evento_id }}
                        label="Caixa"
                      >
                        <AutocompleteInput optionText="nome" debounce={350} sx={{ minWidth: 250, maxWidth: 500 }} />
                      </ReferenceInput>
                    )}
                  </>
                )}

              </>
            );
          }}
        </FormDataConsumer>

      </SimpleForm>
    </Create>
  );
};