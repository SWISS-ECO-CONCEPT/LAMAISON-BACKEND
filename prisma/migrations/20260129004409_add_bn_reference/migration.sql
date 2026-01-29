/*
  Warnings:

  - A unique constraint covering the columns `[bn_reference]` on the table `Annonce` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `annonce` ADD COLUMN `bn_reference` VARCHAR(191) NULL,
    MODIFY `type` ENUM('maison', 'appartement', 'terrain', 'chambre', 'meublé', 'studio') NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Annonce_bn_reference_key` ON `Annonce`(`bn_reference`);
