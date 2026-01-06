// i18n/i18nProvider.ts
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { messages } from './ptBr';

export const i18nProvider = polyglotI18nProvider(
  () => messages,
  'pt'
);
