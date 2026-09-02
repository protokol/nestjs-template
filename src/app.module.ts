import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { configuration } from "./configuration/configuration";
import { validateEnvironmentVariables } from "./configuration/environment-variables";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { NotesModule } from "./notes/notes.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			validate: validateEnvironmentVariables,
		}),
		DatabaseModule.forRoot(),
		HealthModule,
		NotesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
