import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { Note } from "./note.entity";

@Injectable()
export class NotesService {
	constructor(@InjectRepository(Note) private readonly noteRepository: Repository<Note>) {}

	public async findAll(): Promise<Note[]> {
		return this.noteRepository.find({ order: { createdAt: "DESC" } });
	}

	public async findOne(id: number): Promise<Note> {
		const note = await this.noteRepository.findOne({ where: { id } });

		if (!note) {
			throw new NotFoundException(`Note with id ${id} not found`);
		}

		return note;
	}

	public async create(createNoteDto: CreateNoteDto): Promise<Note> {
		const note = this.noteRepository.create(createNoteDto);

		return this.noteRepository.save(note);
	}

	public async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
		await this.findOne(id);

		await this.noteRepository.update(id, updateNoteDto);

		return this.findOne(id);
	}

	public async delete(id: number): Promise<void> {
		const note = await this.findOne(id);

		await this.noteRepository.delete(note.id);
	}
}
