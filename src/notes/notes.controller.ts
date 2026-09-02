import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";

import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { Note } from "./note.entity";
import { NotesService } from "./notes.service";

@Controller("notes")
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@Get()
	public getNotes(): Promise<Note[]> {
		return this.notesService.findAll();
	}

	@Get(":id")
	public getNote(@Param("id", ParseIntPipe) id: number): Promise<Note> {
		return this.notesService.findOne(id);
	}

	@Post()
	public createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
		return this.notesService.create(createNoteDto);
	}

	@Patch(":id")
	public updateNote(@Param("id", ParseIntPipe) id: number, @Body() updateNoteDto: UpdateNoteDto): Promise<Note> {
		return this.notesService.update(id, updateNoteDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	public deleteNote(@Param("id", ParseIntPipe) id: number): Promise<void> {
		return this.notesService.delete(id);
	}
}
