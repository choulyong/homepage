/**
 * About METALDRAGON - Rock Community
 */

export default async function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-8xl mb-6">🎸</div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">METALDRAGON</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
            Rock Community
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Since 2025 · 전 세계 Rock 음악 팬들의 공간
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-red-500/10 via-amber-500/10 to-purple-500/10 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="gradient-text">Our Mission</span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-3xl mx-auto">
            METALDRAGON은 Rock 음악을 사랑하는 모든 이들을 위한 커뮤니티입니다.
            클래식 록부터 헤비메탈, 펑크 록까지 모든 장르의 Rock 음악을 탐험하고,
            전 세계 팬들과 소통하며, Rock 문화를 함께 즐기는 공간을 만들어갑니다.
          </p>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="gradient-text">What We Offer</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: '🎸',
                title: 'Comprehensive Band Database',
                description: '전 세계 Rock 밴드들의 상세한 정보와 디스코그래피를 제공합니다',
              },
              {
                icon: '💿',
                title: 'Album Reviews & Ratings',
                description: '명반들에 대한 깊이 있는 리뷰와 커뮤니티 평가 시스템',
              },
              {
                icon: '🎤',
                title: 'Concert Information',
                description: '전 세계 Rock 콘서트와 페스티벌 일정 및 티켓 정보',
              },
              {
                icon: '📰',
                title: 'Rock News & Articles',
                description: '최신 Rock 음악 소식과 심층 분석 기사',
              },
              {
                icon: '🎬',
                title: 'Music Videos & Live Performances',
                description: '명곡들의 뮤직비디오와 전설적인 라이브 공연 영상',
              },
              {
                icon: '💬',
                title: 'Active Community',
                description: 'Rock 팬들과 자유롭게 소통하고 의견을 나누는 커뮤니티',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-800"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="gradient-text">Community Stats</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '1,000+', label: 'Rock Bands' },
              { number: '5,000+', label: 'Albums' },
              { number: '500+', label: 'Concert Reviews' },
              { number: '10,000+', label: 'Community Members' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="gradient-text">Our Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤘',
                title: 'Passion',
                description: 'Rock에 대한 열정과 진정성을 최우선으로 합니다',
              },
              {
                icon: '🌍',
                title: 'Diversity',
                description: '모든 장르의 Rock 음악과 다양한 의견을 존중합니다',
              },
              {
                icon: '🎯',
                title: 'Quality',
                description: '정확하고 깊이 있는 정보와 콘텐츠를 제공합니다',
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-lg p-6 text-center shadow-md border border-gray-200 dark:border-zinc-800"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Rock Community</h2>
          <p className="text-lg mb-6 opacity-90">
            지금 바로 METALDRAGON 커뮤니티에 참여하여 전 세계 Rock 팬들과 함께하세요
          </p>
          <a
            href="/community"
            className="inline-block px-8 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            커뮤니티 둘러보기 →
          </a>
        </div>
      </div>
    </div>
  );
}
