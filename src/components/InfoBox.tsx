import { Box } from "@mui/material";

export const InfoBox = ({
    label,
    children
}: any) => (
    <Box
        sx={{
            mt: 2
        }}
    >
        <Box
            sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'text.secondary',
                mb: 0.4,
                textTransform: 'uppercase',
                letterSpacing: 0.4
            }}
        >
            {label}
        </Box>

        <Box
            sx={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4
            }}
        >
            {children}
        </Box>
    </Box>
);