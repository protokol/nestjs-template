import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateNoteDto {
	@IsString()
	@MaxLength(255)
	@IsOptional()
	public title?: string;

	@IsString()
	@MaxLength(2000)
	@IsOptional()
	public content?: string;
}
