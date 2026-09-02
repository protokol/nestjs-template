// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import jest from "eslint-plugin-jest";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig(
	globalIgnores(["dist/", "coverage/", ".coverage/"]),
	{
		files: ["**/*.ts"],
		extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"prefer-const": ["error", { destructuring: "all" }],
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
		},
	},
	{
		files: ["__tests__/**/*.ts"],
		extends: [jest.configs["flat/recommended"]],
		rules: {
			"jest/expect-expect": "off",
		},
	},
	eslintConfigPrettier,
);
