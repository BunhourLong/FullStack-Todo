import { MigrationInterface, QueryRunner } from "typeorm";

// The app has a single profile; GET /profile returns it, PATCH /profile/:username edits it.
export class SeedProfile1792240781859 implements MigrationInterface {
    name = 'SeedProfile1792240781859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "profile" ("username", "displayName", "email") VALUES ('guest', 'Guest', 'guest@example.com')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "profile" WHERE "username" = 'guest'`);
    }

}
