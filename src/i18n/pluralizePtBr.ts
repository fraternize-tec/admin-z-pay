// i18n/pluralizePtBr.ts
export function pluralizePtBr(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}
