import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
    @Column({length: 200, unique: true})
    email: string
    @Column()
    passwordHash: string
    @Column({default: "user"})
    role: string
    // argon2 hash of the only refresh token that may be used next; null when logged out.
    @Column({type: "varchar", nullable: true})
    refreshTokenHash: string | null
}
