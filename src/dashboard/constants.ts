// dashboard/constants.ts

export const atalhos = [
    {
        label: "Hoje",

        getRange: () => {

            const now = new Date();

            const inicio = new Date(now);

            inicio.setHours(
                0,
                0,
                0,
                0
            );

            const fim = new Date(now);

            fim.setHours(
                23,
                59,
                59,
                999
            );

            return {
                inicio,
                fim,
            };

        },
    },

    {
        label: "Última hora",

        getRange: () => {

            const now = new Date();

            return {

                inicio: new Date(
                    now.getTime() -
                    60 * 60 * 1000
                ),

                fim: now,

            };

        },
    },

    {
        label: "Últimas 12 horas",

        getRange: () => {

            const now = new Date();

            return {

                inicio: new Date(
                    now.getTime() -
                    12 * 60 * 60 * 1000
                ),

                fim: now,

            };

        },
    },

    {
        label: "Últimos 7 dias",

        getRange: () => {

            const now = new Date();

            const inicio =
                new Date(now);

            inicio.setDate(
                now.getDate() - 7
            );

            inicio.setHours(
                0,
                0,
                0,
                0
            );

            const fim =
                new Date(now);

            fim.setHours(
                23,
                59,
                59,
                999
            );

            return {
                inicio,
                fim,
            };

        },
    },

    {
        label: "Últimos 30 dias",

        getRange: () => {

            const now = new Date();

            const inicio =
                new Date(now);

            inicio.setDate(
                now.getDate() - 30
            );

            inicio.setHours(
                0,
                0,
                0,
                0
            );

            const fim =
                new Date(now);

            fim.setHours(
                23,
                59,
                59,
                999
            );

            return {
                inicio,
                fim,
            };

        },
    },
];

export const rangesIguais = (
    aInicio: Date | null,
    aFim: Date | null,
    bInicio: Date,
    bFim: Date
) => {
    if (!aInicio || !aFim) return false;

    return (
        Math.abs(aInicio.getTime() - bInicio.getTime()) < 1000 &&
        Math.abs(aFim.getTime() - bFim.getTime()) < 1000
    );
};