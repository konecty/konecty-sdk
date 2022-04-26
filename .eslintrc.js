module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest', // Allows the use of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
	},
	extends: ['plugin:@typescript-eslint/recommended'], // Uses the linting rules from @typescript-eslint/eslint-plugin
	env: {
		es2020: true,
		node: true,
	},
	plugins: ['@typescript-eslint'],
	rules: {},
};
