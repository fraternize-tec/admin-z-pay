// layout/MyAppBar.tsx
import { AppBar, UserMenu } from 'react-admin';
import { Box, Typography } from '@mui/material';

export const MyAppBar = () => (
  <AppBar
    elevation={0}
    userMenu={<UserMenu />}
    sx={{
      minHeight: 56,
      '& .RaAppBar-toolbar': {
        minHeight: 56,
      },
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      px={2}
    >
      {/* ESQUERDA — Nome do app */}
      <Typography
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Zpay Admin
      </Typography>

      {/* EMPURRADOR */}
      <Box sx={{ flex: 1 }} />

      {/* DIREITA — Ações */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
      >
      </Box>
    </Box>
  </AppBar>
);
