import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const brandDirectory = join(projectRoot, 'public', 'brand');

const approvedAssets = {
  'kumwe-wordmark-255x100.png': '90707c9dc4d0d7d63d7a5afb289d674b8a69236cc4b030dcb302c5d8ebd02dd8',
  'kumwe-wordmark-1276x500.png': 'd67c1fd4133c3367764b0d9a451eabd1a52693c88caec45b6a31c2036f55f7aa',
  'kumwe-symbol-100x100.png': 'f17a0c258dee3d4c92894f9c083785983d5b0ee8de8681fe0d163300d75d9f04',
  'kumwe-symbol-500x500.png': '2e3b4fd7abaec4935566324cd43942f53436f0035654375cf14fa268739b1730',
} as const;

const sourceExtensions = new Set(['.astro', '.css', '.js', '.mjs', '.ts', '.tsx']);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

describe('canonical Kumwe brand assets', () => {
  it('preserves the exact approved PNG files', () => {
    for (const [fileName, expectedDigest] of Object.entries(approvedAssets)) {
      const digest = createHash('sha256')
        .update(readFileSync(join(brandDirectory, fileName)))
        .digest('hex');

      expect(digest, `${fileName} must remain byte-for-byte identical to the supplied PNG`).toBe(
        expectedDigest,
      );
    }
  });

  it('does not reference the superseded generated SVG brand files', () => {
    const deprecatedBrandReference = /\/brand\/kumwe-(?:symbol|wordmark)\.svg\b/;
    const references = sourceFiles(join(projectRoot, 'src')).flatMap((path) => {
      const match = readFileSync(path, 'utf8').match(deprecatedBrandReference);
      return match ? [`${path}: ${match[0]}`] : [];
    });

    expect(references).toEqual([]);
  });
});
