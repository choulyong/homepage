/**
 * Post Detail Page
 * 게시글 상세 페이지
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PostContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  color: ${tokens.colors.primary[400]};
  font-size: ${tokens.typography.fontSize.sm};
  margin-bottom: ${tokens.spacing[6]};
  transition: all ${tokens.transitions.base};

  &:hover {
    color: ${tokens.colors.primary[300]};
  }
`;

const PostCard = styled(Card)`
  padding: ${tokens.spacing[8]};
`;

const PostHeader = styled.div`
  border-bottom: 1px solid ${tokens.colors.glass.light};
  padding-bottom: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[6]};
`;

const PostTitle = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[4]};
`;

const PostMeta = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
`;

const PostContent = styled.div`
  font-size: ${tokens.typography.fontSize.base};
  line-height: 1.8;
  color: ${tokens.colors.gray[200]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  margin-top: ${tokens.spacing[8]};
  padding-top: ${tokens.spacing[6]};
  border-top: 1px solid ${tokens.colors.glass.light};
`;

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { category, id } = await params;
  const supabase = await createClient();

  // 게시글 가져오기
  const { data: post } = await supabase
    .from('posts')
    .select(
      `
      *,
      users(username, avatar_url)
    `
    )
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  // 조회수 증가
  await supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', id);

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthor = user?.id === post.user_id;

  return (
    <PostContainer>
      <BackLink href={`/board/${category}`}>← 목록으로</BackLink>

      <PostCard variant="glass">
        <PostHeader>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <span>작성자: {post.users?.username || '익명'}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            <span>•</span>
            <span>조회 {post.view_count || 0}</span>
          </PostMeta>
        </PostHeader>

        <PostContent>{post.content}</PostContent>

        {isAuthor && (
          <ActionButtons>
            <Link href={`/board/${category}/${id}/edit`}>
              <Button variant="outline">수정</Button>
            </Link>
            <Button variant="outline">삭제</Button>
          </ActionButtons>
        )}
      </PostCard>
    </PostContainer>
  );
}
