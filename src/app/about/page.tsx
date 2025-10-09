/**
 * About Page (Public) with Tailwind CSS
 * 프로필 정보를 보여주는 공개 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // 현재 사용자 확인
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // 프로필 데이터 가져오기 (첫 번째 프로필 사용)
      const { data: profileData } = await supabase.from('profile').select('*').limit(1).single();
      setProfile(profileData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-gray-600 dark:text-white">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            프로필 정보가 없습니다
          </h2>
          <p className="text-gray-600 dark:text-white mb-6">
            관리자 페이지에서 프로필을 생성하세요
          </p>
          {user && (
            <Link href="/admin/about">
              <Button>프로필 생성하기</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Edit Button */}
      {user && (
        <div className="mb-8">
          <Link href="/admin/about">
            <Button variant="secondary">✏️ 프로필 편집</Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Profile Image */}
        <div className="relative w-48 h-48 rounded-full overflow-hidden p-1 bg-gradient-to-r from-teal-500 to-indigo-500">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
            <Image
              src={profile.profile_image_url || '/placeholder-avatar.png'}
              alt={profile.display_name}
              width={200}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
            {profile.display_name}
          </h1>
          {profile.job_title && (
            <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              {profile.job_title}
            </h2>
          )}
          {profile.bio && (
            <p className="text-gray-600 dark:text-white leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              {profile.social_links.github && (
                <a
                  href={profile.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {profile.social_links.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {profile.social_links.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}
              {profile.social_links.youtube && (
                <a
                  href={profile.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="sr-only">YouTube</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {profile.social_links.instagram && (
                <a
                  href={profile.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:text-white transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">
            보유 스킬
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.skills.map((skill: string, index: number) => (
              <Card
                key={index}
                variant="featured"
                padding="sm"
                className="text-center"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {skill}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {profile.portfolio_items && profile.portfolio_items.length > 0 && (
        <section>
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">
            포트폴리오
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.portfolio_items.map((item: any, index: number) => (
              <Card key={index} padding="lg" className="flex flex-col gap-4">
                {item.imageUrl && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <h4 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-white leading-relaxed">
                  {item.description}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    프로젝트 보기 →
                  </a>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
