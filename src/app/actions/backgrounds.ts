'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 관리자 이메일
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'choulyong@gmail.com';

// 페이지 배경화면 설정 타입
export interface PageBackground {
  id: string;
  page_path: string;
  background_url: string;
  background_color: string | null;
  opacity: number;
  text_color: string;
  created_at: string;
  updated_at: string;
}

// 관리자 체크
async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}

/**
 * 페이지 배경화면 조회 (누구나 가능)
 */
export async function getPageBackground(
  pagePath: string
): Promise<{ success: boolean; background?: PageBackground; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('page_backgrounds')
      .select('*')
      .eq('page_path', pagePath)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터 없음 (정상)
        return { success: true, background: undefined };
      }
      if (error.code === 'PGRST205') {
        // 테이블 없음 (graceful degradation)
        console.error('Error fetching background:', error);
        return { success: true, background: undefined };
      }
      console.error('Error fetching background:', error);
      return { success: false, error: error.message };
    }

    return { success: true, background: data as PageBackground };
  } catch (error: any) {
    console.error('Error fetching background:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 모든 페이지 배경화면 조회 (누구나 가능)
 */
export async function getAllPageBackgrounds(): Promise<{
  success: boolean;
  backgrounds?: PageBackground[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('page_backgrounds')
      .select('*')
      .order('page_path', { ascending: true });

    if (error) {
      console.error('Error fetching backgrounds:', error);
      // Return empty array if table doesn't exist
      if (error.code === 'PGRST205') {
        return { success: true, backgrounds: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, backgrounds: data as PageBackground[] };
  } catch (error: any) {
    console.error('Error fetching backgrounds:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 페이지 배경화면 설정/수정 (관리자 전용)
 */
export async function setPageBackground(
  pagePath: string,
  backgroundUrl: string,
  opacity: number = 0.5,
  textColor: string = '#000000',
  backgroundColor: string | null = null
): Promise<{ success: boolean; background?: PageBackground; error?: string }> {
  try {
    // 관리자 체크
    if (!(await isAdmin())) {
      return { success: false, error: '관리자만 설정 가능합니다.' };
    }

    const supabase = await createClient();

    // Upsert (존재하면 업데이트, 없으면 생성)
    const { data, error } = await supabase
      .from('page_backgrounds')
      .upsert(
        {
          page_path: pagePath,
          background_url: backgroundUrl,
          background_color: backgroundColor,
          opacity,
          text_color: textColor,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'page_path',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error setting background:', error);
      return { success: false, error: error.message };
    }

    // 해당 페이지 재검증
    revalidatePath(pagePath);
    revalidatePath('/admin/backgrounds');

    return { success: true, background: data as PageBackground };
  } catch (error: any) {
    console.error('Error setting background:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 페이지 배경화면 삭제 (관리자 전용)
 */
export async function deletePageBackground(
  pagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 관리자 체크
    if (!(await isAdmin())) {
      return { success: false, error: '관리자만 삭제 가능합니다.' };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('page_backgrounds')
      .delete()
      .eq('page_path', pagePath);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    // 해당 페이지 재검증
    revalidatePath(pagePath);
    revalidatePath('/admin/backgrounds');

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}
