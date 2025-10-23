/**
 * Contact Page - METALDRAGON Rock Community
 */

export default async function ContactPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">📧</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Contact Us</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            METALDRAGON에 대한 문의, 제안, 피드백을 기다립니다
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Email
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              문의 사항을 이메일로 보내주세요
            </p>
            <a
              href="mailto:contact@metaldragon.rocks"
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              contact@metaldragon.rocks
            </a>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Community
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              커뮤니티 게시판에서 자유롭게 소통하세요
            </p>
            <a
              href="/community"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              커뮤니티 바로가기 →
            </a>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Social Media
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              소셜 미디어에서 만나요
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/metaldragon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://twitter.com/metaldragon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 mb-12 shadow-md border border-gray-200 dark:border-zinc-800">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'METALDRAGON은 어떤 서비스인가요?',
                a: 'Rock 음악을 사랑하는 전 세계 팬들을 위한 커뮤니티 플랫폼입니다. 밴드 정보, 앨범 리뷰, 콘서트 일정, 뉴스 등 Rock 음악과 관련된 모든 것을 제공합니다.',
              },
              {
                q: '회원 가입 없이도 이용할 수 있나요?',
                a: '대부분의 콘텐츠는 로그인 없이 열람 가능합니다. 다만 리뷰 작성, 댓글, 커뮤니티 참여 등은 회원 가입이 필요합니다.',
              },
              {
                q: '밴드나 앨범 정보를 추가할 수 있나요?',
                a: '네! 커뮤니티 회원이라면 누구나 밴드, 앨범, 콘서트 정보를 추가하고 수정할 수 있습니다. 모든 정보는 커뮤니티 멤버들과 함께 만들어갑니다.',
              },
              {
                q: '광고나 협업 문의는 어떻게 하나요?',
                a: 'contact@metaldragon.rocks로 이메일을 보내주시면 검토 후 답변드리겠습니다.',
              },
              {
                q: '버그나 개선 사항을 제안하고 싶어요',
                a: '커뮤니티 게시판의 "건의사항" 카테고리에 글을 남겨주시거나, GitHub Issues를 통해 제안해주세요.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-zinc-800 pb-6 last:border-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Q. {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  A. {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-purple-500/10 rounded-xl p-6 text-center">
          <div className="text-5xl mb-4">⏱️</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            응답 시간
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            일반적으로 영업일 기준 1-3일 이내에 답변드립니다.
            <br />
            긴급한 문의는 제목에 [긴급]을 표시해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
