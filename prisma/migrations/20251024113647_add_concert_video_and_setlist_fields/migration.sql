-- AlterTable
ALTER TABLE "concerts" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "past_event" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "poster_url" TEXT,
ADD COLUMN     "setlist" JSONB,
ADD COLUMN     "youtube_url" TEXT;
