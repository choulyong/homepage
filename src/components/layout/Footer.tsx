/**
 * Footer Component with Tailwind CSS
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">metaldragon</h3>
          <p className="text-sm">현대적인 개인 포털 플랫폼</p>
          <p className="text-sm">AI, 학습, 창작물을 하나의 공간에서</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Boards</h3>
          <Link href="/board/ai_study" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            AI 스터디
          </Link>
          <Link href="/board/bigdata_study" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            빅데이터처리기사
          </Link>
          <Link href="/board/free_board" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            자유게시판
          </Link>
          <Link href="/artworks" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            AI 작품 갤러리
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Features</h3>
          <Link href="/schedule" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            일정 관리
          </Link>
          <Link href="/budget" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            가계부
          </Link>
          <Link href="/news" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            IT 뉴스
          </Link>
          <Link href="/youtube" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            유튜브 커버
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Legal</h3>
          <Link href="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            개인정보 처리방침
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            이용약관
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
            문의하기
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2025 metaldragon.co.kr. All rights reserved.</p>
      </div>
    </footer>
  );
}
