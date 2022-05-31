export default {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	// globalSetup: '<rootDir>/src/test/globalSetup.ts',
	// globalTeardown: '<rootDir>/src/test/globalTeardown.ts',

	testEnvironment: 'jest-environment-node',

	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},

	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json',
			diagnostics: true,
		},
	},

	moduleNameMapper: {
		'@konecty/sdk/(.*)': '<rootDir>/src/sdk/$1',
	},

	verbose: true,
};
