/*
  Warnings:

  - You are about to alter the column `originOnly` on the `TokenStats` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `qualityOnly` on the `TokenStats` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `bothCertifications` on the `TokenStats` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TokenStats" ALTER COLUMN "originOnly" SET DEFAULT 0,
ALTER COLUMN "originOnly" SET DATA TYPE INTEGER,
ALTER COLUMN "qualityOnly" SET DEFAULT 0,
ALTER COLUMN "qualityOnly" SET DATA TYPE INTEGER,
ALTER COLUMN "bothCertifications" SET DEFAULT 0,
ALTER COLUMN "bothCertifications" SET DATA TYPE INTEGER;
