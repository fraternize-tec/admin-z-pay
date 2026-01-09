// auth/LoginPage.tsx
import {
  useLogin,
  useNotify,
  useTheme as useRaTheme,
} from 'react-admin';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Switch,
} from '@mui/material';
import { useState } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? 'v1.0.0';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  // 🔐 React Admin
  const login = useLogin();
  const notify = useNotify();
  const [raTheme, setRaTheme] = useRaTheme(); // ✅ correto

  // 🎨 MUI
  const muiTheme = useMuiTheme();

  // 🧠 State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const isDark = raTheme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      return;
    }

    setEmailError(null);
    setLoading(true);

    try {
      await login({ email, password });
    } catch {
      notify('Usuário ou senha inválidos', { type: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: muiTheme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
      }}
    >
      {/* 🌗 Toggle Light / Dark */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LightModeIcon fontSize="small" />
        <Switch
          checked={isDark}
          onChange={() =>
            setRaTheme(isDark ? 'light' : 'dark')
          }
        />
        <DarkModeIcon fontSize="small" />
      </Box>

      <Paper
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          p: 4,
          boxShadow: 'none',
          backgroundColor: muiTheme.palette.background.paper,
        }}
      >
        {/* Logo */}
        <Box textAlign="center" mb={3}>
          <img src="/logo.svg" alt="Zpay" style={{ height: 92 }} />
        </Box>

        <Typography
          textAlign="center"
          fontFamily="Poppins, sans-serif"
          fontWeight={600}
          fontSize={18}
        >
          Módulo de Administração
        </Typography>

        <Typography
          textAlign="center"
          fontSize={13}
          color="text.secondary"
          mb={3}
        >
          Digite suas credenciais para continuar
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            disabled={loading}
            onBlur={() =>
              setEmailError(
                email && !emailRegex.test(email)
                  ? 'Email inválido'
                  : null
              )
            }
          />

          <TextField
            fullWidth
            label="Senha"
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    {showPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            disabled={loading}
            sx={{
              mt: 3,
              borderRadius: 10,
              py: 1.3,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              backgroundColor: muiTheme.palette.primary.main,
              color: '#fff',
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <Typography
          textAlign="center"
          fontSize={11}
          color="text.secondary"
          mt={3}
        >
          Zpay Admin • {APP_VERSION}
        </Typography>
      </Paper>
    </Box>
  );
};
