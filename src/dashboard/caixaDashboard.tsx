import {
    Alert,
    Box,
    CircularProgress,
    Grid,
    Typography,
} from "@mui/material";
import {
    useDataProvider,
    useRecordContext,
} from "react-admin";
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    DashboardCaixa,
    OperadorResumo,
} from "./types";

import { MetricCard } from "./components/MetricCard";

import { TabelaOperadores } from "./components/TabelaOperadores";
import { TabelaFormasPagamento } from "./components/TabelaFormasPagamento";

import { PeriodoSelector } from "./pdvDashboard";
import { atalhos } from "./constants";
import { SectionCard } from "./components/SectionCard";
import { supabase } from "../lib/supabaseClient";
import { formatMoney } from "./formatters";

export const CaixaDashboardTab = () => {

    const record = useRecordContext();

    const dataProvider = useDataProvider();

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

    const [loading, setLoading] = useState(false);

    const [erro, setErro] = useState<string>();

    const [dashboard, setDashboard] =
        useState<DashboardCaixa>();

    const carregar = useCallback(

        async (

            novoInicio = inicio,

            novoFim = fim,

        ) => {

            if (!record?.id) return;

            setLoading(true);

            setErro(undefined);

            try {

                const { data, error } = await supabase.rpc(
                    "rpc_dashboard_caixa",
                    {
                        p_caixa: record.id,
                        p_inicio: novoInicio?.toISOString(),
                        p_fim: novoFim?.toISOString(),
                    }
                );

                console.log("RPC Dashboard Caixa:", data, error);

                if (error) {
                    throw error;
                }

                setDashboard(data);

            } catch (e: any) {

                setErro(
                    e?.message ??
                    "Erro ao carregar relatório."
                );

            } finally {

                setLoading(false);

            }

        },

        [
            record?.id,
            inicio,
            fim,
            dataProvider,
        ]

    );

    useEffect(() => {

        carregar();

    }, [carregar]);

    if (!record?.id) {

        return null;

    }

    return (

        <Box>

            <PeriodoSelector
                inicio={inicio}
                fim={fim}
                setInicio={setInicio}
                setFim={setFim}
                onAplicar={(i, f) => {

                    setInicio(i);

                    setFim(f);

                    carregar(i, f);

                }}
            />

            {erro && (

                <Alert
                    severity="error"
                    sx={{ mt: 2 }}
                >
                    {erro}
                </Alert>

            )}

            {loading && (

                <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                >
                    <CircularProgress />
                </Box>

            )}

            {!loading && dashboard && (

                <>
                    <Grid
                        container
                        spacing={2}
                        mt={1}
                    >

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Valor Recebido"
                                valor={formatMoney(dashboard.resumo.valor_recebido)}
                                cor="#2e7d32"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Taxas"
                                valor={formatMoney(dashboard.resumo.taxas)}
                                cor="#1976d2"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Devoluções"
                                valor={formatMoney(dashboard.resumo.devolucoes)}
                                cor="#6a1b9a"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Saldo Emitido"
                                valor={formatMoney(dashboard.resumo.saldo_emitido)}
                                cor="#ef6c00"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Recargas"
                                valor={dashboard.resumo.recargas}
                                cor="#00838f"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <MetricCard
                                titulo="Cartões Utilizados"
                                valor={
                                    dashboard.resumo
                                        .cartoes_utilizados
                                }
                                cor="#e53935"
                            />
                        </Grid>

                    </Grid>

                    <Box mt={3}>

                        <SectionCard title="Formas de Pagamento">

                            <TabelaFormasPagamento
                                formas={
                                    dashboard.formas_pagamento
                                }
                            />

                        </SectionCard>

                    </Box>

                    <Box mt={3}>

                        <SectionCard title="Operadores">

                            <TabelaOperadores
                                data={dashboard.operadores}
                                titulo="Operadores"
                                labelQuantidade="recargas"
                                labelCartoes="cartões"
                                renderDetails={(op) => (
                                    <TabelaFormasPagamento
                                        formas={op.formas_pagamento ?? []}
                                    />
                                )}
                            />

                        </SectionCard>

                    </Box>

                </>

            )}

        </Box>

    );

};