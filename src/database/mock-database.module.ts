import { type DynamicModule, Module, type Provider } from "@nestjs/common";
import { getDataSourceToken, getEntityManagerToken } from "@nestjs/typeorm";

import { MockDataSource } from "./mock-data-source";

@Module({})
export class MockDatabaseModule {
	public static forRoot(): DynamicModule {
		const mockDataSource = new MockDataSource();

		const providers: Provider[] = [
			{ provide: getDataSourceToken(), useValue: mockDataSource },
			{ provide: getEntityManagerToken(), useValue: mockDataSource.manager },
		];

		return {
			module: MockDatabaseModule,
			global: true,
			providers,
			exports: providers,
		};
	}
}
