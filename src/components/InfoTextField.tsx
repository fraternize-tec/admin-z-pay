import { useRecordContext } from "react-admin";
import { InfoBox } from "./InfoBox";

export const InfoTextField = ({
    label,
    source,
    render,
}: any) => {
    const record = useRecordContext();

     if (!record) return null;

    if (render) {
        return (
            <InfoBox label={label}>
                {render(record)}
            </InfoBox>
        );
    }

    const value = record?.[source];

    const formatValue = () => {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }

        const isDate =
            typeof value === 'string' &&
            !isNaN(Date.parse(value));

        if (isDate) {
            return new Date(value).toLocaleString(
                'pt-BR',
                {
                    dateStyle: 'short',
                    timeStyle: 'short',
                }
            );
        }

        return String(value);
    };

    return (
        <InfoBox label={label}>
            {formatValue()}
        </InfoBox>
    );
};