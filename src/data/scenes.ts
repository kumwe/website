import type { MissionPageId } from './visuals';

export interface SceneAsset {
  readonly alt: string;
  readonly lightSrc?: string;
  readonly objectPosition?: string;
  readonly src: string;
}

export interface MissionSceneSet {
  readonly closing: SceneAsset;
  readonly hero: SceneAsset | null;
  readonly sections: readonly SceneAsset[];
}

const scene = (
  src: string,
  alt: string,
  options: Pick<SceneAsset, 'lightSrc' | 'objectPosition'> = {},
): SceneAsset => ({ src: `/images/mascot/${src}.webp`, alt, ...options });

export const MISSION_SCENES = {
  platform: {
    hero: scene(
      'platform/platform-governed-together-hero',
      'The Kumwe meerkat engineer governing an aquaponics system and laboratory from one shared spacecraft control.',
    ),
    sections: [
      scene(
        'platform/platform-total-visibility',
        'The meerkat monitoring content and business operations across a panoramic control centre.',
      ),
      scene(
        'platform/platform-surface-parity',
        'The meerkat connecting one guarded service core to human controls and machine interfaces.',
      ),
      scene(
        'platform/platform-recoverable-foundation',
        'The meerkat testing portable database cores, recovery equipment and an AI service interface.',
      ),
    ],
    closing: scene(
      'platform/platform-working-system-cta',
      'The Kumwe meerkat beside a landed exploration craft and Namibian flag on a peaceful alien surface.',
      { objectPosition: '64% 50%' },
    ),
  },
  studio: {
    hero: scene(
      'studio/studio-contextual-authoring-hero',
      'The Kumwe meerkat arranging contextual content and layout blocks in a spacecraft design studio.',
    ),
    sections: [
      scene(
        'studio/studio-one-workspace',
        'The meerkat editing one resource with its fields, layout and revision context in one workspace.',
      ),
      scene(
        'studio/studio-connected-primitives',
        'The meerkat linking secure authoring primitives around a central canvas.',
      ),
      scene(
        'studio/studio-open-gap',
        'The meerkat carrying the bridge component needed to connect two stable authoring decks.',
      ),
      scene(
        'studio/studio-authority-boundary',
        'The meerkat operating a presentation surface connected to guarded application services.',
      ),
    ],
    closing: scene(
      'studio/studio-public-journey-cta',
      'The meerkat comparing two public engineering consoles that converge on one shared destination.',
      { objectPosition: '36% 50%' },
    ),
  },
  extensions: {
    hero: scene(
      'extensions/extensions-governed-docking-hero',
      'The Kumwe meerkat guiding a sealed capability module through a governed docking sequence.',
    ),
    sections: [
      scene(
        'extensions/extensions-owned-contribution',
        'The meerkat securing a bounded owner-controlled module to a stable spacecraft.',
      ),
      scene(
        'extensions/extensions-signed-delivery',
        'The meerkat supervising package inspection, verification and controlled activation.',
      ),
      scene(
        'extensions/extensions-public-tooling',
        'The meerkat working with extension tools at distinct levels of maturity.',
      ),
    ],
    closing: scene(
      'extensions/extensions-published-boundary-cta',
      'The meerkat calibrating the published docking boundary before an extension approaches the core.',
      { objectPosition: '42% 50%' },
    ),
  },
  clients: {
    hero: scene(
      'clients/clients-contract-first-hero',
      'The Kumwe meerkat routing one documented service contract to a phone, tablet, terminal and native handheld device.',
    ),
    sections: [
      scene(
        'clients/clients-docs-first',
        'The Kumwe meerkat studying service behaviour blueprints before connecting native devices.',
      ),
      scene(
        'clients/clients-dart-prototype',
        'The meerkat evaluating a typed SDK prototype inside a safe test chamber.',
      ),
      scene(
        'clients/clients-native-field-test',
        'The meerkat testing a rugged native handheld prototype in a simulated alien field environment.',
      ),
    ],
    closing: scene(
      'clients/clients-shaping-direction-cta',
      'The meerkat shaping a route from stable service contracts toward future native clients.',
      { objectPosition: '43% 50%' },
    ),
  },
  packages: {
    hero: scene(
      'packages/packages-coherent-constellation-hero',
      'The Kumwe meerkat arranging focused contract modules around one coherent platform core.',
    ),
    sections: [
      scene(
        'packages/packages-foundation-deck',
        'The meerkat maintaining a deck of focused reusable foundation modules.',
        { lightSrc: '/images/mascot/packages/packages-foundation-deck-light.webp' },
      ),
      scene(
        'packages/packages-business-runtime',
        'The meerkat organising typed values, relationships and policy components around a generic core.',
      ),
      scene(
        'packages/packages-delivery-parity',
        'The meerkat aligning delivery surfaces to equal guarded conduits from one service reactor.',
      ),
    ],
    closing: scene(
      'packages/packages-maturity-cta',
      'The meerkat sorting modules into operational, test and planned physical states.',
      { objectPosition: '38% 50%' },
    ),
  },
  roadmap: {
    hero: scene(
      'roadmap/roadmap-foundation-first-hero',
      'The Kumwe meerkat securing a tested foundation ring before future modules are installed.',
    ),
    sections: [
      scene(
        'roadmap/roadmap-gate-qualification',
        'The meerkat preparing the platform core and supporting systems for the next qualification gate.',
      ),
      scene(
        'roadmap/roadmap-parallel-work',
        'The meerkat advancing Studio authoring and extension adoption in parallel.',
      ),
      scene(
        'roadmap/roadmap-client-boundary-test',
        'The meerkat testing a secure signal path from stable services to a native client prototype.',
      ),
      scene(
        'roadmap/roadmap-stable-extraction',
        'The meerkat extracting only proven contracts from the running core into focused modules.',
      ),
    ],
    closing: scene(
      'roadmap/roadmap-evidence-cta',
      'The meerkat inspecting solid engineering evidence and translucent future plans on an open console.',
      { objectPosition: '38% 50%' },
    ),
  },
  'open-source': {
    hero: scene(
      'open-source/open-foundations-hero',
      'The Kumwe meerkat opening accessible source machinery while keeping the brand boundary distinct.',
    ),
    sections: [
      scene(
        'open-source/open-permissive-use',
        'The meerkat releasing an open blueprint toward both open and closed construction paths.',
      ),
      scene(
        'open-source/open-public-engineering',
        'The meerkat inspecting public source modules, tests, releases and proposals through an open engineering bay.',
      ),
      scene(
        'open-source/open-brand-boundary',
        'The meerkat standing between reusable open code and the separately protected Kumwe brand.',
      ),
      scene(
        'open-source/open-stewardship',
        'The meerkat maintaining the Kumwe core as public contribution signals arrive over the Namib night sky.',
      ),
    ],
    closing: scene(
      'open-source/open-read-before-distribution-cta',
      'The meerkat reviewing licence and notice materials before loading software for distribution.',
      { objectPosition: '61% 50%' },
    ),
  },
} as const satisfies Record<MissionPageId, MissionSceneSet>;
