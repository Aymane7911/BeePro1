/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `beeusers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "beeusers" ADD COLUMN     "google_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "beeusers_google_id_key" ON "beeusers"("google_id");
