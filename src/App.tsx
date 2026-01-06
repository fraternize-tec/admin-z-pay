import { Admin, Resource, TranslationMessages } from 'react-admin';
import { authProvider } from './auth/authProvider';
import { supabaseDataProvider } from './data/supabaseDataProvider';
import { LoginPage } from './auth/LoginPage';

import {
    EventoList,
    EventoCreate,
    EventoEdit,
} from './resources/eventos';
import { PontoDeVendaCreate, PontoDeVendaEdit, PontoDeVendaList } from './resources/pontosDeVenda';
import { ItemCreate, ItemEdit, ItemList } from './resources/itens';
import { ItemPdvCreate, ItemPdvEdit, ItemPdvList } from './resources/itemPdv';
import { CaixaCreate, CaixaEdit, CaixaList } from './resources/caixas';
import { FuncaoList, FuncaoCreate, FuncaoEdit } from './resources/funcoes';
import { PapelContextoList, PapelContextoCreate } from './resources/papelContexto';
import { PermissaoList, PermissaoCreate, PermissaoEdit } from './resources/permissoes';
import { UsuarioList, UsuarioEdit } from './resources/usuarios';

import { darkTheme, lightTheme } from './theme/theme';
import { i18nProvider } from './i18n/i18nProvider';

export const App = () => (
    <Admin
        theme={lightTheme}
        darkTheme={darkTheme}
        defaultTheme="dark"
        dataProvider={supabaseDataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        loginPage={LoginPage}
    >
        <Resource
            name="eventos"
            list={EventoList}
            create={EventoCreate}
            edit={EventoEdit}
        />

        <Resource
            name="pontos_de_venda"
            options={{ label: 'PDVs' }}
            list={PontoDeVendaList}
            create={PontoDeVendaCreate}
            edit={PontoDeVendaEdit}
        />

        <Resource
            name="itens"
            list={ItemList}
            create={ItemCreate}
            edit={ItemEdit}
        />

        <Resource
            name="item_pdv"
            options={{ label: 'Itens por PDV' }}
            list={ItemPdvList}
            create={ItemPdvCreate}
            edit={ItemPdvEdit}
        />

        <Resource
            name="caixas"
            options={{ label: 'Caixas' }}
            list={CaixaList}
            create={CaixaCreate}
            edit={CaixaEdit}
        />

        <Resource name="usuarios" list={UsuarioList} edit={UsuarioEdit} />
        <Resource name="permissoes" list={PermissaoList} create={PermissaoCreate} edit={PermissaoEdit} />
        <Resource name="funcoes_sistema" options={{ label: 'Papéis' }} list={FuncaoList} create={FuncaoCreate} edit={FuncaoEdit} />
        <Resource name="papel_contexto" options={{ label: 'Papéis por Contexto' }} list={PapelContextoList} create={PapelContextoCreate} />
    </Admin>
);
function polyglotI18nProvider(arg0: () => TranslationMessages, arg1: string) {
    throw new Error('Function not implemented.');
}

