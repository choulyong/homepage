/**
 * Admin Authorization Helpers
 * 관리자 권한 확인 유틸리티
 */

import { User } from '@supabase/supabase-js';

// 관리자 이메일 목록
const ADMIN_EMAILS = [
  'choulyong@metaldragon.co.kr',
  'choulyong@gmail.com',
  'admin@metaldragon.co.kr',
  // 추가 관리자 이메일을 여기에 추가
];

/**
 * 사용자가 관리자인지 확인
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * 관리자 권한 확인 (에러 throw)
 */
export function requireAdmin(user: User | null): void {
  if (!isAdmin(user)) {
    throw new Error('관리자 권한이 필요합니다.');
  }
}
