import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { NumberField } from "react-admin";

import { FormaPagamentoResumo } from "../types";

interface Props {
    formas: FormaPagamentoResumo[];
}

export const TabelaFormasPagamento = ({
    formas,
}: Props) => {

    if (!formas?.length) {

        return (

            <Typography
                variant="body2"
                color="text.secondary"
            >
                Nenhuma movimentação encontrada.
            </Typography>

        );

    }

    return (

        <Table size="small">

            <TableHead>

                <TableRow>

                    <TableCell>
                        Forma de Pagamento
                    </TableCell>

                    <TableCell align="right">
                        Total
                    </TableCell>

                </TableRow>

            </TableHead>

            <TableBody>

                {formas.map((forma) => (

                    <TableRow
                        hover
                        key={forma.forma}
                    >

                        <TableCell>

                            {forma.forma}

                        </TableCell>

                        <TableCell align="right">

                            <NumberField
                                record={{
                                    total: forma.total,
                                }}
                                source="total"
                                options={{
                                    style: "currency",
                                    currency: "BRL",
                                }}
                            />

                        </TableCell>

                    </TableRow>

                ))}

            </TableBody>

        </Table>

    );

};