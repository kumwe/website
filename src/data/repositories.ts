export const REPOSITORY_IDS = [
  'app',
  'studio',
  'extension-sdk',
  'conversion',
  'producer',
  'dart-sdk',
  'client',
  'engine',
  'canonical-json',
  'localization',
  'secret-envelope',
  'sequence',
  'idempotency',
  'audit',
  'approval',
  'automation',
  'integration',
  'conversion-extension',
  'computation',
  'business-policy',
  'access-control',
  'access-context',
  'contribution',
  'interface-standard',
  'business-definition',
  'business-schema',
  'record-values',
  'record-model',
  'record-query',
  'reporting',
  'navigation',
  'administrator-contract',
  'portal-contract',
  'business-surface-contract',
  'transaction',
] as const;

export type RepositoryId = (typeof REPOSITORY_IDS)[number];

export type RepositoryGroup =
  'core' | 'tooling' | 'client' | 'foundation' | 'business-runtime' | 'delivery';

export type RepositoryStage =
  'alpha' | 'in-development' | 'published' | 'founding-development' | 'proposal' | 'planned';

export interface RepositoryDefinition {
  readonly id: RepositoryId;
  readonly name: `kumwe/${string}`;
  readonly url: `https://github.com/kumwe/${string}`;
  readonly group: RepositoryGroup;
  readonly stage: RepositoryStage;
  readonly featured: boolean;
}

const repository = (
  id: RepositoryId,
  group: RepositoryGroup,
  stage: RepositoryStage,
  featured = false,
): RepositoryDefinition => ({
  id,
  name: `kumwe/${id}`,
  url: `https://github.com/kumwe/${id}`,
  group,
  stage,
  featured,
});

/**
 * Stage describes the public project posture, not the existence of a repository.
 * Planned package repositories are intentionally not presented as shipped APIs.
 */
export const repositories = [
  repository('app', 'core', 'alpha', true),
  repository('studio', 'core', 'in-development', true),
  repository('extension-sdk', 'tooling', 'published', true),
  repository('conversion', 'tooling', 'published', true),
  repository('producer', 'tooling', 'founding-development', true),
  repository('dart-sdk', 'client', 'proposal', true),
  repository('client', 'client', 'planned', true),
  repository('engine', 'core', 'planned', true),
  repository('canonical-json', 'foundation', 'planned'),
  repository('localization', 'foundation', 'planned'),
  repository('secret-envelope', 'foundation', 'planned'),
  repository('sequence', 'foundation', 'planned'),
  repository('idempotency', 'foundation', 'planned'),
  repository('audit', 'foundation', 'planned'),
  repository('approval', 'foundation', 'planned'),
  repository('automation', 'foundation', 'planned'),
  repository('integration', 'foundation', 'planned'),
  repository('conversion-extension', 'foundation', 'planned'),
  repository('computation', 'foundation', 'planned'),
  repository('business-policy', 'business-runtime', 'planned'),
  repository('access-control', 'business-runtime', 'planned'),
  repository('access-context', 'business-runtime', 'planned'),
  repository('contribution', 'business-runtime', 'planned'),
  repository('interface-standard', 'business-runtime', 'planned'),
  repository('business-definition', 'business-runtime', 'planned'),
  repository('business-schema', 'business-runtime', 'planned'),
  repository('record-values', 'business-runtime', 'planned'),
  repository('record-model', 'business-runtime', 'planned'),
  repository('record-query', 'business-runtime', 'planned'),
  repository('reporting', 'business-runtime', 'planned'),
  repository('navigation', 'delivery', 'planned'),
  repository('administrator-contract', 'delivery', 'planned'),
  repository('portal-contract', 'delivery', 'planned'),
  repository('business-surface-contract', 'delivery', 'planned'),
  repository('transaction', 'foundation', 'planned'),
] as const satisfies readonly RepositoryDefinition[];

export const featuredRepositories = repositories.filter((entry) => entry.featured);

export const packageRepositories = repositories.filter(
  (entry) => !entry.featured && entry.stage === 'planned',
);

export const repositoriesByGroup = Object.groupBy(repositories, (entry) => entry.group) as Partial<
  Record<RepositoryGroup, RepositoryDefinition[]>
>;
