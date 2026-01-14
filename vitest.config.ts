import path from "path";

import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    root: "./",
    pool: "forks",
    maxWorkers: 1,
    watch: false,
    sequence: {
      concurrent: false,
    },
    setupFiles: ["test/e2e/setup.ts"],
    include: ["src/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    reporters: ["default"],
    testTimeout: 80000,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
