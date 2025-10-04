/**
 * Admin About Edit Page
 * 프로필 정보를 편집하는 관리자 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const EditContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[8]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[6]};
`;

const FormSection = styled(Card)`
  padding: ${tokens.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize.xl};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
  margin-bottom: ${tokens.spacing[4]};
`;

const Label = styled.label`
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[300]};
`;

const Input = styled.input`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]}20;
  }

  &::placeholder {
    color: ${tokens.colors.gray[500]};
  }
`;

const TextArea = styled.textarea`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]}20;
  }

  &::placeholder {
    color: ${tokens.colors.gray[500]};
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[2]};
  margin-bottom: ${tokens.spacing[4]};
`;

const SkillTag = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  padding: ${tokens.spacing[2]} ${tokens.spacing[3]};
  background: ${tokens.colors.glass.light};
  border-radius: ${tokens.borderRadius.full};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.sm};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${tokens.colors.danger};
  cursor: pointer;
  font-size: ${tokens.typography.fontSize.lg};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const PortfolioItemCard = styled(Card)`
  padding: ${tokens.spacing[4]};
  margin-bottom: ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  justify-content: flex-end;
  margin-top: ${tokens.spacing[6]};
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
    <EditContainer>
      <Title>프로필 편집</Title>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormSection variant="glass">
          <SectionTitle>기본 정보</SectionTitle>

          <FormGroup>
            <Label htmlFor="displayName">이름 *</Label>
            <Input
              id="displayName"
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              required
              placeholder="홍길동"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="jobTitle">직함</Label>
            <Input
              id="jobTitle"
              type="text"
              value={profile.jobTitle}
              onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
              placeholder="Full Stack Developer"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">자기소개</Label>
            <TextArea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="간단한 자기소개를 작성하세요"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
            <Input
              id="profileImageUrl"
              type="url"
              value={profile.profileImageUrl}
              onChange={(e) => setProfile({ ...profile, profileImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </FormGroup>
        </FormSection>

        <FormSection variant="glass">
          <SectionTitle>보유 스킬</SectionTitle>

          <SkillsContainer>
            {profile.skills.map((skill, index) => (
              <SkillTag key={index}>
                {skill}
                <RemoveButton type="button" onClick={() => removeSkill(skill)}>
                  ×
                </RemoveButton>
              </SkillTag>
            ))}
          </SkillsContainer>

          <FormGroup>
            <Label htmlFor="newSkill">새 스킬 추가</Label>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Input
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
              />
              <Button type="button" onClick={addSkill} variant="outline">
                추가
              </Button>
            </div>
          </FormGroup>
        </FormSection>

        <FormSection variant="glass">
          <SectionTitle>소셜 링크</SectionTitle>

          <FormGroup>
            <Label htmlFor="github">GitHub</Label>
            <Input
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
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
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
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
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
            />
          </FormGroup>
        </FormSection>

        <FormSection variant="glass">
          <SectionTitle>포트폴리오</SectionTitle>

          {profile.portfolioItems.map((item, index) => (
            <PortfolioItemCard key={index} variant="bordered">
              <FormGroup>
                <Label>프로젝트 제목</Label>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                  placeholder="프로젝트 이름"
                />
              </FormGroup>

              <FormGroup>
                <Label>설명</Label>
                <TextArea
                  value={item.description}
                  onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                  placeholder="프로젝트 설명"
                />
              </FormGroup>

              <FormGroup>
                <Label>이미지 URL</Label>
                <Input
                  type="url"
                  value={item.imageUrl || ''}
                  onChange={(e) => updatePortfolioItem(index, 'imageUrl', e.target.value)}
                  placeholder="https://example.com/project-image.jpg"
                />
              </FormGroup>

              <FormGroup>
                <Label>프로젝트 링크</Label>
                <Input
                  type="url"
                  value={item.link || ''}
                  onChange={(e) => updatePortfolioItem(index, 'link', e.target.value)}
                  placeholder="https://github.com/username/project"
                />
              </FormGroup>

              <Button
                type="button"
                variant="outline"
                onClick={() => removePortfolioItem(index)}
                style={{ marginTop: tokens.spacing[2] }}
              >
                삭제
              </Button>
            </PortfolioItemCard>
          ))}

          <Button type="button" variant="outline" onClick={addPortfolioItem}>
            + 포트폴리오 항목 추가
          </Button>
        </FormSection>

        <ButtonGroup>
          <Button type="button" variant="outline" onClick={() => router.push('/about')}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </ButtonGroup>
      </Form>
    </EditContainer>
  );
}
