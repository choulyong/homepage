-- Likes System for Posts, Gallery, Movies, News
-- 게시글, 갤러리, 영화, 뉴스 좋아요 시스템

-- 좋아요 테이블
CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'gallery', 'movie', 'news')),
  target_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id) -- 한 사용자가 같은 항목에 중복 좋아요 방지
);

-- 좋아요 카운트 캐시 테이블 (성능 최적화)
CREATE TABLE IF NOT EXISTS like_counts (
  id BIGSERIAL PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id BIGINT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_type, target_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_like_counts_target ON like_counts(target_type, target_id);

-- RLS 활성화
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE like_counts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 로그인한 사용자는 자신의 좋아요 조회/생성/삭제 가능
CREATE POLICY "Users can view all likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- 좋아요 카운트는 누구나 조회 가능
CREATE POLICY "Anyone can view like counts"
  ON like_counts FOR SELECT
  USING (true);

-- 좋아요 추가 함수 (트리거용)
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO like_counts (target_type, target_id, count)
  VALUES (NEW.target_type, NEW.target_id, 1)
  ON CONFLICT (target_type, target_id)
  DO UPDATE SET count = like_counts.count + 1, updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 좋아요 제거 함수 (트리거용)
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE like_counts
  SET count = GREATEST(0, count - 1), updated_at = NOW()
  WHERE target_type = OLD.target_type AND target_id = OLD.target_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER after_like_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_like_count();

CREATE TRIGGER after_like_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_like_count();
