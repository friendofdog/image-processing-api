/*
  Warnings:

  - You are about to drop the column `blobId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "blobId",
DROP COLUMN "size",
ADD COLUMN     "originalBlobId" TEXT,
ADD COLUMN     "thumbnailBlobId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "ImageSize";

-- CreateIndex
CREATE UNIQUE INDEX "Image_jobId_key" ON "Image"("jobId");
