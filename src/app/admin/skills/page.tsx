/**
 * Admin Skills Management - Tailwind CSS
 * 보유 스킬 관리 페이지 (아이콘 이미지 업로드 지원)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Skill {
  id?: string;
  name: string;
  icon_url?: string;
  proficiency?: number; // 1-100
  category?: string;
}

const SKILL_CATEGORIES = [
  { value: 'language', label: '프로그래밍 언어' },
  { value: 'framework', label: '프레임워크' },
  { value: 'tool', label: '도구' },
  { value: 'database', label: '데이터베이스' },
  { value: 'other', label: '기타' },
];

export default function AdminSkillsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('skills').select('*').order('name', { ascending: true });

    if (data) {
      setSkills(data);
    }
  };

  const addSkill = async () => {
    if (!newSkillName.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('skills')
        .insert({
          name: newSkillName.trim(),
          proficiency: 50,
          category: 'other',
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: '스킬이 추가되었습니다!' });
      setNewSkillName('');
      loadSkills();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async (skillId: string, field: string, value: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('skills')
        .update({ [field]: value })
        .eq('id', skillId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setSkills(skills.map((s) => (s.id === skillId ? { ...s, [field]: value } : s)));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '업데이트에 실패했습니다.' });
    }
  };

  const handleIconUpload = (skillId: string, url: string) => {
    updateSkill(skillId, 'icon_url', url);
    setMessage({ type: 'success', text: '아이콘이 업로드되었습니다!' });
  };

  const deleteSkill = async (skillId: string) => {
    if (!confirm('이 스킬을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('skills').delete().eq('id', skillId);

      if (error) throw error;

      setMessage({ type: 'success', text: '스킬이 삭제되었습니다.' });
      loadSkills();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent mb-8">
        스킬 관리
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

      {/* 새 스킬 추가 */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">새 스킬 추가</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="스킬 이름 (예: React, TypeScript, Node.js)"
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
          />
          <Button variant="primary" onClick={addSkill} disabled={loading}>
            {loading ? '추가 중...' : '추가'}
          </Button>
        </div>
      </div>

      {/* 스킬 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6"
          >
            <div className="flex gap-6">
              {/* 아이콘 업로드 */}
              <div className="w-32 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">아이콘</label>
                <ImageUpload
                  currentImageUrl={skill.icon_url}
                  onUploadComplete={(url) => handleIconUpload(skill.id!, url)}
                  bucket="skills"
                  maxSizeMB={2}
                />
              </div>

              {/* 스킬 정보 */}
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id!, 'name', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    카테고리
                  </label>
                  <select
                    value={skill.category || 'other'}
                    onChange={(e) => updateSkill(skill.id!, 'category', e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    숙련도: {skill.proficiency || 50}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiency || 50}
                    onChange={(e) =>
                      updateSkill(skill.id!, 'proficiency', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSkill(skill.id!)}
                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="col-span-2 text-center p-12 text-gray-400">
            <h2 className="text-xl font-semibold mb-2">등록된 스킬이 없습니다</h2>
            <p>위에서 새 스킬을 추가해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
