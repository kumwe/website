import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  { path: '/', heading: 'One platform. Every connection.' },
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
  test('keeps the product story and primary actions in static HTML', async ({ page }) => {
    await openPublicRoute(page, '/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'One platform. Every connection.',
    );
    await expect(
      page.getByText(
        /Kumwe brings content, business data, workflows and delivery surfaces into one governed system/,
      ),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore the platform/ })).toHaveAttribute(
      'href',
      '/platform/',
    );
    const appLink = page.locator('.hero-actions a[href="https://github.com/kumwe/app"]');
    await expect(appLink).toContainText('View App on GitHub');
    await expect(appLink).toHaveAttribute('href', 'https://github.com/kumwe/app');
    await expect(page.getByText('GATE A · PASSED')).toBeVisible();
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
