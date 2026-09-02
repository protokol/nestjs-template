import type { ConfigService } from "@nestjs/config";

import { typeOrmModuleOptions } from "../../src/database/typeorm-options";

describe("typeOrmModuleOptions", () => {
	it("should map database configuration", () => {
		const configService = {
			getOrThrow: jest.fn().mockReturnValue({
				host: "db.example.com",
				port: 6543,
				username: "app",
				password: "secret",
				database: "app_db",
				ssl: true,
				synchronize: true,
			}),
		} as unknown as ConfigService;

		const options = typeOrmModuleOptions(configService);

		expect(options).toMatchObject({
			type: "postgres",
			host: "db.example.com",
			port: 6543,
			username: "app",
			password: "secret",
			database: "app_db",
			ssl: true,
			synchronize: true,
			autoLoadEntities: true,
			migrationsRun: true,
		});
	});

	it("should point at compiled migrations", () => {
		const configService = {
			getOrThrow: jest.fn().mockReturnValue({}),
		} as unknown as ConfigService;

		const options = typeOrmModuleOptions(configService);

		expect(options.migrations).toHaveLength(1);
		expect(options.migrationsTransactionMode).toBe("each");
	});

	it("should throw when the database configuration is missing", () => {
		const configService = {
			getOrThrow: jest.fn().mockImplementation(() => {
				throw new Error("missing configuration");
			}),
		} as unknown as ConfigService;

		expect(() => typeOrmModuleOptions(configService)).toThrow();
	});
});
