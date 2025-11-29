/**
 * Board Category Page - METALDRAGON Rock Community
 * 카테고리별 게시글 목록 (로컬 PostgreSQL + Cookie 인증)
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma';
import { cookies } from 'next/headers';
import BoardCategoryClient from './BoardCategoryClient';

interface BoardCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Rock Community 게시판 카테고리 (Music Discovery, Rock Art Showcase 제거됨)
const CATEGORIES: Record<string, { name: string; description: string; icon: string }> = {
  'general_discussion': {
    name: 'General Discussion',
    description: 'Rock 음악에 대한 자유로운 토론',
    icon: '💬',
  },
  'album_reviews': {
    name: 'Album Reviews',
    description: '앨범 리뷰 및 평가',
    icon: '💿',
  },
  'concert_reviews': {
    name: 'Concert Reviews',
    description: '공연 후기 및 리뷰',
    icon: '🎤',
  },
  'hot_topics': {
    name: 'Hot Topics',
    description: '뜨거운 Rock 이슈',
    icon: '🔥',
  },
};

// 페이지 사이즈
const POSTS_PER_PAGE = 20;

export default async function BoardCategoryPage({ params, searchParams }: BoardCategoryPageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // 카테고리 유효성 검증
  if (!CATEGORIES[category]) {
    notFound();
  }

  const categoryInfo = CATEGORIES[category];
  const prisma = new PrismaClient();

  // Cookie 기반 사용자 확인
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  let currentUser = null;

  if (session) {
    try {
      const decoded = Buffer.from(session.value, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      const userId = parts[0];
      const username = parts[1];
      const isAdminStr = parts[2] || 'false';
      const isAdmin = isAdminStr === 'true';

      if (userId && username) {
        currentUser = { id: userId, username, isAdmin };
      }
    } catch (e) {
      // Invalid session
    }
  }

  try {
    // 게시글 총 개수 조회
    const totalPosts = await prisma.boardPost.count({
      where: { category }
    });

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    // 게시글 목록 조회 (페이지네이션, is_pinned 우선 정렬)
    const posts = await prisma.boardPost.findMany({
      where: { category },
      orderBy: [
        { is_pinned: 'desc' },
        { created_at: 'desc' }
      ],
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE
    });

    await prisma.$disconnect();

    return (
      <BoardCategoryClient
        category={category}
        categoryInfo={categoryInfo}
        currentUser={currentUser}
        posts={posts}
        totalPosts={totalPosts}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    );
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    await prisma.$disconnect();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">게시글 로드 실패</h2>
          <p className="text-gray-600 dark:text-gray-400">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }
}
