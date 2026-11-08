import { useEffect, useRef } from "react";
import { useGetOne, useSourceContext } from "react-admin";
import { useFormContext, Controller, useWatch } from "react-hook-form";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

interface VigenciaFromEventoProps {
    eventoId: string | number;
    restrictToEvento?: boolean;
}

const MAX_YEARS = 3;
const DEFAULT_DAYS = 7;

export const VigenciaFromEvento = ({
    eventoId,
    restrictToEvento = true
}: VigenciaFromEventoProps) => {

    const { data: evento } = useGetOne(
        "eventos",
        { id: eventoId },
        { enabled: !!eventoId }
    );

    const { setValue, control, getValues } = useFormContext();
    const sourceContext = useSourceContext();
    const inicioSource = sourceContext ? sourceContext.getSource("inicio") : "inicio";
    const fimSource = sourceContext ? sourceContext.getSource("fim") : "fim";

    const inicio = useWatch({ control, name: inicioSource });
    const fim = useWatch({ control, name: fimSource });

    const initializedRef = useRef(false);

    useEffect(() => {
        if (!evento) return;

        initializedRef.current = false;

        if (inicio && typeof inicio === "string") {
            setValue(inicioSource, new Date(inicio));
        }

        if (fim && typeof fim === "string") {
            setValue(fimSource, new Date(fim));
        }

        if (!getValues(inicioSource) && !getValues(fimSource)) {

            const now = new Date();

            const inicioEvento = evento.inicio
                ? new Date(evento.inicio)
                : now;

            const fimEvento = evento.fim
                ? new Date(evento.fim)
                : new Date(now.getTime() + DEFAULT_DAYS * 24 * 60 * 60 * 1000);

            requestAnimationFrame(() => {
                setValue(inicioSource, inicioEvento);
                setValue(fimSource, fimEvento);
            });
        }

    }, [evento, inicioSource, fimSource]);

    if (!evento) return null;

    const validateInicio = (value: Date | null) => {

        if (!value) return;

        const inicio = new Date(value);
        const fim = getValues(fimSource);

        // restrição evento
        if (restrictToEvento && evento.inicio && evento.fim) {

            if (inicio < new Date(evento.inicio)) {
                return "Início não pode ser antes do evento";
            }

            if (inicio > new Date(evento.fim)) {
                return "Início não pode ser depois do evento";
            }
        }

        // limite 3 anos
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + MAX_YEARS);

        if (inicio > maxDate) {
            return "Início não pode ser maior que 3 anos";
        }

        if (fim && inicio > new Date(fim)) {
            return "Início não pode ser maior que o fim";
        }
    };

    const validateFim = (value: Date | null) => {

        if (!value) return;

        const fim = new Date(value);
        const inicio = getValues(inicioSource);

        // restrição evento
        if (restrictToEvento && evento.inicio && evento.fim) {

            if (fim < new Date(evento.inicio)) {
                return "Fim não pode ser antes do evento";
            }

            if (fim > new Date(evento.fim)) {
                return "Fim não pode ser depois do evento";
            }
        }

        // limite 3 anos
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + MAX_YEARS);

        if (fim > maxDate) {
            return "Fim não pode ser maior que 3 anos";
        }

        if (inicio && fim < new Date(inicio)) {
            return "Fim não pode ser menor que início";
        }

        // diferença máxima 3 anos
        if (inicio) {

            const maxFim = new Date(inicio);
            maxFim.setFullYear(maxFim.getFullYear() + MAX_YEARS);

            if (fim > maxFim) {
                return "Diferença máxima é de 3 anos";
            }
        }
    };

    const minDate = restrictToEvento && evento.inicio
        ? new Date(evento.inicio)
        : undefined;

    const maxDate = restrictToEvento && evento.fim
        ? new Date(evento.fim)
        : undefined;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={2}
                mt={2}
            >
                <Controller
                    name={inicioSource}
                    control={control}
                    defaultValue={null}
                    rules={{ validate: validateInicio }}
                    render={({ field, fieldState }) => (
                        <DateTimePicker
                            label="Início"
                            value={
                                field.value
                                    ? typeof field.value === "string"
                                        ? new Date(field.value)
                                        : field.value
                                    : null
                            }
                            onChange={(value) => {
                                setValue(inicioSource, value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            minDateTime={minDate}
                            maxDateTime={maxDate}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!fieldState.error,
                                    helperText: fieldState.error?.message,
                                },
                            }}
                        />
                    )}
                />

                <Controller
                    name={fimSource}
                    control={control}
                    defaultValue={null}
                    rules={{ validate: validateFim }}
                    render={({ field, fieldState }) => (
                        <DateTimePicker
                            label="Fim"
                            value={
                                field.value
                                    ? typeof field.value === "string"
                                        ? new Date(field.value)
                                        : field.value
                                    : null
                            }
                            onChange={(value) => {
                                setValue(fimSource, value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            minDateTime={minDate}
                            maxDateTime={maxDate}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!fieldState.error,
                                    helperText: fieldState.error?.message,
                                },
                            }}
                        />
                    )}
                />
            </Box>
        </LocalizationProvider>
    );
};