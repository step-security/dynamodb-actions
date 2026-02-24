import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // equivalent to tslint semicolon: [true, "always"]
      semi: ["error", "always"],
      // equivalent to tslint trailing-comma
      "comma-dangle": ["error", {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "always-multiline",
      }],
      // equivalent to tslint arrow-parens
      "arrow-parens": ["error", "always"],
      // equivalent to tslint ordered-imports
      "sort-imports": ["error", {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      }],
      // equivalent to tslint no-console (from tslint:disable-line usage)
      "no-console": "warn",
    },
  },
];
