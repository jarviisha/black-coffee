import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import reactPlugin from "eslint-plugin-react"
import tanstackQuery from "@tanstack/eslint-plugin-query"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  // Ignore generated code and build output
  globalIgnores(["dist", "src/api"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      // Type-checked rules — catches unsafe any, unhandled promises, etc.
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...tanstackQuery.configs["flat/recommended"],
      // Must be last to disable rules that conflict with Prettier
      prettier,
    ],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React
      "react/jsx-key": "error",
      "react/self-closing-comp": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-no-target-blank": "error",

      // No leftover debug statements in production
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // TypeScript — relax a few noisy defaults from recommendedTypeChecked
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
  },
])
