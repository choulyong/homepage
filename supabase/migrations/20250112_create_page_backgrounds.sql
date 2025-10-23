-- 페이지별 배경화면 설정 테이블
CREATE TABLE IF NOT EXISTS page_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE, -- 페이지 경로 (예: '/', '/about', '/schedule')
  background_url TEXT NOT NULL, -- Supabase Storage URL
  opacity NUMERIC(3, 2) DEFAULT 0.50 CHECK (opacity >= 0 AND opacity <= 1), -- 투명도 (0.0 ~ 1.0)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_page_backgrounds_path ON page_backgrounds(page_path);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_page_backgrounds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_backgrounds_updated_at
  BEFORE UPDATE ON page_backgrounds
  FOR EACH ROW
  EXECUTE FUNCTION update_page_backgrounds_updated_at();

-- 코멘트 추가
COMMENT ON TABLE page_backgrounds IS '페이지별 배경화면 설정';
COMMENT ON COLUMN page_backgrounds.page_path IS '페이지 경로 (예: /, /about, /schedule)';
COMMENT ON COLUMN page_backgrounds.background_url IS 'Supabase Storage에 저장된 배경 이미지 URL';
COMMENT ON COLUMN page_backgrounds.opacity IS '배경 이미지 투명도 (0.0 = 완전 투명, 1.0 = 완전 불투명)';
