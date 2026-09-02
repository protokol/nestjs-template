import {
	type DeepPartial,
	DeleteResult,
	type EntitySchema,
	type FindManyOptions,
	type FindOneOptions,
	type FindOptionsOrder,
	type FindOptionsWhere,
	getMetadataArgsStorage,
	InsertResult,
	type ObjectId,
	type ObjectLiteral,
	type QueryDeepPartialEntity,
	Repository,
	type SaveOptions,
	UpdateResult,
} from "typeorm";

type MockEntityTarget<T extends ObjectLiteral> = (new (...args: never[]) => T) | EntitySchema<T>;

interface MockColumnDescriptor {
	propertyName: string;
	mode: string;
	options?: { default?: unknown; nullable?: boolean };
}

export class MockRepository<T extends ObjectLiteral> extends Repository<T> {
	public readonly items: T[];

	private currentId = 0;

	public constructor(
		initialItems: T[] = [],
		private readonly entityClass?: MockEntityTarget<T>,
	) {
		super(undefined as never, undefined as never);
		this.items = [...initialItems];
		this.currentId = this.items.reduce((max, item) => Math.max(max, this.itemId(item) ?? 0), 0);
	}

	public reset(): void {
		this.items.length = 0;
		this.currentId = 0;
	}

	public override create(): T;
	public override create(entityLikeArray: DeepPartial<T>[]): T[];
	public override create(entityLike: DeepPartial<T>): T;
	public override create(entityLike?: DeepPartial<T> | DeepPartial<T>[]): T | T[] {
		if (entityLike === undefined) {
			return this.materialize({} as DeepPartial<T>) as T;
		}

		if (Array.isArray(entityLike)) {
			return entityLike.map((entity: DeepPartial<T>) => this.materialize(this.clone(entity))) as T[];
		}

		return this.materialize(this.clone(entityLike)) as T;
	}

	public override insert(entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[]): Promise<InsertResult> {
		const entities = Array.isArray(entity) ? entity : [entity];
		const saved = entities.map((item) => this.persistEntity(item as unknown as DeepPartial<T>));

		const result = new InsertResult();
		result.identifiers = saved.map((item) => ({ id: this.itemId(item) }));
		result.generatedMaps = [];
		result.raw = [];

		return Promise.resolve(result);
	}

	public override save<U extends DeepPartial<T>>(
		entities: U[],
		options: SaveOptions & { reload: false },
	): Promise<U[]>;
	public override save<U extends DeepPartial<T>>(entities: U[], options?: SaveOptions): Promise<(U & T)[]>;
	public override save<U extends DeepPartial<T>>(entity: U, options: SaveOptions & { reload: false }): Promise<U>;
	public override save<U extends DeepPartial<T>>(entity: U, options?: SaveOptions): Promise<U & T>;
	public override save<U extends DeepPartial<T>>(entityOrEntities: U | U[]): Promise<U | (U & T)[]> {
		if (Array.isArray(entityOrEntities)) {
			return Promise.resolve(entityOrEntities.map((entity: U) => this.persistEntity<U>(entity)));
		}

		return Promise.resolve(this.persistEntity<U>(entityOrEntities));
	}
	public override count(options?: FindManyOptions<T>): Promise<number> {
		return Promise.resolve(this.filter(options?.where).length);
	}

	public override find(options?: FindManyOptions<T>): Promise<T[]> {
		const filtered = this.filter(options?.where);
		const ordered = this.order(filtered, options?.order);

		return Promise.resolve(this.paginate(ordered, options));
	}

	public override findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
		return Promise.resolve(this.filter(where));
	}

	public override findOne(options: FindOneOptions<T>): Promise<T | null> {
		return this.findOneBy(options.where ?? {});
	}

	public override findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
		const [first] = this.filter(where);

		return Promise.resolve(first ?? null);
	}

	public override findOneById(id: number | string | Date | ObjectId): Promise<T | null> {
		return this.findOneBy({ id: Number(id) } as unknown as FindOptionsWhere<T>);
	}

	public override update(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>
			| FindOptionsWhere<T>[],
		partialEntity: QueryDeepPartialEntity<T>,
	): Promise<UpdateResult> {
		const matched = this.union(this.resolveCriteria(criteria).map((where) => this.filter(where)));

		matched.forEach((item) => this.mergeInto(item, partialEntity));

		const result = new UpdateResult();
		result.raw = [];
		result.affected = matched.length;

		return Promise.resolve(result);
	}

	public override delete(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>
			| FindOptionsWhere<T>[],
	): Promise<DeleteResult> {
		const matched = this.union(this.resolveCriteria(criteria).map((where) => this.filter(where)));

		for (const item of matched) {
			this.items.splice(this.items.indexOf(item), 1);
		}

		const result = new DeleteResult();
		result.raw = [];
		result.affected = matched.length;

		return Promise.resolve(result);
	}

	private union(groups: T[][]): T[] {
		const merged: T[] = [];

		groups.forEach((group) =>
			group.forEach((item) => {
				if (!merged.includes(item)) {
					merged.push(item);
				}
			}),
		);

		return merged;
	}

	private clone(entity: DeepPartial<T>): T {
		return { ...entity } as T;
	}

	private mergeInto(target: T, source: unknown): void {
		Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
			if (value !== undefined) {
				(target as Record<string, unknown>)[key] = value;
			}
		});
	}

	private materialize(entity: DeepPartial<T>): DeepPartial<T> {
		const materialized: Record<string, unknown> = { ...entity };

		this.columnMetadata().forEach((column) => {
			const key = column.propertyName;

			if (materialized[key] !== undefined) {
				return;
			}

			if (column.mode === "createDate" || column.mode === "updateDate") {
				materialized[key] = new Date();

				return;
			}

			const defaultValue = column.options?.default;

			if (typeof defaultValue === "number" || typeof defaultValue === "boolean") {
				materialized[key] = defaultValue;

				return;
			}

			if (defaultValue === undefined && column.options?.nullable) {
				materialized[key] = null;
			}
		});

		return materialized as DeepPartial<T>;
	}

	private columnMetadata(): MockColumnDescriptor[] {
		return this.entityClass === undefined
			? []
			: getMetadataArgsStorage().columns.filter((column) => column.target === this.entityClass);
	}

	private persistEntity<U extends DeepPartial<T>>(entity: U): U & T {
		const id = this.itemId(entity);

		if (id !== undefined) {
			const existing = this.items.find((item) => this.itemId(item) === id);

			if (existing !== undefined) {
				this.mergeInto(existing, entity);

				return existing as U & T;
			}
		}

		const saved = this.materialize({ id: ++this.currentId, ...entity }) as U & T;
		this.items.push(saved);

		return saved;
	}

	private itemId(item: unknown): number | undefined {
		const id = (item as { id?: unknown }).id;

		return typeof id === "number" ? id : undefined;
	}

	private filter(where?: FindOptionsWhere<T> | FindOptionsWhere<T>[]): T[] {
		if (where === undefined) {
			return [...this.items];
		}

		const groups = Array.isArray(where) ? where : [where];

		return this.items.filter((item) => groups.some((group) => this.matches(item, group)));
	}

	private matches(item: T, where: FindOptionsWhere<T>): boolean {
		return Object.entries(where).every(([key, value]) => {
			if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
				const nestedValue = (item as Record<string, unknown>)[key];

				return nestedValue !== undefined && this.matches(nestedValue as T, value as FindOptionsWhere<T>);
			}

			return (item as Record<string, unknown>)[key] === value;
		});
	}

	private order(items: T[], order?: FindOptionsOrder<T>): T[] {
		const entries = Object.entries(order ?? {});

		if (entries.length === 0) {
			return [...items];
		}

		return [...items].sort((first, second) => {
			for (const [key, direction] of entries) {
				const firstValue = (first as Record<string, unknown>)[key] as number | string | Date;
				const secondValue = (second as Record<string, unknown>)[key] as number | string | Date;
				const comparison = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

				if (comparison !== 0) {
					return direction === "DESC" ? -comparison : comparison;
				}
			}

			return 0;
		});
	}

	private paginate(items: T[], options?: FindManyOptions<T>): T[] {
		const skip = options?.skip;
		const take = options?.take;

		if (take === undefined && skip === undefined) {
			return items;
		}

		return items.slice(skip ?? 0, take === undefined ? undefined : (skip ?? 0) + take);
	}

	private resolveCriteria(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>
			| FindOptionsWhere<T>[],
	): FindOptionsWhere<T>[] {
		if (criteria === null || criteria === undefined) {
			return [];
		}

		if (typeof criteria === "object" && !Array.isArray(criteria)) {
			return [criteria as FindOptionsWhere<T>];
		}

		if (Array.isArray(criteria)) {
			const includesObjects = criteria.some((item) => item !== null && typeof item === "object");

			if (includesObjects) {
				return criteria as FindOptionsWhere<T>[];
			}

			return criteria.map((value) => ({ id: Number(value) }) as unknown as FindOptionsWhere<T>);
		}

		return [{ id: Number(criteria) } as unknown as FindOptionsWhere<T>];
	}
}
