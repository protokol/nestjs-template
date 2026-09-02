import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("notes")
export class Note {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column({ type: "varchar", length: 255 })
	public title!: string;

	@Column({ type: "text", nullable: true })
	public content!: string | null;

	@CreateDateColumn({ name: "created_at" })
	public createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	public updatedAt!: Date;
}
