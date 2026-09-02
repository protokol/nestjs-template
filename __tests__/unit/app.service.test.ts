import { AppService } from "../../src/app.service";

describe("AppService", () => {
	it('should return "Hello Protokol!"', () => {
		expect(new AppService().getHello()).toBe("Hello Protokol!");
	});
});
