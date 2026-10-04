import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // tests/e2e/ holds Playwright specs (run via `pnpm test:e2e`), which use Playwright's own
    // test()/describe() - Vitest's default glob would otherwise pick them up and fail trying to
    // run them under the wrong test runner. Kept alongside Vitest's own default exclusions
    // (overriding `exclude` replaces the defaults, so they're repeated here rather than lost).
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/tests/e2e/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // next's server-only / client-only guards throw outside of Next's own bundler; they're a
      // no-op under Vitest, where our own test setup (not Next) controls which code runs where.
      "server-only": path.resolve(__dirname, "./src/test/empty-module.ts"),
      "client-only": path.resolve(__dirname, "./src/test/empty-module.ts"),
    },
  },
});
