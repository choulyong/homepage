/**
 * Privacy Policy Page with Tailwind CSS
 * 개인정보 처리방침
 */

import { Card } from '@/components/ui/Card';

export const metadata = {
  title: '개인정보 처리방침 - metaldragon',
  description: 'metaldragon.co.kr 개인정보 처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        개인정보 처리방침
      </h1>

      <Card padding="lg" className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-white mb-8">
          최종 수정일: {new Date().toLocaleDateString('ko-KR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. 개인정보의 수집 및 이용 목적
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            metaldragon.co.kr(이하 "사이트")는 다음의 목적을 위하여 개인정보를 수집하고 있습니다:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-gray-700 dark:text-gray-300">
            <li>회원 가입 및 관리</li>
            <li>서비스 제공 및 개선</li>
            <li>문의 및 고객 지원</li>
            <li>게시판 및 댓글 기능 제공</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. 수집하는 개인정보 항목
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>필수 항목: 이메일, 비밀번호</li>
            <li>선택 항목: 프로필 이미지, 사용자 이름</li>
            <li>자동 수집: IP 주소, 쿠키, 접속 로그, 서비스 이용 기록</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            회원 탈퇴 시까지 개인정보를 보유하며, 탈퇴 즉시 모든 개인정보는 삭제됩니다. 
            단, 관련 법령에 따라 일정 기간 보관해야 하는 경우는 예외로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. 개인정보의 제3자 제공
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            당사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
            다만, 법령의 규정에 의한 경우는 예외로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            5. 이용자의 권리
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 
            회원 탈퇴를 통해 개인정보의 삭제를 요청할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            6. 개인정보 보호책임자
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            개인정보에 관한 문의사항이 있으시면 아래 연락처로 문의해 주시기 바랍니다.
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>이메일:</strong> choulyong@metaldragon.co.kr
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            7. 개인정보 처리방침 변경
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 
            삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>
      </Card>
    </div>
  );
}
