import type { Config } from "jest";

const config: Config = {
	testEnvironment: "node",
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	testMatch: ["<rootDir>/__tests__/unit/**/*.test.ts"],
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	collectCoverageFrom: ["src/**/*.(t|j)s"],
	coverageDirectory: "<rootDir>/.coverage",
};

export default config;
