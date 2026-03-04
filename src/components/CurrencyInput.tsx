import { NumericFormat } from "react-number-format";
import TextField from "@mui/material/TextField";

interface Props {
  label: string;
  value: number | string | null;
  onChange: (value: number | null) => void;
}

export const CurrencyInput = ({ label, value, onChange }: Props) => {
  return (
    <NumericFormat
      value={value ?? ""}
      onValueChange={(values) => {
        onChange(values.floatValue ?? null);
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      customInput={TextField}
      label={label}
      fullWidth
    />
  );
};