'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { sanitizeComment } from '@/lib/sanitize';
import {
  validateContent,
  validateGuestName,
  validateGuestPassword,
} from '@/lib/validation';

interface Comment {
  id: string;
  user_id: string | null;
  author_name: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface CommentsSectionProps {
  targetType: 'post' | 'gallery' | 'movie' | 'news';
  targetId: number | string;
}

export function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');
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

    // Validate content
    const contentValidation = validateContent(newComment);
    if (!contentValidation.valid) {
      alert(contentValidation.error);
      return;
    }

    // Validation for guest comments
    if (!currentUser) {
      if (!guestName.trim() || !guestPassword.trim()) {
        alert('이름과 비밀번호를 입력해주세요');
        return;
      }

      // Validate guest name
      const nameValidation = validateGuestName(guestName);
      if (!nameValidation.valid) {
        alert(nameValidation.error);
        return;
      }

      // Validate guest password
      const passwordValidation = validateGuestPassword(guestPassword);
      if (!passwordValidation.valid) {
        alert(passwordValidation.error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        targetType,
        targetId,
        content: newComment,
        parentId: replyTo,
      };

      // Add guest info if not authenticated
      if (!currentUser) {
        payload.authorName = guestName;
        payload.authorPassword = guestPassword;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewComment('');
        setGuestName('');
        setGuestPassword('');
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

  const handleEdit = async (commentId: string, isGuest: boolean) => {
    if (!editContent.trim()) return;

    // Require password for guest comments
    if (isGuest && !editPassword.trim()) {
      alert('비밀번호를 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        commentId,
        content: editContent,
      };

      if (isGuest) {
        payload.password = editPassword;
      }

      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        setEditPassword('');
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

  const handleDelete = async (commentId: string, isGuest: boolean) => {
    let password = '';
    if (isGuest) {
      password = prompt('비밀번호를 입력하세요:') || '';
      if (!password) return;
    }

    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    setSubmitting(true);
    try {
      // SECURITY FIX: Send password in request body, NOT in URL
      const response = await fetch('/api/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          password: isGuest ? password : undefined,
        }),
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
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentAuthorName = (comment: Comment) => {
    if (comment.user_id && comment.user) {
      return comment.user.username || '익명';
    }
    return comment.author_name || '손님';
  };

  const isCommentEditable = (comment: Comment) => {
    if (comment.user_id) {
      return currentUser?.id === comment.user_id;
    }
    return true; // Guest comments are editable with password
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isGuest = !comment.user_id;
    const isEditable = isCommentEditable(comment);
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
              {getCommentAuthorName(comment)[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {getCommentAuthorName(comment)}
                  {isGuest && <span className="text-xs text-gray-500 ml-1">(손님)</span>}
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
                  {isGuest && (
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="비밀번호"
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    />
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(comment.id, isGuest)}
                      disabled={submitting}
                    >
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                        setEditPassword('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {sanitizeComment(comment.content)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-3">
                    {!isReply && (
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-500"
                      >
                        답글
                      </button>
                    )}
                    {isEditable && (
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
                          onClick={() => handleDelete(comment.id, isGuest)}
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

        {/* Guest name/password fields */}
        {!currentUser && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="이름"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
              required
            />
            <input
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              placeholder="비밀번호 (수정/삭제시 필요)"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-teal-500"
          rows={3}
          required
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
