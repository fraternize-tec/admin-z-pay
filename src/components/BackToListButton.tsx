// components/BackToListButton.tsx
import { Button, useResourceContext } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

export const BackToListButton = () => {
  const resource = useResourceContext();

  return (
    <Button
      label="Voltar"
      startIcon={<ArrowBackIcon />}
      href={`/#/${resource}`}
    />
  );
};

export const BackToListButtonNavigate = () => {
  const navigate = useNavigate();

  return (
    <Button
      label="Voltar"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}
    />
  );
};
