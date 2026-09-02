import type { ObjectLiteral } from "typeorm";

import { MockRepository } from "../../src/database/mock-repository";

export const createMockRepository = <T extends ObjectLiteral>(initialItems: T[] = []): MockRepository<T> =>
	new MockRepository<T>(initialItems);
