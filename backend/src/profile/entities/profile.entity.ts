import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Profile {
    @PrimaryColumn({length: '200'})
    username: string
    @Column({length: '200'})
    displayName: string
    @Column({length: '200'})
    email: string
}
