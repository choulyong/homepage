'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  users: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentsSectionProps {
  targetType: 'post' | 'gallery' | 'movie' | 'news';
  targetId: number;
}

export function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
    loadUser();
  }, [targetType, targetId]);

  const loadUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadComments = async () => {
    try {
      const response = await fetch(
        `/api/comments?targetType=${targetType}&targetId=${targetId}`
      );
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          content: newComment,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        await loadComments();
      } else {
        const error = await response.json();
        alert(error.error || '댓글 작성 실패');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          content: editContent,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        await loadComments();
      } else {
        const error = await response.json();
        alert(error.error || '댓글 수정 실패');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('댓글 수정 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadComments();
      } else {
        const error = await response.json();
        alert(error.error || '댓글 삭제 실패');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제 중 오류가 발생했습니다');
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isAuthor = currentUser?.id === comment.user_id;
    const isEditing = editingId === comment.id;
    const replies = comments.filter((c) => c.parent_id === comment.id);

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-4' : 'mt-4'}`}
      >
        <Card padding="md" className="bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-medium">
              {comment.users?.username?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.users?.username || '익명'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (수정됨)
                  </span>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(comment.id)}
                      disabled={submitting}
                    >
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-3">
                    {currentUser && !isReply && (
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-500"
                      >
                        답글
                      </button>
                    )}
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-500"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-4">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          댓글
        </h2>
        <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
      </div>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        댓글 {comments.length}개
      </h2>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-teal-600 dark:text-teal-400">
                답글 작성 중
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                취소
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? '작성 중...' : '댓글 작성'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            댓글을 작성하려면 로그인이 필요합니다
          </p>
        </div>
      )}

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          첫 댓글을 작성해보세요
        </p>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
