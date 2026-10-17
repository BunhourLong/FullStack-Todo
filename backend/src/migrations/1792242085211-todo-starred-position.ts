import { MigrationInterface, QueryRunner } from "typeorm";

export class TodoStarredPosition1792242085211 implements MigrationInterface {
    name = 'TodoStarredPosition1792242085211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" ADD "starred" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "todo" ADD "position" integer NOT NULL DEFAULT 0`);
        // Give existing todos distinct positions in their current (id) order.
        await queryRunner.query(`UPDATE "todo" SET "position" = "id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "starred"`);
    }

}
