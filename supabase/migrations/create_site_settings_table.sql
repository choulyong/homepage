-- 사이트 설정 테이블 생성
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 설정 값 삽입
INSERT INTO site_settings (key, value, description) VALUES
  ('hero_title', 'metaldragon', '메인 페이지 히어로 제목'),
  ('hero_subtitle', 'AI, 빅데이터 학습부터 개인 포트폴리오까지<br />모든 것을 하나의 플랫폼에서', '메인 페이지 히어로 부제목'),
  ('features_title', '다양한 기능을 탐험하세요', '기능 섹션 제목'),
  ('features_description', '학습, 창작, 공유가 한곳에서', '기능 섹션 설명')
ON CONFLICT (key) DO NOTHING;

-- RLS 활성화
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- 정책: 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();
