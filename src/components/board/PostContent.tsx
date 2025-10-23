/**
 * 게시물 내용 렌더링 컴포넌트
 * 대시보드 타입의 경우 DashboardView로 렌더링
 */

'use client';

import { useState } from 'react';
import { DashboardView } from './DashboardView';
import { BIGDATA_SUB_CATEGORIES } from '@/constants/bigdataTemplates';
import { createClient } from '@/lib/supabase/client';

interface PostContentProps {
  post: any;
  isAdmin: boolean;
}

export function PostContent({ post, isAdmin }: PostContentProps) {
  const isDashboard = post.sub_category === BIGDATA_SUB_CATEGORIES.DASHBOARD;

  // template_data 파싱
  const parseDashboardData = () => {
    if (!post.template_data) {
      // 기본 데이터 생성
      return {
        progress: [
          { label: '데이터 사이언스 Lv.2', value: 50, color: '#14b8a6' },
          { label: '빅데이터 분석기사 (필기)', value: 80, color: '#6366f1' },
          { label: '빅데이터 분석기사 (실기)', value: 20, color: '#8b5cf6' },
        ],
        weeklyGoals: [
          { id: '1', text: 'DS Lv.2: 3주차 머신러닝 기초 강의 수강 및 정리', completed: true },
          { id: '2', text: '빅분기: 4과목(빅데이터 결과 해석) 핵심 개념 정리', completed: false },
        ],
        ddays: [
          { label: '빅데이터 분석기사 필기시험', date: '2025-03-15' },
          { label: 'DS Lv.2 과정 종료', date: '2025-04-30' },
        ],
      };
    }

    return post.template_data;
  };

  const [dashboardData, setDashboardData] = useState(parseDashboardData());

  // 대시보드 데이터 업데이트
  const handleUpdateDashboard = async (data: any) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('posts')
      .update({ template_data: data })
      .eq('id', post.id);

    if (error) {
      console.error('Failed to update dashboard:', error);
      throw error;
    }

    setDashboardData(data);
  };

  if (isDashboard && post.category === 'bigdata_study') {
    return (
      <div>
        {/* 대시보드 뷰 */}
        <DashboardView
          data={dashboardData}
          onUpdate={handleUpdateDashboard}
          isEditable={isAdmin}
        />

        {/* 원본 내용 (접기 가능) */}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            📄 원본 마크다운 보기
          </summary>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words font-mono">
              {post.content}
            </pre>
          </div>
        </details>
      </div>
    );
  }

  // 일반 게시물
  return (
    <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
      {post.content}
    </div>
  );
}
