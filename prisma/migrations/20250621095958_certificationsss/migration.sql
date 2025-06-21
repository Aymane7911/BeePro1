-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "batch_ids" TEXT NOT NULL,
    "certification_date" DATE NOT NULL,
    "total_certified" DECIMAL(10,2) NOT NULL,
    "certification_type" TEXT NOT NULL,
    "expiry_date" DATE NOT NULL,
    "total_jars" INTEGER NOT NULL,
    "company_name" TEXT,
    "beekeeper_name" TEXT,
    "location" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certification_verification_code_key" ON "Certification"("verification_code");

-- CreateIndex
CREATE INDEX "Certification_verification_code_idx" ON "Certification"("verification_code");

-- CreateIndex
CREATE INDEX "Certification_user_id_idx" ON "Certification"("user_id");

-- CreateIndex
CREATE INDEX "Certification_expiry_date_idx" ON "Certification"("expiry_date");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "beeusers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
