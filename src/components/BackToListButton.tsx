// components/BackToListButton.tsx
import { Button, useResourceContext } from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
