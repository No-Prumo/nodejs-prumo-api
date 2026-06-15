-- CreateEnum
CREATE TYPE "AuthRefreshTokenStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

-- CreateTable
CREATE TABLE "auth_refresh_tokens" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "refresh_token_family_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" "AuthRefreshTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "rotated_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "idle_expires_at" TIMESTAMP(3) NOT NULL,
    "absolute_expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_refresh_tokens_token_hash_key" ON "auth_refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_session_id_status_idx" ON "auth_refresh_tokens"("session_id", "status");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_refresh_token_family_id_status_idx" ON "auth_refresh_tokens"("refresh_token_family_id", "status");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_idle_expires_at_idx" ON "auth_refresh_tokens"("idle_expires_at");

-- CreateIndex
CREATE INDEX "auth_refresh_tokens_absolute_expires_at_idx" ON "auth_refresh_tokens"("absolute_expires_at");

-- AddForeignKey
ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "auth_refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill current session tokens so existing local sessions can still refresh
-- after the rotation history table is introduced.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO "auth_refresh_tokens" (
    "id",
    "session_id",
    "refresh_token_family_id",
    "token_hash",
    "status",
    "created_at",
    "last_used_at",
    "revoked_at",
    "idle_expires_at",
    "absolute_expires_at"
)
SELECT
    gen_random_uuid(),
    "id",
    "refresh_token_family_id",
    "refresh_token_hash",
    CASE
        WHEN "status" = 'ACTIVE' AND "revoked_at" IS NULL THEN 'ACTIVE'::"AuthRefreshTokenStatus"
        ELSE 'REVOKED'::"AuthRefreshTokenStatus"
    END,
    "created_at",
    "last_used_at",
    "revoked_at",
    "idle_expires_at",
    "absolute_expires_at"
FROM "auth_sessions"
ON CONFLICT ("token_hash") DO NOTHING;
