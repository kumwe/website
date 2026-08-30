import { enGB } from './en-GB';
import { DEFAULT_LOCALE, resolveShippedLocale, type ShippedLocale } from './locales';

export * from './locales';
export * from './types';
export { enGB } from './en-GB';

export type WebsiteMessages = typeof enGB;

const catalogues = {
  'en-GB': enGB,
} as const satisfies Record<ShippedLocale, WebsiteMessages>;

export const getCatalogue = (locale?: string | null): WebsiteMessages =>
  catalogues[resolveShippedLocale(locale)];

export const defaultCatalogue = catalogues[DEFAULT_LOCALE];
