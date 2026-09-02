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
			delete process.env.DATABASE_HOST;
			delete process.env.DATABASE_PORT;
			delete process.env.DATABASE_USERNAME;
			delete process.env.DATABASE_PASSWORD;
			delete process.env.DATABASE_NAME;
			delete process.env.DATABASE_SSL;
			delete process.env.DATABASE_SYNCHRONIZE;

			expect(configuration()).toEqual({
				port: 3000,
				nodeEnvironment: "development",
				corsOrigins: [],
				database: {
					host: "localhost",
					port: 5432,
					username: "protokol",
					password: "protokol",
					database: "protokol",
					ssl: false,
					synchronize: false,
				},
			});
		});

		it("should load the provided environment", () => {
			process.env.PORT = "8080";
			process.env.NODE_ENV = "production";
			process.env.CORS_ORIGINS = "https://example.com, https://protokol.com";
			process.env.DATABASE_HOST = "db.example.com";
			process.env.DATABASE_PORT = "6543";
			process.env.DATABASE_USERNAME = "app";
			process.env.DATABASE_PASSWORD = "secret";
			process.env.DATABASE_NAME = "app_db";
			process.env.DATABASE_SSL = "true";
			process.env.DATABASE_SYNCHRONIZE = "true";

			expect(configuration()).toEqual({
				port: 8080,
				nodeEnvironment: "production",
				corsOrigins: ["https://example.com", "https://protokol.com"],
				database: {
					host: "db.example.com",
					port: 6543,
					username: "app",
					password: "secret",
					database: "app_db",
					ssl: true,
					synchronize: true,
				},
			});
		});

		it("should accept 1/0 as boolean database flags", () => {
			process.env.DATABASE_SSL = "1";
			process.env.DATABASE_SYNCHRONIZE = "0";

			expect(configuration().database.ssl).toBe(true);
			expect(configuration().database.synchronize).toBe(false);
		});

		it("should fall back to false on empty boolean database flags", () => {
			process.env.DATABASE_SSL = "";
			process.env.DATABASE_SYNCHRONIZE = "";

			expect(configuration().database.ssl).toBe(false);
			expect(configuration().database.synchronize).toBe(false);
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

		it("should reject a non-numeric database port", () => {
			expect(() => validateEnvironmentVariables({ DATABASE_PORT: "not-a-number" })).toThrow();
		});

		it("should reject non-boolean database flags", () => {
			expect(() => validateEnvironmentVariables({ DATABASE_SSL: "maybe" })).toThrow();
			expect(() => validateEnvironmentVariables({ DATABASE_SYNCHRONIZE: "maybe" })).toThrow();
		});
	});
});
