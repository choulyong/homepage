/*
  Warnings:

  - You are about to drop the column `description` on the `gallery` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `gallery` table. All the data in the column will be lost.
  - You are about to drop the column `taken_at` on the `gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gallery" DROP COLUMN "description",
DROP COLUMN "image_url",
DROP COLUMN "taken_at",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "like_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "video_type" TEXT,
ADD COLUMN     "video_url" TEXT,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "youtube_url" TEXT;

-- CreateIndex
CREATE INDEX "gallery_user_id_idx" ON "gallery"("user_id");
