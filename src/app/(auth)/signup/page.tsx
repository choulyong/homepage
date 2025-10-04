/**
 * Signup Page
 * Supabase Auth 회원가입
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

const SignupCard = styled(Card)`
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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createClient();

      // 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('회원가입 성공! 이메일을 확인해주세요.');

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SignupCard variant="glass" padding="lg">
        <Title>회원가입</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSignup}>
          <FormGroup>
            <Label htmlFor="username">사용자 이름</Label>
            <Input
              id="username"
              type="text"
              placeholder="홍길동"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormGroup>

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
              minLength={6}
            />
          </FormGroup>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '회원가입 중...' : '회원가입'}
          </Button>
        </Form>

        <LinkText>
          이미 계정이 있으신가요? <a href="/login">로그인</a>
        </LinkText>
      </SignupCard>
    </Container>
  );
}
