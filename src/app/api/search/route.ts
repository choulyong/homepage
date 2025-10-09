import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();

    // 게시글 검색
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, board_id, title, content, created_at, view_count')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    // 뉴스 검색
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, content, link, created_at')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    // 갤러리 검색
    const { data: gallery, error: galleryError } = await supabase
      .from('gallery')
      .select('id, title, description, image_url, created_at')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    // 영화 검색
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('id, title, description, poster_url, created_at')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    const results = {
      posts: posts || [],
      news: news || [],
      gallery: gallery || [],
      movies: movies || [],
      total: (posts?.length || 0) + (news?.length || 0) + (gallery?.length || 0) + (movies?.length || 0),
    };

    return NextResponse.json({ results, query });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
