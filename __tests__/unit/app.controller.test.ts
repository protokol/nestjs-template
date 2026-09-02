import { Test, TestingModule } from "@nestjs/testing";

import { AppController } from "../../src/app.controller";
import { AppService } from "../../src/app.service";

describe("AppController", () => {
	let appController: AppController;
	const getHelloMock = jest.fn<() => string>(() => "Hello Protokol!");

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		})
			.overrideProvider(AppService)
			.useValue({ getHello: getHelloMock })
			.compile();

		appController = app.get<AppController>(AppController);
		getHelloMock.mockClear();
	});

	describe("root", () => {
		it('should return "Hello Protokol!"', () => {
			expect(appController.getHello()).toBe("Hello Protokol!");
			expect(getHelloMock).toHaveBeenCalledTimes(1);
		});
	});
});
