import { join } from "node:path";

import { config as loadEnvironmentVariables } from "dotenv";
import { DataSource } from "typeorm";

import { configuration } from "../configuration/configuration";

loadEnvironmentVariables();

export default new DataSource({
	type: "postgres",
	...configuration().database,
	entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
	migrations: [join(__dirname, "./migrations/*{.ts,.js}")],
	migrationsRun: false,
	migrationsTransactionMode: "each",
});
