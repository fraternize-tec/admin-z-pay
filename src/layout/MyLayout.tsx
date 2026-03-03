// layout/MyLayout.tsx
import { Layout } from 'react-admin';
import { MyAppBar } from './MyAppBar';
import { MyMenu } from './MyMenu';
import { EventoProvider } from '../context/EventoContext';

export const MyLayout = (props: any) => (
  <EventoProvider>
    <Layout
      {...props}
      appBar={MyAppBar}
      menu={MyMenu}
    >
    </Layout>
  </EventoProvider>
);
