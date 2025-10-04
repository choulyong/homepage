/**
 * Login Page
 * Supabase Auth 로그인
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${tokens.spacing[6]};
  background: ${tokens.colors.gradients.dark};
`;

const LoginCard = styled(Card)`
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${tokens.spacing[8]};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
`;

const Label = styled.label`
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[700]};
`;

const Input = styled.input`
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border: 1px solid ${tokens.colors.gray[300]};
  border-radius: ${tokens.borderRadius.md};
  font-size: ${tokens.typography.fontSize.base};
  transition: all ${tokens.transitions.base};

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary[500]};
    box-shadow: 0 0 0 3px ${tokens.colors.primary[100]};
  }

  &::placeholder {
    color: ${tokens.colors.gray[400]};
  }
`;

const ErrorMessage = styled.div`
  padding: ${tokens.spacing[3]};
  background: ${tokens.colors.danger}15;
  border: 1px solid ${tokens.colors.danger};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.danger};
  font-size: ${tokens.typography.fontSize.sm};
`;

const SuccessMessage = styled.div`
  padding: ${tokens.spacing[3]};
  background: ${tokens.colors.success}15;
  border: 1px solid ${tokens.colors.success};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.success};
  font-size: ${tokens.typography.fontSize.sm};
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.gray[600]};

  a {
    color: ${tokens.colors.primary[600]};
    font-weight: ${tokens.typography.fontWeight.medium};
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[4]};
  margin: ${tokens.spacing[6]} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${tokens.colors.gray[300]};
  }

  span {
    color: ${tokens.colors.gray[500]};
    font-size: ${tokens.typography.fontSize.sm};
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccess('로그인 성공! 리다이렉팅...');
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'GitHub 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard variant="glass" padding="lg">
        <Title>로그인</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleEmailLogin}>
          <FormGroup>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>

        <Divider>
          <span>또는</span>
        </Divider>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Google로 로그인
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGithubLogin}
            disabled={loading}
          >
            GitHub로 로그인
          </Button>
        </div>

        <LinkText>
          계정이 없으신가요? <a href="/signup">회원가입</a>
        </LinkText>
      </LoginCard>
    </Container>
  );
}
