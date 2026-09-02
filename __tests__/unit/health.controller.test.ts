import { HealthController } from "../../src/health/health.controller";

describe("HealthController", () => {
	it("should report healthy with uptime", () => {
		const response = new HealthController().getHealth();

		expect(response.status).toBe("ok");
		expect(response.uptime).toBeGreaterThanOrEqual(0);
	});
});
