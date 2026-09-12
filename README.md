# Kumwe website

[![CI](https://github.com/kumwe/website/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kumwe/website/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/kumwe/website/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/kumwe/website/actions/workflows/deploy-pages.yml)
[![Source version](https://img.shields.io/github/package-json/v/kumwe/website?label=source%20version)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.12.0-339933)](package.json)
[![License](https://img.shields.io/github/license/kumwe/website)](LICENSE)

The public website for [Kumwe](https://www.kumwe.net/), an open-source CMS and business application platform.

The site is a fully static [Astro](https://astro.build/) build for GitHub Pages. Its home page uses a progressively enhanced Three.js scene: Earth, a highlighted Namibia, twinkling stars, a breathing atmosphere, four satellites and an ISS-like station share one depth-tested 3D space. Orbiters pass naturally behind Earth and reappear in front. Visitors who disable motion, enable Save-Data, use lower-powered devices or lack WebGL receive a deliberate static fallback.

## Relationship to Core

This repository publishes the public ecosystem website. It does not run Kumwe Core, own application data or authorization, or distribute a Composer package. Product claims and package links must reflect the owning repository's released behavior. The source version in `package.json` identifies this private build project; it is not a published npm package.

## Technology

- Astro static generation with real file-based routes
- Direct Three.js rendering for the orbital hero
- System-aware light and dark themes with a saved visitor override
- Typed `en-GB` source catalogue and locale registry prepared for future translations
- Vitest unit tests, Playwright browser tests and axe accessibility checks
- GitHub Actions CI and GitHub Pages deployment

The direct Three.js implementation keeps the production hero substantially smaller than a general-purpose globe framework while retaining real 3D orbit geometry and occlusion.

## Local development

Node.js 24 is recommended; the supported minimum is Node.js 22.12.

```sh
npm ci
npm run dev
```

Useful commands:

```sh
npm run format:check
npm run lint
npm run check
npm run test
npm run build
npm run test:e2e
npm run qa
```

## Routes

- `/` — ecosystem overview and orbital hero
- `/platform/` — Kumwe App and core platform
- `/studio/` — contextual authoring direction and current status
- `/extensions/` — signed extension model and SDK
- `/clients/` — Dart SDK proposal and native Flutter client plan
- `/packages/` — modular package boundaries and directory
- `/roadmap/` — evidence-based delivery trajectory
- `/open-source/` — contribution, licensing and stewardship

Product copy deliberately distinguishes published, alpha, in-development, proposed and planned work. A repository existing does not imply that its package or API has shipped.

## Localisation

`en-GB` is the source locale and the only catalogue currently shipped. Locale metadata is already defined for the full Version 2 language plan:

`en-GB`, `en-US`, `af`, `de`, `he`, `ar`, `es`, `pt-BR`, `zh-Hans`.

Arabic and Hebrew are marked right-to-left. Planned languages appear as status information, not selectable translations. To add a translation:

1. create a catalogue matching `WebsiteMessagesShape` in `src/i18n/`;
2. add it to the catalogue registry in `src/i18n/index.ts`;
3. move its locale from planned to shipped;
4. generate the corresponding static locale routes and `hreflang` entries;
5. run the full QA suite in both text directions where applicable.

## Deployment and custom domain

`.github/workflows/deploy-pages.yml` builds and deploys on pushes to `main`. The repository Pages source must be set to **GitHub Actions**.

The configured canonical domain is `www.kumwe.net`, recorded in `public/CNAME`. The GitHub Pages repository setting remains authoritative for an Actions deployment. To configure or change the domain:

1. verify `kumwe.net` in the Kumwe GitHub organisation;
2. configure `www.kumwe.net` as this repository's Pages custom domain;
3. point the `www` CNAME to `kumwe.github.io`;
4. confirm the Pages deployment and DNS check;
5. enable HTTPS enforcement;
6. complete any DNS cutover only after the deployment is verified.

Keep the current site available while validating a replacement deployment and its domain ownership.

## Licensing and brand

Website code is licensed under the [Apache License 2.0](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for bundled asset notices.

Copyright © 2022–2026 Vast Development Method Trading Pty Ltd.

The Kumwe name and logos are not part of the code licence. Each repository in the broader ecosystem is governed by the licence published with that repository.
