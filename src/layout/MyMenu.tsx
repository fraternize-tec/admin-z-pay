import { Menu, MenuItemLink, usePermissions } from "react-admin";
import EventIcon from "@mui/icons-material/Event";
import StoreIcon from "@mui/icons-material/Store";
import InventoryIcon from "@mui/icons-material/Inventory";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PeopleIcon from "@mui/icons-material/People";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { can } from "../auth/useCan";

export const MyMenu = () => {
  const { permissions } = usePermissions();

  return (
    <Menu
      sx={{
        "& .RaMenuItemLink-root": {
          borderRadius: 10,
          mx: 1,
          my: 0.5,
        },
        "& .RaMenuItemLink-active": {
          backgroundColor: "rgba(204, 85, 0, 0.12)",
        },
      }}
    >
      {/* ===================== */}
      {/* EVENTOS               */}
      {/* ===================== */}
      {can(permissions, "eventos.read") && (
        <MenuItemLink
          to="/eventos"
          primaryText="Eventos"
          leftIcon={<EventIcon />}
        />
      )}

      {can(permissions, "eventos.read") && (
        <MenuItemLink
          to="/vw_cartoes_proprios"
          primaryText="Cartões Próprios"
          leftIcon={<CreditCardIcon />}
        />
      )}

      {/* ===================== */}
      {/* OPERAÇÃO              */}
      {/* ===================== */}
      {can(permissions, "eventos.read") && (
        <MenuItemLink
          to="/operacao/cartoes"
          primaryText="Cancelar Operação"
          leftIcon={<CreditCardIcon />}
        />
      )}

      {/* ===================== */}
      {/* PDV / CAIXA           */}
      {/* ===================== */}
      {can(permissions, "pdv.read") && (
        <MenuItemLink
          to="/pontos_de_venda"
          primaryText="PDVs"
          leftIcon={<StoreIcon />}
        />
      )}

      {can(permissions, "caixa.read") && (
        <MenuItemLink
          to="/caixas"
          primaryText="Caixas"
          leftIcon={<PointOfSaleIcon />}
        />
      )}

      {/* ===================== */}
      {/* ITENS                 */}
      {/* ===================== */}
      {can(permissions, "itens.read") && (
        <MenuItemLink
          to="/itens"
          primaryText="Itens"
          leftIcon={<InventoryIcon />}
        />
      )}

      {/* ===================== */}
      {/* USUÁRIOS              */}
      {/* ===================== */}
      {can(permissions, "usuarios.read") && (
        <MenuItemLink
          to="/usuarios"
          primaryText="Usuários"
          leftIcon={<PeopleIcon />}
        />
      )}

      {/* ===================== */}
      {/* RBAC                  */}
      {/* ===================== */}
      {can(permissions, "rbac.manage") && (
        [
          <MenuItemLink
            key="funcoes"
            to="/funcoes_sistema"
            primaryText="Papéis"
            leftIcon={<AdminPanelSettingsIcon />}
          />,
          <MenuItemLink
            key="permissoes"
            to="/permissoes"
            primaryText="Permissões"
            leftIcon={<VpnKeyIcon />}
          />
        ]
      )}
    </Menu>
  );
};
