import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { OperadorResumo } from "../types";
import { formatMoney } from "../formatters";
import { ReactNode } from "react";

interface Props {
    data: OperadorResumo[];

    titulo?: string;

    labelQuantidade?: string;

    labelCartoes?: string;

    renderDetails?: (
        operador: OperadorResumo
    ) => ReactNode;

    expandable?: boolean;
}

const LinhaOperador = ({
    op,
    labelQuantidade,
    labelCartoes,
}: {
    op: OperadorResumo;
    labelQuantidade: string;
    labelCartoes: string;
}) => (

    <Box
        display="flex"
        flexDirection={{
            xs: "column",
            sm: "row",
        }}
        gap={1}
        justifyContent="space-between"
        alignItems={{
            xs: "flex-start",
            sm: "center",
        }}
        width="100%"
    >

        <Box minWidth={0}>

            <Typography
                fontWeight={700}
                sx={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                }}
            >
                {op.operador_nome}
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
            >
                {(op.qtd_recargas ??
                    op.qtd_vendas ??
                    0)}{" "}

                {labelQuantidade}

                {op.cartoes_utilizados != null && (
                    <>
                        {" • "}
                        {op.cartoes_utilizados} {labelCartoes}
                    </>
                )}

            </Typography>

        </Box>

        <Typography
            fontWeight={700}
            color="success.main"
        >
            {formatMoney(
                op.total_recargas ??
                op.valor_total ??
                0
            )}
        </Typography>

    </Box>

);

export const TabelaOperadores = ({
    data,
    titulo = "Recargas por Operador",
    labelQuantidade = "recargas",
    labelCartoes = "cartões",
    renderDetails,
    expandable = true,
}: Props) => {

    console.log("TabelaOperadores", data);

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

{(data ?? []).map((op, index) => {

    if (!expandable) {

        return (

            <Card
                key={index}
                variant="outlined"
                sx={{
                    mb: 1,
                    borderRadius: 2,
                }}
            >

                <CardContent>

                    <LinhaOperador
                        op={op}
                        labelQuantidade={labelQuantidade}
                        labelCartoes={labelCartoes}
                    />

                </CardContent>

            </Card>

        );

    }

    return (

        <Accordion
            key={index}
            disableGutters
        >

            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    "& .MuiAccordionSummary-content": {
                        minWidth: 0,
                    },
                }}
            >

                <LinhaOperador
                    op={op}
                    labelQuantidade={labelQuantidade}
                    labelCartoes={labelCartoes}
                />

            </AccordionSummary>

            <AccordionDetails
                sx={{
                    px: {
                        xs: 1,
                        sm: 2,
                    },
                }}
            >

                <Box>

                    {renderDetails
                        ? renderDetails(op)
                        : mobile
                            ? (
                                <Stack spacing={1.2}>
                                    {(op.formas_pagamento ?? []).map((fp, idx) => (
                                        <Card
                                            key={idx}
                                            variant="outlined"
                                            sx={{ borderRadius: 1 }}
                                        >
                                            <CardContent
                                                sx={{
                                                    py: 1.5,
                                                    "&:last-child": {
                                                        pb: 1.5,
                                                    },
                                                }}
                                            >
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between"
                                                >
                                                    <Typography variant="body2">
                                                        {fp.forma}
                                                    </Typography>

                                                    <Typography fontWeight={700}>
                                                        {formatMoney(fp.total)}
                                                    </Typography>

                                                </Box>

                                            </CardContent>

                                        </Card>
                                    ))}
                                </Stack>
                            )
                            : (


                                <Box
                                    component="table"
                                    sx={{
                                        width: "100%",

                                        borderCollapse:
                                            "separate",

                                        borderSpacing: 0,

                                        "& thead th": {
                                            fontSize: 12,

                                            fontWeight: 700,

                                            color:
                                                "text.secondary",

                                            backgroundColor:
                                                "action.hover",

                                            borderBottom:
                                                "1px solid",

                                            borderColor:
                                                "divider",
                                        },

                                        "& tbody td": {
                                            borderBottom:
                                                "1px solid",

                                            borderColor:
                                                "divider",
                                        },

                                        "& tbody tr:last-child td": {
                                            borderBottom:
                                                "none",
                                        },

                                        "& tbody tr:hover": {
                                            backgroundColor:
                                                "action.hover",
                                        },
                                    }}
                                >

                                    <thead>

                                        <tr>

                                            <th
                                                style={{
                                                    textAlign:
                                                        "left",

                                                    padding: 8,
                                                }}
                                            >
                                                Forma
                                            </th>

                                            <th
                                                style={{
                                                    textAlign:
                                                        "right",

                                                    padding: 8,
                                                }}
                                            >
                                                Total
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {(op.formas_pagamento ??
                                            []).map(
                                                (
                                                    fp,
                                                    idx
                                                ) => (

                                                    <tr
                                                        key={idx}
                                                    >

                                                        <td
                                                            style={{
                                                                padding: 8,
                                                            }}
                                                        >
                                                            {fp.forma}
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding: 8,

                                                                textAlign:
                                                                    "right",

                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {formatMoney(
                                                                fp.total
                                                            )}
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                    </tbody>

                                </Box>

                            )}
                            </Box>

                        </AccordionDetails>

                    </Accordion>

                );
            })}

            </CardContent>

        </Card>
    );

};