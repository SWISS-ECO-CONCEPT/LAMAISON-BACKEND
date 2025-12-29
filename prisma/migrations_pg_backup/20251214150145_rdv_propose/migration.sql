/*
  Warnings:

  - Made the column `message` on table `RendezVous` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "RdvStatus" ADD VALUE 'PROPOSE';

-- AlterTable
ALTER TABLE "RendezVous" ADD COLUMN     "proposedDate" TIMESTAMP(3),
ALTER COLUMN "message" SET NOT NULL;
