# Metaldragon Personal Portal

**metaldragon.co.kr** - AI/빅데이터 학습 커뮤니티와 개인 포트폴리오를 결합한 종합 웹 포털

## 🎯 프로젝트 개요

Metaldragon은 AI와 빅데이터 학습 자료 공유, 개인 포트폴리오 전시, 일정 관리, IT 뉴스 큐레이션을 하나의 플랫폼에서 제공하는 개인 포털 사이트입니다.

### 주요 기능

- **게시판 시스템**: AI 스터디, 빅데이터 스터디, 자유게시판, AI 작품 갤러리
- **일정 관리**: 공개/비공개 일정, 반복 일정, 월/주/일 뷰
- **IT 뉴스**: AI, 암호화폐 관련 뉴스 큐레이션
- **YouTube 갤러리**: 커버 영상 임베드 재생
- **문의하기**: 이메일 기반 문의 접수 시스템
- **관리자 CMS**: 모든 콘텐츠를 코딩 없이 웹에서 관리
- **SEO 최적화**: sitemap, robots.txt, 메타태그
- **법적 문서**: 개인정보 처리방침, 이용약관

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - App Router, React Server Components, Server Actions
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안정성
- **Emotion** - CSS-in-JS 스타일링
- **React Big Calendar** - 일정 관리 UI
- **date-fns** - 날짜 처리
- **Lucide React** - 아이콘

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스, 인증, 스토리지
- **Row Level Security (RLS)** - 데이터 보안
- **Real-time Subscriptions** - 실시간 데이터 동기화

### DevOps
- **Git & GitHub** - 버전 관리
- **Vercel** (권장) - 배포 플랫폼

### Design System
- **Glassmorphism 2.0** - 반투명 카드 디자인
- **Kinetic Gradients** - 핑크-오렌지 애니메이션 그라디언트
- **Design Tokens** - 일관된 디자인 시스템

## 📁 프로젝트 구조

```
metaldragon/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # 인증 관련 페이지 (로그인, 회원가입)
│   │   ├── about/               # 프로필 페이지
│   │   ├── admin/               # 관리자 CMS
│   │   │   ├── about/           # 프로필 편집
│   │   │   ├── posts/           # 게시글 관리
│   │   │   ├── ai-artwork/      # AI 작품 관리
│   │   │   ├── news/            # 뉴스 관리
│   │   │   ├── youtube/         # YouTube 링크 관리
│   │   │   ├── contacts/        # 문의 내역 관리
│   │   │   └── components/      # 관리자 전용 컴포넌트
│   │   ├── artworks/            # AI 작품 갤러리
│   │   ├── board/               # 게시판 (ai_study, bigdata_study, free_board, ai_artwork)
│   │   ├── contact/             # 문의하기
│   │   ├── news/                # IT 뉴스
│   │   ├── privacy/             # 개인정보 처리방침
│   │   ├── schedule/            # 일정 관리
│   │   ├── terms/               # 이용약관
│   │   ├── youtube/             # YouTube 갤러리
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 홈페이지
│   │   ├── sitemap.ts           # SEO 사이트맵
│   │   └── robots.ts            # 검색 엔진 크롤러 설정
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── layout/              # 레이아웃 컴포넌트 (Header, Footer)
│   │   └── ui/                  # UI 컴포넌트 (Card, Button 등)
│   ├── lib/                     # 유틸리티 및 설정
│   │   ├── supabase/            # Supabase 클라이언트 설정
│   │   └── styles/              # 디자인 토큰, 글로벌 스타일
│   └── types/                   # TypeScript 타입 정의
├── public/                      # 정적 파일
├── .env.local                   # 환경 변수 (Git 제외)
├── next.config.ts               # Next.js 설정
├── tsconfig.json                # TypeScript 설정
├── package.json                 # 의존성 관리
├── PLAN.md                      # 프로젝트 로드맵
├── PRD.md                       # 제품 요구사항 명세서
└── LLD.md                       # 저수준 설계 문서
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd metaldragon
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xhzqhvjkkfpeavdphoit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Supabase 프로젝트 정보:
- **Project ID**: xhzqhvjkkfpeavdphoit
- **Region**: ap-northeast-2 (Seoul)
- **Database**: PostgreSQL 17.6.1

### 4. Supabase 데이터베이스 설정

#### 필수 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- profile 테이블
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  job_title TEXT,
  bio TEXT,
  profile_image_url TEXT,
  skills TEXT[],
  social_links JSONB,
  portfolio_items JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai_study', 'bigdata_study', 'free_board', 'ai_artwork')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- schedules 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#667eea',
  is_public BOOLEAN DEFAULT false,
  is_all_day BOOLEAN DEFAULT false,
  repeat_type TEXT CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- news 테이블
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'crypto')),
  source TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- youtube_videos 테이블
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- contact_messages 테이블
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Row Level Security (RLS) 설정

```sql
-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- posts 정책
CREATE POLICY "게시글 누구나 조회 가능" ON posts FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자만 작성 가능" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "본인 게시글만 수정 가능" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "본인 게시글만 삭제 가능" ON posts FOR DELETE USING (auth.uid() = author_id);

-- schedules 정책
CREATE POLICY "공개 일정 누구나 조회 가능" ON schedules FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "로그인한 사용자만 일정 작성 가능" ON schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 일정만 수정 가능" ON schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 일정만 삭제 가능" ON schedules FOR DELETE USING (auth.uid() = user_id);

-- news 정책
CREATE POLICY "뉴스 누구나 조회 가능" ON news FOR SELECT USING (true);

-- youtube_videos 정책
CREATE POLICY "YouTube 영상 누구나 조회 가능" ON youtube_videos FOR SELECT USING (true);

-- contact_messages 정책
CREATE POLICY "문의 메시지 누구나 작성 가능" ON contact_messages FOR INSERT WITH CHECK (true);
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🔐 인증 설정

### Supabase Auth 설정

1. Supabase Dashboard > Authentication > Providers
2. Email 활성화
3. (선택) Google, GitHub OAuth 활성화
4. Site URL 설정: `http://localhost:3000` (개발), `https://metaldragon.co.kr` (프로덕션)
5. Redirect URLs 설정:
   - `http://localhost:3000/auth/callback`
   - `https://metaldragon.co.kr/auth/callback`

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### Vercel 배포 (권장)

1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 도메인 설정: `metaldragon.co.kr`
4. 자동 배포 활성화

### 수동 배포

```bash
npm run build
npm run start
```

## 🎨 디자인 시스템

### Design Tokens

`src/lib/styles/tokens.ts`에서 관리:
- **Colors**: Primary(핑크), Secondary(오렌지), Gray 스케일
- **Typography**: 폰트 크기, 굵기
- **Spacing**: 4px 단위 간격 시스템
- **Border Radius**: 라운드 처리
- **Shadows**: 그림자 효과
- **Gradients**: Kinetic 그라디언트

### Glassmorphism 스타일

```typescript
background: rgba(30, 30, 46, 0.6);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## 📊 관리자 기능

관리자 대시보드: `/admin`

### 주요 기능
- **통계 대시보드**: 게시글, 사용자, 뉴스, 영상, 일정, 문의 통계
- **게시글 관리**: CRUD 및 카테고리별 필터링
- **AI 작품 관리**: 이미지 업로드 및 갤러리
- **뉴스 관리**: IT 뉴스 추가/편집
- **YouTube 관리**: 영상 링크 관리
- **문의 관리**: 상태별 필터링 및 이메일 답변

## 📝 라이선스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.

## 👤 작성자

**Metaldragon**
- Website: [https://metaldragon.co.kr](https://metaldragon.co.kr)
- Email: admin@metaldragon.co.kr

## 📚 참고 문서

- [PLAN.md](./PLAN.md) - 프로젝트 로드맵 및 진행 상황
- [PRD.md](./PRD.md) - 제품 요구사항 명세서
- [LLD.md](./LLD.md) - 저수준 설계 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Emotion Documentation](https://emotion.sh/docs/introduction)

---

**Built with ❤️ using Next.js 15 and Supabase**
