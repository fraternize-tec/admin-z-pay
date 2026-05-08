import {
    Box,
    Button,
    Chip,
    Fade,
    Grow,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    Zoom,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import UndoIcon from "@mui/icons-material/Undo";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme, alpha } from "@mui/material";
import { supabase } from "../../lib/supabaseClient";

type NumeroStatus =
    | "cinza"
    | "sorteado"
    | "penultimo"
    | "ultimo"
    | "demarcado";

type BingoState = {
    rodada: string;
    historico: number[];
    status: Record<number, NumeroStatus>;
};

const STORAGE_KEY = "bingo-telao-v1";

const grupos = [
    {
        letra: "B",
        inicio: 1,
        fim: 15,
        cor: "#ef5350",
    },
    {
        letra: "I",
        inicio: 16,
        fim: 30,
        cor: "#ffca28",
    },
    {
        letra: "N",
        inicio: 31,
        fim: 45,
        cor: "#66bb6a",
    },
    {
        letra: "G",
        inicio: 46,
        fim: 60,
        cor: "#42a5f5",
    },
    {
        letra: "O",
        inicio: 61,
        fim: 75,
        cor: "#ab47bc",
    },
];

const createInitialStatus = () => {
    const initial: Record<number, NumeroStatus> = {};

    for (let i = 1; i <= 75; i++) {
        initial[i] = "cinza";
    }

    return initial;
};



export default function BingoTelao() {
    const theme = useTheme();

    const isDark = theme.palette.mode === "dark";
    const [fullscreen, setFullscreen] = useState(false);
    const [patrocinador, setPatrocinador] =
        useState<string | null>(null);
    const patrocinadorTimeout =
        useRef<NodeJS.Timeout | null>(null);

    const [showPatrocinador, setShowPatrocinador] =
        useState(false);

    const [state, setState] = useState<BingoState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            return JSON.parse(saved);
        }

        return {
            rodada: "1",
            historico: [],
            status: createInitialStatus(),
        };
    });

    const ultimo = state.historico[0] ?? null;
    const penultimo = state.historico[1] ?? null;
    const terceiro = state.historico[2] ?? null;

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const buscarPatrocinador = async (
        numero: number
    ) => {
        setShowPatrocinador(false);
        setPatrocinador(null);

        if (patrocinadorTimeout.current) {
            clearTimeout(
                patrocinadorTimeout.current
            );
        }

        const extensoes = [
            "png",
        ];

        for (const ext of extensoes) {
            const path = `${numero}.${ext}`;

            const { data } = supabase.storage
                .from("bingo")
                .getPublicUrl(path);

            try {
                const response = await fetch(
                    data.publicUrl,
                    {
                        method: "HEAD",
                        cache: "no-store",
                    }
                );

                if (response.ok) {
                    // pequeno delay para reiniciar animação
                    setTimeout(() => {
                        setPatrocinador(
                            `${data.publicUrl}?t=${Date.now()}`
                        );

                        setShowPatrocinador(true);
                    }, 80);

                    patrocinadorTimeout.current =
                        setTimeout(() => {
                            setShowPatrocinador(false);
                        }, 7000);

                    return;
                }
            } catch (_) { }
        }
    };

    const letraNumero = (num?: number | null) => {
        if (!num) return "-";

        if (num <= 15) return "B";
        if (num <= 30) return "I";
        if (num <= 45) return "N";
        if (num <= 60) return "G";

        return "O";
    };

    const sortearNumero = (numero: number) => {
        buscarPatrocinador(numero);
        setState((old) => {
            const novoStatus = { ...old.status };

            Object.entries(novoStatus).forEach(([key, value]) => {
                if (value === "ultimo") {
                    novoStatus[Number(key)] = "penultimo";
                } else if (value === "penultimo") {
                    novoStatus[Number(key)] = "sorteado";
                }
            });

            novoStatus[numero] = "ultimo";

            return {
                ...old,
                historico: [
                    numero,
                    ...old.historico.filter((n) => n !== numero),
                ].slice(0, 75),
                status: novoStatus,
            };
        });
    };

    const desmarcarNumero = (numero: number) => {
        setState((old) => {
            const novo = { ...old.status };

            novo[numero] =
                old.status[numero] === "demarcado"
                    ? "cinza"
                    : "demarcado";

            return {
                ...old,
                status: novo,
            };
        });
    };

    const desfazerUltimo = () => {
        setState((old) => {
            const historico = [...old.historico];

            const removido = historico.shift();

            const novoStatus = createInitialStatus();

            historico.forEach((n, index) => {
                if (index === 0) {
                    novoStatus[n] = "ultimo";
                } else if (index === 1) {
                    novoStatus[n] = "penultimo";
                } else {
                    novoStatus[n] = "sorteado";
                }
            });

            return {
                ...old,
                historico,
                status: {
                    ...novoStatus,
                },
            };
        });
    };

    const grupoCor = (num?: number | null) => {
        if (!num) {
            return theme.palette.primary.main;
        }

        if (num <= 15) return "#ef5350";
        if (num <= 30) return "#ffca28";
        if (num <= 45) return "#66bb6a";
        if (num <= 60) return "#42a5f5";

        return "#ab47bc";
    };

    const novaRodada = () => {
        const valor = prompt("Digite a rodada");

        if (!valor) return;

        setState({
            rodada: valor,
            historico: [],
            status: createInitialStatus(),
        });
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            const elem = document.getElementById("bingo-telao");

            if (!document.fullscreenElement) {
                await elem?.requestFullscreen();
            }
            setFullscreen(true);
        } else {
            await document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const getNumeroStyle = (status: NumeroStatus) => {
        switch (status) {
            case "ultimo":
                return {
                    background: "#f44336",
                    color: "#fff",
                    transform: "scale(1.12)",
                    boxShadow: "0 0 30px rgba(244,67,54,0.8)",
                };

            case "penultimo":
                return {
                    background: "#ff9800",
                    color: "#fff",
                };

            case "sorteado":
                return {
                    background: "#fff",
                    color: "#000",
                };

            case "demarcado":
                return {
                    background: "#00acc1",
                    color: "#fff",
                };

            default:
                return {
                    background: "#424242",
                    color: "#fff",
                };
        }
    };

    return (
        <Box id="bingo-telao"
            sx={{
                minHeight: "100vh",
                background: isDark
                    ? `
      linear-gradient(
        135deg,
        ${theme.palette.background.default} 0%,
        ${alpha(theme.palette.primary.dark, 0.18)} 100%
      )
    `
                    : `
      linear-gradient(
        135deg,
        ${theme.palette.background.default} 0%,
        ${alpha(theme.palette.primary.light, 0.08)} 100%
      )
    `,
                p: 2,
                overflow: "hidden",
                "@keyframes pulse": {
                    "0%": {
                        transform: "scale(0.92)",
                        opacity: 0.7,
                    },
                    "100%": {
                        transform: "scale(1)",
                        opacity: 1,
                    },
                    "@keyframes sponsorGlow": {
                        "0%": {
                            opacity: 0.5,
                            transform: "scale(1)",
                        },
                        "100%": {
                            opacity: 0.9,
                            transform: "scale(1.12)",
                        },
                    },

                    "@keyframes sponsorImage": {
                        "0%": {
                            opacity: 0,
                            transform: "scale(.85)",
                        },
                        "100%": {
                            opacity: 1,
                            transform: "scale(1)",
                        },
                    },
                },
            }}
        >
            {/* TOPO */}
            <Paper
                elevation={10}
                sx={{
                    mb: 2,
                    borderRadius: 3,
                    p: 2,
                    background: alpha(
                        theme.palette.background.paper,
                        isDark ? 0.45 : 0.9
                    ),
                    backdropFilter: "blur(10px)",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <CampaignIcon
                            sx={{
                                fontSize: 52,
                                color: "text.primary"
                            }}
                        />

                        <Box>
                            <Typography
                                variant="h3"
                                fontWeight={900}
                                color="text.primary"
                            >
                                BINGO
                            </Typography>

                            <Typography
                                variant="h5"
                                color="text.secondary"
                            >
                                {state.rodada != null ? `${state.rodada}` : ""}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Nova rodada">
                            <IconButton
                                onClick={novaRodada}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    color: theme.palette.primary.main,
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Desfazer">
                            <IconButton
                                onClick={desfazerUltimo}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    color: theme.palette.primary.main,
                                }}
                            >
                                <UndoIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Tela cheia">
                            <IconButton
                                onClick={toggleFullscreen}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    color: theme.palette.primary.main,
                                }}
                            >
                                {fullscreen ? (
                                    <FullscreenExitIcon />
                                ) : (
                                    <FullscreenIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Paper>

            {/* ÚLTIMOS NÚMEROS */}

            <Fade in={showPatrocinador}>
                <Box
                    sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: showPatrocinador
                            ? "flex"
                            : "none",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(18px)",
                        background: isDark
                            ? "rgba(0,0,0,0.72)"
                            : "rgba(255,255,255,0.82)",
                        animation: "fadeSponsor .4s ease",
                    }}
                >
                    <Box
                        sx={{
                            width: "100vw",
                            height: "100vh",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            animation:
                                "sponsorEnter .45s ease",
                        }}
                    >
                        {/* brilho */}
                        <Box
                            sx={{
                                position: "absolute",
                                width: "60vw",
                                height: "60vw",
                                borderRadius: "50%",
                                background: alpha(
                                    theme.palette.primary.main,
                                    isDark ? 0.22 : 0.12
                                ),
                                filter: "blur(120px)",
                                animation:
                                    "sponsorGlow 3s ease infinite alternate",
                            }}
                        />

                        {patrocinador && (
                            <Box
                                component="img"
                                src={patrocinador}
                                alt="Patrocinador"
                                sx={{
                                    position: "relative",
                                    zIndex: 2,

                                    width: "min(92vw, 1400px)",
                                    maxHeight: "78vh",

                                    objectFit: "contain",

                                    filter: isDark
                                        ? "drop-shadow(0 20px 60px rgba(0,0,0,.55))"
                                        : "drop-shadow(0 20px 40px rgba(0,0,0,.18))",

                                    animation:
                                        "sponsorImage 0.6s ease",
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Fade>

            {/* GRADE */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(6, 1fr)",
                    },
                    alignItems: "stretch",
                    gap: 2,
                    "@keyframes sponsorEnter": {
                        "0%": {
                            opacity: 0,
                            transform:
                                "translateY(40px) scale(.94)",
                        },
                        "100%": {
                            opacity: 1,
                            transform:
                                "translateY(0) scale(1)",
                        },
                    },

                    "@keyframes fadeSponsor": {
                        "0%": {
                            opacity: 0,
                        },
                        "100%": {
                            opacity: 1,
                        },
                    },
                }}
            >
                {grupos.map((grupo) => (
                    <Box key={grupo.letra}>
                        <Paper
                            elevation={12}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(
                                    theme.palette.divider,
                                    0.15
                                )}`,
                                overflow: "hidden",
                                background:
                                    "rgba(255,255,255,0.05)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <Box
                                sx={{
                                    background: grupo.cor,
                                    py: 2,
                                    textAlign: "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: 32,
                                            lg: 48,
                                        },
                                        fontWeight: 900,
                                        color:
                                            grupo.letra === "I"
                                                ? "#000"
                                                : "#fff",
                                    }}
                                >
                                    {grupo.letra}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    p: 1.5,
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                    gap: 1,
                                }}
                            >
                                {Array.from(
                                    {
                                        length:
                                            grupo.fim - grupo.inicio + 1,
                                    },
                                    (_, i) => {
                                        const numero =
                                            grupo.inicio + i;

                                        return (
                                            <Fade
                                                in
                                                timeout={300}
                                                key={numero}
                                            >
                                                <Button
                                                    onClick={() =>
                                                        sortearNumero(numero)
                                                    }
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        desmarcarNumero(numero);
                                                    }}
                                                    variant="contained"
                                                    sx={{
                                                        aspectRatio: "1 / 1",
                                                        minHeight: {
                                                            xs: 54,
                                                            lg: 68,
                                                        },
                                                        borderRadius: 4,
                                                        backdropFilter: "blur(8px)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        fontSize: {
                                                            xs: 24,
                                                            lg: 34,
                                                        },
                                                        fontWeight: 900,
                                                        transition:
                                                            "all .2s ease",
                                                        ...getNumeroStyle(
                                                            state.status[numero]
                                                        ),
                                                        "&:hover": {
                                                            transform:
                                                                "scale(1.05)",
                                                        },
                                                    }}
                                                >
                                                    {numero}
                                                </Button>
                                            </Fade>
                                        );
                                    }
                                )}
                            </Box>
                        </Paper>
                    </Box>
                ))}

                {/* PAINEL LATERAL */}
                <Paper
                    elevation={12}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.15
                        )}`,
                        overflow: "hidden",
                        background: alpha(
                            theme.palette.background.paper,
                            isDark ? 0.35 : 0.85
                        ),
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* HEADER */}
                    <Box
                        sx={{
                            py: 2,
                            textAlign: "center",
                            background: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    lg: 34,
                                },
                                fontWeight: 900,
                                lineHeight: 1,
                            }}
                        >
                            ÚLTIMOS SORTEADOS
                        </Typography>
                    </Box>

                    {/* ÚLTIMOS */}
                    <Box
                        sx={{
                            p: 1.5,
                            display: "grid",
                            gap: 1,
                        }}
                    >
                        {state.historico.slice(0, 3).map((n, idx) => (
                            <Box
                                key={n}
                                sx={{
                                    borderRadius: 3,
                                    px: 2,
                                    py: 1.5,
                                    background:
                                        idx === 0
                                            ? grupoCor(n)
                                            : alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                    color:
                                        idx === 0
                                            ? "#fff"
                                            : theme.palette.text.primary,
                                    transition: "all .2s ease",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        opacity: 0.7,
                                    }}
                                >
                                    {idx === 0
                                        ? "ÚLTIMO"
                                        : idx === 1
                                            ? "ANTERIOR"
                                            : "TERCEIRO"}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: 42,
                                            lg: 56,
                                        },
                                        fontWeight: 900,
                                        lineHeight: 1,
                                    }}
                                >
                                    {letraNumero(n)}
                                    {n}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* RODADA */}
                    {/* <Box
    sx={{
      mt: "auto",
      px: 2,
      py: 1.5,
      borderTop: `1px solid ${alpha(
        theme.palette.divider,
        0.12
      )}`,
    }}
  >
    <Typography
      sx={{
        fontSize: 13,
        opacity: 0.7,
        fontWeight: 700,
      }}
    >
      RODADA
    </Typography>

    <Typography
      sx={{
        fontSize: 32,
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {state.rodada}
    </Typography>
  </Box> */}
                </Paper>

            </Box>
        </Box>
    );
}