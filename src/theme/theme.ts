// theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.orange,
        },
        secondary: {
            main: colors.orange,
        },
        background: {
            default: colors.lightBackground,
            paper: colors.lightSurface,
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',

        h1: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h2: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
        },
        h3: {
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
        },
        body1: {
            fontSize: '0.95rem',
        },
        body2: {
            fontSize: '0.85rem',
            opacity: 0.8,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    boxShadow: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    paddingTop: 12,
                    paddingBottom: 12,
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'filled',
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    '& .MuiFilledInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderRadius: 12,
                    },
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': {
                        display: 'none',
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontFamily: 'Inter, sans-serif',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.orange,
                    color: '#fff',
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.lightSurface,
                    borderRight: '1px solid rgba(0,0,0,0.08)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    marginInline: 8,
                    marginBlock: 4,
                },
            },
        },
    }

});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: colors.orange,
        },
        secondary: {
            main: colors.orange,
        },
        background: {
            default: colors.petrolBlue,
            paper: colors.petrolBlueSoft,
        },
    },
    typography: lightTheme.typography,
    shape: {
        borderRadius: 12,
    },
});
