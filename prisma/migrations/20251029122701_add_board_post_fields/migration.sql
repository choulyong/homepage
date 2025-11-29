/*
  Warnings:

  - Added the required column `category` to the `board_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "board_posts" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "board_posts_category_idx" ON "board_posts"("category");

-- CreateIndex
CREATE INDEX "board_posts_is_pinned_created_at_idx" ON "board_posts"("is_pinned", "created_at");
