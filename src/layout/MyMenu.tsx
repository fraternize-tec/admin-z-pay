// layout/MyMenu.tsx
import { Menu } from 'react-admin';

export const MyMenu = () => (
  <Menu
    sx={{
      '& .RaMenuItemLink-root': {
        borderRadius: 10,
        marginX: 1,
        marginY: 0.5,
      },
      '& .RaMenuItemLink-active': {
        backgroundColor: 'rgba(204, 85, 0, 0.12)',
      },
    }}
  />
);
