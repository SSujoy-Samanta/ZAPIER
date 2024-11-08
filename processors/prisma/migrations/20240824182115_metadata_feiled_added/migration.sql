-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "metaData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Trigger" ADD COLUMN     "metaData" JSONB NOT NULL DEFAULT '{}';
