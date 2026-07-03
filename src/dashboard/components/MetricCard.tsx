import {
    Box,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

export interface MetricCardProps {

    titulo: string;

    valor: number | string;

    subtitulo?: string;

    cor?: string;

    minWidth?: number;

}

export const MetricCard = ({
    titulo,
    valor,
    subtitulo,
    cor = "#1976d2",
    minWidth = 200,
}: MetricCardProps) => (
    <Card
        sx={{
            borderRadius: 2,

            border: "1px solid",

            borderColor: "divider",

            position: "relative",

            overflow: "hidden",

            minWidth: {
                xs: "100%",
                sm: minWidth,
            },

            transition: "all .2s",

            "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
            },
        }}
    >
        <Box
            sx={{
                position: "absolute",

                top: 0,

                left: 0,

                width: 4,

                height: "100%",

                bgcolor: cor,
            }}
        />

        <CardContent
            sx={{
                py: 2,

                pl: 3,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    opacity: .7,

                    lineHeight: 1.2,
                }}
            >
                {titulo}
            </Typography>

            <Typography
                variant="h5"
                fontWeight={800}
                mt={0.5}
            >
                {typeof valor === "number"
                    ? valor.toLocaleString("pt-BR")
                    : valor}
            </Typography>

            {subtitulo && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {subtitulo}
                </Typography>
            )}
        </CardContent>
    </Card>
);