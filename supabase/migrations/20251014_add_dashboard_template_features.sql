-- ========================================
-- 빅데이터 게시판 대시보드 및 템플릿 기능 추가
-- ========================================

-- posts 테이블에 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS template_data JSONB;

-- is_pinned 인덱스 추가 (공지 게시물 빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned, created_at DESC) WHERE is_pinned = TRUE;

-- sub_category 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_sub_category ON posts(category, sub_category) WHERE sub_category IS NOT NULL;

-- 템플릿 카테고리 enum (선택사항: 나중에 필요시 활용)
COMMENT ON COLUMN posts.sub_category IS '빅데이터 게시판 하위 카테고리: 학습노트, 기출_오답노트, 미니프로젝트, 유용한_자료 등';
COMMENT ON COLUMN posts.is_pinned IS '공지로 고정된 게시물 여부 (대시보드 등)';
COMMENT ON COLUMN posts.template_data IS '템플릿 관련 메타데이터 (진행률, D-DAY, 주간 목표 등)';

-- 예시 템플릿 데이터 구조:
-- {
--   "type": "dashboard",
--   "progress": {
--     "ds_lv2": 50,
--     "bigdata_written": 80,
--     "bigdata_practical": 20
--   },
--   "weekly_goals": [
--     { "text": "DS Lv.2: 3주차 머신러닝 기초 강의 수강", "completed": true },
--     { "text": "빅분기: 4과목 핵심 개념 정리", "completed": false }
--   ],
--   "dday": {
--     "bigdata_written": "2025-XX-XX",
--     "ds_lv2_end": "2025-XX-XX"
--   }
-- }
