import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { configuration } from "./configuration/configuration";
import { validateEnvironmentVariables } from "./configuration/environment-variables";
import { HealthModule } from "./health/health.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			validate: validateEnvironmentVariables,
		}),
		HealthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
