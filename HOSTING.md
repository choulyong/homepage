# www.metaldragon.co.kr 도메인 호스팅 가이드

## 📋 목차
1. [호스팅 방법 선택](#호스팅-방법-선택)
2. [Windows 서버 호스팅](#windows-서버-호스팅)
3. [클라우드 호스팅](#클라우드-호스팅)
4. [DNS 설정](#dns-설정)

---

## 1. 호스팅 방법 선택

### 옵션 A: Windows 로컬 서버 (현재 서버)
**장점**: 추가 비용 없음, 완전한 제어
**단점**: 공인 IP 필요, 24/7 가동, 보안 설정 복잡

### 옵션 B: Vercel (⭐ 권장)
**장점**: 무료, 자동 배포, CDN, HTTPS 자동
**단점**: Next.js 특화, 서버리스 제한

### 옵션 C: AWS/Azure/GCP
**장점**: 확장성, 전문적
**단점**: 비용 발생, 관리 복잡

---

## 2. Windows 서버 호스팅 (현재 서버 사용)

### 2-1. 준비 사항

```powershell
# 1. 공인 IP 확인
curl ifconfig.me

# 2. ISP에 고정 IP 신청 (선택)
# - 동적 IP는 공유기 DDNS 사용 가능
```

### 2-2. 포트 포워딩 설정

**공유기 관리자 페이지 접속** (보통 192.168.0.1 또는 192.168.1.1)

1. **포트 포워딩 규칙 추가**
   - 외부 포트: `80` (HTTP)
   - 내부 IP: `192.168.x.x` (현재 PC IP)
   - 내부 포트: `3000`

2. **HTTPS용 포트도 추가** (선택)
   - 외부 포트: `443` (HTTPS)
   - 내부 포트: `3000`

### 2-3. 방화벽 설정

```powershell
# PowerShell 관리자 권한으로

# HTTP 허용
New-NetFirewallRule -DisplayName "MetalDragon HTTP" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# HTTPS 허용 (선택)
New-NetFirewallRule -DisplayName "MetalDragon HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### 2-4. 리버스 프록시 설정 (Nginx 또는 IIS)

#### Option A: Nginx for Windows

```nginx
# nginx.conf

server {
    listen 80;
    server_name www.metaldragon.co.kr metaldragon.co.kr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option B: IIS (Windows 내장)

1. IIS 설치
2. URL Rewrite 모듈 설치
3. 리버스 프록시 규칙 추가

### 2-5. PM2로 서버 자동 재시작

```powershell
# PM2 설치 (전역)
npm install -g pm2

# 프로덕션 빌드
cd C:\Vibe Coding\Homepage\metaldragon
npm run build

# PM2로 시작
pm2 start npm --name "metaldragon" -- start

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

---

## 3. Vercel 호스팅 (⭐ 권장)

### 3-1. Vercel 배포 (5분 완료)

```powershell
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포
cd C:\Vibe Coding\Homepage\metaldragon
vercel

# 4. 프로덕션 배포
vercel --prod
```

### 3-2. 도메인 연결

**Vercel 대시보드에서:**

1. 프로젝트 선택
2. Settings > Domains
3. `www.metaldragon.co.kr` 추가
4. DNS 설정 안내 확인

---

## 4. DNS 설정

### 도메인 등록 대행사 (가비아, 후이즈 등)에서:

#### Case 1: Windows 서버 사용

```
A 레코드 추가:
- 호스트: www
- 값: [공인 IP 주소]
- TTL: 3600

A 레코드 추가 (루트 도메인):
- 호스트: @
- 값: [공인 IP 주소]
- TTL: 3600
```

#### Case 2: Vercel 사용

```
CNAME 레코드 추가:
- 호스트: www
- 값: cname.vercel-dns.com
- TTL: 3600

A 레코드 추가 (루트 도메인):
- 호스트: @
- 값: 76.76.21.21
- TTL: 3600
```

---

## 5. HTTPS 설정

### Windows 서버: Let's Encrypt

```powershell
# Certbot 설치
# https://certbot.eff.org/

# SSL 인증서 발급
certbot certonly --standalone -d www.metaldragon.co.kr -d metaldragon.co.kr
```

### Vercel: 자동 처리 ✅

Vercel은 자동으로 Let's Encrypt SSL 인증서를 발급하고 갱신합니다.

---

## 6. 배포 스크립트

### Windows 서버용

```batch
REM deploy-production.bat

@echo off
echo Building for production...
npm run build

echo Restarting PM2...
pm2 restart metaldragon

echo Deployment complete!
echo https://www.metaldragon.co.kr
```

### Vercel용

```batch
REM deploy-vercel.bat

@echo off
echo Deploying to Vercel...
vercel --prod

echo Deployment complete!
echo https://www.metaldragon.co.kr
```

---

## 7. 체크리스트

### Windows 서버 호스팅
- [ ] 공인 IP 확보
- [ ] 포트 포워딩 설정 (80 → 3000)
- [ ] 방화벽 설정
- [ ] Nginx 또는 IIS 설치
- [ ] PM2 설치 및 설정
- [ ] DNS A 레코드 설정
- [ ] SSL 인증서 발급
- [ ] 24/7 서버 가동 확인

### Vercel 호스팅 (권장)
- [ ] Vercel 계정 생성
- [ ] `vercel --prod` 실행
- [ ] DNS CNAME 레코드 설정
- [ ] 도메인 연결 확인
- [ ] HTTPS 자동 설정 확인

---

## 8. 추천 방법

### 🎯 초기 단계: Vercel 사용

**이유:**
- 무료 (취미 프로젝트)
- 설정 5분
- 자동 HTTPS
- 글로벌 CDN
- 자동 배포

**단점:**
- 서버리스 제한 (API Routes 10초 타임아웃)
- Grafana/Redis 사용 불가 (별도 클라우드 필요)

### 🏢 프로덕션: AWS EC2 + Docker

**나중에 필요 시:**
- 완전한 제어
- Docker 스택 전체 사용
- Grafana, Redis, Loki 모두 운영

---

## 9. 빠른 시작 (Vercel 추천)

```powershell
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
cd C:\Vibe Coding\Homepage\metaldragon
vercel --prod

# 3. 도메인 연결
# Vercel 대시보드에서 www.metaldragon.co.kr 추가

# 4. DNS 설정
# CNAME: www → cname.vercel-dns.com
# A: @ → 76.76.21.21

# 5. 완료!
# https://www.metaldragon.co.kr 접속
```

---

**다음 단계**: 어떤 방법을 선택하시겠어요?

1. **Vercel** - 5분 안에 배포 (권장)
2. **Windows 서버** - 현재 서버 사용 (복잡)
3. **AWS/클라우드** - 프로덕션급 (나중에)
