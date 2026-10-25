import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity.js";

@Entity()
export class Todo {
    @PrimaryGeneratedColumn()
    id: number
    @Column({length: 200})
    title: string
    @Column({default: "TODO"})
    status: string
    @Column({default: false})
    starred: boolean
    // Sort order for drag-and-drop; lower comes first.
    @Column({default: 0})
    position: number
    // Nullable because todos created before auth have no owner; only admins see those.
    @ManyToOne(() => User, {onDelete: "CASCADE"})
    owner: User
    @Column({type: "int", nullable: true})
    ownerId: number | null
}
