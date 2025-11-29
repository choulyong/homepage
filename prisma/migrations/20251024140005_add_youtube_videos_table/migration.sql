-- CreateTable
CREATE TABLE "youtube_videos" (
    "id" UUID NOT NULL,
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtube_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtube_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "youtube_videos_video_id_key" ON "youtube_videos"("video_id");

-- CreateIndex
CREATE INDEX "youtube_videos_published_at_idx" ON "youtube_videos"("published_at");
