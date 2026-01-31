# Metal-ORM global metadata registry fix & release checklist

This repo (pgedigital-backend) validated that the fix works: once the metadata map is stored on `globalThis`, Adorn API + Metal ORM stop emitting `Entity "..." has no columns` warnings under Vitest (ESM+CJS dual package hazard).

## Summary of fix
Metal-ORM currently stores entity metadata in a module-local `Map`. When consumers load **both ESM and CJS** builds in the same process, each build has its own map, so decorators register into one and DTO generation reads from the other. Using a **global map** prevents this split.

## Patch (source)
Edit `src/orm/entity-metadata.ts`:

```ts
const GLOBAL_KEY = Symbol.for("metal-orm:entity-metadata");
const globalStore = globalThis as unknown as {
  [GLOBAL_KEY]?: Map<EntityConstructor, EntityMetadata>;
};
const metadataMap = globalStore[GLOBAL_KEY] ?? (globalStore[GLOBAL_KEY] = new Map());
```

Replace the existing `const metadataMap = new Map(...)` with the above.

## Build outputs to update
Metal-ORM ships built files. After changing source, rebuild so both ESM and CJS bundles contain the global map:

- `dist/index.js`
- `dist/index.cjs`
- (maps will update too)

## Release steps (metal-orm repo)
1. **Create a branch** and apply the source change.
2. **Run tests**:
   ```bash
   npm test
   ```
3. **Build**:
   ```bash
   npm run build
   ```
4. **Version bump** (patch is likely enough):
   ```bash
   npm version patch
   ```
5. **Verify dist**:
   - Confirm `dist/index.js` and `dist/index.cjs` now contain:
     `Symbol.for("metal-orm:entity-metadata")` and `globalThis`.
6. **Publish**:
   ```bash
   npm publish
   ```

## Optional: regression test idea
Add a small test in metal-orm (or adorn-api) that simulates dual-package usage:
- Import metal-orm ESM and CJS in same process
- Register decorators via ESM
- Validate metadata available via CJS

## Notes
- This change is backwards-compatible.
- It resolves warnings in Adorn API when the consumer toolchain loads both builds.
- Local validation was done inside `pgedigital-backend` via Vitest.