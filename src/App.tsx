import { Admin, Resource } from 'react-admin';
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

export const App = () => (
    <Admin
        dataProvider={supabaseDataProvider}
        authProvider={authProvider}
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
    </Admin>
);
