module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:prettier/recommended", // Ensures ESLint and Prettier work together
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "react", "prettier", "unused-imports"],
	rules: {
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
			},
		],
		//indent: ["error", "tab"], // Enforce tabs for indentation
		"react/react-in-jsx-scope": "off", // Disable React in scope rule (React 17+)
		"@typescript-eslint/explicit-module-boundary-types": "off", // Adjust TypeScript linting preferences
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"], // Allow mixing tabs and spaces for alignment only
		"unused-imports/no-unused-imports": "warn", // Enable unused imports rule
		// explicit any
		"@typescript-eslint/no-explicit-any": "warn",
	},
};
