import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";


/**
 * Architecture guard: dependency direction is  core <- server | seo | components <- app.
 * These rules turn the layering from a convention into a build failure.
 */
const layer = (files, patterns) => ({
  files,
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

const guards = [
  layer(["src/core/**/*.{ts,tsx}"], [
    { group: ["@/server/*", "@/seo/*", "@/components/*", "@/app/*", "@/config/env", "next", "next/*", "react", "react-dom"], message: "core is framework-free: it may only depend on zod and itself." },
  ]),
  layer(["src/seo/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"], [
    { group: ["@/server/*", "@/app/*"], message: "Components and SEO builders receive data as props; only routes (src/app) and src/server touch the data layer." },
  ]),
  layer(["src/components/client/**/*.{ts,tsx}"], [
    { group: ["@/server/*", "@/config/env", "@/app/*"], message: "Client Components ship to the browser: never import server-only modules or env." },
  ]),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...guards,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
