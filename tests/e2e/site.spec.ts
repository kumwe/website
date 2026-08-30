import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  {
    path: '/',
    heading: 'Publish your world. Run your business. Extend everything.',
  },
  { path: '/platform/', heading: 'Content and business, governed together.' },
  { path: '/studio/', heading: 'Author in context. Stay with the work.' },
  { path: '/extensions/', heading: 'Extend the platform. Keep one set of rules.' },
  { path: '/clients/', heading: 'Native clients, designed from the contract out.' },
  { path: '/packages/', heading: 'Small contracts. One coherent platform.' },
  { path: '/roadmap/', heading: 'Build the foundation before the modules.' },
  { path: '/open-source/', heading: 'Open foundations. Clear boundaries.' },
] as const;

async function openPublicRoute(page: Page, path: string): Promise<void> {
  const response = await page.goto(path);
  expect(response, `Expected ${path} to return a document response`).not.toBeNull();
  expect(response?.status(), `Expected ${path} to be a successful static route`).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
}

test.describe('static public routes', () => {
  test('every route responds and renders one distinct page heading', async ({ page }) => {
    const renderedHeadings = new Set<string>();

    for (const route of publicRoutes) {
      await openPublicRoute(page, route.path);

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toContainText(route.heading);

      const normalisedHeading = (await heading.innerText()).replace(/\s+/g, ' ').trim();
      expect(normalisedHeading).toBe(route.heading);
      renderedHeadings.add(normalisedHeading);
    }

    expect(renderedHeadings.size).toBe(publicRoutes.length);
  });

  test('unknown routes use the custom not-found page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist/');

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('That route is out of orbit.');
    await expect(page.getByRole('link', { name: 'Return to Kumwe' })).toHaveAttribute('href', '/');
  });
});

test.describe('home page', () => {
  test('renders the approved hero copy, actions, trust line and product dock', async ({ page }) => {
    await openPublicRoute(page, '/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveCount(1);
    const headingLines = (await heading.innerText())
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    expect(headingLines).toEqual([
      'Publish your world.',
      'Run your business.',
      'Extend everything.',
    ]);

    await expect(page.getByText('ONE CORE · EVERY SURFACE', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        'A secure, extensible CMS and application platform for content, business data, workflows, integrations and digital experiences.',
        { exact: true },
      ),
    ).toBeVisible();

    const primaryAction = page.getByRole('link', {
      name: 'Explore the platform',
      exact: true,
    });
    await expect(primaryAction).toHaveAttribute('href', '/platform/');

    const githubAction = page.getByRole('link').filter({ hasText: 'View on GitHub' }).first();
    await expect(githubAction).toBeVisible();
    await expect(githubAction).toHaveAttribute('href', 'https://github.com/kumwe');
    await expect(page.getByText('Open source · Apache 2.0', { exact: true })).toBeVisible();

    const productDock = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Built to move together.', exact: true }),
    });
    await expect(productDock).toHaveCount(1);

    const expectedProducts = [
      {
        title: 'App Core',
        description: 'The secure foundation for content, data and workflows.',
        href: '/platform/',
      },
      {
        title: 'Studio',
        description: 'Compose, model and manage experiences with confidence.',
        href: '/studio/',
      },
      {
        title: 'Extension SDK',
        description: 'Build powerful extensions that integrate seamlessly.',
        href: '/extensions/',
      },
      {
        title: 'Dart SDK + Clients',
        description: 'Type-safe SDK and clients for every surface.',
        href: '/clients/',
      },
    ] as const;
    const productCards = productDock.getByRole('link');
    await expect(productCards).toHaveCount(expectedProducts.length);

    for (const [index, expectedProduct] of expectedProducts.entries()) {
      const productCard = productCards.nth(index);
      await expect(productCard).toHaveAttribute('href', expectedProduct.href);
      expect((await productCard.innerText()).replace(/\s+/g, ' ').trim()).toBe(
        `${expectedProduct.title} ${expectedProduct.description}`,
      );
    }
  });

  test('uses one visible PNG wordmark in the header and no competing footer logo', async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await openPublicRoute(page, '/');

      const brandLink = page.locator('[data-site-header] a.brand');
      await expect(brandLink).toHaveCount(1);
      await expect(brandLink.locator('img')).toHaveCount(1);

      const wordmark = brandLink.locator('img:visible');
      await expect(wordmark).toHaveCount(1);
      await expect(wordmark).toHaveAttribute('src', /\/brand\/kumwe-wordmark-[^/]+\.png$/);
      expect((await wordmark.getAttribute('srcset')) ?? '').not.toContain('.svg');

      const footer = page.locator('footer');
      await expect(footer.locator('a.brand')).toHaveCount(0);
      await expect(footer.locator('img[src*="kumwe" i]')).toHaveCount(0);
    }
  });

  test('always exposes a resilient orbital scene, with WebGL optional', async ({ page }) => {
    await openPublicRoute(page, '/');

    const orbitalScene = page.locator('[data-orbital-scene]');
    await expect(orbitalScene).toHaveCount(1);
    await expect(orbitalScene.locator('.orbital-scene__fallback')).toHaveCount(1);
    await expect(orbitalScene).toHaveAttribute('data-orbit-initialised', 'true');
    await expect(orbitalScene).toHaveAttribute('data-orbit-status', /^(fallback|webgl)$/);

    const mode = await orbitalScene.getAttribute('data-orbit-status');
    if (mode === 'webgl') {
      await expect(orbitalScene.locator('canvas')).toHaveCount(1);
    } else {
      await expect(orbitalScene).toHaveAttribute('data-orbit-reason', /\S+/);
    }
  });
});

test.describe('page-specific visual language', () => {
  const visualRoutes = [
    { path: '/platform/', motif: 'orbital-core' },
    { path: '/studio/', motif: 'holographic-canvas' },
    { path: '/extensions/', motif: 'module-docking' },
    { path: '/clients/', motif: 'signal-constellation' },
    { path: '/packages/', motif: 'package-constellation' },
    { path: '/roadmap/', motif: 'mission-trajectory' },
    { path: '/open-source/', motif: 'open-shield' },
  ] as const;

  test('gives every internal route one unique hero motif and a visual story', async ({ page }) => {
    const renderedMotifs = new Set<string>();

    for (const route of visualRoutes) {
      await openPublicRoute(page, route.path);

      const motifRoot = page.locator(`[data-page-motif="${route.motif}"]`);
      await expect(motifRoot).toHaveCount(1);
      await expect(motifRoot).toBeVisible();
      const renderedMotif = await motifRoot.getAttribute('data-page-motif');
      expect(renderedMotif).toBe(route.motif);

      const heroVisual = page.locator('[data-page-hero-visual]');
      await expect(heroVisual).toHaveCount(1);
      await expect(heroVisual).toBeVisible();

      const heroBelongsToMotif = await heroVisual.evaluate(
        (element, motif) => element.closest(`[data-page-motif="${motif}"]`) !== null,
        route.motif,
      );
      expect(heroBelongsToMotif, `${route.path} hero visual should belong to its motif`).toBe(true);

      const visualStories = page.locator('[data-visual-story]');
      expect(
        await visualStories.count(),
        `${route.path} should contain a visual story`,
      ).toBeGreaterThan(0);
      await expect(visualStories.first()).toBeVisible();

      renderedMotifs.add(renderedMotif ?? '');
    }

    expect(renderedMotifs.size).toBe(visualRoutes.length);
  });
});
