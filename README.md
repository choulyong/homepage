# 🐉 metaldragon.co.kr

> 현대적인 개인 포털 - AI 학습, 재무 관리, 창작물 공유를 하나의 플랫폼에서

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## ✨ 주요 기능

### 📚 학습 & 커뮤니티
- **AI 스터디 게시판**: AI/ML 학습 내용 공유 및 토론
- **빅데이터 자격증 스터디**: 빅데이터처리기사 자격증 준비
- **자유게시판**: 일상 및 자유 주제 소통
- **실시간 댓글**: Supabase Realtime 기반 실시간 댓글 시스템

### 🎨 창작 & 포트폴리오
- **AI 작품 갤러리**: AI 생성 이미지, 영상, 음악, 문서 전시
- **YouTube 커버 영상**: 노래 커버 영상 링크 관리
- **포트폴리오**: 프로젝트 소개 및 기술 스택 전시

### 📰 정보 & 유틸리티
- **IT 뉴스 피드**: AI, 암호화폐 관련 뉴스 자동 수집
- **일정 관리**: 캘린더 기반 개인/공개 일정 관리 (반복 일정 지원)
- **가계부**: 수입/지출 기록 및 월별 통계 차트
- **문의하기**: 방문자 문의 및 피드백 수집

### 🛠️ 관리자 기능
- **통합 대시보드**: 모든 콘텐츠 통계 및 관리
- **CMS 시스템**: 웹에서 직접 모든 콘텐츠 편집 가능
- **사용자 관리**: 회원 관리 및 권한 설정

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom component library (Button, Card, Input, etc.)
- **State Management**: React Query (@tanstack/react-query)
- **Animation**: Framer Motion, AOS

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Storage**: Supabase Storage (이미지, 파일)
- **Realtime**: Supabase Realtime (댓글, 알림)

### DevOps & Monitoring
- **Caching**: Upstash Redis
- **Logging**: Loki + Grafana
- **Deployment**: Docker + Nginx
- **DNS/CDN**: Cloudflare

---

## 🚀 로컬 개발 환경 세팅

### 1. 필수 요구사항
- Node.js 20.x 이상
- npm 또는 yarn
- Git

### 2. 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/metaldragon.git
cd metaldragon
```

### 3. 패키지 설치
```bash
npm install
```

### 4. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis (선택사항)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# YouTube API (선택사항)
YOUTUBE_API_KEY=your_youtube_api_key

# Email (선택사항)
RESEND_API_KEY=your_resend_api_key
```

### 5. 데이터베이스 마이그레이션
```bash
npm run db:push
```

### 6. 개발 서버 실행
```bash
npm run dev
```

서버가 시작되면 http://localhost:3000 에서 확인할 수 있습니다.

---

## 📦 주요 스크립트

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행

npm run db:generate  # Drizzle 마이그레이션 생성
npm run db:migrate   # 마이그레이션 실행
npm run db:push      # 스키마를 DB에 직접 푸시
npm run db:studio    # Drizzle Studio 실행
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: Teal (#14b8a6)
- **Secondary**: Indigo (#6366f1)
- **Gradient**: Teal to Indigo (135deg)

### 타이포그래피
- **Display Font**: Red Hat Display (제목, 로고)
- **Body Font**: Inter (본문, UI)

### 주요 컴포넌트
- `Button`: 4 variants (primary, secondary, outline, ghost), 3 sizes
- `Card`: 3 variants (default, bordered, featured)
- `Input`, `Textarea`, `Select`: 통일된 폼 컴포넌트
- `DarkModeToggle`: 다크 모드 전환 (localStorage 저장)

---

## 📂 프로젝트 구조

```
metaldragon/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   ├── admin/             # 관리자 페이지
│   │   ├── board/             # 게시판 페이지
│   │   ├── about/             # 자기소개 페이지
│   │   ├── contact/           # 문의 페이지
│   │   ├── news/              # 뉴스 페이지
│   │   ├── youtube/           # YouTube 링크 페이지
│   │   ├── artworks/          # AI 작품 갤러리
│   │   ├── schedule/          # 일정 관리
│   │   ├── sitemap.ts         # SEO 사이트맵
│   │   ├── robots.ts          # SEO robots.txt
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── supabase/         # Supabase 클라이언트
│   │   ├── db/               # Drizzle ORM 스키마
│   │   └── utils.ts          # 공통 유틸리티
│   └── contexts/              # React Context
├── public/                    # 정적 파일
├── drizzle/                   # DB 마이그레이션
├── docker-compose.yml         # Docker 설정
└── package.json
```

---

## 🔐 보안

- **인증**: Supabase Auth (JWT 토큰 기반)
- **권한 관리**: Row Level Security (RLS)
- **환경변수**: `.env.local`에서 관리 (절대 Git에 포함 금지)
- **HTTPS**: Cloudflare SSL/TLS (Full Strict)

---

## 📈 성능 최적화

- ✅ Next.js Image 컴포넌트로 이미지 최적화
- ✅ Tailwind CSS JIT 모드로 번들 크기 최소화
- ✅ Turbopack으로 빠른 빌드
- ✅ Redis 캐싱으로 API 응답 속도 향상
- ✅ 코드 스플리팅 (동적 임포트)

---

## 🌐 배포

### Docker 배포
```bash
docker-compose up -d --build
```

### 환경변수 설정
프로덕션 환경에서는 `.env.production` 파일을 사용하거나 Docker secrets를 활용하세요.

---

## 📝 라이선스

이 프로젝트는 개인 포트폴리오 프로젝트입니다.

---

## 📞 문의

- **Website**: https://metaldragon.co.kr
- **Email**: choulyong@metaldragon.co.kr

---

**Built with ❤️ by metaldragon**
