/**
 * Terms of Service Page with Tailwind CSS
 * 이용약관
 */

import { Card } from '@/components/ui/Card';

export const metadata = {
  title: '이용약관 - metaldragon',
  description: 'metaldragon.co.kr 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
        이용약관
      </h1>

      <Card padding="lg" className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          최종 수정일: {new Date().toLocaleDateString('ko-KR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제1조 (목적)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            본 약관은 metaldragon.co.kr(이하 "사이트")가 제공하는 모든 서비스(이하 "서비스")의 
            이용조건 및 절차, 이용자와 사이트의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제2조 (정의)
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>"사이트"란 metaldragon.co.kr를 통해 제공하는 서비스를 의미합니다.</li>
            <li>"이용자"란 본 약관에 따라 사이트가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
            <li>"회원"이란 사이트에 개인정보를 제공하여 회원등록을 한 자로서, 사이트의 정보를 지속적으로 제공받으며, 
            사이트가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제3조 (약관의 게시와 개정)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            사이트는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 
            사이트는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제4조 (서비스의 제공 및 변경)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            사이트는 다음과 같은 서비스를 제공합니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>게시판 서비스 (AI 스터디, 빅데이터 스터디, 자유게시판)</li>
            <li>AI 작품 갤러리</li>
            <li>IT 뉴스 피드</li>
            <li>일정 관리</li>
            <li>YouTube 커버 영상 링크 관리</li>
            <li>문의 기능</li>
            <li>기타 사이트가 추가 개발하거나 다른 회사와의 제휴 계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제5조 (서비스의 중단)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            사이트는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 
            서비스의 제공을 일시적으로 중단할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제6조 (회원가입)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            이용자는 사이트가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 
            회원가입을 신청합니다. 사이트는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 
            않는 한 회원으로 등록합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제7조 (회원 탈퇴 및 자격 상실)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            회원은 사이트에 언제든지 탈퇴를 요청할 수 있으며 사이트는 즉시 회원탈퇴를 처리합니다. 
            회원이 다음 각 호의 사유에 해당하는 경우, 사이트는 회원자격을 제한 및 정지시킬 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제8조 (회원에 대한 통지)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            사이트가 회원에 대한 통지를 하는 경우, 회원이 사이트와 미리 약정하여 지정한 
            전자우편 주소로 할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제9조 (게시물의 저작권)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다. 
            회원이 서비스 내에 게시하는 게시물은 검색결과 내지 서비스 및 관련 프로모션 등에 노출될 수 있으며, 
            해당 노출을 위해 필요한 범위 내에서는 일부 수정, 복제, 편집되어 게시될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            제10조 (분쟁 해결)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            사이트와 회원 간 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 하며, 
            서울중앙지방법원을 관할 법원으로 합니다.
          </p>
        </section>
      </Card>
    </div>
  );
}
