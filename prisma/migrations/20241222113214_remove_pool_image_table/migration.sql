/*
  Warnings:

  - You are about to drop the column `poolId` on the `Pool` table. All the data in the column will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Pool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pool" DROP COLUMN "poolId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "pools" TEXT[];

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "User";
