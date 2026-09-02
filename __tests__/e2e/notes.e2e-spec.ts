import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";

import { AppModule } from "../../src/app.module";

describe("NotesController (e2e)", () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
		await app.init();
	});

	afterEach(async () => {
		await app?.close();
	});

	it("/notes (POST + GET)", async () => {
		const created = await request(app.getHttpServer())
			.post("/notes")
			.send({ title: "First note", content: "Body" })
			.expect(201);

		const note = created.body as { id: number; title: string; content: string };

		expect(note.title).toBe("First note");
		expect(note.content).toBe("Body");
		expect(typeof note.id).toBe("number");

		const list = await request(app.getHttpServer()).get("/notes").expect(200);
		const notes = list.body as Array<{ id: number; title: string }>;

		expect(notes).toHaveLength(1);
		expect(notes[0]).toMatchObject({ id: note.id, title: "First note" });
	});

	it("/notes/:id (GET + PATCH)", async () => {
		const created = await request(app.getHttpServer()).post("/notes").send({ title: "First note" }).expect(201);
		const note = created.body as { id: number };

		await request(app.getHttpServer())
			.patch(`/notes/${note.id}`)
			.send({ content: "Updated body" })
			.expect(200)
			.expect((response) => {
				const updated = response.body as { title: string; content: string };
				expect(updated.title).toBe("First note");
				expect(updated.content).toBe("Updated body");
			});

		await request(app.getHttpServer()).get(`/notes/${note.id}`).expect(200);
	});

	it("/notes/:id (GET) should respond 404 for unknown notes", () => {
		return request(app.getHttpServer()).get("/notes/424242").expect(404);
	});

	it("/notes/:id (DELETE)", async () => {
		const created = await request(app.getHttpServer()).post("/notes").send({ title: "First note" }).expect(201);
		const note = created.body as { id: number };

		await request(app.getHttpServer()).delete(`/notes/${note.id}`).expect(204);
		await request(app.getHttpServer()).get(`/notes/${note.id}`).expect(404);
	});

	it("/notes (POST) should reject an invalid payload with 400", () => {
		return request(app.getHttpServer()).post("/notes").send({ content: "no title" }).expect(400);
	});
});
