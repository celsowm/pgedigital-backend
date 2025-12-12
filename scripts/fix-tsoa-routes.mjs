import { readFile, writeFile } from 'node:fs/promises';

/**
 * TSOA currently generates controller imports without explicit `.js` extensions.
 * With TS `moduleResolution: NodeNext`, TypeScript requires explicit extensions
 * for relative ESM imports.
 *
 * This post-generation step patches `src/routes/routes.ts` so `tsc --noEmit`
 * passes while keeping runtime ESM behavior consistent with the rest of this repo.
 */

const ROUTES_FILE = new URL('../src/routes/routes.ts', import.meta.url);

const source = await readFile(ROUTES_FILE, 'utf8');

// Patch only controller imports, leaving other imports untouched.
// Example: import { X } from './../controllers/X';  ->  ...from './../controllers/X.js';
const patched = source.replace(
    /(from\s+['"]\.?\.\/\.\.\/controllers\/[^'"\n]+)(['"]\s*;)/g,
    (match, prefix, suffix) => {
        if (prefix.endsWith('.js')) return match;
        if (prefix.endsWith('.ts')) return match;
        return `${prefix}.js${suffix}`;
    },
);

if (patched !== source) {
    await writeFile(ROUTES_FILE, patched, 'utf8');
}
