-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "is_legend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legend_rank" INTEGER;

-- CreateIndex
CREATE INDEX "albums_is_legend_legend_rank_idx" ON "albums"("is_legend", "legend_rank");
