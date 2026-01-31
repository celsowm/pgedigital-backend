import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    target: "es2022"
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "dist/**"],
    setupFiles: ["tests/setup/vitest.setup.ts"],
    testTimeout: 10000
  }
});
