/**
 * Intentionally uses Vitest globals (no import from `vitest`) to avoid any chance of
 * importing a different Vitest instance than the runner, which can cause:
 * "No test suite found in file ..."
 */

describe('smoke', () => {
    it('runs', () => {
        expect(1).toBe(1);
    });
});