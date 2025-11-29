/**
 * Footer Component - METALDRAGON Rock Community
 * Fire Red & Rock Gold theme with dark metal background
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 px-6 mt-auto border-t border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
            METALDRAGON
          </h3>
          <p className="text-sm">🎸 전 세계 Rock 음악 팬들을 위한</p>
          <p className="text-sm">통합 커뮤니티 플랫폼</p>
          <p className="text-xs text-zinc-500 mt-2">
            Unleash the Power of Rock
          </p>
        </div>

        {/* Rock Content Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Rock Content</h3>
          <Link href="/bands" className="text-zinc-400 hover:text-red-400 transition-colors text-sm">
            밴드 데이터베이스
          </Link>
          <Link href="/albums" className="text-zinc-400 hover:text-red-400 transition-colors text-sm">
            앨범 리뷰
          </Link>
          <Link href="/concerts" className="text-zinc-400 hover:text-red-400 transition-colors text-sm">
            콘서트 일정
          </Link>
          <Link href="/gallery" className="text-zinc-400 hover:text-red-400 transition-colors text-sm">
            회원동영상
          </Link>
          <Link href="/rock-art" className="text-zinc-400 hover:text-red-400 transition-colors text-sm">
            AI Rock Art
          </Link>
        </div>

        {/* Community Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Community</h3>
          <Link href="/community" className="text-zinc-400 hover:text-amber-400 transition-colors text-sm">
            커뮤니티 게시판
          </Link>
          <Link href="/news" className="text-zinc-400 hover:text-amber-400 transition-colors text-sm">
            Rock 뉴스
          </Link>
          <Link href="/gallery" className="text-zinc-400 hover:text-amber-400 transition-colors text-sm">
            포토 갤러리
          </Link>
          <Link href="/videos" className="text-zinc-400 hover:text-amber-400 transition-colors text-sm">
            유튜브 비디오
          </Link>
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Info</h3>
          <Link href="/about" className="text-zinc-400 hover:text-purple-400 transition-colors text-sm">
            About Us
          </Link>
          <Link href="/contact" className="text-zinc-400 hover:text-purple-400 transition-colors text-sm">
            Contact
          </Link>
          <Link href="/privacy" className="text-zinc-400 hover:text-purple-400 transition-colors text-sm">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-zinc-400 hover:text-purple-400 transition-colors text-sm">
            Terms of Service
          </Link>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900 text-center">
        <p className="text-zinc-500 text-sm mb-2">
          🎸 Powered by Rock & Metal 🎸
        </p>
        <p className="text-zinc-600 text-xs">
          © 2025 METALDRAGON - Rock Community Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
