-- CreateTable
CREATE TABLE "ashdish" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "author" TEXT NOT NULL,
    "user_id" TEXT,
    "video_type" TEXT,
    "youtube_url" TEXT,
    "video_url" TEXT,
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ashdish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ashdish_created_at_idx" ON "ashdish"("created_at");

-- CreateIndex
CREATE INDEX "ashdish_user_id_idx" ON "ashdish"("user_id");
