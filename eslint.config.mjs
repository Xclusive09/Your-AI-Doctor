import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Contract deployment scripts (designed for BlockDAG IDE, not main codebase)
    "contracts/deploy.js",
    "contracts/blockdag-deploy.js",
    "contracts/standalone-deploy.js",
    "contracts/package.json",
  ]),
]);

export default eslintConfig;
