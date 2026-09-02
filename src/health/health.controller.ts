import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
	status: "ok";
	uptime: number;
}

@Controller("health")
export class HealthController {
	@Get()
	public getHealth(): HealthResponse {
		return { status: "ok", uptime: process.uptime() };
	}
}
