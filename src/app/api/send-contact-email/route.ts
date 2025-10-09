/**
 * Contact Email API
 * Resend를 사용하여 문의 메일 발송
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Contact email API called');
    const { name, email, subject, message } = await request.json();
    console.log('📧 Request data:', { name, email, subject });

    // 입력 검증
    if (!name || !email || !subject || !message) {
      console.log('❌ Validation failed: missing fields');
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('📧 Sending email via Resend...');
    // 이메일 발송
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'choulyong@gmail.com',
      replyTo: email,
      subject: `[문의] ${subject}`,
      html: `
        <h2>새로운 문의가 도착했습니다</h2>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>제목:</strong> ${subject}</p>
        <hr />
        <h3>메시지:</h3>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Email API error:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
