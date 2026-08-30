import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const accessibilityPages = [
  { path: '/', label: 'home page' },
  { path: '/platform/', label: 'platform page' },
] as const;

for (const target of accessibilityPages) {
  test(`${target.label} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(target.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
      .analyze();

    const details = results.violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help} (${violation.nodes.length} node${
            violation.nodes.length === 1 ? '' : 's'
          })`,
      )
      .join('\n');
    expect(results.violations, details || 'No accessibility violations detected').toEqual([]);
  });
}
