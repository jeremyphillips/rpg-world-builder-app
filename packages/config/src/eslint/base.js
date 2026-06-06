import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-config-prettier";

/**
 * Shared base ESLint flat config.
 *
 * Consumers extend this (or `@rpg/config/eslint/react`) and add their own
 * `languageOptions.parserOptions.project` for type-aware rules if desired.
 *
 * Feature-first boundary: each directory under `src/features/*` is an element.
 * Code in one feature may only reach another feature through its public entry
 * (`index.ts` / `index.tsx`); deep cross-feature imports are disallowed.
 * Imports within the same feature are unrestricted.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/out/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "**/node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
      "boundaries/include": ["**/src/**"],
      "boundaries/elements": [
        { type: "feature", pattern: "src/features/*", mode: "folder", capture: ["feature"] },
        { type: "shared", pattern: "src/!(features)/**", mode: "full" },
      ],
    },
    rules: {
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            { target: ["feature"], allow: ["index.ts", "index.tsx"] },
            { target: ["shared"], allow: ["**"] },
          ],
        },
      ],
    },
  },
  prettier,
);
