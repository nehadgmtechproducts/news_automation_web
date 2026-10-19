import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside a React Server build; tests run in plain Node.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  // .tsx tests render components to static HTML (see tests/footer-render.test.tsx)
  test: { include: ["tests/**/*.test.{ts,tsx}"] },
});
