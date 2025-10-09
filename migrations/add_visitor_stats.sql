-- Visitor Statistics Tables
-- 방문자 통계 및 페이지뷰 트래킹

-- 방문자 로그 테이블
CREATE TABLE IF NOT EXISTS visitor_logs (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- 방문자 고유 ID (쿠키 기반)
  page_path TEXT NOT NULL, -- 방문 페이지 경로
  referrer TEXT, -- 리퍼러 (유입 경로)
  user_agent TEXT, -- 브라우저 정보
  ip_address TEXT, -- IP 주소 (해시된 값)
  country TEXT, -- 국가
  city TEXT, -- 도시
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT, -- 브라우저 이름
  os TEXT, -- 운영체제
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일별 통계 집계 테이블 (성능 최적화용)
CREATE TABLE IF NOT EXISTS visitor_daily_stats (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2), -- 이탈률
  avg_session_duration INTEGER, -- 평균 세션 시간 (초)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 페이지별 조회수 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  view_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor_id ON visitor_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_page_path ON visitor_logs(page_path);
CREATE INDEX IF NOT EXISTS idx_visitor_daily_stats_date ON visitor_daily_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- Row Level Security (RLS) 활성화
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자만 조회 가능 (anon은 API를 통해서만 접근)
CREATE POLICY "Allow service role to read visitor_logs"
  ON visitor_logs FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to insert visitor_logs"
  ON visitor_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to read visitor_daily_stats"
  ON visitor_daily_stats FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public to read page_views"
  ON page_views FOR SELECT
  USING (true);

-- 데이터 보관 기간: 90일 이후 자동 삭제 (선택사항)
-- Supabase의 pg_cron 확장을 사용하거나 별도 cron job으로 실행
CREATE OR REPLACE FUNCTION cleanup_old_visitor_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM visitor_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
