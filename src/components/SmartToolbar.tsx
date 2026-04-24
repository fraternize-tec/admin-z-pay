import { TopToolbar } from 'react-admin';
import { useTheme, useMediaQuery } from '@mui/material';

export const SmartToolbar = ({ children }: any) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down('sm')
  );

  const isTablet = useMediaQuery(
    theme.breakpoints.between('sm', 'md')
  );

  return (
    <TopToolbar
      sx={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,

        justifyContent: isMobile
          ? 'flex-start'
          : 'flex-end',

        alignItems: 'center',

        '& .MuiButton-root': {
          minWidth: 0,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          borderRadius: 2,

          mt: isMobile ? 0 : 1.5,

          px: isMobile ? 1.2 : 2,

          fontSize: isMobile
            ? '0.8rem'
            : '0.9rem',

          flexGrow: isMobile ? 1 : 0,

          flexBasis: isMobile
            ? '48%'
            : isTablet
            ? 'auto'
            : 'auto',

          maxWidth: isMobile
            ? '100%'
            : 'none',
        },

        '& .MuiButton-startIcon': {
          mr: isMobile ? 0.5 : 1,
        }
      }}
    >
      {children}
    </TopToolbar>
  );
};