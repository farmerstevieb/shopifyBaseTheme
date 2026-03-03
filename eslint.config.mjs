import pluginJs from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
    },
  },
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.mjs", "**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
];
