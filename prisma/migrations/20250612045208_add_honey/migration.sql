-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "honeyCertified" DROP NOT NULL,
ALTER COLUMN "honeyCertified" DROP DEFAULT,
ALTER COLUMN "honeyRemaining" DROP NOT NULL,
ALTER COLUMN "honeyRemaining" DROP DEFAULT,
ALTER COLUMN "totalHoneyCollected" DROP NOT NULL,
ALTER COLUMN "totalHoneyCollected" DROP DEFAULT;
