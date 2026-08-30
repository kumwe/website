import type { PageId } from '../data/pages';
import type { RepositoryGroup, RepositoryId, RepositoryStage } from '../data/repositories';

export interface ActionCopy {
  readonly label: string;
  readonly accessibleLabel?: string;
}

export interface FeatureCopy {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
}

export interface SectionCopy {
  readonly eyebrow?: string;
  readonly title: string;
  readonly body: string;
  readonly note?: string;
  readonly items?: readonly FeatureCopy[];
}

export interface PageCopy {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly hero: {
    readonly eyebrow: string;
    readonly status?: string;
    readonly title: string;
    readonly titleLines?: readonly string[];
    readonly summary: string;
    readonly primaryAction: ActionCopy;
    readonly secondaryAction: ActionCopy;
  };
  readonly sections: readonly SectionCopy[];
  readonly closing?: {
    readonly title: string;
    readonly body: string;
    readonly action: ActionCopy;
  };
}

export interface RepositoryCopy {
  readonly title: string;
  readonly summary: string;
}

export interface WebsiteMessagesShape {
  readonly site: {
    readonly title: string;
    readonly description: string;
    readonly socialDescription: string;
  };
  readonly accessibility: {
    readonly skipToContent: string;
    readonly openMenu: string;
    readonly closeMenu: string;
    readonly externalLink: string;
    readonly orbitalScene: string;
    readonly reducedMotionScene: string;
  };
  readonly navigation: Record<PageId | 'docs' | 'github', string>;
  readonly theme: {
    readonly label: string;
    readonly system: string;
    readonly light: string;
    readonly dark: string;
    readonly active: string;
  };
  readonly language: {
    readonly label: string;
    readonly current: string;
    readonly available: string;
    readonly planned: string;
    readonly plannedDescription: string;
  };
  readonly common: {
    readonly learnMore: string;
    readonly viewRepository: string;
    readonly readDocumentation: string;
    readonly projectStatus: string;
    readonly plannedProject: string;
  };
  readonly homeExperience: {
    readonly trustLine: string;
    readonly ecosystemTitle: string;
    readonly products: readonly {
      readonly id: 'platform' | 'studio' | 'extensions' | 'clients';
      readonly title: string;
      readonly description: string;
      readonly href: string;
    }[];
  };
  readonly repositoryStages: Record<RepositoryStage, string>;
  readonly repositoryGroups: Record<RepositoryGroup, string>;
  readonly repositories: Record<RepositoryId, RepositoryCopy>;
  readonly pages: Record<PageId, PageCopy>;
  readonly footer: {
    readonly summary: string;
    readonly projectLinks: string;
    readonly legalLinks: string;
    readonly copyright: string;
    readonly licence: string;
    readonly trademark: string;
    readonly madeWithLove: string;
  };
}
