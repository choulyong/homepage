/**
 * AI Rock Art Page - METALDRAGON Rock Community
 */

export default async function RockArtPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">🎨 AI Rock Art</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI로 창작한 Rock 테마 아트워크
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-12 text-center">
          <div className="text-8xl mb-6">🎨</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI Rock Art Gallery
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            AI 기술로 생성된 Rock 테마의 독창적인 아트워크들을 감상하세요.
            곧 다양한 스타일의 Rock Art가 추가될 예정입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { emoji: '🎸', title: 'Electric Guitar', desc: 'AI가 그린 일렉트릭 기타' },
              { emoji: '🤘', title: 'Rock Signs', desc: '락 제스처 아트워크' },
              { emoji: '🎵', title: 'Music Notes', desc: '음표와 멜로디의 시각화' },
              { emoji: '🔥', title: 'Fire & Energy', desc: '불꽃 튀는 록 에너지' },
              { emoji: '💀', title: 'Skull Art', desc: '헤비메탈 스타일 해골' },
              { emoji: '⚡', title: 'Lightning', desc: '번개와 파워' },
            ].map((art, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-zinc-800"
              >
                <div className="text-6xl mb-4">{art.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {art.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {art.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
