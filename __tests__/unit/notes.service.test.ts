import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { Note } from "../../src/notes/note.entity";
import { NotesService } from "../../src/notes/notes.service";
import { createMockRepository } from "../mocks/repository.mock";

describe("NotesService", () => {
	let notesService: NotesService;
	let noteRepository: ReturnType<typeof createMockRepository<Note>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [NotesService, { provide: getRepositoryToken(Note), useValue: createMockRepository<Note>() }],
		}).compile();

		notesService = module.get<NotesService>(NotesService);
		noteRepository = module.get(getRepositoryToken(Note));
	});

	describe("findAll", () => {
		it("should return every stored note", async () => {
			await notesService.create({ title: "First" });
			await notesService.create({ title: "Second" });

			const notes = await notesService.findAll();

			expect(notes).toHaveLength(2);
			expect(notes.map((note) => note.title)).toEqual(["First", "Second"]);
		});
	});

	describe("findOne", () => {
		it("should return the note with the given id", async () => {
			const created = await notesService.create({ title: "First" });

			const note = await notesService.findOne(created.id);

			expect(note.title).toBe("First");
		});

		it("should throw when the note does not exist", async () => {
			await expect(notesService.findOne(1234)).rejects.toThrow(NotFoundException);
		});
	});

	describe("create", () => {
		it("should persist the note and assign an id", async () => {
			const note = await notesService.create({ title: "First", content: "Body" });

			expect(note.id).toBe(1);
			expect(note.title).toBe("First");
			expect(note.content).toBe("Body");
			expect(noteRepository.items).toHaveLength(1);
		});
	});

	describe("update", () => {
		it("should merge the given fields on the note", async () => {
			const created = await notesService.create({ title: "First", content: "Body" });

			const note = await notesService.update(created.id, { title: "Changed" });

			expect(note.title).toBe("Changed");
			expect(note.content).toBe("Body");
		});

		it("should throw when the note does not exist", async () => {
			await expect(notesService.update(1234, { title: "Changed" })).rejects.toThrow(NotFoundException);
		});
	});

	describe("delete", () => {
		it("should remove the note", async () => {
			const created = await notesService.create({ title: "First" });

			await notesService.delete(created.id);

			expect(noteRepository.items).toHaveLength(0);
		});

		it("should throw when the note does not exist", async () => {
			await expect(notesService.delete(1234)).rejects.toThrow(NotFoundException);
		});
	});
});
