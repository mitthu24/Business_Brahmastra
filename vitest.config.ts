import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
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
