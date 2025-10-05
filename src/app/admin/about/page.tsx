/**
 * Admin About Edit Page - Tailwind CSS
 * 프로필 정보를 편집하는 관리자 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ProfileData {
  displayName: string;
  jobTitle: string;
  bio: string;
  profileImageUrl: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    email?: string;
  };
  portfolioItems: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    tags?: string[];
  }>;
}

export default function AdminAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [newSkill, setNewSkill] = useState('');

  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    jobTitle: '',
    bio: '',
    profileImageUrl: '',
    skills: [],
    socialLinks: {},
    portfolioItems: [],
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profile').select('*').limit(1).single();

      if (data) {
        setProfile({
          displayName: data.displayName || '',
          jobTitle: data.jobTitle || '',
          bio: data.bio || '',
          profileImageUrl: data.profileImageUrl || '',
          skills: data.skills || [],
          socialLinks: data.socialLinks || {},
          portfolioItems: data.portfolioItems || [],
        });
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // 기존 프로필 확인
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('id')
        .limit(1)
        .single();

      if (existingProfile) {
        // 업데이트
        const { error } = await supabase
          .from('profile')
          .update({
            ...profile,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', existingProfile.id);

        if (error) throw error;
      } else {
        // 새로 생성
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error('로그인이 필요합니다');

        const { error } = await supabase.from('profile').insert({
          ...profile,
          userId: user.id,
        });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: '프로필이 성공적으로 저장되었습니다!' });

      // 3초 후 About 페이지로 이동
      setTimeout(() => {
        router.push('/about');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const addPortfolioItem = () => {
    setProfile({
      ...profile,
      portfolioItems: [
        ...profile.portfolioItems,
        { title: '', description: '', imageUrl: '', link: '', tags: [] },
      ],
    });
  };

  const updatePortfolioItem = (index: number, field: string, value: any) => {
    const updatedItems = [...profile.portfolioItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setProfile({ ...profile, portfolioItems: updatedItems });
  };

  const removePortfolioItem = (index: number) => {
    setProfile({
      ...profile,
      portfolioItems: profile.portfolioItems.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent mb-8">
        프로필 편집
      </h1>

      {message && (
        <div
          className={cn(
            'p-4 rounded-md mb-4 border',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          )}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">기본 정보</h2>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-300">
              이름 *
            </label>
            <input
              id="displayName"
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              required
              placeholder="홍길동"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="jobTitle" className="text-sm font-medium text-gray-300">
              직함
            </label>
            <input
              id="jobTitle"
              type="text"
              value={profile.jobTitle}
              onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
              placeholder="Full Stack Developer"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="bio" className="text-sm font-medium text-gray-300">
              자기소개
            </label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="간단한 자기소개를 작성하세요"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white min-h-[120px] resize-y font-[inherit] placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-gray-300">
              프로필 이미지
            </label>
            <ImageUpload
              currentImageUrl={profile.profileImageUrl}
              onUploadComplete={(url) => setProfile({ ...profile, profileImageUrl: url })}
              bucket="avatars"
              maxSizeMB={5}
            />
          </div>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">보유 스킬</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full text-white text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="bg-transparent border-none text-red-500 cursor-pointer text-lg p-0 flex items-center justify-center hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="newSkill" className="text-sm font-medium text-gray-300">
              새 스킬 추가
            </label>
            <div className="flex gap-2">
              <input
                id="newSkill"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="React, TypeScript, Node.js..."
                className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
              />
              <Button type="button" onClick={addSkill} variant="outline">
                추가
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">소셜 링크</h2>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="github" className="text-sm font-medium text-gray-300">
              GitHub
            </label>
            <input
              id="github"
              type="url"
              value={profile.socialLinks.github || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, github: e.target.value },
                })
              }
              placeholder="https://github.com/username"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="linkedin" className="text-sm font-medium text-gray-300">
              LinkedIn
            </label>
            <input
              id="linkedin"
              type="url"
              value={profile.socialLinks.linkedin || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                })
              }
              placeholder="https://linkedin.com/in/username"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="youtube" className="text-sm font-medium text-gray-300">
              YouTube
            </label>
            <input
              id="youtube"
              type="url"
              value={profile.socialLinks.youtube || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, youtube: e.target.value },
                })
              }
              placeholder="https://youtube.com/@username"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="instagram" className="text-sm font-medium text-gray-300">
              Instagram
            </label>
            <input
              id="instagram"
              type="url"
              value={profile.socialLinks.instagram || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, instagram: e.target.value },
                })
              }
              placeholder="https://instagram.com/username"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="facebook" className="text-sm font-medium text-gray-300">
              Facebook
            </label>
            <input
              id="facebook"
              type="url"
              value={profile.socialLinks.facebook || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                })
              }
              placeholder="https://facebook.com/username"
              className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
            />
          </div>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">포트폴리오</h2>

          {profile.portfolioItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-white/18 rounded-lg p-4 mb-4"
            >
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-300">프로젝트 제목</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                  placeholder="프로젝트 이름"
                  className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-300">설명</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                  placeholder="프로젝트 설명"
                  className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white min-h-[120px] resize-y font-[inherit] placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-300">이미지 URL</label>
                <input
                  type="url"
                  value={item.imageUrl || ''}
                  onChange={(e) => updatePortfolioItem(index, 'imageUrl', e.target.value)}
                  placeholder="https://example.com/project-image.jpg"
                  className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-300">프로젝트 링크</label>
                <input
                  type="url"
                  value={item.link || ''}
                  onChange={(e) => updatePortfolioItem(index, 'link', e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => removePortfolioItem(index)}
                className="mt-2"
              >
                삭제
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addPortfolioItem}>
            + 포트폴리오 항목 추가
          </Button>
        </div>

        <div className="flex gap-4 justify-end mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/about')}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
