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
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
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
