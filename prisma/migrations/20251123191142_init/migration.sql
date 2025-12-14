/*
  Warnings:

  - Added the required column `email` to the `RendezVous` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `RendezVous` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `RendezVous` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `RendezVous` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone` to the `RendezVous` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RendezVous" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL,
ADD COLUMN     "telephone" TEXT NOT NULL;
