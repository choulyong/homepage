-- CreateIndex
CREATE INDEX "albums_band_id_idx" ON "albums"("band_id");

-- CreateIndex
CREATE INDEX "albums_release_year_idx" ON "albums"("release_year");

-- CreateIndex
CREATE INDEX "albums_created_at_idx" ON "albums"("created_at");

-- CreateIndex
CREATE INDEX "bands_country_idx" ON "bands"("country");

-- CreateIndex
CREATE INDEX "bands_spotify_followers_idx" ON "bands"("spotify_followers");

-- CreateIndex
CREATE INDEX "bands_name_idx" ON "bands"("name");

-- CreateIndex
CREATE INDEX "bands_created_at_idx" ON "bands"("created_at");

-- CreateIndex
CREATE INDEX "concerts_band_id_idx" ON "concerts"("band_id");

-- CreateIndex
CREATE INDEX "concerts_date_idx" ON "concerts"("date");

-- CreateIndex
CREATE INDEX "concerts_past_event_idx" ON "concerts"("past_event");
