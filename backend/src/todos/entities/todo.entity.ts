import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
