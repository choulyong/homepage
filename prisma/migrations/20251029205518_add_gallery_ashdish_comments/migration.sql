-- CreateTable
CREATE TABLE "gallery_comments" (
    "id" UUID NOT NULL,
    "gallery_id" UUID NOT NULL,
    "author" TEXT NOT NULL,
    "user_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ashdish_comments" (
    "id" UUID NOT NULL,
    "ashdish_id" UUID NOT NULL,
    "author" TEXT NOT NULL,
    "user_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ashdish_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_comments_gallery_id_idx" ON "gallery_comments"("gallery_id");

-- CreateIndex
CREATE INDEX "gallery_comments_created_at_idx" ON "gallery_comments"("created_at");

-- CreateIndex
CREATE INDEX "ashdish_comments_ashdish_id_idx" ON "ashdish_comments"("ashdish_id");

-- CreateIndex
CREATE INDEX "ashdish_comments_created_at_idx" ON "ashdish_comments"("created_at");

-- AddForeignKey
ALTER TABLE "gallery_comments" ADD CONSTRAINT "gallery_comments_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ashdish_comments" ADD CONSTRAINT "ashdish_comments_ashdish_id_fkey" FOREIGN KEY ("ashdish_id") REFERENCES "ashdish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
