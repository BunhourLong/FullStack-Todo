import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersTodoOwner1792899433926 implements MigrationInterface {
    name = 'UsersTodoOwner1792899433926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying(200) NOT NULL, "passwordHash" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "refreshTokenHash" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "todo" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "todo" ADD CONSTRAINT "FK_05552e862619dc4ad7ec8fc9cb8" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" DROP CONSTRAINT "FK_05552e862619dc4ad7ec8fc9cb8"`);
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "ownerId"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
