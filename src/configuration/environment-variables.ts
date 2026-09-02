import { plainToInstance } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min, validateSync } from "class-validator";

export enum NodeEnvironment {
	Development = "development",
	Production = "production",
	Test = "test",
}

export class EnvironmentVariables {
	@IsInt()
	@Min(1)
	@Max(65535)
	@IsOptional()
	public PORT?: number;

	@IsEnum(NodeEnvironment)
	@IsOptional()
	public NODE_ENV?: NodeEnvironment;

	@IsString()
	@IsOptional()
	public CORS_ORIGINS?: string;

	@IsString()
	@IsOptional()
	public DATABASE_HOST?: string;

	@IsInt()
	@Min(1)
	@Max(65535)
	@IsOptional()
	public DATABASE_PORT?: number;

	@IsString()
	@IsOptional()
	public DATABASE_USERNAME?: string;

	@IsString()
	@IsOptional()
	public DATABASE_PASSWORD?: string;

	@IsString()
	@IsOptional()
	public DATABASE_NAME?: string;

	@IsIn(["true", "false"])
	@IsOptional()
	public DATABASE_SSL?: string;

	@IsIn(["true", "false"])
	@IsOptional()
	public DATABASE_SYNCHRONIZE?: string;
}

export function validateEnvironmentVariables(config: Record<string, unknown>): Record<string, unknown> {
	const validatedConfiguration = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const validationErrors = validateSync(validatedConfiguration, {
		skipMissingProperties: false,
	});

	if (validationErrors.length > 0) {
		throw new Error(`Invalid environment variables: ${validationErrors.toString()}`);
	}

	return validatedConfiguration as Record<string, unknown>;
}
