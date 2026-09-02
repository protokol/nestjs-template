import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateNoteDto {
	@IsString()
	@MaxLength(255)
	public title!: string;

	@IsString()
	@IsOptional()
	public content?: string;
}
