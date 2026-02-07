import { Admin, CustomRoutes, MenuItemLink, Resource } from 'react-admin';
import { supabaseDataProvider } from './data/supabaseDataProvider';
import { authProvider } from './auth/authProvider';
import { LoginPage } from './auth/LoginPage';
import { MyLayout } from './layout/MyLayout';
import { can } from './auth/useCan';

import {
    EventoList,
    EventoCreate,
    EventoEdit,
} from './resources/eventos';
import {
    PontoDeVendaList,
    PontoDeVendaCreate,
    PontoDeVendaEdit,
} from './resources/pontosDeVenda';
import { ItemList, ItemCreate, ItemEdit } from './resources/itens';
import { CaixaCreate, CaixaEdit, CaixaList } from './resources/caixas';
import { UsuarioList, UsuarioEdit } from './resources/usuarios';
import { PermissaoList, PermissaoCreate, PermissaoEdit } from './resources/permissoes';
import { FuncaoList, FuncaoCreate, FuncaoEdit } from './resources/funcoes';
import { PapelContextoCreate } from './resources/papelContexto';

import EventIcon from '@mui/icons-material/Event';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import { i18nProvider } from './i18n/i18nProvider';
import { lightTheme, darkTheme } from './theme/theme';
import { ItemPdvCreate, ItemPdvEdit, ItemPdvList } from './resources/itemPdv';
import { PapelPermissaoCreate } from './resources/papelPermissoes';
import { LoteCartaoList, LoteCartaoCreate, LoteCartaoEdit } from './resources/lotesCartoes';
import { Route } from 'react-router';
import { CartaoList } from './resources/cartoes';
import { CartaoProprioShow, CartoesPropriosList } from './resources/cartoesProprios';
import { CartoesPropriosEventoList } from './resources/cartoesEmergenciais';
import { ExtratoMeioAcesso } from './resources/extratoMeioAcesso';
import HistoricoCartaoOperacional from './pages/historicoCartaoOperacional';

export const App = () => (
    <Admin
        layout={MyLayout}
        theme={lightTheme}
        darkTheme={darkTheme}
        defaultTheme="dark"
        dataProvider={supabaseDataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        loginPage={LoginPage}
    >
        <CustomRoutes>
            <Route
                path="/eventos/:eventoId/lotes-cartoes"
                element={<LoteCartaoList />}
            />

            <Route
                path="/eventos/:eventoId/lotes-cartoes/create"
                element={<LoteCartaoCreate />}
            />

            <Route
                path="/eventos/:eventoId/lotes-cartoes/:loteId/cartoes"
                element={<CartaoList />}
            />

            <Route
                path="/eventos/:eventoId/cartoes-emergenciais"
                element={<CartoesPropriosEventoList />}
            />

            <Route
                path="/operacao/cartoes"
                element={<HistoricoCartaoOperacional />}
            />
        </CustomRoutes>
        {(permissions) => (
            <>
                {can(permissions, 'eventos.read') && (
                    <>
                        <Resource
                            name="eventos"
                            icon={EventIcon}
                            list={EventoList}
                            create={can(permissions, 'eventos.write') ? EventoCreate : undefined}
                            edit={can(permissions, 'eventos.write') ? EventoEdit : undefined}
                        />

                        <Resource
                            name="lotes_cartoes"
                            options={{ label: 'Lotes de Cartões' }}
                            create={can(permissions, 'eventos.write') ? LoteCartaoCreate : undefined}
                            edit={can(permissions, 'eventos.write') ? LoteCartaoEdit : undefined}
                        />

                        <Resource
                            name="evento_taxa_primeira_recarga"
                            options={{ label: 'Taxa de primeira recarga' }}
                            recordRepresentation="descricao"
                        />


                        <Resource
                            name="vw_cartoes_proprios"
                            icon={CreditCardIcon}
                            options={{ label: 'Cartões Próprios' }}
                            list={CartoesPropriosList}
                            show={CartaoProprioShow}
                        />

                    </>
                )}

                {can(permissions, 'pdv.read') && (
                    <Resource
                        name="pontos_de_venda"
                        icon={StoreIcon}
                        options={{ label: 'PDVs' }}
                        list={PontoDeVendaList}
                        create={can(permissions, 'pdv.write') ? PontoDeVendaCreate : undefined}
                        edit={can(permissions, 'pdv.write') ? PontoDeVendaEdit : undefined}
                    />
                )}

                {can(permissions, 'itens.read') && (
                    <Resource
                        name="itens"
                        icon={InventoryIcon}
                        list={ItemList}
                        create={can(permissions, 'itens.write') ? ItemCreate : undefined}
                        edit={can(permissions, 'itens.write') ? ItemEdit : undefined}
                    />
                )}

                {can(permissions, 'itens.read') && (
                    <Resource
                        name="item_pdv"
                        icon={InventoryIcon}
                        options={{ label: 'Itens por PDV' }}
                        list={ItemPdvList}
                        create={can(permissions, 'itens.write') ? ItemPdvCreate : undefined}
                        edit={can(permissions, 'itens.write') ? ItemPdvEdit : undefined}
                    />
                )}

                {can(permissions, 'caixa.read') && (
                    <Resource
                        name="caixas"
                        icon={PointOfSaleIcon}
                        options={{ label: 'Caixas' }}
                        list={CaixaList}
                        create={CaixaCreate}
                        edit={CaixaEdit}
                    />
                )}

                {can(permissions, 'usuarios.read') && (
                    <Resource
                        name="usuarios"
                        icon={PeopleIcon}
                        options={{ label: 'Usuários' }}
                        list={UsuarioList}
                        edit={can(permissions, 'usuarios.write') ? UsuarioEdit : undefined}
                    />
                )}

                {can(permissions, 'rbac.manage') && (
                    <>

                        <Resource
                            name="funcoes_sistema"
                            options={{ label: 'Papéis' }}
                            list={FuncaoList}
                            create={FuncaoCreate}
                            edit={FuncaoEdit}
                        />
                        <Resource
                            name="permissoes"
                            options={{ label: 'Permissões' }}
                            list={PermissaoList}
                            create={PermissaoCreate}
                            edit={PermissaoEdit}
                        />
                        <Resource
                            name="papel_permissoes"
                            options={{ label: 'Permissões por Papel' }}
                            create={PapelPermissaoCreate}
                        />
                        <Resource
                            name="papel_contexto"
                            options={{ label: 'Papéis por Contexto' }}
                            create={PapelContextoCreate}
                        />
                        <Resource
                            name="vw_usuario_permissoes_detalhe"
                            options={{ label: 'Permissões Efetivas' }}
                        />

                    </>
                )}
            </>
        )}
    </Admin>
);

