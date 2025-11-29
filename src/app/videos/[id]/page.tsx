/**
 * Videos Post Detail Page - 동영상 상세보기
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';

interface VideoPost {
  id: string;
  title: string;
  content: string | null;
  author: string;
  user_id: string | null;
  video_type: string | null;
  youtube_url: string | null;
  video_url: string | null;
  image_urls: string[];
  view_count: number;
  like_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  video_id: string;
  author: string;
  user_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<VideoPost | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  // 댓글 states
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
    loadPost();
    loadComments();
  }, [id]);

  const loadUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${id}`);
      const data = await response.json();

      if (!data.success) {
        console.error('Error loading post:', data.error);
        alert('게시글을 찾을 수 없습니다.');
        router.push('/videos');
        return;
      }

      setPost(data.post);
    } catch (err) {
      console.error('Error:', err);
      alert('게시글을 불러오는데 실패했습니다.');
      router.push('/videos');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const newLikeCount = liked ? post.like_count - 1 : post.like_count + 1;

      const response = await fetch(`/api/videos/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ like_count: newLikeCount }),
      });

      const data = await response.json();
      if (data.success) {
        setPost({ ...post, like_count: newLikeCount });
        setLiked(!liked);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;
    if (post.user_id !== user.id) {
      alert('본인의 게시글만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      // 파일 삭제
      if (post.video_url) {
        await fetch(`/api/upload?url=${encodeURIComponent(post.video_url)}`, { method: 'DELETE' });
      }
      for (const imageUrl of post.image_urls) {
        await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' });
      }

      // DB에서 삭제 - Use API route
      const response = await fetch(`/api/videos?id=${encodeURIComponent(post.id)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      alert('삭제되었습니다.');
      router.push('/videos');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/videos/${id}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setCommentSubmitting(true);

      const response = await fetch(`/api/videos/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent.trim(),
          author: user.username || user.email || 'Anonymous',
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '댓글 작성에 실패했습니다.');
      }

      setCommentContent('');
      await loadComments();
    } catch (err: any) {
      console.error('Comment error:', err);
      alert(err.message || '댓글 작성에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/videos/${id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '댓글 삭제에 실패했습니다.');
      }

      await loadComments();
    } catch (err: any) {
      console.error('Delete comment error:', err);
      alert(err.message || '댓글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">게시글을 찾을 수 없습니다</h2>
          <Link href="/videos"><button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg">목록으로</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/videos" className="text-red-600 hover:text-red-500 mb-6 inline-block">← 목록으로</Link>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="font-medium">{post.author}</span>
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>👀 {post.view_count}</span>
              <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}>❤️ {post.like_count}</button>
            </div>
          </div>

          {user && user.id === post.user_id && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">삭제</button>
            </div>
          )}
        </div>

        {post.video_type === 'youtube' && post.youtube_url && (
          <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-6">
            <div className="aspect-video">
              <iframe src={`https://www.youtube.com/embed/${extractYouTubeVideoId(post.youtube_url)}`} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            </div>
          </div>
        )}

        {post.video_type === 'upload' && post.video_url && (
          <div className="bg-black rounded-xl overflow-hidden shadow-lg mb-6">
            <video src={post.video_url} controls className="w-full">동영상을 재생할 수 없습니다.</video>
          </div>
        )}

        {post.image_urls && post.image_urls.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">이미지</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.image_urls.map((url, index) => (
                <div key={index} className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image src={url} alt={`Image ${index + 1}`} fill className="object-contain bg-gray-100 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        )}

        {post.content && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">내용</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            댓글 <span className="text-red-500">({comments.length})</span>
          </h2>

          {/* 댓글 작성 폼 */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                disabled={commentSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentContent.trim()}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentSubmitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link href="/auth/login">
                <button className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">로그인</button>
              </Link>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">첫 댓글을 작성해보세요!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
