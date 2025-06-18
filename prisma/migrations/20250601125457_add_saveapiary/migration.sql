-- DropForeignKey
ALTER TABLE "Apiary" DROP CONSTRAINT "Apiary_batchId_fkey";

-- AlterTable
ALTER TABLE "Apiary" ALTER COLUMN "batchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Apiary" ADD CONSTRAINT "Apiary_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
