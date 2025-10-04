/**
 * Admin Posts Management
 * 게시글 관리 페이지 (목록, 수정, 삭제)
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${tokens.spacing[3]};
  margin-bottom: ${tokens.spacing[6]};
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${tokens.spacing[2]} ${tokens.spacing[5]};
  background: ${(props) =>
    props.$active ? tokens.colors.gradients.kinetic : tokens.colors.glass.light};
  color: ${tokens.colors.white};
  border: none;
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${tokens.transitions.base};

  &:hover {
    transform: translateY(-2px);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${tokens.colors.glass.medium};
  border-bottom: 2px solid ${tokens.colors.glass.light};
`;

const Th = styled.th`
  padding: ${tokens.spacing[4]};
  text-align: left;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.gray[300]};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${tokens.colors.glass.light};
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${tokens.colors.glass.light};
  }
`;

const Td = styled.td`
  padding: ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[300]};
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.medium};
  background: ${(props) =>
    props.$category === 'ai_study'
      ? tokens.colors.primary[500]
      : props.$category === 'bigdata_study'
        ? tokens.colors.secondary[500]
        : props.$category === 'free_board'
          ? tokens.colors.success
          : tokens.colors.warning};
  color: ${tokens.colors.white};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${tokens.spacing[2]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  margin-bottom: ${tokens.spacing[4]};
  background: ${(props) =>
    props.$type === 'success'
      ? `${tokens.colors.success}15`
      : `${tokens.colors.danger}15`};
  border: 1px solid
    ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
  color: ${(props) =>
    props.$type === 'success' ? tokens.colors.success : tokens.colors.danger};
`;

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'ai_study', label: 'AI 스터디' },
  { value: 'bigdata_study', label: '빅데이터 스터디' },
  { value: 'free_board', label: '자유게시판' },
  { value: 'ai_artwork', label: 'AI 작품' },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.category === selectedCategory));
    }
  }, [selectedCategory, posts]);

  const loadPosts = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage({ type: 'error', text: '게시글을 불러오는데 실패했습니다.' });
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
    } else {
      setMessage({ type: 'success', text: '게시글이 삭제되었습니다.' });
      loadPosts();
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find((c) => c.value === category);
    return found ? found.label : category;
  };

  if (loading) {
    return (
      <Container>
        <EmptyState>
          <p>로딩 중...</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>게시글 관리</Title>
        <Link href="/board/ai_study/new">
          <Button variant="primary">+ 새 게시글 작성</Button>
        </Link>
      </Header>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <FilterTabs>
        {CATEGORIES.map((category) => (
          <TabButton
            key={category.value}
            $active={selectedCategory === category.value}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
            {category.value === 'all'
              ? ` (${posts.length})`
              : ` (${posts.filter((p) => p.category === category.value).length})`}
          </TabButton>
        ))}
      </FilterTabs>

      <Card variant="glass" style={{ overflow: 'hidden' }}>
        {filteredPosts && filteredPosts.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th style={{ width: '10%' }}>카테고리</Th>
                <Th style={{ width: '40%' }}>제목</Th>
                <Th style={{ width: '10%' }}>조회수</Th>
                <Th style={{ width: '15%' }}>작성일</Th>
                <Th style={{ width: '25%' }}>관리</Th>
              </tr>
            </Thead>
            <Tbody>
              {filteredPosts.map((post) => (
                <Tr key={post.id}>
                  <Td>
                    <CategoryBadge $category={post.category}>
                      {getCategoryLabel(post.category)}
                    </CategoryBadge>
                  </Td>
                  <Td>{post.title}</Td>
                  <Td>{post.view_count || 0}</Td>
                  <Td>{new Date(post.created_at).toLocaleDateString('ko-KR')}</Td>
                  <Td>
                    <ActionButtons>
                      <Link href={`/board/${post.category}/${post.id}`}>
                        <Button variant="outline" size="sm">
                          보기
                        </Button>
                      </Link>
                      <Link href={`/board/${post.category}/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        삭제
                      </Button>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <EmptyState>
            <h2>게시글이 없습니다</h2>
            <p>새 게시글을 작성해보세요!</p>
          </EmptyState>
        )}
      </Card>
    </Container>
  );
}
