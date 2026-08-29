-- CreateTable
CREATE TABLE "beta_invitations" (
    "id" UUID NOT NULL,
    "normalized_email" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beta_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "beta_invitations_normalized_email_key" ON "beta_invitations"("normalized_email");

-- CreateIndex
CREATE INDEX "beta_invitations_revoked_at_idx" ON "beta_invitations"("revoked_at");
