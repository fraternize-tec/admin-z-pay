import { useRecordContext } from "react-admin";
import { InfoBox } from "./InfoBox";

export const InfoTextField = ({
    label,
    source
}: any) => {
    const record = useRecordContext();

    const value = record?.[source];

    const formatValue = () => {
        if (!value) return '-';

        const isDate =
            typeof value === 'string' &&
            !isNaN(Date.parse(value));

        if (isDate) {
            return new Date(value).toLocaleString(
                'pt-BR',
                {
                    dateStyle: 'short',
                    timeStyle: 'short'
                }
            );
        }

        return value;
    };

    return (
        <InfoBox label={label}>
            {formatValue()}
        </InfoBox>
    );
};