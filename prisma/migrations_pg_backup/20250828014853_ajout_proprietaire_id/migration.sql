/*
  Warnings:

  - Added the required column `proprietaireId` to the `Annonce` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RdvStatus" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'ANNULE');

-- AlterTable
ALTER TABLE "Annonce" ADD COLUMN     "proprietaireId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "RdvStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prospectId" INTEGER NOT NULL,
    "annonceId" INTEGER NOT NULL,

    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
