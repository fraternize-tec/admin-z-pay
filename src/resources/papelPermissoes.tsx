import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  required,
} from 'react-admin';
import { useLocation } from 'react-router-dom';

export const PapelPermissaoCreate = () => {
  const { state } = useLocation();
  const papelId = state?.papel_id;

  return (
    <Create
      redirect={papelId ? `/funcoes_sistema/${papelId}` : 'list'}
      transform={(data) => ({
        ...data,
        papel_id: papelId,
      })}
    >
      <SimpleForm>
        <ReferenceInput source="papel_id" reference="funcoes_sistema">
          <SelectInput optionText="codigo" disabled />
        </ReferenceInput>

        <ReferenceInput source="permissao_id" reference="permissoes">
          <SelectInput
            optionText="codigo"
            label="Permissão"
            validate={required()}
          />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
};
