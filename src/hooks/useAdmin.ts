'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        // 관리자 이메일 체크 (환경변수 또는 하드코딩)
        const adminEmails = [
          'choulyong@naver.com',
          'choulyong@gmail.com',
          'admin@metaldragon.co.kr'
        ];
        setIsAdmin(adminEmails.includes(currentUser.email || ''));
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading, user };
}
