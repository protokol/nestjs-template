import { type DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NodeEnvironment } from "../configuration/environment-variables";
import { MockDatabaseModule } from "./mock-database.module";
import { typeOrmModuleOptions } from "./typeorm-options";

@Module({})
export class DatabaseModule {
	public static forRoot(): DynamicModule {
		if (process.env.NODE_ENV === NodeEnvironment.Test) {
			return MockDatabaseModule.forRoot();
		}

		return TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: typeOrmModuleOptions,
		});
	}
}
