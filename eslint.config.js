import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    // Legacy: was previously in .eslintignore
    "amplify-codegen-temp/**",
  ]),

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
    ignores: ["**/node_modules/**"],
    rules: {
      // Optional nicety:
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  /**
   * UI-layer guardrail:
   * - In components/pages, forbid importing generated Amplify API types from ../API or @/API.
   * - Allow ONLY TaskStatus + TaskPriority enums.
   * - UI must not import from src/api/** directly.
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
          paths: [
            {
              name: "../api",
              message: "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
            {
              name: "../../api",
              message: "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
            {
              name: "../../../api",
              message: "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
            {
              name: "../../../../api",
              message: "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
            {
              name: "@/api",
              message: "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
          ],
          patterns: [
            // Disallow API subpath imports entirely (../API/* or @/API/*)
            {
              regex: "^(\\.{1,2}\\/)+API\\/.+$",
              message:
                "UI must not import from ../API subpaths. Only named imports TaskStatus/TaskPriority from ../API are allowed.",
            },
            {
              regex: "^@\\/API\\/.+$",
              message:
                "UI must not import from @/API subpaths. Only named imports TaskStatus/TaskPriority from @/API are allowed.",
            },

            // Allowlist only TaskStatus/TaskPriority from ../API or @/API
            {
              regex: "^(\\.{1,2}\\/)+API$",
              allowImportNames: ["TaskStatus", "TaskPriority"],
              message:
                "UI must not import from ../API except for named imports TaskStatus and TaskPriority.",
            },
            {
              regex: "^@\\/API$",
              allowImportNames: ["TaskStatus", "TaskPriority"],
              message:
                "UI must not import from @/API except for named imports TaskStatus and TaskPriority.",
            },

            // UI must not call API wrappers directly; use Zustand store actions instead.
            {
              regex: "^(\\.{1,2}\\/)+api\\/.+$",
              message:
                "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
            {
              regex: "^@\\/api\\/.+$",
              message:
                "UI must use store/hooks (useTaskActions/useTaskStoreView) instead of src/api directly.",
            },
          ],
        },
      ],
    },
  },
]);