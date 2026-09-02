import { NodeEnvironment } from "./environment-variables";

export interface ApplicationConfiguration {
	port: number;
	nodeEnvironment: NodeEnvironment;
	corsOrigins: string[];
}

export const configuration = (): ApplicationConfiguration => {
	const corsOrigins = (process.env.CORS_ORIGINS ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);

	return {
		port: Number.parseInt(process.env.PORT ?? "3000", 10),
		nodeEnvironment: (process.env.NODE_ENV ?? NodeEnvironment.Development) as NodeEnvironment,
		corsOrigins,
	};
};
