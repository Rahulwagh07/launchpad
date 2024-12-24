/*
  Warnings:

  - You are about to drop the `Pool` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Pool";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "pools" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
