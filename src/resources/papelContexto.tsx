import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  required,
  FormDataConsumer,
  useRedirect,
} from 'react-admin';
import { useLocation } from 'react-router-dom';

export const PapelContextoCreate = () => {
  const { state } = useLocation();
  const redirect = useRedirect();

  return (
    <Create
      transform={(data) => ({
        ...data,
        usuario_id: state?.usuario_id,
      })}
      mutationOptions={{
        onSuccess: () => {
          redirect(`/usuarios/${state?.usuario_id}`);
        },
      }}
    >
      <SimpleForm>
        <ReferenceInput source="usuario_id" reference="usuarios">
          <SelectInput optionText="email" disabled />
        </ReferenceInput>

        <ReferenceInput source="papel_id" reference="funcoes_sistema">
          <SelectInput optionText="codigo" validate={required()} />
        </ReferenceInput>

        <SelectInput
          source="escopo_tipo"
          label="Escopo"
          choices={[
            { id: 'global', name: 'Global' },
            { id: 'evento', name: 'Evento' },
            { id: 'pdv', name: 'PDV' },
            { id: 'caixa', name: 'Caixa' },
          ]}
          validate={required()}
        />

        <FormDataConsumer>
          {({ formData }) => (
            <>
              {formData.escopo_tipo === 'evento' && (
                <ReferenceInput source="escopo_id" reference="eventos">
                  <SelectInput optionText="nome" label="Evento" />
                </ReferenceInput>
              )}

              {formData.escopo_tipo === 'pdv' && (
                <ReferenceInput source="escopo_id" reference="pontos_de_venda">
                  <SelectInput optionText="nome" label="PDV" />
                </ReferenceInput>
              )}

              {formData.escopo_tipo === 'caixa' && (
                <ReferenceInput source="escopo_id" reference="caixas">
                  <SelectInput optionText="id" label="Caixa" />
                </ReferenceInput>
              )}
            </>
          )}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
