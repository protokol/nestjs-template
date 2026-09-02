import { getDataSourceToken, getEntityManagerToken } from "@nestjs/typeorm";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { MockDataSource } from "../../src/database/mock-data-source";
import { MockDatabaseModule } from "../../src/database/mock-database.module";
import { MockRepository } from "../../src/database/mock-repository";
import { Note } from "../../src/notes/note.entity";

class Sample {
	public id?: number;
	public title?: string;
	public createdAt?: Date;
	public author?: { id?: number };
}

@Entity()
class Tagged {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column({ type: "varchar", length: 10, default: "draft" })
	public status!: string;

	@Column({ type: "int", default: 0 })
	public views!: number;

	@Column({ type: "boolean", default: false })
	public archived!: boolean;

	@Column({ type: "int", nullable: true })
	public ranking!: number | null;

	@CreateDateColumn()
	public createdAt!: Date;

	@UpdateDateColumn()
	public updatedAt!: Date;
}

describe("MockRepository", () => {
	let repository: MockRepository<Sample>;

	beforeEach(() => {
		repository = new MockRepository<Sample>();
	});

	describe("create", () => {
		it("should return a shallow copy without persisting", () => {
			const entity = repository.create({ title: "First" });

			expect(entity.title).toBe("First");
			expect(repository.items).toHaveLength(0);
		});
	});

	describe("insert", () => {
		it("should persist a single entity and report identifiers", async () => {
			const result = await repository.insert({ title: "First" });

			expect(result.identifiers).toEqual([{ id: 1 }]);
			expect(repository.items[0]?.title).toBe("First");
		});

		it("should persist multiple entities", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			expect(repository.items.map((item) => item.id)).toEqual([1, 2]);
		});
	});

	describe("save", () => {
		it("should assign incremental ids to new entities", async () => {
			const saved = await repository.save({ title: "First" });

			expect(saved.id).toBe(1);
		});

		it("should update an existing entity instead of duplicating it", async () => {
			const first = await repository.save({ title: "First" });

			await repository.save({ id: first.id, title: "Changed" });

			expect(repository.items).toHaveLength(1);
			expect(repository.items[0]?.title).toBe("Changed");
		});

		it("should consider preseeded items as updatable", async () => {
			const seeded = new MockRepository<Sample>([{ id: 5, title: "Original" }]);
			await seeded.save({ id: 5, title: "Changed" });

			expect(seeded.items).toHaveLength(1);
			expect(seeded.items[0]?.title).toBe("Changed");
		});

		it("should continue the id sequence of preseeded items", async () => {
			const seeded = new MockRepository<Sample>([{ id: 5, title: "Original" }]);
			await seeded.save({ title: "New" });

			const last = seeded.items.at(-1);

			expect(last?.id).toBe(6);
		});
	});

	describe("find", () => {
		it("should return all entities by default", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			expect(await repository.find()).toHaveLength(2);
		});

		it("should filter by where clauses", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const items = await repository.find({ where: { title: "Second" } });

			expect(items.map((item) => item.id)).toEqual([2]);
		});

		it("should order by a column", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const items = await repository.find({ order: { id: "DESC" } });

			expect(items.map((item) => item.id)).toEqual([2, 1]);
		});

		it("should paginate with skip and take", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

			const page = await repository.find({ skip: 1, take: 1 });

			expect(page.map((item) => item.title)).toEqual(["Second"]);
		});
	});

	describe("findBy", () => {
		it("should match any of the given where clauses", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

			const items = await repository.findBy([{ title: "First" }, { title: "Third" }]);

			expect(items.map((item) => item.id)).toEqual([1, 3]);
		});
	});

	describe("findOne", () => {
		it("should return the first matching entity", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const item = await repository.findOne({ where: { title: "Second" } });

			expect(item?.title).toBe("Second");
		});

		it("should return the first entity without a where clause", async () => {
			await repository.insert([{ title: "First" }]);

			const item = await repository.findOne({});

			expect(item?.title).toBe("First");
		});
	});

	describe("findOneBy", () => {
		it("should return null when nothing matches", async () => {
			expect(await repository.findOneBy({ title: "Missing" })).toBeNull();
		});
	});

	describe("findOneById", () => {
		it("should resolve string ids as numbers", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const item = await repository.findOneById("2");

			expect(item?.title).toBe("Second");
		});
	});

	describe("count", () => {
		it("should count all stored entities", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			expect(await repository.count()).toBe(2);
		});

		it("should count filtered entities", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			expect(await repository.count({ where: { title: "Second" } })).toBe(1);
		});
	});

	describe("update", () => {
		it("should merge fields into the matching entities", async () => {
			await repository.insert([{ title: "First" }]);

			const result = await repository.update(1, { title: "Changed" });

			expect(result.affected).toBe(1);
			expect(repository.items[0]?.title).toBe("Changed");
		});

		it("should report no affected rows for unknown criteria", async () => {
			await repository.insert([{ title: "First" }]);

			const result = await repository.update(1234, { title: "Changed" });

			expect(result.affected).toBe(0);
		});

		it("should support multiple criteria", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const result = await repository.update([1, 2], { title: "Changed" });

			expect(result.affected).toBe(2);
		});
	});

	describe("delete", () => {
		it("should remove matching entities", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const result = await repository.delete(1);

			expect(result.affected).toBe(1);
			expect(repository.items.map((item) => item.id)).toEqual([2]);
		});

		it("should remove entities matching a where clause", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			await repository.delete({ title: "Second" });

			expect(repository.items.map((item) => item.id)).toEqual([1]);
		});
	});

	describe("reset", () => {
		it("should wipe all stored entities", async () => {
			await repository.insert([{ title: "First" }]);

			repository.reset();

			await repository.insert([{ title: "Second" }]);
			const before = await repository.find();
			expect(before[0]?.id).toBe(1);
		});
	});

	describe("create without arguments", () => {
		it("should return an empty object for classes without entity metadata", () => {
			expect(repository.create()).toEqual({});
		});
	});

	describe("create from an array", () => {
		it("should map every entry", () => {
			const entities = repository.create([{ title: "First" }, { title: "Second" }]);

			expect(entities.map((entity) => entity.title)).toEqual(["First", "Second"]);
			expect(repository.items).toHaveLength(0);
		});
	});

	describe("save from an array", () => {
		it("should persist every entry", async () => {
			const saved = await repository.save([{ title: "First" }, { title: "Second" }]);

			expect(saved.map((entity) => entity.id)).toEqual([1, 2]);
		});
	});

	describe("update with object criteria", () => {
		it("should merge into entities matching a single where clause", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const result = await repository.update({ title: "Second" }, { title: "Changed" });

			expect(result.affected).toBe(1);
			expect(repository.items.at(-1)?.title).toBe("Changed");
		});

		it("should merge into entities matching any of the given where clauses", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

			const result = await repository.update([{ title: "First" }, { title: "Third" }], { title: "Changed" });

			expect(result.affected).toBe(2);
		});

		it("should report no affected rows without criteria", async () => {
			await repository.insert([{ title: "First" }]);

			const result = await repository.update(undefined as never, { title: "Changed" });

			expect(result.affected).toBe(0);
		});
	});

	describe("find with date criteria", () => {
		it("should compare date values with strict equality", async () => {
			const date = new Date("2026-01-01T00:00:00.000Z");
			await repository.insert([{ title: "First", createdAt: date }, { title: "Second" }]);

			const items = await repository.find({ where: { createdAt: date } });

			expect(items.map((item) => item.title)).toEqual(["First"]);
		});
	});

	describe("find with nested criteria", () => {
		it("should compare nested object values", async () => {
			await repository.insert([
				{ title: "First", author: { id: 1 } },
				{ title: "Second", author: { id: 2 } },
			]);

			const items = await repository.find({ where: { author: { id: 1 } } });

			expect(items.map((item) => item.title)).toEqual(["First"]);
		});

		it("should reject entities without the nested relation", async () => {
			await repository.insert([{ title: "First" }]);

			const items = await repository.find({ where: { author: { id: 1 } } });

			expect(items).toHaveLength(0);
		});
	});

	describe("find with partial pagination", () => {
		it("should apply skip only", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const items = await repository.find({ skip: 1 });

			expect(items.map((item) => item.title)).toEqual(["Second"]);
		});

		it("should apply take from the beginning without skip", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const items = await repository.find({ take: 1 });

			expect(items.map((item) => item.title)).toEqual(["First"]);
		});
	});

	describe("delete with criteria variants", () => {
		it("should delete entities matching an id array", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }, { title: "Third" }]);

			const result = await repository.delete([1, 3]);

			expect(result.affected).toBe(2);
			expect(repository.items.map((item) => item.title)).toEqual(["Second"]);
		});

		it("should delete entities matching a where object", async () => {
			await repository.insert([{ title: "First" }, { title: "Second" }]);

			const result = await repository.delete({ title: "Second" });

			expect(result.affected).toBe(1);
		});

		it("should report no affected rows without criteria", async () => {
			await repository.insert([{ title: "First" }]);

			const result = await repository.delete(undefined as never);

			expect(result.affected).toBe(0);
		});
	});
});

describe("MockRepository with entity metadata", () => {
	it("should materialize default column values on create", () => {
		const repository = new MockDataSource().getRepository(Tagged);

		const entity = repository.create({ views: 3, archived: true });

		expect(entity.id).toBeUndefined();
		expect(entity.status).toBeUndefined();
		expect(entity.views).toBe(3);
		expect(entity.archived).toBe(true);
		expect(entity.ranking).toBeNull();
		expect(entity.createdAt).toBeInstanceOf(Date);
		expect(entity.updatedAt).toBeInstanceOf(Date);
		expect(repository.items).toHaveLength(0);
	});

	it("should keep explicit values over defaults", () => {
		const repository = new MockDataSource().getRepository(Tagged);

		const fixture = new Date("2026-01-01T00:00:00.000Z");
		const entity = repository.create({ ranking: 9, createdAt: fixture, updatedAt: fixture });

		expect(entity.ranking).toBe(9);
		expect(entity.createdAt).toEqual(fixture);
		expect(entity.updatedAt).toEqual(fixture);
	});

	it("should materialize defaults on insert", async () => {
		const repository = new MockDataSource().getRepository(Tagged);

		await repository.insert({});

		const [item] = repository.items;
		expect(item?.views).toBe(0);
		expect(item?.archived).toBe(false);
		expect(item?.ranking).toBeNull();
	});

	it("should not materialize anything for classes without entity metadata", () => {
		const repository = new MockRepository<Sample>();

		expect(repository.create({ title: "First" })).toEqual({ title: "First" });
	});
});

describe("MockDataSource", () => {
	it("should share a repository instance per entity", () => {
		const dataSource = new MockDataSource();

		const repository = dataSource.getRepository(Sample);
		const repositoryAgain = dataSource.getRepository(Sample);

		expect(repositoryAgain).toBe(repository);
		expect(dataSource.getRepository(Note)).not.toBe(repository);
	});

	it("should expose a manager that resolves repositories", () => {
		const dataSource = new MockDataSource();

		const fromManager = dataSource.manager.getRepository(Sample);

		expect(fromManager).toBe(dataSource.getRepository(Sample));
	});

	it("should look initialized and target postgres", () => {
		const dataSource = new MockDataSource();

		expect(dataSource.isInitialized).toBe(true);
		expect(dataSource.options.type).toBe("postgres");
		expect(dataSource.entityMetadatas).toEqual([]);
	});
});

describe("MockDatabaseModule", () => {
	it("should provide the data source under the real TypeORM tokens", () => {
		const dynamicModule = MockDatabaseModule.forRoot();

		const provides = (dynamicModule.exports ?? []).map((provider) => (provider as { provide?: unknown }).provide);

		expect(dynamicModule.module).toBe(MockDatabaseModule);
		expect(dynamicModule.global).toBe(true);
		expect(provides).toContain(getDataSourceToken());
		expect(provides).toContain(getEntityManagerToken());
	});
});
