/**
 * Admin YouTube Management - Tailwind CSS
 * YouTube 커버 영상 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { crawlYouTubeVideos, getYouTubeChannelId } from '@/app/actions/crawl';
import { cn } from '@/lib/utils';

export default function AdminYouTubePage() {
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [findingChannel, setFindingChannel] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [channelInput, setChannelInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    description: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20);

    if (data) setVideos(data);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // YouTube ID 추출
      const videoId = extractYouTubeId(formData.youtubeUrl);
      if (!videoId) {
        throw new Error('유효한 YouTube URL이 아닙니다');
      }

      // 썸네일 URL 자동 생성 (입력하지 않은 경우)
      const thumbnailUrl =
        formData.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const { error } = await supabase.from('youtube_videos').insert({
        title: formData.title,
        youtube_url: formData.youtubeUrl,
        thumbnail_url: thumbnailUrl,
        description: formData.description,
        published_at: formData.publishedAt,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'YouTube 영상이 추가되었습니다!' });
      setFormData({
        title: '',
        youtubeUrl: '',
        thumbnailUrl: '',
        description: '',
        publishedAt: new Date().toISOString().split('T')[0],
      });

      loadVideos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 영상을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('youtube_videos').delete().eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: '영상이 삭제되었습니다.' });
      loadVideos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '삭제에 실패했습니다.' });
    }
  };

  const handleCrawl = async () => {
    setCrawling(true);
    setMessage(null);

    try {
      const result = await crawlYouTubeVideos();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadVideos();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '크롤링에 실패했습니다.' });
    } finally {
      setCrawling(false);
    }
  };

  const handleFindChannelId = async () => {
    if (!channelInput.trim()) {
      setMessage({ type: 'error', text: '채널 username 또는 URL을 입력해주세요.' });
      return;
    }

    setFindingChannel(true);
    setMessage(null);

    try {
      const result = await getYouTubeChannelId(channelInput);

      if (result.success && result.channelId) {
        setMessage({
          type: 'success',
          text: `Channel ID를 찾았습니다: ${result.channelId}\n\ncrawl.ts 파일의 YOUTUBE_CHANNEL_ID를 이 값으로 업데이트하세요.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Channel ID를 찾을 수 없습니다.',
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Channel ID 찾기에 실패했습니다.' });
    } finally {
      setFindingChannel(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-indigo-400 bg-clip-text text-transparent">
            YouTube 커버 영상 관리
          </h1>
          <Button variant="primary" onClick={handleCrawl} disabled={crawling}>
            {crawling ? '크롤링 중...' : '🔄 채널에서 자동 가져오기'}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={cn(
            'p-4 rounded-md mb-4 border whitespace-pre-wrap',
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Channel ID 찾기 섹션 */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6 mb-8">
        <h2 className="text-xl text-white mb-4">🔍 YouTube Channel ID 찾기</h2>
        <p className="text-sm text-gray-400 mb-4">
          YouTube RSS 크롤링을 사용하려면 먼저 Channel ID를 찾아 설정해야 합니다.
          <br />
          채널 username (예: Metaldragon_82) 또는 채널 URL을 입력하세요.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            placeholder="채널 username 또는 https://www.youtube.com/@username"
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500"
            onKeyPress={(e) => e.key === 'Enter' && handleFindChannelId()}
          />
          <Button variant="primary" onClick={handleFindChannelId} disabled={findingChannel}>
            {findingChannel ? '찾는 중...' : 'Channel ID 찾기'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-6">
          <h2 className="text-xl text-white mb-4">새 영상 추가</h2>

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              제목 *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="커버 영상 제목"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL *
            </label>
            <input
              id="youtubeUrl"
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="thumbnailUrl"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              썸네일 URL (선택사항 - 자동 생성됨)
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://img.youtube.com/vi/..."
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              설명
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="영상에 대한 간단한 설명"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white min-h-[80px] resize-y font-[inherit] focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-300 mb-2">
              발행일
            </label>
            <input
              id="publishedAt"
              type="date"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} fullWidth>
            {loading ? '추가 중...' : '영상 추가'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl text-white mb-4">등록된 영상</h2>
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/18 rounded-lg p-4 flex gap-4 items-center"
          >
            {video.thumbnail_url && (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-40 h-[90px] object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-400 hover:underline"
              >
                {video.youtube_url}
              </a>
            </div>
            <Button variant="outline" onClick={() => handleDelete(video.id)}>
              삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
