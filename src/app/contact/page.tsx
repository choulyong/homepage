/**
 * Contact Page
 * 문의하기 페이지
 */

'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/lib/styles/tokens';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

const ContactContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${tokens.spacing[12]} ${tokens.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: ${tokens.colors.gradients.kinetic};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: ${tokens.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${tokens.typography.fontSize.lg};
  color: ${tokens.colors.gray[400]};
  text-align: center;
  margin-bottom: ${tokens.spacing[8]};
`;

const Form = styled.form``;

const FormCard = styled(Card)`
  padding: ${tokens.spacing[8]};
`;

const FormGroup = styled.div`
  margin-bottom: ${tokens.spacing[6]};
`;

const Label = styled.label`
  display: block;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.gray[300]};
  margin-bottom: ${tokens.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background: ${tokens.colors.gray[800]};
  border: 1px solid ${tokens.colors.gray[600]};
  border-radius: ${tokens.borderRadius.md};
  color: ${tokens.colors.white};
  font-size: ${tokens.typography.fontSize.base};
  min-height: 200px;
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

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: ${tokens.spacing[4]};
  border-radius: ${tokens.borderRadius.md};
  margin-bottom: ${tokens.spacing[6]};
  background: ${(props) =>
    props.$type === 'success' ? `${tokens.colors.success}15` : `${tokens.colors.danger}15`};
  border: 1px solid
    ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
  color: ${(props) => (props.$type === 'success' ? tokens.colors.success : tokens.colors.danger)};
  text-align: center;
`;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: '문의가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.',
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '문의 전송에 실패했습니다. 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContactContainer>
      <Title>문의하기</Title>
      <Subtitle>궁금한 점이 있으시면 언제든 연락주세요</Subtitle>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormCard variant="glass">
          <FormGroup>
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="홍길동"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="subject">제목 *</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="문의 제목을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">메시지 *</Label>
            <TextArea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="문의 내용을 자세히 적어주세요"
            />
          </FormGroup>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? '전송 중...' : '문의 보내기'}
          </Button>
        </FormCard>
      </Form>
    </ContactContainer>
  );
}
