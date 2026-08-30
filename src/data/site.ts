import type { PageId } from './pages';

export const SITE = {
  name: 'Kumwe',
  url: 'https://www.kumwe.net',
  defaultLocale: 'en-GB',
  organisation: 'Kumwe',
  owner: 'Vast Development Method Trading Pty Ltd',
  ownerShortName: 'Vast Development Method',
  ownerUrl: 'https://www.vdm.io/',
  copyrightYears: '2022–2026',
} as const;

export const EXTERNAL_LINKS = {
  github: 'https://github.com/kumwe',
  websiteRepository: 'https://github.com/kumwe/website',
  app: 'https://github.com/kumwe/app',
  documentation: 'https://github.com/kumwe/app/tree/master/docs',
  issues: 'https://github.com/kumwe/app/issues',
  discussions: 'https://github.com/kumwe/app/discussions',
  releases: 'https://github.com/kumwe/app/releases',
  apacheLicence: 'https://www.apache.org/licenses/LICENSE-2.0',
  vastDevelopmentMethod: SITE.ownerUrl,
} as const;

export interface InternalNavigationItem {
  readonly kind: 'internal';
  readonly id: PageId;
  readonly href: `/${string}`;
}

export interface ExternalNavigationItem {
  readonly kind: 'external';
  readonly id: 'docs' | 'github';
  readonly href: string;
}

export type NavigationItem = InternalNavigationItem | ExternalNavigationItem;

export const PRIMARY_NAVIGATION = [
  { kind: 'internal', id: 'platform', href: '/platform/' },
  { kind: 'internal', id: 'studio', href: '/studio/' },
  { kind: 'internal', id: 'extensions', href: '/extensions/' },
  { kind: 'internal', id: 'clients', href: '/clients/' },
  { kind: 'internal', id: 'packages', href: '/packages/' },
  { kind: 'internal', id: 'roadmap', href: '/roadmap/' },
] as const satisfies readonly NavigationItem[];

export const UTILITY_NAVIGATION = [
  { kind: 'external', id: 'docs', href: EXTERNAL_LINKS.documentation },
  { kind: 'external', id: 'github', href: EXTERNAL_LINKS.github },
] as const satisfies readonly NavigationItem[];

export const FOOTER_NAVIGATION = [
  { kind: 'internal', id: 'open-source', href: '/open-source/' },
  { kind: 'internal', id: 'roadmap', href: '/roadmap/' },
  { kind: 'external', id: 'docs', href: EXTERNAL_LINKS.documentation },
  { kind: 'external', id: 'github', href: EXTERNAL_LINKS.github },
] as const satisfies readonly NavigationItem[];
