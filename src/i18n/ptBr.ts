// i18n/ptBr.ts
import ptBrMessages from 'ra-language-pt-br';

const customMessages = {
  resources: {
    eventos: {
      name: 'Evento |||| Eventos',
      fields: {
        nome: 'Nome',
        data_inicio: 'Data de início',
        data_fim: 'Data de fim',
      },
    },
  },
};

export const messages = {
  ...ptBrMessages,
  ...customMessages,
};
