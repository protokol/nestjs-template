import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	testMatch: ["<rootDir>/__tests__/unit/**/*.test.ts"],
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	setupFiles: ["reflect-metadata"],
	collectCoverageFrom: ["src/**/*.(t|j)s", "!src/main.ts", "!src/**/*.module.ts"],
	coverageDirectory: "<rootDir>/.coverage",
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 90,
			lines: 90,
			statements: 90,
		},
	},
};

export default config;
