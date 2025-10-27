-- CreateEnum
CREATE TYPE "public"."TypeBien" AS ENUM ('maison', 'appartement', 'terrain', 'chambre', 'meublé');

-- AlterTable
ALTER TABLE "public"."Annonce" ADD COLUMN     "chambres" INTEGER,
ADD COLUMN     "douches" INTEGER,
ADD COLUMN     "surface" INTEGER,
ADD COLUMN     "type" "public"."TypeBien";
