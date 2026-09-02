import { NodeEnvironment } from "./environment-variables";

export interface DatabaseConfiguration {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	ssl: boolean;
	synchronize: boolean;
}

export interface ApplicationConfiguration {
	port: number;
	nodeEnvironment: NodeEnvironment;
	corsOrigins: string[];
	database: DatabaseConfiguration;
}

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
	if (value === undefined || value === "") {
		return fallback;
	}

	return value === "true" || value === "1";
};

export const configuration = (): ApplicationConfiguration => {
	const corsOrigins = (process.env.CORS_ORIGINS ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);

	return {
		port: Number.parseInt(process.env.PORT ?? "3000", 10),
		nodeEnvironment: (process.env.NODE_ENV ?? NodeEnvironment.Development) as NodeEnvironment,
		corsOrigins,
		database: {
			host: process.env.DATABASE_HOST ?? "localhost",
			port: Number.parseInt(process.env.DATABASE_PORT ?? "5432", 10),
			username: process.env.DATABASE_USERNAME ?? "protokol",
			password: process.env.DATABASE_PASSWORD ?? "protokol",
			database: process.env.DATABASE_NAME ?? "protokol",
			ssl: toBoolean(process.env.DATABASE_SSL, false),
			synchronize: toBoolean(process.env.DATABASE_SYNCHRONIZE, false),
		},
	};
};
