// components/BackToListButton.tsx
import { useResourceContext } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';

export const BackToListButton = () => {
  const resource = useResourceContext();

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      href={`/#/${resource}`}
    >
      Voltar
    </Button>
  );
};

export const BackToListButtonNavigate = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}
    >
      Voltar
    </Button>
  );
};
