import {
    Datagrid,
    TextField,
    DateField,
    FunctionField,
} from "react-admin";

import { Chip, Box } from "@mui/material";
import { ToggleUsuarioButton, ReenviarConviteButton } from "../resources/usuarios";


type UsuariosDatagridProps = {
    rowClick?: "edit" | false;
    disableBulkDelete?: boolean;
};

export const UsuariosDatagrid = ({
    rowClick = "edit",
    disableBulkDelete = false,
}: UsuariosDatagridProps) => (
    <Datagrid rowClick={rowClick} hover={rowClick !== false} bulkActionButtons={disableBulkDelete ? false : undefined}>

        <TextField
            source="nome"
            label="Nome"
        />

        <TextField
            source="email"
            label="Email"
        />

        <DateField
            source="criado_em"
            label="Criado em"
        />

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

        <FunctionField
            label="Ações"
            render={() => (
                <Box display="flex" gap={1}>
                    <ToggleUsuarioButton />
                    <ReenviarConviteButton />
                </Box>
            )}
        />

    </Datagrid>
);