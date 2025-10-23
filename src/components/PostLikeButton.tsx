'use client';

import { LikeButton } from './LikeButton';

interface PostLikeButtonProps {
  postId: number | string;
}

export function PostLikeButton({ postId }: PostLikeButtonProps) {
  return <LikeButton targetType="post" targetId={postId} />;
}
