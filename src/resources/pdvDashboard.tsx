import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";

import {
    LocalizationProvider,
    DateTimePicker,
} from "@mui/x-date-pickers";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { ptBR } from "date-fns/locale";

import { useRecordContext } from "react-admin";

import { supabase } from "../lib/supabaseClient";

import {
    DashboardPdv,
} from "../dashboard/types";

import {
    atalhos,
    rangesIguais,
} from "../dashboard/constants";

import {
    MetricCard,
} from "../dashboard/components/MetricCard";

import {
    formatMoney,
} from "../dashboard/formatters";

import { TabelaItens } from "../dashboard/components/TabelaItens";
import { TabelaOperadores } from "../dashboard/components/TabelaOperadores";

type PeriodoProps = {

    inicio: Date | null;

    fim: Date | null;

    setInicio: (
        d: Date | null
    ) => void;

    setFim: (
        d: Date | null
    ) => void;

    onAplicar: (
        inicio: Date | null,
        fim: Date | null,
    ) => void;

};

const PeriodoSelector = ({
    inicio,
    fim,
    setInicio,
    setFim,
    onAplicar,
}: PeriodoProps) => {

    return (

        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
        >

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 2,
                }}
            >

                <CardContent>

                    <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        mb={2}
                    >
                        Período
                    </Typography>

                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            xs: "1fr",
                            md: "repeat(3,minmax(0,1fr)) auto",
                        }}
                        gap={2}
                        mb={2}
                        alignItems="start"
                    >

                        <DateTimePicker
                            label="Data inicial"
                            value={inicio}
                            onChange={(v) => {
                                setInicio(v);
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                },
                            }}
                        />


                        <DateTimePicker
                            label="Data final"
                            value={fim}
                            onChange={(v) => {
                                setFim(v);
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={() => onAplicar(inicio, fim)}
                        >
                            Aplicar
                        </Button>

                    </Box>

                    <Box
                        sx={{
                            overflowX: "auto",
                            WebkitOverflowScrolling: "touch",
                            pb: 1,
                        }}
                    >
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={1}
                        >
                            {atalhos.map((a) => {

                                const range = a.getRange();

                                const ativo = rangesIguais(
                                    inicio,
                                    fim,
                                    range.inicio,
                                    range.fim
                                );

                                return (

                                    <Button
                                        key={a.label}
                                        size="small"
                                        variant={
                                            ativo
                                                ? "contained"
                                                : "text"
                                        }
                                        color={
                                            ativo
                                                ? "primary"
                                                : "inherit"
                                        }
                                        onClick={() => {

                                            const r = a.getRange();

                                            setInicio(r.inicio);
                                            setFim(r.fim);

                                            onAplicar(
                                                r.inicio,
                                                r.fim,
                                            );

                                        }}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: 999,
                                            flexShrink: 0,

                                            minWidth: "unset",

                                            px: 1.5,
                                            py: 0.5,

                                            fontSize: "0.8rem",
                                            fontWeight: 600,

                                            boxShadow: "none",

                                            opacity: ativo ? 1 : 0.8,

                                            "&:hover": {
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        {a.label}
                                    </Button>

                                );

                            })}
                        </Box>
                    </Box>

                </CardContent>

            </Card>

        </LocalizationProvider>

    );

};

export const PdvDashboardTab = () => {

    const record =
        useRecordContext();

    const rangeInicial =
        atalhos[0].getRange();

    const [
        inicio,
        setInicio,
    ] = useState<Date | null>(
        rangeInicial.inicio
    );

    const [
        fim,
        setFim,
    ] = useState<Date | null>(
        rangeInicial.fim
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        data,
        setData,
    ] = useState<DashboardPdv>();

    const carregar = async (
        novoInicio: Date | null = inicio,
        novoFim: Date | null = fim,
    ) => {

        if (!record)
            return;

        if (!novoInicio || !novoFim)
            return;

        setLoading(true);

        const { data, error } =
            await supabase.rpc(
                "rpc_dashboard_pdv",
                {
                    p_pdv: record.id,
                    p_inicio: novoInicio.toISOString(),
                    p_fim: novoFim.toISOString(),
                }
            );

        if (!error) {

            setData(data);

        }

        setLoading(false);

    };

    useEffect(() => {

        if (!record)
            return;

        carregar();

    }, [record?.id]);

    useEffect(() => {

        if (!record)
            return;

        const channel = supabase
            .channel(
                `dashboard-pdv-${record.id}`
            )

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "consumos",
                },
                carregar
            )

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "cancelamentos",
                },
                carregar
            )

            .subscribe();

        return () => {

            supabase.removeChannel(
                channel
            );

        };

    }, [
        record?.id
    ]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                py={8}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Nenhum dado encontrado para o período informado.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (

        <Box>

            <PeriodoSelector
                inicio={inicio}
                fim={fim}
                setInicio={setInicio}
                setFim={setFim}
                onAplicar={carregar}
            />

            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "repeat(2,1fr)",
                    lg: "repeat(5,1fr)",
                }}
                gap={2}
                mb={3}
            >

                <MetricCard
                    titulo="Valor Vendido"
                    valor={formatMoney(
                        data.resumo.valor_vendido
                    )}
                    cor="#2e7d32"
                />

                <MetricCard
                    titulo="Vendas"
                    valor={
                        data.resumo
                            .quantidade_vendas
                    }
                    cor="#1976d2"
                />

                <MetricCard
                    titulo="Ticket Médio"
                    valor={formatMoney(
                        data.resumo.ticket_medio
                    )}
                    cor="#6a1b9a"
                />

                <MetricCard
                    titulo="Itens"
                    valor={
                        data.resumo
                            .itens_vendidos
                    }
                    cor="#ef6c00"
                />

                <MetricCard
                    titulo="Operadores"
                    valor={
                        data.resumo
                            .operadores
                    }
                    cor="#00838f"
                />

            </Box>

            <TabelaItens
                titulo="Itens vendidos"
                grupos={[
                    {
                        titulo: "Itens vendidos",
                        total: data.resumo.valor_vendido,
                        itens: data.itens,
                    },
                ]}
            />

            <Box mt={4} />

            <TabelaOperadores
                titulo="Vendas por Operador"
                labelQuantidade="vendas"
                expandable={false}
                data={data.operadores}
            />
        </Box>

    );

};