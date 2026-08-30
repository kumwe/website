export const PAGE_IDS = [
  'home',
  'platform',
  'studio',
  'extensions',
  'clients',
  'packages',
  'roadmap',
  'open-source',
] as const;

export type PageId = (typeof PAGE_IDS)[number];

export interface PageDefinition {
  readonly id: PageId;
  readonly path: `/${string}`;
  readonly primaryActionHref: string;
  readonly secondaryActionHref: string;
}

/**
 * Routes and destinations are deliberately kept outside the language catalogue.
 * A future locale adds translated copy without duplicating navigation behaviour.
 */
export const pages = {
  home: {
    id: 'home',
    path: '/',
    primaryActionHref: '/platform/',
    secondaryActionHref: 'https://github.com/kumwe',
  },
  platform: {
    id: 'platform',
    path: '/platform/',
    primaryActionHref: 'https://github.com/kumwe/app#quick-start-the-full-demonstration',
    secondaryActionHref: 'https://github.com/kumwe/app/tree/master/docs',
  },
  studio: {
    id: 'studio',
    path: '/studio/',
    primaryActionHref: 'https://github.com/kumwe/studio',
    secondaryActionHref:
      'https://github.com/kumwe/app/blob/master/docs/studio-composition-authoring.md',
  },
  extensions: {
    id: 'extensions',
    path: '/extensions/',
    primaryActionHref: 'https://github.com/kumwe/extension-sdk',
    secondaryActionHref: 'https://github.com/kumwe/app/blob/master/docs/extensions.md',
  },
  clients: {
    id: 'clients',
    path: '/clients/',
    primaryActionHref: 'https://github.com/kumwe/client',
    secondaryActionHref: 'https://github.com/kumwe/dart-sdk',
  },
  packages: {
    id: 'packages',
    path: '/packages/',
    primaryActionHref: 'https://github.com/orgs/kumwe/repositories',
    secondaryActionHref: '/roadmap/',
  },
  roadmap: {
    id: 'roadmap',
    path: '/roadmap/',
    primaryActionHref: 'https://github.com/kumwe/app/blob/master/docs/roadmap/STATUS.md',
    secondaryActionHref: 'https://github.com/kumwe/app/releases',
  },
  'open-source': {
    id: 'open-source',
    path: '/open-source/',
    primaryActionHref: 'https://github.com/kumwe/app',
    secondaryActionHref: 'https://github.com/kumwe/app/blob/master/CONTRIBUTING.md',
  },
} as const satisfies Record<PageId, PageDefinition>;

export const pageList = PAGE_IDS.map((id) => pages[id]);
