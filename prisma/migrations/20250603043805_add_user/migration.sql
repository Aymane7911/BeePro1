/*
  Warnings:

  - Added the required column `userId` to the `Apiary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Apiary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Apiary" ADD CONSTRAINT "Apiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "beeusers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
