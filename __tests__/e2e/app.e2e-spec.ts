import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";

import { AppModule } from "../../src/app.module";

describe("AppController (e2e)", () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app?.close();
	});

	it("/ (GET)", () => {
		return request(app.getHttpServer()).get("/").expect(200).expect("Hello Protokol!");
	});

	it("/health (GET)", async () => {
		const response = await request(app.getHttpServer()).get("/health").expect(200);
		const health = response.body as { status: string; uptime: number };

		expect(health.status).toBe("ok");
		expect(health.uptime).toBeGreaterThanOrEqual(0);
	});
});
