/**
 * Board Page (Dynamic Route)
 * 카테고리별 게시판 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const BoardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const PostCard = styled(Card)`
  padding: ${tokens.spacing[6]};
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(240, 147, 251, 0.2);
  }
`;

const PostTitle = styled.h2`
  font-size: ${tokens.typography.fontSize.xl};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[2]};
`;

const PostMeta = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

const CATEGORY_LABELS: Record<string, string> = {
  ai_study: 'AI 스터디',
  bigdata_study: '빅데이터 엔지니어 자격증 스터디',
  free_board: '자유게시판',
  ai_artwork: 'AI 작품 갤러리',
};

export default function BoardPage() {
  const params = useParams();
  const category = params?.category as string;
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!category || !CATEGORY_LABELS[category]) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // 현재 사용자 확인
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // 게시글 가져오기
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    };

    loadData();
  }, [category]);

  if (loading) {
    return (
      <BoardContainer>
        <EmptyState>
          <p>로딩 중...</p>
        </EmptyState>
      </BoardContainer>
    );
  }

  if (!category || !CATEGORY_LABELS[category]) {
    return (
      <BoardContainer>
        <EmptyState>
          <h2>존재하지 않는 카테고리입니다</h2>
        </EmptyState>
      </BoardContainer>
    );
  }

  return (
    <BoardContainer>
      <Header>
        <Title>{CATEGORY_LABELS[category]}</Title>
        {user && (
          <Link href={`/board/${category}/new`}>
            <Button variant="primary">글쓰기</Button>
          </Link>
        )}
      </Header>

      {posts && posts.length > 0 ? (
        <PostList>
          {posts.map((post) => (
            <Link key={post.id} href={`/board/${category}/${post.id}`}>
              <PostCard variant="glass">
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  <span>작성자: {post.author_id}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  {post.view_count > 0 && (
                    <>
                      <span>•</span>
                      <span>조회 {post.view_count}</span>
                    </>
                  )}
                </PostMeta>
              </PostCard>
            </Link>
          ))}
        </PostList>
      ) : (
        <EmptyState>
          <h2>아직 게시글이 없습니다</h2>
          <p>첫 게시글을 작성해보세요!</p>
          {user && (
            <Link href={`/board/${category}/new`}>
              <Button variant="primary" style={{ marginTop: tokens.spacing[4] }}>
                글쓰기
              </Button>
            </Link>
          )}
        </EmptyState>
      )}
    </BoardContainer>
  );
}
