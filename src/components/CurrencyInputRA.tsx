import { NumericFormat } from "react-number-format";
import { useInput, InputProps } from "react-admin";
import TextField from "@mui/material/TextField";

export const CurrencyInput = (props: InputProps) => {
    const {
        field,
        fieldState: { error },
        isRequired,
    } = useInput(props);

    return (
        <NumericFormat
            value={field.value ?? ""}
            onValueChange={(values) => {
                field.onChange(values.floatValue ?? null);
            }}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            customInput={TextField}
            label={props.label}
            required={isRequired}
            error={!!error}
            helperText={error?.message}
            fullWidth
            inputRef={field.ref}
        />
    );
};
