import {
    Box,
    Card,
    CardContent,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { FinanceiroResumo } from "../types";
import { formatMoney } from "../formatters";

interface Props {
    data: FinanceiroResumo;
}

export const ResumoFinanceiro = ({
    data,
}: Props) => {

    const theme = useTheme();

    const items = [

        {
            label: "Taxas Arrecadadas",

            tooltip:
                "Total arrecadado em taxas de ativação somando todas as formas de pagamento.",

            value: data.taxas_arrecadadas,

            color: theme.palette.warning.main,

            oculto:
                data.taxas_arrecadadas === 0,
        },

        {
            label:
                "Valor Recebido em Recargas",

            tooltip:
                "Total recebido em recargas pagas desconsiderando taxas.",

            value:
                data.valor_bruto_recebido,

            color:
                theme.palette.info.main,
        },

        {
            label:
                "Cortesias",

            tooltip:
                "Créditos emitidos gratuitamente.",

            value:
                data.cortesias,

            color:
                theme.palette.success.main,

            oculto:
                data.cortesias === 0,
        },

        {
            label:
                "Créditos Emitidos",

            tooltip:
                "Total de créditos disponibilizados.",

            value:
                data.valor_liquido_cartoes,

            color:
                theme.palette.primary.main,
        },

        {
            label:
                "Valor Consumido",

            tooltip:
                "Valor total consumido.",

            value:
                data.total_consumido,

            color:
                theme.palette.error.main,
        },

        {
            label:
                "Devoluções",

            tooltip:
                "Valores devolvidos.",

            value:
                data.devolucoes,

            color:
                theme.palette.error.light,

            oculto:
                data.devolucoes === 0,
        },

        {
            label:
                "Saldo em Circulação",

            tooltip:
                "Saldo ainda disponível nos cartões.",

            value:
                data.saldo_evento,

            color:
                theme.palette.success.main,

            destaque: true,
        },

    ];

    return (

        <Card
            sx={{
                borderRadius: 2,
                mb: 3,

                border: "1px solid",
                borderColor: "divider",
            }}
        >

            <CardContent>

                <Typography
                    variant="overline"
                    color="text.secondary"
                >
                    Resumo Financeiro
                </Typography>

                <Box
                    mt={3}
                    display="grid"
                    gridTemplateColumns={{
                        xs: "1fr",
                        sm: "repeat(2,1fr)",
                        md: "repeat(auto-fit,minmax(180px,1fr))",
                    }}
                    gap={2}
                >

                    {items
                        .filter(i => !i.oculto)
                        .map(item => (

                            <Box
                                key={item.label}
                                sx={{
                                    p: 2,

                                    borderRadius: 2,

                                    bgcolor:
                                        "background.default",

                                    border:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                    borderLeft:
                                        `3px solid ${item.color}`,

                                    transition:
                                        ".2s",

                                    "&:hover": {
                                        transform:
                                            "translateY(-2px)",

                                        boxShadow:
                                            theme.shadows[2],
                                    },
                                }}
                            >

                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={.5}
                                >

                                    <Typography
                                        variant="caption"
                                    >
                                        {item.label}
                                    </Typography>

                                    <Tooltip
                                        title={
                                            item.tooltip
                                        }
                                    >

                                        <InfoOutlinedIcon
                                            sx={{
                                                fontSize: 14,

                                                color:
                                                    "text.disabled",

                                                cursor:
                                                    "help",
                                            }}
                                        />

                                    </Tooltip>

                                </Box>

                                <Typography
                                    mt={.5}
                                    variant={
                                        item.destaque
                                            ? "h5"
                                            : "h6"
                                    }
                                    fontWeight={800}
                                    sx={{
                                        color:
                                            item.color,
                                    }}
                                >
                                    {formatMoney(
                                        item.value
                                    )}
                                </Typography>

                            </Box>

                        ))}

                </Box>

            </CardContent>

        </Card>

    );

};