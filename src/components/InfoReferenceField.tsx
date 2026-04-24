import { ReferenceField, TextField } from "react-admin";
import { InfoBox } from "./InfoBox";

export const InfoReferenceField = ({
    label,
    source,
    reference
}: any) => (
    <InfoBox label={label}>
        <ReferenceField
            source={source}
            reference={reference}
            link={false}
        >
            <TextField source="nome" />
        </ReferenceField>
    </InfoBox>
);