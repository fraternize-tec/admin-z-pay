import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { formatMoney } from "../formatters";
import { ItemResumo } from "../types";

export interface GrupoItens {

    titulo: string;

    total?: number;

    itens: ItemResumo[];

}

import { ReactNode } from "react";

interface Props {

    titulo: string;

    grupos: GrupoItens[];

    renderDetails?: (
        grupo: GrupoItens
    ) => ReactNode;

}

export const TabelaItens = ({
    titulo,
    grupos,
    renderDetails,
}: Props) => {

    const theme = useTheme();

    const mobile = useMediaQuery(
        theme.breakpoints.down("sm")
    );

    return (

        <Card
            sx={{
                borderRadius: 2,
                boxShadow: 1,
            }}
        >

            <CardContent>

                <Typography
                    variant="h6"
                    fontWeight={800}
                    mb={2}
                >
                    {titulo}
                </Typography>

                {grupos.map(
                    (grupo, index) => {

                        const itensAgrupados =
                            Object.values(

                                grupo.itens.reduce(
                                    (
                                        acc: Record<
                                            string,
                                            ItemResumo[]
                                        >,
                                        item
                                    ) => {

                                        if (
                                            !acc[item.item_nome]
                                        ) {

                                            acc[item.item_nome] =
                                                [];

                                        }

                                        acc[
                                            item.item_nome
                                        ].push(item);

                                        return acc;

                                    },
                                    {}
                                )

                            );

                        return (

                            <Accordion
                                key={index}
                                disableGutters
                            >

                                <AccordionSummary
                                    expandIcon={
                                        <ExpandMoreIcon />
                                    }
                                >

                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        width="100%"
                                        flexDirection={{
                                            xs: "column",
                                            sm: "row",
                                        }}
                                        gap={1}
                                    >

                                        <Typography
                                            fontWeight={700}
                                        >
                                            {grupo.titulo}
                                        </Typography>

                                        {grupo.total != null && (

                                            <Typography
                                                color="primary"
                                                fontWeight={700}
                                            >
                                                {formatMoney(
                                                    grupo.total
                                                )}
                                            </Typography>

                                        )}

                                    </Box>

                                </AccordionSummary>

                                <AccordionDetails>
                                    {renderDetails
                                        ? (renderDetails(
                                            grupo
                                        ))
                                        :
                                    mobile
                                        ? (

                                            <Stack spacing={1.5}>

                                                {itensAgrupados.map(
                                                    (
                                                        lista,
                                                        idx
                                                    ) => {

                                                        const itens =
                                                            lista as ItemResumo[];

                                                        const mudouPreco =
                                                            itens.length >
                                                            1;

                                                        return itens.map(
                                                            (
                                                                item,
                                                                j
                                                            ) => (

                                                                <Card
                                                                    key={`${idx}-${j}`}
                                                                    variant="outlined"
                                                                >

                                                                    <CardContent>

                                                                        <Stack spacing={1}>

                                                                            <Box
                                                                                display="flex"
                                                                                justifyContent="space-between"
                                                                            >

                                                                                <Box>

                                                                                    <Typography
                                                                                        fontWeight={700}
                                                                                    >
                                                                                        {item.item_nome}
                                                                                    </Typography>

                                                                                    {mudouPreco &&
                                                                                        j ===
                                                                                        0 && (

                                                                                            <Chip
                                                                                                size="small"
                                                                                                color="warning"
                                                                                                label="preço alterado"
                                                                                            />

                                                                                        )}

                                                                                </Box>

                                                                                <Typography
                                                                                    fontWeight={800}
                                                                                >
                                                                                    {formatMoney(
                                                                                        item.valor_total
                                                                                    )}
                                                                                </Typography>

                                                                            </Box>

                                                                            <Box
                                                                                display="grid"
                                                                                gridTemplateColumns="repeat(2,1fr)"
                                                                                gap={2}
                                                                            >

                                                                                <Box>

                                                                                    <Typography variant="caption">
                                                                                        Preço
                                                                                    </Typography>

                                                                                    <Typography>
                                                                                        {formatMoney(
                                                                                            item.valor_unitario
                                                                                        )}
                                                                                    </Typography>

                                                                                </Box>

                                                                                <Box>

                                                                                    <Typography variant="caption">
                                                                                        Quantidade
                                                                                    </Typography>

                                                                                    <Typography>
                                                                                        {item.quantidade}
                                                                                    </Typography>

                                                                                </Box>

                                                                            </Box>

                                                                        </Stack>

                                                                    </CardContent>

                                                                </Card>

                                                            )
                                                        );

                                                    }
                                                )}
                                                

                                            </Stack>

                                        )
                                        : (

                                            <Box
                                                component="table"
                                                sx={{
                                                    width: "100%",
                                                    borderCollapse:
                                                        "collapse",

                                                    "& th": {
                                                        textAlign:
                                                            "right",
                                                        p: 1,
                                                    },

                                                    "& th:first-of-type":
                                                    {
                                                        textAlign:
                                                            "left",
                                                    },

                                                    "& td": {
                                                        p: 1,
                                                        borderTop:
                                                            "1px solid",
                                                        borderColor:
                                                            "divider",
                                                    },
                                                }}
                                            >

                                                <thead>

                                                    <tr>

                                                        <th>
                                                            Item
                                                        </th>

                                                        <th>
                                                            Preço
                                                        </th>

                                                        <th>
                                                            Qtd
                                                        </th>

                                                        <th>
                                                            Total
                                                        </th>

                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {itensAgrupados.map(
                                                        (
                                                            lista,
                                                            idx
                                                        ) => {

                                                            const itens =
                                                                lista as ItemResumo[];

                                                            const mudouPreco =
                                                                itens.length >
                                                                1;

                                                            return itens.map(
                                                                (
                                                                    item,
                                                                    j
                                                                ) => (

                                                                    <tr
                                                                        key={`${idx}-${j}`}
                                                                    >

                                                                        <td>

                                                                            <Box
                                                                                display="flex"
                                                                                gap={1}
                                                                                alignItems="center"
                                                                            >

                                                                                {j ===
                                                                                    0 &&
                                                                                    item.item_nome}

                                                                                {mudouPreco &&
                                                                                    j ===
                                                                                    0 && (

                                                                                        <Chip
                                                                                            label="preço alterado"
                                                                                            size="small"
                                                                                            color="warning"
                                                                                        />

                                                                                    )}

                                                                            </Box>

                                                                        </td>

                                                                        <td
                                                                            align="right"
                                                                        >
                                                                            {formatMoney(
                                                                                item.valor_unitario
                                                                            )}
                                                                        </td>

                                                                        <td
                                                                            align="right"
                                                                        >
                                                                            {item.quantidade}
                                                                        </td>

                                                                        <td
                                                                            align="right"
                                                                        >
                                                                            <strong>
                                                                                {formatMoney(
                                                                                    item.valor_total
                                                                                )}
                                                                            </strong>
                                                                        </td>

                                                                    </tr>

                                                                )
                                                            );

                                                        }
                                                    )}

                                                </tbody>

                                            </Box>

                                        )}

                                </AccordionDetails>

                            </Accordion>

                        );

                    }
                )}

            </CardContent>

        </Card>

    );

};