# Contributing to the Kumwe website

Thank you for helping improve the Kumwe website. This repository builds a static Astro site and deploys it through GitHub Pages.

## Local development

Use Node.js 24 and npm 11. Install the locked dependency tree, then start the local server:

```sh
npm ci
npm run dev
```

Before opening a pull request, run the same checks used by continuous integration:

```sh
npm run format:check
npm run lint
npm run check
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```

The end-to-end tests preview the already-built `dist/` directory. Browser-generated reports are written to `playwright-report/` and `test-results/`; neither directory is committed.

## Pull requests

- Keep changes focused and explain the user-facing outcome.
- Add or update tests for behavioral changes.
- Preserve keyboard support, visible focus, semantic landmarks, and reduced-motion behavior.
- Keep English copy in the typed locale catalogue so future translations do not require component rewrites.
- Do not commit credentials, environment files, build output, or generated browser reports.

Deployment runs only after a change reaches `main`. Pull requests build and test the site but do not publish it.
