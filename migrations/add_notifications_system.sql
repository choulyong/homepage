-- Notifications System
-- 댓글 및 좋아요 알림 시스템

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'like', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- 알림 클릭 시 이동할 URL
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 관련 데이터 참조 (선택적)
  related_post_id BIGINT,
  related_comment_id BIGINT,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 알림만 조회/수정 가능
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 시스템이 알림 생성 가능 (service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 댓글 작성 시 자동 알림 생성 함수
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
  commenter_email TEXT;
BEGIN
  -- 게시글 작성자 ID와 제목 가져오기
  SELECT user_id, title INTO post_author_id, post_title
  FROM posts
  WHERE id = NEW.post_id;

  -- 댓글 작성자 이메일 가져오기
  SELECT email INTO commenter_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- 자신의 게시글에 자신이 댓글 단 경우 알림 생성 안함
  IF post_author_id != NEW.user_id THEN
    -- 게시글 작성자에게 알림 생성
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link,
      related_post_id,
      related_comment_id,
      related_user_id
    ) VALUES (
      post_author_id,
      'comment',
      '새 댓글이 달렸습니다',
      commenter_email || ' 님이 "' || post_title || '"에 댓글을 남겼습니다.',
      '/board/' || (SELECT board_id FROM posts WHERE id = NEW.post_id) || '/' || NEW.post_id,
      NEW.post_id,
      NEW.id,
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 댓글 트리거 생성
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- 답글 작성 시 자동 알림 생성 함수
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment_user_id UUID;
  post_title TEXT;
  replier_email TEXT;
BEGIN
  -- 부모 댓글이 있는 경우 (답글)
  IF NEW.parent_id IS NOT NULL THEN
    -- 부모 댓글 작성자 ID 가져오기
    SELECT user_id INTO parent_comment_user_id
    FROM comments
    WHERE id = NEW.parent_id;

    -- 답글 작성자 이메일 가져오기
    SELECT email INTO replier_email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- 게시글 제목 가져오기
    SELECT title INTO post_title
    FROM posts
    WHERE id = NEW.post_id;

    -- 자신의 댓글에 자신이 답글 단 경우 알림 생성 안함
    IF parent_comment_user_id != NEW.user_id THEN
      -- 부모 댓글 작성자에게 알림 생성
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        related_post_id,
        related_comment_id,
        related_user_id
      ) VALUES (
        parent_comment_user_id,
        'reply',
        '답글이 달렸습니다',
        replier_email || ' 님이 "' || post_title || '"의 댓글에 답글을 남겼습니다.',
        '/board/' || (SELECT board_id FROM posts WHERE id = NEW.post_id) || '/' || NEW.post_id,
        NEW.post_id,
        NEW.id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 답글 트리거 생성
DROP TRIGGER IF EXISTS trigger_notify_on_reply ON comments;
CREATE TRIGGER trigger_notify_on_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reply();

-- 오래된 알림 정리 함수 (90일 이상 & 읽음)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE read = TRUE
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
