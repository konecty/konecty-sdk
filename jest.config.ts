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

	verbose: true,
};
