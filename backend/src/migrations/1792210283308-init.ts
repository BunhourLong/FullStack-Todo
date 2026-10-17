import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792210283308 implements MigrationInterface {
    name = 'Init1792210283308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile" ("username" character varying(200) NOT NULL, "displayName" character varying(200) NOT NULL, "email" character varying(200) NOT NULL, CONSTRAINT "PK_d80b94dc62f7467403009d88062" PRIMARY KEY ("username"))`);
        await queryRunner.query(`CREATE TABLE "todo" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "status" character varying NOT NULL DEFAULT 'TODO', CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todo"`);
        await queryRunner.query(`DROP TABLE "profile"`);
    }

}
