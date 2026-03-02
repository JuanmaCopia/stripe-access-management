import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const appImportBoundaries = [
  "@stripe-access-management/web",
  "@stripe-access-management/worker"
];

export default [
  {
    ignores: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": appImportBoundaries
        }
      ]
    }
  },
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            "@stripe-access-management/database",
            "@stripe-access-management/infrastructure",
            "@stripe-access-management/testing",
            "@stripe-access-management/web",
            "@stripe-access-management/worker"
          ]
        }
      ]
    }
  },
  {
    files: [
      "apps/**/*.{ts,tsx}",
      "packages/core/**/*.{ts,tsx}",
      "packages/infrastructure/**/*.{ts,tsx}",
      "packages/testing/**/*.{ts,tsx}"
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "paths": ["@prisma/client"]
        }
      ]
    }
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": ["@stripe-access-management/worker"]
        }
      ]
    }
  },
  {
    files: ["apps/worker/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": ["@stripe-access-management/web"]
        }
      ]
    }
  }
];
