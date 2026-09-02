import { configuration } from "../../src/configuration/configuration";
import { EnvironmentVariables, validateEnvironmentVariables } from "../../src/configuration/environment-variables";

const ORIGINAL_ENV = process.env;

describe("configuration", () => {
	beforeEach(() => {
		jest.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});

	afterAll(() => {
		process.env = ORIGINAL_ENV;
	});

	describe("configuration", () => {
		it("should fall back to defaults", () => {
			delete process.env.PORT;
			delete process.env.NODE_ENV;
			delete process.env.CORS_ORIGINS;

			expect(configuration()).toEqual({
				port: 3000,
				nodeEnvironment: "development",
				corsOrigins: [],
			});
		});

		it("should load the provided environment", () => {
			process.env.PORT = "8080";
			process.env.NODE_ENV = "production";
			process.env.CORS_ORIGINS = "https://example.com, https://protokol.com";

			expect(configuration()).toEqual({
				port: 8080,
				nodeEnvironment: "production",
				corsOrigins: ["https://example.com", "https://protokol.com"],
			});
		});
	});

	describe("validateEnvironmentVariables", () => {
		it("should accept a valid configuration", () => {
			const validated = validateEnvironmentVariables({
				PORT: "3000",
				NODE_ENV: "development",
			}) as EnvironmentVariables;

			expect(validated.PORT).toBe(3000);
			expect(validated.NODE_ENV).toBe("development");
		});

		it("should accept an empty configuration", () => {
			expect(() => validateEnvironmentVariables({})).not.toThrow();
		});

		it("should reject a non-numeric port", () => {
			expect(() => validateEnvironmentVariables({ PORT: "not-a-number" })).toThrow();
		});

		it("should reject an out-of-range port", () => {
			expect(() => validateEnvironmentVariables({ PORT: "70000" })).toThrow();
		});

		it("should reject an unknown node environment", () => {
			expect(() => validateEnvironmentVariables({ NODE_ENV: "staging" })).toThrow();
		});
	});
});
