export const SUPPORTED_LOCALES = [
  'en-GB',
  'en-US',
  'af',
  'de',
  'he',
  'ar',
  'es',
  'pt-BR',
  'zh-Hans',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type TextDirection = 'ltr' | 'rtl';
export type LocaleAvailability = 'available' | 'planned';

export const DEFAULT_LOCALE = 'en-GB' as const satisfies SupportedLocale;
export const SHIPPED_LOCALES = [DEFAULT_LOCALE] as const;
export type ShippedLocale = (typeof SHIPPED_LOCALES)[number];

export const PLANNED_LOCALES = [
  'en-US',
  'af',
  'de',
  'he',
  'ar',
  'es',
  'pt-BR',
  'zh-Hans',
] as const satisfies readonly SupportedLocale[];

export interface LocaleDefinition {
  readonly code: SupportedLocale;
  readonly englishName: string;
  readonly nativeName: string;
  readonly direction: TextDirection;
  readonly availability: LocaleAvailability;
}

export const LOCALES = {
  'en-GB': {
    code: 'en-GB',
    englishName: 'English (United Kingdom)',
    nativeName: 'English (UK)',
    direction: 'ltr',
    availability: 'available',
  },
  'en-US': {
    code: 'en-US',
    englishName: 'English (United States)',
    nativeName: 'English (US)',
    direction: 'ltr',
    availability: 'planned',
  },
  af: {
    code: 'af',
    englishName: 'Afrikaans',
    nativeName: 'Afrikaans',
    direction: 'ltr',
    availability: 'planned',
  },
  de: {
    code: 'de',
    englishName: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    availability: 'planned',
  },
  he: {
    code: 'he',
    englishName: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    availability: 'planned',
  },
  ar: {
    code: 'ar',
    englishName: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    availability: 'planned',
  },
  es: {
    code: 'es',
    englishName: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    availability: 'planned',
  },
  'pt-BR': {
    code: 'pt-BR',
    englishName: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    direction: 'ltr',
    availability: 'planned',
  },
  'zh-Hans': {
    code: 'zh-Hans',
    englishName: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    availability: 'planned',
  },
} as const satisfies Record<SupportedLocale, LocaleDefinition>;

export const localeList = SUPPORTED_LOCALES.map((code) => LOCALES[code]);
export const availableLocaleList = SHIPPED_LOCALES.map((code) => LOCALES[code]);
export const plannedLocaleList = PLANNED_LOCALES.map((code) => LOCALES[code]);

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  SUPPORTED_LOCALES.some((locale) => locale === value);

export const isShippedLocale = (value: string): value is ShippedLocale =>
  SHIPPED_LOCALES.some((locale) => locale === value);

export const resolveShippedLocale = (value?: string | null): ShippedLocale =>
  value && isShippedLocale(value) ? value : DEFAULT_LOCALE;

export const directionForLocale = (locale: SupportedLocale): TextDirection =>
  LOCALES[locale].direction;

/**
 * The default language stays unprefixed. Once another catalogue ships, its
 * static routes can use this helper to receive a stable locale prefix.
 */
export const localisePath = (path: string, locale: ShippedLocale): string => {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? normalisedPath : `/${locale}${normalisedPath}`;
};
