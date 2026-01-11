import { Permissao } from './types';

export const can = (
  permissions: Permissao[] | undefined,
  perm: string
) => {
  if (!permissions) return false;
  return permissions.some(p => p.permissao === perm);
};
