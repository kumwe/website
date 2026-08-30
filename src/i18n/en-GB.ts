import type { WebsiteMessagesShape } from './types';

export const enGB = {
  site: {
    title: 'Kumwe — open-source CMS and application platform',
    description:
      'Kumwe unifies governed content, business data, workflows and delivery surfaces in one extensible open-source platform.',
    socialDescription:
      'Build content-rich, workflow-driven applications on one secure and extensible foundation.',
  },
  accessibility: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    externalLink: 'Opens in a new tab',
    orbitalScene:
      'Decorative orbital view of Earth with satellites travelling in inclined paths around the globe.',
    reducedMotionScene:
      'Decorative static orbital view of Earth. Animation is paused because reduced motion is enabled.',
  },
  navigation: {
    home: 'Home',
    platform: 'Platform',
    studio: 'Studio',
    extensions: 'Extensions',
    clients: 'Clients',
    packages: 'Packages',
    roadmap: 'Roadmap',
    'open-source': 'Open source',
    docs: 'Docs',
    github: 'GitHub',
  },
  theme: {
    label: 'Appearance',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    active: 'Current theme',
  },
  language: {
    label: 'Language',
    current: 'English (UK)',
    available: 'Available',
    planned: 'Planned',
    plannedDescription: 'This language is part of the base locale plan but is not translated yet.',
  },
  common: {
    learnMore: 'Learn more',
    viewRepository: 'View repository',
    readDocumentation: 'Read the documentation',
    projectStatus: 'Project status',
    plannedProject: 'Planned — repository available, public API not yet shipped',
  },
  homeExperience: {
    trustLine: 'Open source · Apache 2.0',
    ecosystemTitle: 'Built to move together.',
    products: [
      {
        id: 'platform',
        title: 'App Core',
        description: 'The secure foundation for content, data and workflows.',
        href: '/platform/',
      },
      {
        id: 'studio',
        title: 'Studio',
        description: 'Compose, model and manage experiences with confidence.',
        href: '/studio/',
      },
      {
        id: 'extensions',
        title: 'Extension SDK',
        description: 'Build powerful extensions that integrate seamlessly.',
        href: '/extensions/',
      },
      {
        id: 'clients',
        title: 'Dart SDK + Clients',
        description: 'Type-safe SDK and clients for every surface.',
        href: '/clients/',
      },
    ],
  },
  repositoryStages: {
    alpha: 'v2 alpha',
    'in-development': 'In development',
    published: 'Published',
    'founding-development': 'Founding development',
    proposal: 'Proposal',
    planned: 'Planned',
  },
  repositoryGroups: {
    core: 'Core platform',
    tooling: 'Tooling and SDKs',
    client: 'Client ecosystem',
    foundation: 'Foundation contracts',
    'business-runtime': 'Business runtime contracts',
    delivery: 'Delivery contracts',
  },
  repositories: {
    app: {
      title: 'Kumwe App',
      summary:
        'The CMS and business application platform. The v2 alpha has passed Gate A and is preparing for Gate B.',
    },
    studio: {
      title: 'Kumwe Studio',
      summary:
        'The contextual content-authoring workspace. Core integration primitives exist; the unified authoring journey remains incomplete.',
    },
    'extension-sdk': {
      title: 'Extension SDK',
      summary:
        'Published contracts and development tooling for installable Kumwe extensions. Adoption across App continues.',
    },
    conversion: {
      title: 'Conversion',
      summary:
        'A published conversion package that demonstrates a focused, reusable ecosystem capability.',
    },
    producer: {
      title: 'Producer',
      summary:
        'Founding development for producing extension projects and repeatable package workflows.',
    },
    'dart-sdk': {
      title: 'Dart SDK',
      summary:
        'A public proposal for typed Dart access to Kumwe services. It is direction, not a released SDK.',
    },
    client: {
      title: 'Flutter client',
      summary:
        'A planned, documentation-first native client. Flutter Web is deliberately outside the current client direction.',
    },
    engine: {
      title: 'Kumwe Engine',
      summary:
        'A planned composition point for reusable contracts as the package ecosystem is extracted and stabilised.',
    },
    'canonical-json': {
      title: 'Canonical JSON',
      summary: 'Planned deterministic JSON representation and hashing primitives.',
    },
    localization: {
      title: 'Localisation',
      summary: 'Planned locale resolution, message catalogue and override contracts.',
    },
    'secret-envelope': {
      title: 'Secret envelope',
      summary: 'Planned portable contracts for bounded encrypted values and key metadata.',
    },
    sequence: {
      title: 'Sequence',
      summary: 'Planned portable sequence allocation and identity contracts.',
    },
    idempotency: {
      title: 'Idempotency',
      summary: 'Planned replay-safe mutation and result-recovery contracts.',
    },
    audit: {
      title: 'Audit',
      summary: 'Planned actor-attributed audit event contracts.',
    },
    approval: {
      title: 'Approval',
      summary: 'Planned maker-checker and high-impact action approval contracts.',
    },
    automation: {
      title: 'Automation',
      summary: 'Planned durable job, retry and schedule contracts.',
    },
    integration: {
      title: 'Integration',
      summary: 'Planned durable external integration and event contracts.',
    },
    'conversion-extension': {
      title: 'Conversion extension',
      summary: 'Planned App adapter for the published conversion capability.',
    },
    computation: {
      title: 'Computation',
      summary: 'Planned bounded formula and dependency-evaluation contracts.',
    },
    'business-policy': {
      title: 'Business policy',
      summary: 'Planned business record and field policy contracts.',
    },
    'access-control': {
      title: 'Access control',
      summary: 'Planned capability and policy-decision contracts.',
    },
    'access-context': {
      title: 'Access context',
      summary: 'Planned explicit actor, site and organisation context contracts.',
    },
    contribution: {
      title: 'Contribution',
      summary: 'Planned typed, owner-aware extension contribution contracts.',
    },
    'interface-standard': {
      title: 'Interface standard',
      summary: 'Planned semantic and accessible interface conformance contracts.',
    },
    'business-definition': {
      title: 'Business definition',
      summary: 'Planned versioned entity, field, relationship, view and action contracts.',
    },
    'business-schema': {
      title: 'Business schema',
      summary: 'Planned portable relational schema planning contracts.',
    },
    'record-values': {
      title: 'Record values',
      summary: 'Planned exact typed-value normalisation and persistence contracts.',
    },
    'record-model': {
      title: 'Record model',
      summary: 'Planned transactional business-record model contracts.',
    },
    'record-query': {
      title: 'Record query',
      summary: 'Planned bounded filtering, sorting, projection and pagination contracts.',
    },
    reporting: {
      title: 'Reporting',
      summary: 'Planned permission-aware reporting and projection contracts.',
    },
    navigation: {
      title: 'Navigation',
      summary: 'Planned permission-aware workspace and navigation contracts.',
    },
    'administrator-contract': {
      title: 'Administrator contract',
      summary: 'Planned administrator surface and contribution contracts.',
    },
    'portal-contract': {
      title: 'Portal contract',
      summary: 'Planned authenticated portal surface and contribution contracts.',
    },
    'business-surface-contract': {
      title: 'Business surface contract',
      summary: 'Planned parity contracts across graphical, API, CLI and MCP surfaces.',
    },
    transaction: {
      title: 'Transaction',
      summary: 'Planned transaction ownership and boundary contracts.',
    },
  },
  pages: {
    home: {
      metaTitle: 'Kumwe — open-source CMS and application platform',
      metaDescription:
        'Build governed content and business applications on one secure, extensible open-source platform.',
      hero: {
        eyebrow: 'ONE CORE · EVERY SURFACE',
        status: 'App v2 alpha · Gate A passed · Gate B preparation',
        title: 'Publish your world. Run your business. Extend everything.',
        titleLines: ['Publish your world.', 'Run your business.', 'Extend everything.'],
        summary:
          'A secure, extensible CMS and application platform for content, business data, workflows, integrations and digital experiences.',
        primaryAction: { label: 'Explore the platform' },
        secondaryAction: {
          label: 'View on GitHub',
          accessibleLabel: 'View Kumwe on GitHub',
        },
      },
      sections: [
        {
          eyebrow: 'ONE SET OF RULES',
          title: 'Content and operations, connected by design.',
          body: 'Kumwe is both a modern CMS and a business application platform. Each surface calls the same application services, so policy, validation, workflow and audit do not drift between interfaces.',
          items: [
            {
              eyebrow: 'CONTENT',
              title: 'Publish with structure',
              description:
                'Manage pages, media, navigation, revisions and governed publishing workflows from a graphical administrator.',
            },
            {
              eyebrow: 'BUSINESS',
              title: 'Model real operations',
              description:
                'Declare typed entities, relationships, views, actions, approvals and reports without forcing business records into page content.',
            },
            {
              eyebrow: 'DELIVERY',
              title: 'Reach every surface',
              description:
                'Reuse authorised behaviour across administrator, portal, REST and OpenAPI, CLI, MCP, workers and schedules.',
            },
          ],
        },
        {
          eyebrow: 'EXTENSIBLE BY CONTRACT',
          title: 'Add capability without breaking the core.',
          body: 'Signed packages, owner-aware contributions and a published Extension SDK give independently installable components a governed route into Kumwe. The ecosystem is being separated into focused contracts as those boundaries stabilise.',
          note: 'Published, in-development, proposed and planned projects are labelled separately throughout this site.',
        },
        {
          eyebrow: 'BUILT IN THE OPEN',
          title: 'Follow the evidence, not a promise.',
          body: 'The App v2 alpha has passed its first release gate. Studio’s unified contextual-authoring journey, broader SDK adoption and the native client ecosystem remain active work with their current status visible in public repositories.',
        },
      ],
      closing: {
        title: 'Start with the working platform.',
        body: 'Run the full App demonstration, inspect the architecture and join the work from the public repository.',
        action: { label: 'Open Kumwe App' },
      },
    },
    platform: {
      metaTitle: 'Platform — Kumwe',
      metaDescription:
        'Explore Kumwe’s shared CMS and business application platform, delivery surfaces and operational foundations.',
      hero: {
        eyebrow: 'KUMWE APP',
        status: 'v2 alpha · Gate A passed',
        title: 'Content and business, governed together.',
        summary:
          'One application core serves managed content and typed business records, then carries the same authority, policy and audit decisions to every supported interface.',
        primaryAction: { label: 'Run the demonstration' },
        secondaryAction: { label: 'Read App documentation' },
      },
      sections: [
        {
          eyebrow: 'TWO PLATFORMS, ONE CORE',
          title: 'A CMS without a business-runtime blind spot.',
          body: 'Pages, media, navigation and publishing remain first-class content models. Typed entities, relationships and operational records remain parallel first-class business models. Neither is reduced to the other.',
          items: [
            {
              title: 'Governed content',
              description:
                'Revisions, workflow states, media, navigation and templates support structured publishing experiences.',
            },
            {
              title: 'Typed operations',
              description:
                'Business definitions drive exact values, relational storage, policies, approvals, actions and reports.',
            },
            {
              title: 'Shared application services',
              description:
                'Delivery adapters present authorised use cases; they do not duplicate domain rules.',
            },
          ],
        },
        {
          eyebrow: 'CONSISTENT DELIVERY',
          title: 'Graphical when people need it. Machine-readable when systems do.',
          body: 'Administrator and portal interfaces, REST and OpenAPI, CLI commands, MCP tools, workers and the scheduler share the same use-case boundaries. A refusal on one surface cannot quietly become permission on another.',
        },
        {
          eyebrow: 'OPERATIONS MATTER',
          title: 'Portable, testable and recoverable foundations.',
          body: 'Kumwe supports MariaDB, MySQL and PostgreSQL through a portable persistence boundary, with durable jobs, migrations, signed extension packages, backup and restore procedures, and deployment acceptance.',
          note: 'Engineering controls support strong deployments; they do not by themselves confer a regulatory certification.',
        },
      ],
      closing: {
        title: 'See the complete working system.',
        body: 'The public App repository includes the quick start, architecture and operational guides.',
        action: { label: 'Open the App repository' },
      },
    },
    studio: {
      metaTitle: 'Studio — Kumwe',
      metaDescription:
        'Understand the target, current primitives and open integration work for Kumwe’s contextual content-authoring experience.',
      hero: {
        eyebrow: 'CONTEXTUAL AUTHORING',
        status: 'In development · unified journey incomplete',
        title: 'Author in context. Stay with the work.',
        summary:
          'Studio is the target page builder and content editor for Kumwe: layout, blocks, typed fields and values in one resource-bound workspace. That end-to-end App journey is not complete yet.',
        primaryAction: { label: 'View Studio' },
        secondaryAction: { label: 'Read App integration status' },
      },
      sections: [
        {
          eyebrow: 'PRODUCT DIRECTION',
          title: 'One workspace, not a catalogue hand-off.',
          body: 'Creating or editing managed content should open Studio for that exact item, preserve its authority and unsaved state, and support clear outcomes for saving the item or creating reusable types.',
        },
        {
          eyebrow: 'WHAT EXISTS',
          title: 'Strong primitives are already connected.',
          body: 'App has a compiled Studio shell, a Blueprint canvas, authenticated PHP host dispatch, bounded content context, persistence, media, preview, localisation, telemetry and extension-contribution primitives.',
          note: 'These primitives are valuable infrastructure; they are not evidence that the complete contextual-authoring journey has passed.',
        },
        {
          eyebrow: 'THE OPEN GAP',
          title: 'Content creation and editing still cross separate forms.',
          body: 'The current App route opens a Blueprint-only composition view from an existing content-type version. Blank or reusable-type creation, entry editing, field creation, explicit save outcomes and the full context-preserving acceptance journey remain open.',
        },
        {
          eyebrow: 'AUTHORITY BOUNDARY',
          title: 'The browser presents; App remains authoritative.',
          body: 'Studio’s browser assets are compiled before deployment. PHP application services retain authentication, authorisation, validation, revision, transaction, idempotency and audit authority; production does not require a JavaScript server.',
        },
      ],
      closing: {
        title: 'Track the integrated journey in public.',
        body: 'Studio and App publish separate contract and implementation status so target, primitives and completed acceptance are never conflated.',
        action: { label: 'Explore Studio on GitHub' },
      },
    },
    extensions: {
      metaTitle: 'Extensions — Kumwe',
      metaDescription:
        'Build signed, governed Kumwe extensions with published SDK contracts and a shared application-service boundary.',
      hero: {
        eyebrow: 'EXTENSION ECOSYSTEM',
        status: 'SDK published · App adoption ongoing',
        title: 'Extend the platform. Keep one set of rules.',
        summary:
          'Kumwe extensions contribute capability through typed, owned contracts and install through a signed pipeline. The Extension SDK is published while adoption across App continues.',
        primaryAction: { label: 'Open the Extension SDK' },
        secondaryAction: { label: 'Read extension documentation' },
      },
      sections: [
        {
          eyebrow: 'GOVERNED CONTRIBUTIONS',
          title: 'A component joins the platform without becoming the platform.',
          body: 'Extensions can add routes, workspaces, navigation, templates, capabilities and domain contributions under explicit ownership. Disablement or trust loss removes executable contributions while preserving owned data by default.',
        },
        {
          eyebrow: 'SIGNED DELIVERY',
          title: 'Inspect, verify, activate.',
          body: 'Package admission covers archive safety, strict manifests, signatures, compatibility and contribution ownership before a release enters the immutable runtime generation.',
        },
        {
          eyebrow: 'PUBLIC TOOLING',
          title: 'Published foundations, honest adoption status.',
          body: 'The Extension SDK provides public development contracts. Conversion is published as a focused package, and Producer is in founding development for repeatable project and package workflows.',
          items: [
            {
              title: 'Extension SDK',
              description: 'Published SDK contracts; integration and adoption continue in App.',
            },
            {
              title: 'Conversion',
              description: 'Published reusable conversion capability.',
            },
            {
              title: 'Producer',
              description: 'Founding development for extension project production workflows.',
            },
          ],
        },
      ],
      closing: {
        title: 'Build against the published boundary.',
        body: 'Start with the Extension SDK, then verify App’s current integration before depending on a capability.',
        action: { label: 'View the Extension SDK' },
      },
    },
    clients: {
      metaTitle: 'Clients — Kumwe',
      metaDescription:
        'Follow Kumwe’s proposed Dart SDK and documentation-first native Flutter client direction.',
      hero: {
        eyebrow: 'CLIENT ECOSYSTEM',
        status: 'Dart SDK proposed · Flutter client planned',
        title: 'Native clients, designed from the contract out.',
        summary:
          'The client direction starts with documented service contracts, proposes a typed Dart SDK, and plans a native Flutter client without positioning Flutter Web as another Kumwe front end.',
        primaryAction: { label: 'View the client plan' },
        secondaryAction: { label: 'Read the Dart SDK proposal' },
      },
      sections: [
        {
          eyebrow: 'DOCS FIRST',
          title: 'Define behaviour before wrapping endpoints.',
          body: 'Client work begins with authentication, site context, capabilities, errors, concurrency, idempotency, pagination and lifecycle behaviour written as stable contracts. Generated convenience must not hide security semantics.',
        },
        {
          eyebrow: 'DART SDK',
          title: 'A typed proposal, not a released dependency.',
          body: 'The Dart SDK repository records the intended package shape and client boundary. Applications should not treat that proposal as a stable published SDK until its status changes.',
        },
        {
          eyebrow: 'FLUTTER CLIENT',
          title: 'A planned native experience.',
          body: 'The Flutter client is planned for supported native targets after the service and Dart boundaries are proven. Flutter Web is deliberately excluded: Kumwe’s existing web surfaces remain the web delivery path.',
        },
      ],
      closing: {
        title: 'Review the direction while it is still being shaped.',
        body: 'The client and SDK repositories make scope and maturity visible before implementation claims are made.',
        action: { label: 'Open the client repository' },
      },
    },
    packages: {
      metaTitle: 'Packages — Kumwe',
      metaDescription:
        'Explore the published, in-development and planned repositories that form Kumwe’s modular contract ecosystem.',
      hero: {
        eyebrow: 'MODULAR FOUNDATIONS',
        status: 'Package extraction planned',
        title: 'Small contracts. One coherent platform.',
        summary:
          'Kumwe is preparing focused repositories for portable platform boundaries. Their public existence signals architecture and collaboration space; it does not mean those planned APIs have shipped.',
        primaryAction: { label: 'Browse Kumwe repositories' },
        secondaryAction: { label: 'See the roadmap' },
      },
      sections: [
        {
          eyebrow: 'FOUNDATION',
          title: 'Reusable behaviour below the application surface.',
          body: 'Planned packages cover deterministic representation, localisation, secret envelopes, sequences, idempotency, audit, approvals, transactions, automation, integrations, conversion adapters and bounded computation.',
        },
        {
          eyebrow: 'BUSINESS RUNTIME',
          title: 'Typed records without turning core into an ERP.',
          body: 'Planned contracts separate contributions, access, definitions, relational schema, exact values, record models, queries, policies and reporting. Independently installable business modules can compose those capabilities later.',
        },
        {
          eyebrow: 'DELIVERY',
          title: 'Keep every surface aligned.',
          body: 'Navigation, administrator, portal and business-surface contracts are planned to preserve capability filtering and application-service parity as the ecosystem grows.',
          note: 'Unless a card is explicitly marked Published, its repository is a planned boundary rather than a released package API.',
        },
      ],
      closing: {
        title: 'Use maturity labels as part of the API.',
        body: 'Choose published packages for present work and follow proposals or planned repositories when contributing to direction.',
        action: { label: 'Browse all repositories' },
      },
    },
    roadmap: {
      metaTitle: 'Roadmap — Kumwe',
      metaDescription:
        'Follow Kumwe’s evidence-based path from App v2 alpha through Studio integration, SDK adoption, clients and modular packages.',
      hero: {
        eyebrow: 'PROJECT TRAJECTORY',
        status: 'Gate A passed · Gate B preparation',
        title: 'Build the foundation before the modules.',
        summary:
          'Kumwe is becoming an ERP-capable application platform without becoming an ERP. The roadmap delivers safe extension contracts and shared runtime capabilities before domain modules are built.',
        primaryAction: { label: 'Read live App status' },
        secondaryAction: { label: 'View releases' },
      },
      sections: [
        {
          eyebrow: 'NOW',
          title: 'Qualify App v2 and complete the shared core.',
          body: 'The v2 alpha has passed Gate A and is preparing for Gate B. Current work preserves portable databases, recovery, extension trust and delivery-surface parity while qualification evidence grows.',
        },
        {
          eyebrow: 'IN PARALLEL',
          title: 'Finish the authoring journey and SDK adoption.',
          body: 'Studio must complete contextual creation and editing inside App, while the published Extension SDK becomes the normal route for governed extension development. Producer remains in founding development.',
        },
        {
          eyebrow: 'NEXT',
          title: 'Prove client boundaries before shipping clients.',
          body: 'The Dart SDK remains a proposal and the Flutter client remains planned. Documentation and behavioural contracts come first; implementation follows qualified server APIs.',
        },
        {
          eyebrow: 'THEN',
          title: 'Extract stable contracts into focused packages.',
          body: 'Engine and package repositories are planned around boundaries already being proven in App. Extraction follows stability rather than creating a second, competing architecture.',
          note: 'The roadmap stops at ERP-capable platform contracts; accounting, inventory, CRM, payroll and other ERP modules are separate future components.',
        },
      ],
      closing: {
        title: 'Use repository status as the current truth.',
        body: 'Plans explain direction. A passing gate, published package or merged implementation is the evidence for delivered behaviour.',
        action: { label: 'Open the App status ledger' },
      },
    },
    'open-source': {
      metaTitle: 'Open source — Kumwe',
      metaDescription:
        'Learn how Kumwe’s Apache 2.0 code, public development process and separate brand rights support an open ecosystem.',
      hero: {
        eyebrow: 'OPEN BY FOUNDATION',
        status: 'Apache License 2.0',
        title: 'Open foundations. Clear boundaries.',
        summary:
          'Kumwe code is free and open-source software under Apache 2.0. Use it, modify it and build open or proprietary extensions — with the licence, notices and separate brand rights kept clear.',
        primaryAction: { label: 'Explore the source' },
        secondaryAction: { label: 'Contribute to Kumwe' },
      },
      sections: [
        {
          eyebrow: 'PERMISSIVE CODE LICENCE',
          title: 'Build without a copyleft requirement.',
          body: 'Apache 2.0 permits use, modification and distribution in open or closed products, subject to its notice, attribution and other licence terms. Proprietary extensions are welcome.',
        },
        {
          eyebrow: 'PUBLIC ENGINEERING',
          title: 'Inspect the decisions and the evidence.',
          body: 'Source, issues, discussions, release status and ecosystem proposals live in public repositories. Status language distinguishes implemented behaviour from incomplete integration, proposals and plans.',
        },
        {
          eyebrow: 'BRAND AND WARRANTY',
          title: 'Open code does not transfer the name or logos.',
          body: 'The software is provided as-is under the licence. The Kumwe name and logos are not included in the code licence and remain subject to their separate rights.',
        },
        {
          eyebrow: 'STEWARDSHIP',
          title: 'Developed by Vast Development Method.',
          body: 'Kumwe is owned and developed by Vast Development Method Trading Pty Ltd, with contributions welcomed through the project’s public workflow.',
        },
      ],
      closing: {
        title: 'Read the repository licence before distributing.',
        body: 'The licence and notice files in each repository are the authoritative terms for that project’s code.',
        action: { label: 'View Kumwe on GitHub' },
      },
    },
  },
  footer: {
    summary: 'Open-source CMS and business application platform.',
    projectLinks: 'Project',
    legalLinks: 'Legal',
    copyright: '© 2022–2026 Vast Development Method Trading Pty Ltd.',
    licence: 'Code licensed under Apache 2.0.',
    trademark: 'The Kumwe name and logos are not part of the code licence.',
    madeWithLove: 'Made with love by Vast Development Method.',
  },
} as const satisfies WebsiteMessagesShape;

export type EnglishMessages = typeof enGB;
