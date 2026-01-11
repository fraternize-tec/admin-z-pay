export type Permissao = {
  permissao: string;
  escopo_tipo: 'global' | 'evento' | 'pdv' | 'caixa';
  escopo_id: string | null;
};
