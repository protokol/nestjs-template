import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNoteTable20260902000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "notes",
				columns: [
					{ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
					{ name: "title", type: "varchar", length: "255" },
					{ name: "content", type: "text", isNullable: true },
					{ name: "created_at", type: "timestamp", default: "now()" },
					{ name: "updated_at", type: "timestamp", default: "now()" },
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("notes", true);
	}
}
