# PLAN: Rock Community 구현 계획

> **프로젝트**: Rock Community - The Ultimate Rock Music Hub
> **시작일**: 2025-10-23
> **예상 완료**: 2026-01-31 (13주)
> **문서 버전**: 2.0 (Rock Community Edition)

---

## 📋 프로젝트 개요

이 문서는 Rock Community 플랫폼의 단계별 구현 계획입니다.
**PRD.md**와 **LLD.md**를 기반으로 작성되었으며, 각 Phase별 상세 작업 체크리스트와 완료 조건을 정의합니다.

### 핵심 원칙
- ✅ **실제 데이터만 사용** (가짜/데모 데이터 절대 금지)
- ✅ **PRD 범위 엄수** (스코프 크리프 방지)
- ✅ **단계별 완료 후 다음 단계 진행**
- ✅ **각 Phase 완료 시 PLAN.md 업데이트 및 GitHub 반영**

---

## 🎯 전체 로드맵

```
Phase 1: 핵심 기능 구축 (4주)          ← 시작 단계
  ├─ Week 1-2: 프로젝트 세팅 및 인증
  ├─ Week 3: 밴드 데이터베이스
  └─ Week 4: 커뮤니티 게시판

Phase 2: 공연 일정 및 뉴스 자동화 (3주)
  ├─ Week 5: 공연 일정 시스템
  ├─ Week 6: Rock 뉴스 자동 업데이트
  └─ Week 7: 포토 갤러리

Phase 3: AI 아트 및 YouTube (3주)
  ├─ Week 8: AI Rock Art 게시판
  ├─ Week 9: YouTube Rock 영상 관리
  └─ Week 10: 문의 기능 및 통합

Phase 4: 관리자 도구 및 최적화 (2주)
  ├─ Week 11: 관리자 대시보드
  └─ Week 12: 모니터링 및 최적화

Phase 5: 런칭 및 안정화 (1주)
  └─ Week 13: 도메인 연결 및 런칭
```

---

## 📊 진행 상황 요약

| Phase | 상태 | 완료율 | 시작일 | 완료일 |
|-------|------|--------|--------|--------|
| Phase 1 | 🟡 In Progress | 50% | 2025-10-23 | - |
| Phase 2 | ⬜ Not Started | 0% | - | - |
| Phase 3 | ⬜ Not Started | 0% | - | - |
| Phase 4 | ⬜ Not Started | 0% | - | - |
| Phase 5 | ⬜ Not Started | 0% | - | - |

**전체 진행률**: 50% (Week 3/13주)

**최근 업데이트**: 2025-10-23 - ✅ **Week 1-3 완료!** 홈페이지 Rock 테마 완성, 밴드 데이터베이스 페이지 구현 완료

---

## Phase 1: 핵심 기능 구축 (4주)

**목표**: 인증 시스템, 밴드 데이터베이스, 커뮤니티 게시판 구축
**기간**: Week 1 ~ Week 4
**상태**: 🟡 In Progress (Week 1-2 진행 중)

### Week 1-2: 프로젝트 세팅 및 인증 시스템

#### 1.1 개발 환경 세팅
- [x] Next.js 15 프로젝트 세팅 확인
- [x] Rock Community 테마로 디자인 시스템 재구성
- [x] 필수 패키지 설치 확인
- [x] GitHub 저장소 연결

#### 1.2 Supabase 프로젝트 재구성
- [x] 환경변수 설정 확인
- [x] Supabase Client 유틸리티 확인
- [x] Middleware 설정 확인

#### 1.3 Drizzle ORM 스키마 재정의
- [x] Rock Community DB 스키마 정의
  - [x] `bands.ts` (밴드)
  - [x] `albums.ts` (앨범)
  - [x] `artists.ts` (아티스트)
  - [x] `band_members.ts` (밴드 멤버)
  - [x] `concerts.ts` (공연)
  - [x] `reviews.ts` (앨범 리뷰)
  - [x] `concert_reviews.ts` (공연 리뷰)
  - [x] `posts.ts` (게시글)
  - [x] `categories.ts` (카테고리)
  - [x] `comments.ts` (댓글)
  - [x] `news.ts` (뉴스)
  - [x] `photos.ts` (사진 갤러리)
  - [x] `youtube_videos.ts` (유튜브 영상)
- [x] 마이그레이션 생성 및 적용

#### 1.4 디자인 시스템 구축
- [x] Rock Community 브랜딩 색상 적용
- [x] 디자인 토큰 정의 (Rock 테마)
- [x] 유틸리티 스타일 확인
- [x] 기본 UI 컴포넌트 확인

#### 1.5 인증 시스템 확인
- [x] 회원가입/로그인 기능 테스트 (Supabase Auth 설정 완료)
- [ ] 사용자 프로필 시스템 구축 (Week 3-4에서 진행)
  - [ ] 프로필 이미지, 자기소개
  - [ ] 좋아하는 장르 태그
  - [ ] 활동 내역
- [x] 관리자 권한 시스템 확인

#### 1.6 레이아웃 재구성
- [x] Header 컴포넌트 Rock Community 메뉴로 변경
  - [x] About, Bands, Albums, Concerts
  - [x] Community, News, Gallery
  - [x] Rock Art, Videos, Contact
- [x] Footer 컴포넌트 확인
- [x] 전체 네비게이션 구조 완성

**Week 1-2 완료 조건**:
- ✅ 회원가입/로그인 가능
- ✅ Rock Community DB 스키마 적용 완료
- ✅ 디자인 시스템 Rock 테마 적용
- ✅ GitHub에 코드 푸시 완료

---

### Week 3: 밴드 데이터베이스

#### 3.1 밴드 정보 시스템
- [ ] 밴드 페이지 생성 (`app/bands/page.tsx`)
- [ ] 밴드 목록 UI
  - [ ] 밴드 카드 컴포넌트
  - [ ] 그리드 레이아웃
  - [ ] 검색 및 필터링 (장르, 국가)
  - [ ] 페이지네이션
- [ ] 밴드 상세 페이지 (`app/bands/[id]/page.tsx`)
  - [ ] 밴드 프로필 (로고, 바이오, 멤버)
  - [ ] 앨범 목록
  - [ ] SNS 링크

#### 3.2 앨범 정보 시스템
- [ ] 앨범 페이지 생성 (`app/albums/page.tsx`)
- [ ] 앨범 목록 UI
  - [ ] 앨범 커버 그리드
  - [ ] 검색 및 필터링 (밴드, 장르, 연도)
- [ ] 앨범 상세 페이지 (`app/albums/[id]/page.tsx`)
  - [ ] 앨범 커버, 트랙리스트
  - [ ] 리뷰 섹션
  - [ ] 평점 시스템

#### 3.3 CRUD API
- [ ] 밴드 API (`/api/bands`)
  - [ ] 목록 조회, 상세 조회, 등록, 수정
- [ ] 앨범 API (`/api/albums`)
  - [ ] 목록 조회, 상세 조회, 등록, 수정
- [ ] 리뷰 API (`/api/reviews`)
  - [ ] 리뷰 작성, 수정, 삭제

#### 3.4 MusicBrainz API 연동
- [ ] Edge Function 생성 (`fetch-band-info`)
- [ ] 밴드 검색 기능
- [ ] 자동 정보 가져오기

**Week 3 완료 조건**:
- ✅ 밴드/앨범 정보 등록 및 조회 가능
- ✅ 검색 및 필터링 작동
- ✅ MusicBrainz API 연동 테스트 완료

---

### Week 4: 커뮤니티 게시판

#### 4.1 카테고리 시드 데이터
- [ ] Categories 시드 데이터 삽입
  - [ ] `general_discussion` (General Discussion)
  - [ ] `album_reviews` (Album Reviews)
  - [ ] `concert_reviews` (Concert Reviews)
  - [ ] `hot_topics` (Hot Topics)
  - [ ] `rock_art` (Rock Art Showcase)

#### 4.2 게시판 목록 페이지
- [ ] 동적 라우트 (`app/community/[category]/page.tsx`)
- [ ] 게시글 목록 조회
- [ ] 게시글 카드 컴포넌트
- [ ] 검색 및 정렬 기능
- [ ] 페이지네이션

#### 4.3 게시글 작성 페이지
- [ ] 작성 페이지 (`app/community/[category]/new/page.tsx`)
- [ ] 마크다운 에디터
- [ ] 밴드 태그 기능
- [ ] 이미지 업로드

#### 4.4 게시글 상세 페이지
- [ ] 상세 페이지 (`app/community/[category]/[id]/page.tsx`)
- [ ] 마크다운 렌더링
- [ ] 조회수 증가
- [ ] 좋아요 기능
- [ ] 수정/삭제 버튼

#### 4.5 댓글 시스템
- [ ] 댓글 목록 컴포넌트
- [ ] 댓글 작성 폼
- [ ] 댓글 삭제
- [ ] 실시간 반영

**Week 4 완료 조건**:
- ✅ 5개 게시판에서 글 작성/조회 가능
- ✅ 마크다운 에디터 작동
- ✅ 댓글 작성/삭제 가능
- ✅ 검색 및 페이지네이션 작동

---

**Phase 1 전체 완료 조건**:
- ✅ 회원가입/로그인 가능
- ✅ 밴드/앨범 정보 등록 및 조회 가능
- ✅ 커뮤니티 게시판에서 글 작성/조회 가능
- ✅ GitHub에 Phase 1 코드 푸시 및 PLAN.md 업데이트

---

## Phase 2: 공연 일정 및 뉴스 자동화 (3주)

**목표**: 공연 일정 관리, Rock 뉴스 크롤링, 포토 갤러리
**기간**: Week 5 ~ Week 7
**상태**: ⬜ Not Started

### Week 5: 공연 일정 시스템

#### 5.1 DB 스키마
- [ ] Concerts 테이블 확인
- [ ] RLS 정책 적용

#### 5.2 캘린더 UI
- [ ] 캘린더 라이브러리 설정 (react-big-calendar)
- [ ] 캘린더 페이지 (`app/concerts/page.tsx`)
- [ ] 월간/주간/일간 뷰
- [ ] 공연 정보 표시 (밴드, 장소, 시간)

#### 5.3 공연 CRUD
- [ ] 공연 등록 모달
- [ ] 밴드 선택 드롭다운
- [ ] 티켓 링크 입력
- [ ] 공연 수정/삭제
- [ ] API Routes (`app/api/concerts/route.ts`)

#### 5.4 필터링 및 검색
- [ ] 장르별 필터
- [ ] 지역별 필터
- [ ] 밴드별 검색

**Week 5 완료 조건**:
- ✅ 캘린더에서 공연 추가/수정/삭제 가능
- ✅ 필터링 및 검색 작동

---

### Week 6: Rock 뉴스 자동 업데이트

#### 6.1 DB 스키마
- [ ] News 테이블 확인
- [ ] 인덱스 설정

#### 6.2 Edge Function: Rock 뉴스 크롤러
- [ ] Edge Function 생성 (`crawl-rock-news`)
- [ ] RSS 파싱 로직
  - [ ] Rolling Stone
  - [ ] NME
  - [ ] Metal Hammer
  - [ ] Loudwire
- [ ] 뉴스 데이터 저장 (Upsert)

#### 6.3 Cron Job 설정
- [ ] Supabase Cron 또는 GitHub Actions
- [ ] 일 1회 실행 (매일 오전 9시)

#### 6.4 뉴스 페이지
- [ ] 뉴스 목록 페이지 (`app/news/page.tsx`)
- [ ] 뉴스 카드 컴포넌트
- [ ] 카테고리 필터 (Classic Rock, Metal, Punk, Alternative)
- [ ] 페이지네이션
- [ ] Redis 캐싱

**Week 6 완료 조건**:
- ✅ 뉴스가 자동으로 업데이트됨
- ✅ `/news` 페이지에서 뉴스 조회 가능
- ✅ 카테고리 필터링 작동

---

### Week 7: 포토 갤러리

#### 7.1 DB 스키마
- [ ] Photos 테이블 확인
- [ ] RLS 정책 적용

#### 7.2 갤러리 페이지
- [ ] 갤러리 페이지 (`app/gallery/page.tsx`)
- [ ] Masonry 레이아웃
- [ ] 사진 카드 컴포넌트
- [ ] 라이트박스 뷰어

#### 7.3 사진 업로드
- [ ] 사진 업로드 폼
- [ ] 밴드/공연 태그
- [ ] 캡션 입력
- [ ] Supabase Storage 업로드

#### 7.4 필터링
- [ ] 밴드별 필터
- [ ] 공연별 필터
- [ ] 날짜별 정렬

**Week 7 완료 조건**:
- ✅ 포토 갤러리에서 사진 업로드 및 조회 가능
- ✅ 라이트박스 뷰어 작동
- ✅ 필터링 작동

---

**Phase 2 전체 완료 조건**:
- ✅ 공연 캘린더 작동
- ✅ Rock 뉴스 자동 업데이트 확인
- ✅ 포토 갤러리 작동
- ✅ GitHub에 Phase 2 코드 푸시 및 PLAN.md 업데이트

---

## Phase 3: AI 아트 및 YouTube (3주)

**목표**: AI Rock Art, YouTube 영상 관리, 문의 기능
**기간**: Week 8 ~ Week 10
**상태**: ⬜ Not Started

### Week 8: AI Rock Art 게시판

#### 8.1 AI Rock Art 업로드
- [ ] AI 아트 페이지 (`app/rock-art/page.tsx`)
- [ ] 멀티미디어 업로드 지원
- [ ] 메타데이터 입력 (모델, 프롬프트)
- [ ] Supabase Storage 업로드

#### 8.2 갤러리 뷰
- [ ] 그리드 레이아웃 (Masonry)
- [ ] 라이트박스 뷰어
- [ ] 좋아요/댓글 기능

**Week 8 완료 조건**:
- ✅ AI Rock Art 업로드 가능
- ✅ 갤러리에서 작품 조회 가능

---

### Week 9: YouTube Rock 영상 관리

#### 9.1 Edge Function: 유튜브 크롤러
- [ ] Edge Function 생성 (`crawl-youtube`)
- [ ] YouTube Data API v3 연동
- [ ] Rock 영상 검색 및 저장

#### 9.2 YouTube 영상 페이지
- [ ] 영상 목록 페이지 (`app/videos/page.tsx`)
- [ ] 영상 카드 컴포넌트
- [ ] YouTube 임베드 플레이어
- [ ] 밴드별 필터

**Week 9 완료 조건**:
- ✅ YouTube Rock 영상 자동 수집
- ✅ 임베드 플레이어 재생 가능

---

### Week 10: 문의 기능 및 통합

#### 10.1 문의 기능
- [ ] 문의 페이지 (`app/contact/page.tsx`)
- [ ] 문의 폼 (이름, 이메일, 제목, 내용)
- [ ] reCAPTCHA v3
- [ ] Edge Function: 이메일 전송

#### 10.2 UX 최적화
- [ ] 로딩 상태 개선
- [ ] 에러 바운더리
- [ ] 토스트 알림
- [ ] 접근성 점검

**Week 10 완료 조건**:
- ✅ 방문자가 이메일 전송 가능
- ✅ 전체 UX 개선 완료

---

**Phase 3 전체 완료 조건**:
- ✅ AI Rock Art 갤러리 작동
- ✅ YouTube Rock 영상 자동 수집
- ✅ 이메일 문의 기능 작동
- ✅ GitHub에 Phase 3 코드 푸시 및 PLAN.md 업데이트

---

## Phase 4: 관리자 도구 및 최적화 (2주)

**목표**: 관리자 대시보드, 모니터링, 성능 최적화
**기간**: Week 11 ~ Week 12
**상태**: ⬜ Not Started

### Week 11: 관리자 대시보드

#### 11.1 대시보드 레이아웃
- [ ] 관리자 페이지 (`app/admin/page.tsx`)
- [ ] 접근 제어

#### 11.2 통계 패널
- [ ] 방문자 통계
- [ ] 밴드/앨범 등록 현황
- [ ] 게시물 통계
- [ ] 공연 정보 통계

#### 11.3 콘텐츠 관리
- [ ] 밴드/앨범 관리 패널
- [ ] 게시글 통합 관리
- [ ] 사용자 관리

**Week 11 완료 조건**:
- ✅ 관리자 대시보드 접속 가능
- ✅ 통계 패널에서 데이터 확인

---

### Week 12: 모니터링 및 최적화

#### 12.1 Loki + Grafana 연동
- [ ] Docker Compose 설정 확인
- [ ] Grafana 대시보드 생성

#### 12.2 성능 최적화
- [ ] 이미지 최적화 점검
- [ ] 코드 스플리팅 점검
- [ ] 캐싱 전략 점검

#### 12.3 SEO 최적화
- [ ] 메타 태그 최적화
- [ ] 사이트맵 생성 (`app/sitemap.ts`)
- [ ] robots.txt 설정 (`app/robots.ts`)

**Week 12 완료 조건**:
- ✅ Grafana에서 로그 확인 가능
- ✅ Lighthouse 점수 90점 이상
- ✅ SEO 최적화 완료

---

**Phase 4 전체 완료 조건**:
- ✅ 관리자 대시보드 작동
- ✅ Grafana 모니터링 가동
- ✅ 성능 및 SEO 최적화 완료
- ✅ GitHub에 Phase 4 코드 푸시 및 PLAN.md 업데이트

---

## Phase 5: 런칭 및 안정화 (1주)

**목표**: 도메인 연결, 최종 테스트, 공식 런칭
**기간**: Week 13
**상태**: ⬜ Not Started

### Week 13: 런칭 준비

#### 13.1 도메인 연결
- [ ] Cloudflare DNS 설정
- [ ] SSL/TLS 설정

#### 13.2 서버 배포
- [ ] Docker Compose 실행
- [ ] Nginx 리버스 프록시 설정

#### 13.3 전체 기능 테스트
- [ ] 인증 시스템
- [ ] 밴드/앨범 정보
- [ ] 커뮤니티 게시판
- [ ] 공연 캘린더
- [ ] Rock 뉴스
- [ ] 포토 갤러리
- [ ] AI Rock Art
- [ ] YouTube 영상
- [ ] 문의 기능
- [ ] 관리자 대시보드

#### 13.4 공식 런칭
- [ ] metaldragon.co.kr 접속 확인
- [ ] 모든 기능 정상 작동 확인
- [ ] 첫 번째 게시글 작성 (환영 메시지)

**Week 13 완료 조건**:
- ✅ metaldragon.co.kr 접속 가능
- ✅ 모든 핵심 기능 정상 작동
- ✅ 모니터링 시스템 가동

---

**Phase 5 전체 완료 조건**:
- ✅ 공식 런칭 완료
- ✅ 도메인 연결 및 SSL 적용
- ✅ GitHub에 최종 코드 푸시
- ✅ PLAN.md 100% 완료 표시

---

## 📝 작업 관리 규칙

### GitHub 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정, 패키지 업데이트 등
```

### Phase 완료 시 체크리스트
1. [ ] 모든 기능 테스트 완료
2. [ ] 코드 리뷰 (자체 점검)
3. [ ] PLAN.md 진행 상황 업데이트
4. [ ] GitHub 커밋 및 푸시
5. [ ] PRD.md, LLD.md 필요 시 업데이트

---

## ⚠️ 리스크 관리

### 주요 리스크

| 리스크 | 영향도 | 완화 방안 | 상태 |
|--------|--------|-----------|------|
| Supabase Free Tier 제한 초과 | 높음 | 사용량 모니터링, 필요 시 유료 전환 | 🟢 정상 |
| 1인 개발 일정 지연 | 높음 | 우선순위 조정, MVP 먼저 완성 | 🟢 정상 |
| 크롤링 차단/제한 | 중간 | 공식 API 우선, Rate Limiting 준수 | 🟢 정상 |
| 저작권 문제 | 중간 | 출처 명시, 사용자 업로드 검토 | 🟢 정상 |

---

**문서 버전**: 2.0 (Rock Community Edition)
**최종 업데이트**: 2025-10-23
**다음 업데이트 예정**: Phase 1 시작 시
