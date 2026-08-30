import type { PageId } from './pages';

export type MissionPageId = Exclude<PageId, 'home'>;

export interface MissionVisualDefinition {
  readonly code: string;
  readonly motif:
    | 'orbital-core'
    | 'holographic-canvas'
    | 'module-docking'
    | 'signal-constellation'
    | 'package-constellation'
    | 'mission-trajectory'
    | 'open-shield';
  readonly accent: string;
  readonly secondaryAccent: string;
  readonly telemetry: readonly [string, string, string];
}

export const MISSION_VISUALS = {
  platform: {
    code: '01 · CORE',
    motif: 'orbital-core',
    accent: '#35dcff',
    secondaryAccent: '#39e1c6',
    telemetry: ['CONTENT', 'BUSINESS', 'DELIVERY'],
  },
  studio: {
    code: '02 · STUDIO',
    motif: 'holographic-canvas',
    accent: '#53d8ff',
    secondaryAccent: '#7f70ff',
    telemetry: ['CONTEXT', 'COMPOSE', 'PUBLISH'],
  },
  extensions: {
    code: '03 · SDK',
    motif: 'module-docking',
    accent: '#8b70ff',
    secondaryAccent: '#31d9d1',
    telemetry: ['INSPECT', 'VERIFY', 'ACTIVATE'],
  },
  clients: {
    code: '04 · CLIENTS',
    motif: 'signal-constellation',
    accent: '#30dff5',
    secondaryAccent: '#4e8dff',
    telemetry: ['CONTRACT', 'DART', 'NATIVE'],
  },
  packages: {
    code: '05 · PACKAGES',
    motif: 'package-constellation',
    accent: '#58e2ff',
    secondaryAccent: '#ac73ff',
    telemetry: ['FOUNDATION', 'RUNTIME', 'DELIVERY'],
  },
  roadmap: {
    code: '06 · TRAJECTORY',
    motif: 'mission-trajectory',
    accent: '#42e4dc',
    secondaryAccent: '#ffb65a',
    telemetry: ['NOW', 'NEXT', 'THEN'],
  },
  'open-source': {
    code: '07 · OPEN',
    motif: 'open-shield',
    accent: '#39e2f5',
    secondaryAccent: '#32d79f',
    telemetry: ['SOURCE', 'APACHE-2.0', 'STEWARDSHIP'],
  },
} as const satisfies Record<MissionPageId, MissionVisualDefinition>;
