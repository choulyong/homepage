/**
 * Contact Page with Tailwind CSS
 * 문의하기 페이지
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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

      // 1. 데이터베이스에 저장
      const { error: dbError } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (dbError) throw dbError;

      // 2. 이메일 발송
      const emailResponse = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || '이메일 발송 실패');
      }

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text text-center mb-2">
        문의하기
      </h1>
      <p className="text-lg text-gray-600 dark:text-white text-center mb-8">
        궁금한 점이 있으시면 언제든 연락주세요
      </p>

      {/* Success/Error Message */}
      {message && (
        <div
          className={cn(
            'p-4 rounded-lg mb-6 text-center',
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-500 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit}>
        <Card padding="lg">
          <div className="space-y-6">
            {/* Name Field */}
            <Input
              id="name"
              label="이름"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="홍길동"
              fullWidth
            />

            {/* Email Field */}
            <Input
              id="email"
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your@email.com"
              fullWidth
            />

            {/* Subject Field */}
            <Input
              id="subject"
              label="제목"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="문의 제목을 입력하세요"
              fullWidth
            />

            {/* Message Field */}
            <Textarea
              id="message"
              label="메시지"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="문의 내용을 자세히 적어주세요"
              rows={8}
              fullWidth
            />

            {/* Submit Button */}
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? '전송 중...' : '문의 보내기'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Contact Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="text-center">
          <div className="text-3xl mb-3">📧</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">이메일</h3>
          <p className="text-sm text-gray-600 dark:text-white">choulyong@metaldragon.co.kr</p>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">응답 시간</h3>
          <p className="text-sm text-gray-600 dark:text-white">영업일 기준 1-2일 이내</p>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">SNS</h3>
          <p className="text-sm text-gray-600 dark:text-white">GitHub, LinkedIn</p>
        </Card>
      </div>
    </div>
  );
}
