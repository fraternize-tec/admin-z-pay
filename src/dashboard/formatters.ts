// dashboard/formatters.ts

export const formatMoney = (value: number) =>
    value.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    );

export const formatNumber = (value: number) =>
    value.toLocaleString("pt-BR");

export const formatPercent = (
    value: number,
    digits = 2
) =>
    `${value.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        }
    )}%`;