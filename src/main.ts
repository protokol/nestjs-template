import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const logger = new Logger("Bootstrap");

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	const port = configService.get<number>("port");

	if (port === undefined) {
		throw new Error("Application configuration could not be loaded");
	}

	const corsOrigins = configService.get<string[]>("corsOrigins") ?? [];

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.enableCors({
		origin: corsOrigins.length > 0 ? corsOrigins : true,
		credentials: true,
	});

	app.enableShutdownHooks();

	await app.listen(port);

	logger.log(`Application listening on port ${port}`);
}

void bootstrap().catch((error: unknown) => {
	logger.error("Failed to bootstrap the application", error instanceof Error ? error.stack : String(error));
	process.exit(1);
});
