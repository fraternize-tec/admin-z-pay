import { useEffect, useRef } from "react";
import { useGetOne } from "react-admin";
import { useFormContext, Controller } from "react-hook-form";

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

    const previousEventoId = useRef<string | number | null>(null);

    useEffect(() => {
        if (!evento) return;

        const isEventoChanged = previousEventoId.current !== eventoId;

        if (isEventoChanged) {

            const now = new Date();

            const inicioEvento = evento.inicio
                ? new Date(evento.inicio)
                : now;

            const fimEvento = evento.fim
                ? new Date(evento.fim)
                : new Date(now.getTime() + DEFAULT_DAYS * 24 * 60 * 60 * 1000);

            setValue("inicio", inicioEvento);
            setValue("fim", fimEvento);
        }

        previousEventoId.current = eventoId;

    }, [evento, eventoId]);

    if (!evento) return null;

    const validateInicio = (value: Date | null) => {

        if (!value) return;

        const inicio = new Date(value);
        const fim = getValues("fim");

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
        const inicio = getValues("inicio");

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
                    name="inicio"
                    control={control}
                    rules={{ validate: validateInicio }}
                    render={({ field, fieldState }) => (
                        <DateTimePicker
                            label="Início"
                            value={field.value ? new Date(field.value) : null}
                            onChange={field.onChange}
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
                    name="fim"
                    control={control}
                    rules={{ validate: validateFim }}
                    render={({ field, fieldState }) => (
                        <DateTimePicker
                            label="Fim"
                            value={field.value ? new Date(field.value) : null}
                            onChange={field.onChange}
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