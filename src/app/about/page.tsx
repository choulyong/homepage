/**
 * About Page (Public)
 * 프로필 정보를 보여주는 공개 페이지
 */

import { createClient } from '@/lib/supabase/server';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import Link from 'next/link';

const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[8]};
  margin-bottom: ${tokens.spacing[12]};
  padding: ${tokens.spacing[8]};
  background: ${tokens.colors.glass.medium};
  backdrop-filter: blur(20px);
  border-radius: ${tokens.borderRadius.xl};
  border: 1px solid ${tokens.colors.glass.light};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImage = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid transparent;
  background: ${tokens.colors.gradients.kinetic};
  padding: 4px;

  img {
    border-radius: 50%;
    object-fit: cover;
  }
`;

const HeroContent = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: ${tokens.spacing[2]};
`;

const JobTitle = styled.h2`
  font-size: ${tokens.typography.fontSize.xl};
  color: ${tokens.colors.gray[300]};
  margin-bottom: ${tokens.spacing[4]};
`;

const Bio = styled.p`
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.gray[400]};
  line-height: 1.8;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  margin-top: ${tokens.spacing[4]};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${tokens.colors.glass.light};
  color: ${tokens.colors.white};
  transition: all ${tokens.transitions.base};

  &:hover {
    background: ${tokens.colors.gradients.kinetic};
    transform: translateY(-2px);
  }
`;

const Section = styled.section`
  margin-bottom: ${tokens.spacing[12]};
`;

const SectionTitle = styled.h3`
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
  margin-bottom: ${tokens.spacing[6]};
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${tokens.spacing[4]};
`;

const SkillCard = styled(Card)`
  padding: ${tokens.spacing[4]};
  text-align: center;
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.white};
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};
`;

const PortfolioCard = styled(Card)`
  padding: ${tokens.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const PortfolioTitle = styled.h4`
  font-size: ${tokens.typography.fontSize.xl};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.white};
`;

const PortfolioDescription = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[400]};
  line-height: 1.6;
`;

const PortfolioTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[2]};
`;

const Tag = styled.span`
  padding: ${tokens.spacing[1]} ${tokens.spacing[3]};
  background: ${tokens.colors.glass.light};
  border-radius: ${tokens.borderRadius.full};
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.gray[300]};
`;

const EditButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
  background: ${tokens.colors.gradients.kinetic};
  color: ${tokens.colors.white};
  font-weight: ${tokens.typography.fontWeight.medium};
  border-radius: ${tokens.borderRadius.md};
  transition: all ${tokens.transitions.base};
  margin-bottom: ${tokens.spacing[8]};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(240, 147, 251, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${tokens.spacing[12]};
  color: ${tokens.colors.gray[400]};
`;

export default async function AboutPage() {
  const supabase = await createClient();

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 프로필 데이터 가져오기 (첫 번째 프로필 사용)
  const { data: profile } = await supabase.from('profile').select('*').limit(1).single();

  if (!profile) {
    return (
      <AboutContainer>
        <EmptyState>
          <h2>프로필 정보가 없습니다</h2>
          <p>관리자 페이지에서 프로필을 생성하세요</p>
          {user && (
            <EditButton href="/admin/about">프로필 생성하기</EditButton>
          )}
        </EmptyState>
      </AboutContainer>
    );
  }

  return (
    <AboutContainer>
      {user && <EditButton href="/admin/about">✏️ 프로필 편집</EditButton>}

      <Hero>
        <ProfileImage>
          <Image
            src={profile.profileImageUrl || '/placeholder-avatar.png'}
            alt={profile.displayName}
            width={200}
            height={200}
          />
        </ProfileImage>
        <HeroContent>
          <Name>{profile.displayName}</Name>
          {profile.jobTitle && <JobTitle>{profile.jobTitle}</JobTitle>}
          {profile.bio && <Bio>{profile.bio}</Bio>}

          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <SocialLinks>
              {profile.socialLinks.github && (
                <SocialLink
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </SocialLink>
              )}
              {profile.socialLinks.linkedin && (
                <SocialLink
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </SocialLink>
              )}
              {profile.socialLinks.twitter && (
                <SocialLink
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </SocialLink>
              )}
              {profile.socialLinks.youtube && (
                <SocialLink
                  href={profile.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </SocialLink>
              )}
            </SocialLinks>
          )}
        </HeroContent>
      </Hero>

      {profile.skills && profile.skills.length > 0 && (
        <Section>
          <SectionTitle>보유 스킬</SectionTitle>
          <SkillsGrid>
            {profile.skills.map((skill, index) => (
              <SkillCard key={index} variant="glass">
                {skill}
              </SkillCard>
            ))}
          </SkillsGrid>
        </Section>
      )}

      {profile.portfolioItems && profile.portfolioItems.length > 0 && (
        <Section>
          <SectionTitle>포트폴리오</SectionTitle>
          <PortfolioGrid>
            {profile.portfolioItems.map((item, index) => (
              <PortfolioCard key={index} variant="glass">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={300}
                    height={200}
                    style={{ borderRadius: tokens.borderRadius.md }}
                  />
                )}
                <PortfolioTitle>{item.title}</PortfolioTitle>
                <PortfolioDescription>{item.description}</PortfolioDescription>
                {item.tags && item.tags.length > 0 && (
                  <PortfolioTags>
                    {item.tags.map((tag, tagIndex) => (
                      <Tag key={tagIndex}>{tag}</Tag>
                    ))}
                  </PortfolioTags>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: tokens.colors.primary[400] }}
                  >
                    프로젝트 보기 →
                  </a>
                )}
              </PortfolioCard>
            ))}
          </PortfolioGrid>
        </Section>
      )}
    </AboutContainer>
  );
}
