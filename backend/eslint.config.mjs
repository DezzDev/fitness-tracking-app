import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
	[
		eslint.configs.recommended,
		tseslint.configs.strict,
		tseslint.configs.stylistic,
		{
			files: [ '**/*.ts', '**/*.js' ],
			languageOptions: {
				parser: tseslint.parser,
				parserOptions: {
					project: './tsconfig.json',
				},
			},
			rules: {
				semi: [ "error", "always" ],
			},
			excludes: [ 'dist/**', 'node_modules/**' ],
		},
	]
);
