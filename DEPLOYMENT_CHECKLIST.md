# 🚀 배포 체크리스트

배포 전 모든 항목을 확인하세요.

---

## ✅ Pre-Deployment (배포 전)

### 코드 품질

- [ ] 모든 테스트 통과
- [ ] ESLint 오류 없음: `npm run lint`
- [ ] TypeScript 컴파일 성공: `npm run build`
- [ ] 로컬에서 프로덕션 빌드 테스트 완료

### 환경변수

- [ ] `.env.example` 파일 확인
- [ ] 프로덕션 환경변수 준비:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `UPSTASH_REDIS_REST_URL` (선택사항)
  - [ ] `UPSTASH_REDIS_REST_TOKEN` (선택사항)
  - [ ] `YOUTUBE_API_KEY` (선택사항)
  - [ ] `RESEND_API_KEY` (선택사항)
  - [ ] `GRAFANA_ADMIN_PASSWORD`
- [ ] 환경변수에 민감 정보 포함 확인
- [ ] `.env.production` 파일 생성 (서버에서)

### 데이터베이스

- [ ] Supabase 프로젝트 상태 확인: ACTIVE_HEALTHY
- [ ] 모든 마이그레이션 적용 완료
- [ ] RLS 정책 활성화 확인
- [ ] 테스트 데이터 정리 (프로덕션에 불필요한 데이터 삭제)

### Git & GitHub

- [ ] GitHub 저장소 생성: https://github.com/choulyong/homepage
- [ ] 모든 변경사항 커밋 및 푸시
- [ ] `.gitignore`에 `.env*` 포함 확인
- [ ] README.md 최신 상태 확인
- [ ] PLAN.md 진행 상황 업데이트

---

## 🖥️ Server Setup (서버 설정)

### 서버 준비

- [ ] 서버 운영체제: Ubuntu 20.04 LTS 이상
- [ ] 최소 사양:
  - [ ] 2 CPU cores
  - [ ] 4GB RAM
  - [ ] 20GB 디스크 공간
- [ ] SSH 접근 가능
- [ ] 방화벽 포트 열기:
  - [ ] 22 (SSH)
  - [ ] 80 (HTTP)
  - [ ] 443 (HTTPS)

### 필수 소프트웨어 설치

```bash
sudo apt update
sudo apt upgrade -y
```

- [ ] Docker 설치 및 실행
  ```bash
  sudo apt install -y docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
- [ ] Docker Compose 설치
  ```bash
  sudo apt install -y docker-compose
  ```
- [ ] Nginx 설치
  ```bash
  sudo apt install -y nginx
  ```
- [ ] Certbot 설치 (SSL)
  ```bash
  sudo apt install -y certbot python3-certbot-nginx
  ```

### Git 설정

- [ ] Git 설치: `sudo apt install -y git`
- [ ] SSH 키 생성 및 GitHub에 등록
  ```bash
  ssh-keygen -t ed25519 -C "your_email@example.com"
  cat ~/.ssh/id_ed25519.pub
  # GitHub Settings → SSH keys에 추가
  ```

---

## 🌐 Domain & DNS (도메인 & DNS)

### Cloudflare 설정

- [ ] Cloudflare 계정 로그인
- [ ] DNS 레코드 추가:
  - [ ] **A 레코드**
    - Name: `metaldragon.co.kr` (또는 `@`)
    - Content: `YOUR_SERVER_IP`
    - Proxy status: Proxied (주황색 구름)
  - [ ] **CNAME 레코드**
    - Name: `www`
    - Content: `metaldragon.co.kr`
    - Proxy status: Proxied

### SSL/TLS 설정

- [ ] **SSL/TLS** 탭 → Overview
  - [ ] 암호화 모드: **Full (strict)**
- [ ] **Edge Certificates**
  - [ ] Always Use HTTPS: **On**
  - [ ] Automatic HTTPS Rewrites: **On**
  - [ ] Minimum TLS Version: **1.2**

### 캐싱 규칙 (선택사항)

- [ ] Page Rules 생성
  - [ ] 정적 파일 캐싱: `metaldragon.co.kr/_next/static/*`
  - [ ] API 경로 캐싱 방지: `metaldragon.co.kr/api/*`

---

## 📦 Deployment (배포)

### 코드 배포

- [ ] 서버에 프로젝트 클론
  ```bash
  cd /var/www
  sudo git clone https://github.com/choulyong/homepage.git metaldragon
  cd metaldragon
  ```

- [ ] 환경변수 설정
  ```bash
  sudo cp .env.example .env.production
  sudo nano .env.production
  # 모든 필수 환경변수 입력
  ```

- [ ] 배포 스크립트 실행 권한 부여
  ```bash
  sudo chmod +x deploy.sh
  ```

### Docker 배포

- [ ] Docker Compose 실행
  ```bash
  sudo docker-compose up -d --build
  ```

- [ ] 컨테이너 상태 확인
  ```bash
  sudo docker-compose ps
  ```

- [ ] 로그 확인
  ```bash
  sudo docker-compose logs -f
  ```

- [ ] 헬스 체크
  - [ ] Next.js 앱: `curl http://localhost:3000`
  - [ ] Grafana: `curl http://localhost:3001`
  - [ ] Loki: `curl http://localhost:3100/ready`

### Nginx 설정

- [ ] Nginx 설정 파일 생성
  ```bash
  sudo nano /etc/nginx/sites-available/metaldragon
  ```

- [ ] 심볼릭 링크 생성
  ```bash
  sudo ln -s /etc/nginx/sites-available/metaldragon /etc/nginx/sites-enabled/
  ```

- [ ] Nginx 설정 테스트
  ```bash
  sudo nginx -t
  ```

- [ ] Nginx 재시작
  ```bash
  sudo systemctl restart nginx
  ```

### SSL 인증서

- [ ] Let's Encrypt 인증서 발급
  ```bash
  sudo certbot --nginx -d metaldragon.co.kr -d www.metaldragon.co.kr
  ```

- [ ] 자동 갱신 테스트
  ```bash
  sudo certbot renew --dry-run
  ```

---

## 🔍 Testing (테스트)

### 기능 테스트

- [ ] https://metaldragon.co.kr 접속 확인
- [ ] SSL 인증서 유효성 확인 (자물쇠 아이콘)
- [ ] 모바일 반응형 테스트
- [ ] 주요 페이지 접속 테스트:
  - [ ] 홈 (`/`)
  - [ ] About (`/about`)
  - [ ] 게시판 (`/board/ai_study`, `/board/bigdata_study`, `/board/free_board`)
  - [ ] AI 작품 (`/artworks`)
  - [ ] YouTube (`/youtube`)
  - [ ] 뉴스 (`/news`)
  - [ ] 일정 (`/schedule`)
  - [ ] 문의 (`/contact`)
  - [ ] 관리자 (`/admin`)

### 인증 테스트

- [ ] 회원가입 테스트
- [ ] 로그인 테스트
  - [ ] 이메일/비밀번호
  - [ ] Google OAuth
  - [ ] GitHub OAuth
- [ ] 로그아웃 테스트

### 게시판 테스트

- [ ] 게시글 작성
- [ ] 게시글 조회
- [ ] 게시글 수정
- [ ] 게시글 삭제
- [ ] 댓글 작성
- [ ] 댓글 삭제

### 관리자 기능 테스트

- [ ] 관리자 대시보드 접속
- [ ] 모든 관리 페이지 접근 확인
- [ ] CMS 기능 테스트

### 성능 테스트

- [ ] Lighthouse 점수 측정
  - [ ] Performance: > 90
  - [ ] Accessibility: > 90
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90
- [ ] 페이지 로딩 속도 확인 (< 3초)
- [ ] 이미지 최적화 확인

---

## 📊 Monitoring (모니터링)

### Grafana 설정

- [ ] Grafana 접속: https://metaldragon.co.kr/grafana
- [ ] 초기 비밀번호 변경
- [ ] Loki 데이터소스 확인
- [ ] 대시보드 생성:
  - [ ] 에러 로그 패널
  - [ ] API 응답 시간 패널
  - [ ] 사용자 활동 패널

### 로그 확인

- [ ] Docker 로그: `docker-compose logs -f`
- [ ] Nginx 로그: `tail -f /var/log/nginx/error.log`
- [ ] Loki 쿼리 테스트: `{job="docker"} |= "error"`

---

## 🔐 Security (보안)

### 환경변수 보안

- [ ] `.env.production` 파일 권한 설정
  ```bash
  sudo chmod 600 .env.production
  ```

### 방화벽 설정

- [ ] UFW 활성화
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

### Supabase RLS

- [ ] 모든 테이블에 RLS 정책 적용 확인
- [ ] 익명 사용자 권한 최소화
- [ ] 관리자 권한 확인

### 민감정보 확인

- [ ] API 키가 코드에 하드코딩되지 않았는지 확인
- [ ] `.gitignore`에 `.env*` 포함 확인
- [ ] GitHub에 민감 정보가 푸시되지 않았는지 확인

---

## 📱 Post-Deployment (배포 후)

### SEO

- [ ] Google Search Console 등록
- [ ] 사이트맵 제출: `https://metaldragon.co.kr/sitemap.xml`
- [ ] robots.txt 확인: `https://metaldragon.co.kr/robots.txt`

### Analytics (선택사항)

- [ ] Google Analytics 설정
- [ ] 추적 코드 설치

### 백업

- [ ] 자동 백업 스크립트 설정
- [ ] Supabase 백업 정책 확인

### 모니터링 알림

- [ ] Grafana 알림 설정 (이메일/Slack)
- [ ] 에러 발생 시 알림 규칙 생성

---

## 🎉 Launch (런칭)

- [ ] 모든 테스트 완료
- [ ] 팀원/사용자에게 공지
- [ ] 첫 번째 게시글 작성 (환영 메시지)
- [ ] SNS 공유 (선택사항)

---

## 📝 Documentation

- [ ] PLAN.md 100% 완료 표시
- [ ] README.md 최종 확인
- [ ] DEPLOYMENT.md 링크 공유
- [ ] GitHub 저장소 설명 업데이트

---

## 🆘 Rollback Plan (롤백 계획)

문제 발생 시:

1. **즉시 롤백**:
   ```bash
   cd /var/www/metaldragon
   sudo docker-compose down
   # 마지막 백업 복원
   sudo tar -xzf /var/backups/metaldragon/backup-YYYYMMDD-HHMMSS.tar.gz
   sudo docker-compose up -d
   ```

2. **문제 분석**:
   ```bash
   # 로그 확인
   sudo docker-compose logs -f
   # Nginx 로그
   sudo tail -f /var/log/nginx/error.log
   ```

3. **긴급 연락처**:
   - GitHub Issues: https://github.com/choulyong/homepage/issues
   - Email: choulyong@metaldragon.co.kr

---

**모든 항목을 체크한 후 배포를 진행하세요!**

✅ = 완료
⬜ = 미완료
⚠️ = 선택사항
