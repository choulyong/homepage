-- CreateTable
CREATE TABLE "bands" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "logo_url" TEXT,
    "country" TEXT,
    "formed_year" INTEGER,
    "genres" TEXT[],
    "social_links" JSONB,
    "spotify_id" TEXT,
    "spotify_followers" INTEGER,
    "spotify_popularity" INTEGER,
    "origin" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" UUID NOT NULL,
    "band_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "cover_url" TEXT,
    "release_year" INTEGER,
    "label" TEXT,
    "genres" TEXT[],
    "spotify_id" TEXT,
    "spotify_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL,
    "album_id" UUID NOT NULL,
    "track_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration_seconds" INTEGER,
    "spotify_id" TEXT,
    "preview_url" TEXT,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "band_id" UUID NOT NULL,
    "user_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concerts" (
    "id" UUID NOT NULL,
    "band_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ticket_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_posts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bands_spotify_id_key" ON "bands"("spotify_id");

-- CreateIndex
CREATE UNIQUE INDEX "albums_spotify_id_key" ON "albums"("spotify_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_spotify_id_key" ON "tracks"("spotify_id");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concerts" ADD CONSTRAINT "concerts_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_comments" ADD CONSTRAINT "board_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "board_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
