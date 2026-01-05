import {
  Button,
  TextInput,
  useLogin,
  useNotify,
  Form,
} from 'react-admin';
import { Card, CardContent } from '@mui/material';

type LoginValues = {
  email?: string;
  password?: string;
};

export const EmailLoginForm = () => {
  const login = useLogin();
  const notify = useNotify();

  const submit = async (values: LoginValues) => {
    if (!values.email || !values.password) {
      notify('Informe email e senha', { type: 'warning' });
      return;
    }

    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      notify('Email ou senha inválidos', {
        type: 'error',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Form onSubmit={submit}>
          <TextInput
            source="email"
            label="Email"
            type="email"
            fullWidth
            required
            autoFocus
          />

          <TextInput
            source="password"
            label="Senha"
            type="password"
            fullWidth
            required
          />

          <Button
            type="submit"
            label="Entrar"
            fullWidth
            sx={{ mt: 2 }}
          />
        </Form>
      </CardContent>
    </Card>
  );
};
