-- CreateEnum
CREATE TYPE "PlayerLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "sports" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "player_profiles" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "display_name" TEXT,
    "main_sport_code" TEXT,
    "main_sport_level" "PlayerLevel",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

-- Seed MVP sports catalog.
INSERT INTO "sports" ("code", "name", "updated_at")
VALUES
    ('futevolei', 'Futevolei', CURRENT_TIMESTAMP),
    ('beach_tennis', 'Beach tennis', CURRENT_TIMESTAMP),
    ('beach_volleyball', 'Beach volleyball', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "updated_at" = CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_account_id_key" ON "player_profiles"("account_id");

-- CreateIndex
CREATE INDEX "player_profiles_main_sport_code_idx" ON "player_profiles"("main_sport_code");

-- CreateIndex
CREATE INDEX "player_profiles_main_sport_level_idx" ON "player_profiles"("main_sport_level");

-- AddForeignKey
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_main_sport_code_fkey" FOREIGN KEY ("main_sport_code") REFERENCES "sports"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
