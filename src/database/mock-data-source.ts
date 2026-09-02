import type { EntityManager, EntityMetadata, ObjectLiteral } from "typeorm";
import type { EntitySchema } from "typeorm";

import { MockRepository } from "./mock-repository";

type EntityTarget<T extends ObjectLiteral> = (new (...args: never[]) => T) | EntitySchema<T>;

export class MockDataSource {
	public readonly options = { type: "postgres" } as const;

	public readonly entityMetadatas: EntityMetadata[] = [];

	private readonly repositories = new Map<unknown, MockRepository<ObjectLiteral>>();

	public get isInitialized(): boolean {
		return true;
	}

	public get manager(): EntityManager {
		return {
			getRepository: (entity: EntityTarget<ObjectLiteral>) => this.getRepository(entity),
		} as unknown as EntityManager;
	}

	public getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): MockRepository<T> {
		const existing = this.repositories.get(entity);

		if (existing !== undefined) {
			return existing as MockRepository<T>;
		}

		const repository = new MockRepository<T>([], entity);
		this.repositories.set(entity, repository as MockRepository<ObjectLiteral>);

		return repository;
	}
}
