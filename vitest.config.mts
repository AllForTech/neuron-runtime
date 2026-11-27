import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const exclude = ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.turbo/**"];

export default defineConfig({
  test: {
    // No global include: projects declare their own scopes to prevent inheritance
    // from causing every project to collect every test file.
    exclude,
    projects: [
      {
        test: {
          name: "api",
          environment: "node",
          include: ["apps/api/**/*.{test,spec}.{ts,tsx}"],
          exclude: [...exclude, "apps/web/**", "packages/**", "tests/**"],
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./apps/api/src", import.meta.url)),
          },
        },
      },
      {
        test: {
          name: "web",
          environment: "node",
          include: ["apps/web/**/*.{test,spec}.{ts,tsx}"],
          exclude: [...exclude, "apps/api/**", "packages/**", "tests/**"],
          // DOM suites opt in with @vitest-environment happy-dom.
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./apps/web", import.meta.url)),
          },
        },
      },
      {
        test: {
          name: "packages",
          environment: "node",
          include: ["tests/**/*.{test,spec}.{ts,tsx}", "packages/**/*.{test,spec}.{ts,tsx}"],
          exclude: [...exclude, "apps/api/**", "apps/web/**"],
        },
      },
    ],
  },
});
