import { Test, TestingModule } from "@nestjs/testing";

import { Note } from "../../src/notes/note.entity";
import { NotesController } from "../../src/notes/notes.controller";
import { NotesService } from "../../src/notes/notes.service";

describe("NotesController", () => {
	let notesController: NotesController;

	const note: Note = { id: 1, title: "First", content: "Body", createdAt: new Date(), updatedAt: new Date() };

	const findAllMock = jest.fn<Promise<Note[]>, []>(() => Promise.resolve([note]));
	const findOneMock = jest.fn<Promise<Note>, [number]>(() => Promise.resolve(note));
	const createMock = jest.fn<Promise<Note>, [object]>((dto) => Promise.resolve({ ...note, ...dto }));
	const updateMock = jest.fn<Promise<Note>, [number, object]>((id, dto) => Promise.resolve({ ...note, ...dto, id }));
	const deleteMock = jest.fn<Promise<void>, [number]>(() => Promise.resolve());

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [NotesController],
			providers: [
				{
					provide: NotesService,
					useValue: {
						findAll: findAllMock,
						findOne: findOneMock,
						create: createMock,
						update: updateMock,
						delete: deleteMock,
					},
				},
			],
		}).compile();

		notesController = module.get<NotesController>(NotesController);

		[findAllMock, findOneMock, createMock, updateMock, deleteMock].forEach((mock) => mock.mockClear());
	});

	it("should return all notes", async () => {
		expect(await notesController.getNotes()).toEqual([note]);
		expect(findAllMock).toHaveBeenCalledTimes(1);
	});

	it("should return a single note by id", async () => {
		expect(await notesController.getNote(1)).toEqual(note);
		expect(findOneMock).toHaveBeenCalledWith(1);
	});

	it("should create a note", async () => {
		const dto = { title: "First", content: "Body" };

		expect(await notesController.createNote(dto)).toEqual(note);
		expect(createMock).toHaveBeenCalledWith(dto);
	});

	it("should update a note", async () => {
		const dto = { title: "Changed" };

		expect(await notesController.updateNote(1, dto)).toEqual({ ...note, ...dto });
		expect(updateMock).toHaveBeenCalledWith(1, dto);
	});

	it("should delete a note", async () => {
		await notesController.deleteNote(1);

		expect(deleteMock).toHaveBeenCalledWith(1);
	});
});
