# 🚀 metaldragon.co.kr 배포 가이드

프로덕션 환경 배포를 위한 단계별 가이드입니다.

---

## 📋 배포 전 체크리스트

- [x] 로컬 개발 환경에서 모든 기능 테스트 완료
- [x] 환경변수 설정 확인 (`.env.local`)
- [x] GitHub 저장소 생성 및 코드 푸시
- [ ] 서버 준비 (Docker, Nginx 설치)
- [ ] 도메인 DNS 설정 (Cloudflare)
- [ ] SSL 인증서 발급

---

## 1️⃣ GitHub 저장소 설정

### 1.1 저장소 생성

1. **GitHub에서 새 저장소 생성**:
   ```
   URL: https://github.com/new
   Repository name: metaldragon
   Description: 🐉 Modern personal portal - AI learning, finance management, creative showcase
   Visibility: Public
   ```

2. **아무것도 추가하지 말고** "Create repository" 클릭

### 1.2 코드 푸시

**방법 1: 배치 스크립트 사용**
```bash
# Windows
push-to-github.bat
```

**방법 2: 수동 명령어**
```bash
cd "C:\Vibe Coding\Homepage\metaldragon"
git remote add origin https://github.com/choulyong/metaldragon.git
git branch -M master
git push -u origin master
```

---

## 2️⃣ 서버 환경 준비

### 2.1 필수 소프트웨어 설치

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.2 프로젝트 클론

```bash
cd /var/www
sudo git clone https://github.com/choulyong/metaldragon.git
cd metaldragon
```

### 2.3 환경변수 설정

```bash
# .env.production 파일 생성
sudo nano .env.production
```

**필수 환경변수**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xhzqhvjkkfpeavdphoit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Upstash Redis (Production)
UPSTASH_REDIS_REST_URL=your_production_redis_url
UPSTASH_REDIS_REST_TOKEN=your_production_redis_token

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Email
RESEND_API_KEY=your_resend_api_key

# Grafana
GRAFANA_ADMIN_PASSWORD=strong_random_password_here

# Environment
NODE_ENV=production
```

---

## 3️⃣ Cloudflare DNS 설정

### 3.1 DNS 레코드 추가

Cloudflare 대시보드에서 다음 레코드를 추가:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | metaldragon.co.kr | YOUR_SERVER_IP | Proxied (주황색) |
| CNAME | www | metaldragon.co.kr | Proxied (주황색) |

### 3.2 SSL/TLS 설정

1. **SSL/TLS** 탭 → **Overview**
2. 암호화 모드: **Full (strict)** 선택
3. **Edge Certificates** 탭:
   - Always Use HTTPS: **On**
   - Minimum TLS Version: **1.2**
   - Automatic HTTPS Rewrites: **On**

---

## 4️⃣ Docker 배포

### 4.1 Docker Compose 실행

```bash
cd /var/www/metaldragon

# 모니터링 스택 + Next.js 앱 실행
sudo docker-compose up -d --build

# 로그 확인
sudo docker-compose logs -f
```

### 4.2 컨테이너 관리

```bash
# 상태 확인
sudo docker-compose ps

# 재시작
sudo docker-compose restart

# 중지
sudo docker-compose down

# 업데이트 (GitHub에서 pull 후)
git pull origin master
sudo docker-compose up -d --build
```

---

## 5️⃣ Nginx 리버스 프록시 설정

### 5.1 Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/metaldragon
```

**설정 내용**:
```nginx
server {
    listen 80;
    server_name metaldragon.co.kr www.metaldragon.co.kr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
    }
}
```

### 5.2 설정 활성화

```bash
sudo ln -s /etc/nginx/sites-available/metaldragon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6️⃣ SSL 인증서 발급

```bash
sudo certbot --nginx -d metaldragon.co.kr -d www.metaldragon.co.kr
```

---

## 7️⃣ 모니터링 설정

### Grafana 접속

```
URL: https://metaldragon.co.kr/grafana
기본 계정: admin / [GRAFANA_ADMIN_PASSWORD]
```

자세한 내용은 `MONITORING.md` 참조

---

## ✅ 배포 완료 체크리스트

- [ ] GitHub 저장소 생성 및 코드 푸시
- [ ] 서버에 Docker, Nginx 설치
- [ ] Cloudflare DNS 설정
- [ ] Docker Compose 실행
- [ ] Nginx 리버스 프록시 설정
- [ ] SSL 인증서 발급
- [ ] https://metaldragon.co.kr 접속 확인
- [ ] Grafana 모니터링 확인
- [ ] 모든 주요 기능 테스트

---

**Built with ❤️ by metaldragon**
