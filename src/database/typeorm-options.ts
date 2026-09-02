import { join } from "node:path";

import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

import type { DatabaseConfiguration } from "../configuration/configuration";

export const typeOrmModuleOptions = (configService: ConfigService): TypeOrmModuleOptions => {
	const database = configService.getOrThrow<DatabaseConfiguration>("database");

	return {
		type: "postgres",
		host: database.host,
		port: database.port,
		username: database.username,
		password: database.password,
		database: database.database,
		ssl: database.ssl,
		synchronize: database.synchronize,
		autoLoadEntities: true,
		migrationsRun: true,
		migrationsTransactionMode: "each",
		migrations: [join(__dirname, "./migrations/*{.ts,.js}")],
	};
};
