import { Box } from "@mui/material";

import { MetricCard } from "./MetricCard";
import { CartoesStats } from "../types";

interface Props {
    cartoes: CartoesStats;
}

export const CardsOperacionais = ({
    cartoes,
}: Props) => {

    const cards = [

        {
            titulo: "Cartões Utilizados",

            valor:
                `${cartoes.cartoes_utilizados} / ${cartoes.total_cartoes}`,

            subtitulo:
                "cartões operacionalizados",

            cor: "#6a1b9a",
        },

        {
            titulo:
                "Cartões Disponíveis",

            valor:
                cartoes.cartoes_disponiveis,

            subtitulo:
                "ainda sem utilização",

            cor: "#2e7d32",
        },

        {
            titulo:
                "Cartões do Evento",

            valor:
                `${cartoes.cartoes_evento_utilizados} / ${cartoes.cartoes_evento_total}`,

            subtitulo:
                "utilizados do lote do evento",

            cor: "#00838f",
        },

        {
            titulo:
                "Cartões Emergenciais",

            valor:
                `${cartoes.cartoes_emergenciais_utilizados} / ${cartoes.cartoes_emergenciais_total}`,

            subtitulo:
                "utilizados emergenciais",

            cor: "#ef6c00",
        },

    ];

    return (

        <Box
            display="grid"
            gridTemplateColumns={{
                xs: "1fr",
                sm: "repeat(2,1fr)",
                md: "repeat(4,1fr)",
            }}
            gap={2}
        >

            {cards.map(card => (

                <MetricCard
                    key={card.titulo}
                    titulo={card.titulo}
                    valor={card.valor}
                    subtitulo={card.subtitulo}
                    cor={card.cor}
                />

            ))}

        </Box>

    );

};