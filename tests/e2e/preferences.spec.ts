import { expect, test } from '@playwright/test';

test.describe('appearance preferences', () => {
  test('theme overrides update the document and persist across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const root = page.locator('html');
    const light = page.locator('[data-theme-choice="light"]');
    const dark = page.locator('[data-theme-choice="dark"]');
    const system = page.locator('[data-theme-choice="system"]');

    await expect(root).toHaveAttribute('data-theme-preference', 'system');
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(system).toHaveAttribute('aria-pressed', 'true');

    await light.click();
    await expect(root).toHaveAttribute('data-theme-preference', 'light');
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(light).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kumwe-theme'))).toBe('light');

    await page.reload();
    await expect(root).toHaveAttribute('data-theme-preference', 'light');
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(light).toHaveAttribute('aria-pressed', 'true');

    await dark.click();
    await expect(root).toHaveAttribute('data-theme-preference', 'dark');
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(dark).toHaveAttribute('aria-pressed', 'true');

    await system.click();
    await expect(root).toHaveAttribute('data-theme-preference', 'system');
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(system).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('kumwe-theme')))
      .toBe('system');
  });
});

test.describe('language readiness', () => {
  test('identifies en-GB as available and labels every planned base locale', async ({ page }) => {
    await page.goto('/');

    const menu = page.locator('[data-language-menu]');
    const summary = menu.locator('summary');
    await expect(summary).toHaveAttribute('aria-label', 'Language: English (UK)');
    await expect(summary).toContainText('EN-GB');
    await summary.click();

    await expect(menu).toHaveAttribute('open', '');
    await expect(menu.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(menu.locator('.locale-current')).toContainText('English (UK)');
    await expect(menu.locator('.locale-current')).toContainText('Available');

    const plannedLocales = menu.locator('.locale-planned');
    await expect(plannedLocales).toHaveCount(8);
    await expect(plannedLocales).toHaveText([
      'English (US)',
      'Afrikaans',
      'Deutsch',
      'עברית',
      'العربية',
      'Español',
      'Português (Brasil)',
      '简体中文',
    ]);
    expect(
      await plannedLocales.evaluateAll((elements) =>
        elements.map((item) => item.getAttribute('title')),
      ),
    ).toEqual([
      'English (United States) — Planned',
      'Afrikaans — Planned',
      'German — Planned',
      'Hebrew — Planned',
      'Arabic — Planned',
      'Spanish — Planned',
      'Portuguese (Brazil) — Planned',
      'Chinese (Simplified) — Planned',
    ]);
  });
});

test.describe('responsive navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens the mobile menu and follows an internal route', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-menu-button]');
    const navigation = page.locator('[data-primary-nav]');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toHaveAttribute('data-open', 'false');
    await expect(navigation).toBeHidden();

    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toHaveAttribute('data-open', 'true');
    await expect(navigation).toBeVisible();

    await navigation.getByRole('link', { name: 'Platform', exact: true }).click();
    await expect(page).toHaveURL(/\/platform\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Content and business, governed together.',
    );
  });
});

test.describe('reduced motion', () => {
  test('serves the static orbital treatment without required animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true,
    );

    const orbitalScene = page.locator('[data-orbital-scene]');
    await expect(orbitalScene).toHaveAttribute('data-orbit-status', /^(fallback|webgl)$/);
    await expect(orbitalScene.locator('.orbital-scene__fallback-earth')).toHaveCount(1);

    const transitionDurations = await orbitalScene
      .locator('.orbital-scene__fallback')
      .evaluate((element) => getComputedStyle(element).transitionDuration);
    const longestTransitionMs = Math.max(
      ...transitionDurations.split(',').map((duration) => {
        const value = Number.parseFloat(duration);
        return duration.trim().endsWith('ms') ? value : value * 1_000;
      }),
    );
    expect(longestTransitionMs).toBeLessThanOrEqual(0.01);
  });
});
