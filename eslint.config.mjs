import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "padding-line-between-statements": [
        "warn",
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
        { blankLine: "always", prev: "*", next: ["const", "let", "var"] },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
        { blankLine: "always", prev: "*", next: ["block-like", "block"] },
        { blankLine: "always", prev: ["block-like", "block"], next: "*" },
        { blankLine: "always", prev: "*", next: "export" },
        { blankLine: "any", prev: "export", next: "export" },
      ],
    },
  },
  globalIgnores([
    ".agents/**",
    ".next/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
