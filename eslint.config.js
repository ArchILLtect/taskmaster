import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  // Base config for all TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    ignores: ["**/node_modules/**", "amplify-codegen-temp/models/models.ts"],
    rules: {
      // Optional nicety:
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  /**
   * UI-layer guardrail:
   * - In components/pages/hooks, forbid importing generated Amplify API *types*
   *   (models/queries/mutations/etc.) from ../API or @/API.
   * - Allow ONLY TaskStatus + TaskPriority enums.
   */
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/pages/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // Match any relative import that ends in "/API" (../API, ../../API, etc.)
            {
              regex: "^(\\.{1,2}\\/)+API$",
              allowImportNames: ["TaskStatus", "TaskPriority"],
              message:
                "UI-layer code must not import generated model/query types from ../API. Import TaskUI/ListUI from src/types and map API results at the boundary (src/api/**). Only TaskStatus/TaskPriority enums are allowed here.",
            },

            // Match alias import "@/API"
            {
              regex: "^@\\/API$",
              allowImportNames: ["TaskStatus", "TaskPriority"],
              message:
                "UI-layer code must not import generated model/query types from @/API. Import TaskUI/ListUI from src/types and map API results at the boundary (src/api/**). Only TaskStatus/TaskPriority enums are allowed here.",
            },

            // Optional: also forbid deep subpath imports like ../API/something (usually not needed)
            // Uncomment if you ever see those appear.
            /*
            {
              regex: "^(\\.{1,2}\\/)+API\\/.+$",
              message:
                "UI-layer code must not import from API subpaths. Import from ../API only for enums (TaskStatus/TaskPriority) or move API usage to the boundary (src/api/**).",
            },
            {
              regex: "^@\\/API\\/.+$",
              message:
                "UI-layer code must not import from API subpaths. Import from @/API only for enums (TaskStatus/TaskPriority) or move API usage to the boundary (src/api/**).",
            },
            */
          ],
        },
      ],
    },
  },
]);