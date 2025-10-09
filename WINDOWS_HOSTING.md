# Windows 서버 24시간 호스팅 가이드

## 📍 서버 정보
- **공인 IP**: 121.167.6.99
- **도메인**: www.metaldragon.co.kr
- **앱 포트**: 3000
- **운영체제**: Windows

---

## 🚀 배포 단계

### ✅ 1단계: 공인 IP 확인 (완료)
- 공인 IP: **121.167.6.99**

### 📋 2단계: 포트 포워딩 설정

**공유기 관리자 페이지 접속:**
1. 브라우저에서 `192.168.0.1` 또는 `192.168.1.1` 접속
2. 관리자 계정으로 로그인

**포트 포워딩 규칙 추가:**

| 항목 | 값 |
|------|-----|
| 서비스 이름 | MetalDragon-HTTP |
| 외부 포트 | 80 |
| 내부 IP | [이 PC의 로컬 IP] |
| 내부 포트 | 80 |
| 프로토콜 | TCP |

**내 PC 로컬 IP 확인:**
```powershell
ipconfig | findstr IPv4
```

### 📋 3단계: 프로덕션 빌드 및 PM2 설정

```powershell
# 1. PM2 설치 (전역)
npm install -g pm2
npm install -g pm2-windows-startup

# 2. PM2 Windows 서비스 등록
pm2-startup install

# 3. 프로덕션 빌드
cd C:\Vibe Coding\Homepage\metaldragon
npm run build

# 4. PM2로 시작
pm2 start npm --name "metaldragon" -- start

# 5. 부팅 시 자동 시작 설정
pm2 save
```

### 📋 4단계: Nginx 설치 및 설정

**Nginx for Windows 다운로드:**
- https://nginx.org/en/download.html
- `nginx-1.24.0.zip` 다운로드

**설치 및 설정:**

1. `C:\nginx` 폴더에 압축 해제

2. `C:\nginx\conf\nginx.conf` 파일 수정:

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen       80;
        server_name  www.metaldragon.co.kr metaldragon.co.kr 121.167.6.99;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

3. Nginx 시작:
```powershell
cd C:\nginx
start nginx
```

4. Nginx를 Windows 서비스로 등록:
```powershell
# NSSM 다운로드: https://nssm.cc/download
# C:\nssm 폴더에 압축 해제

cd C:\nssm\win64
.\nssm install nginx "C:\nginx\nginx.exe"
.\nssm start nginx
```

### 📋 5단계: 방화벽 설정

```powershell
# PowerShell 관리자 권한으로 실행

# HTTP 포트 80 허용
New-NetFirewallRule -DisplayName "MetalDragon HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# HTTPS 포트 443 허용 (나중에 SSL 설정 후)
New-NetFirewallRule -DisplayName "MetalDragon HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Next.js 포트 3000 허용
New-NetFirewallRule -DisplayName "Next.js 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 📋 6단계: DNS 설정

**도메인 등록업체(가비아, 후이즈 등)에서:**

```
A 레코드 추가:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
호스트명: www
레코드 타입: A
값(IP): 121.167.6.99
TTL: 3600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A 레코드 추가 (루트 도메인):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
호스트명: @ (또는 비워둠)
레코드 타입: A
값(IP): 121.167.6.99
TTL: 3600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 📋 7단계: SSL 인증서 설치 (HTTPS)

**Win-ACME (Let's Encrypt for Windows):**

```powershell
# 1. Win-ACME 다운로드
# https://www.win-acme.com/

# 2. C:\win-acme 폴더에 압축 해제

# 3. 실행
cd C:\win-acme
.\wacs.exe

# 4. 메뉴에서 선택:
# - N: Create new certificate
# - 2: Manual input
# - 도메인: www.metaldragon.co.kr,metaldragon.co.kr
# - Validation: HTTP validation
# - Installation: Manual (Nginx 선택)
```

**Nginx HTTPS 설정 추가:**

```nginx
server {
    listen       443 ssl;
    server_name  www.metaldragon.co.kr metaldragon.co.kr;

    ssl_certificate      C:/win-acme/certificates/metaldragon.co.kr-chain.pem;
    ssl_certificate_key  C:/win-acme/certificates/metaldragon.co.kr-key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name www.metaldragon.co.kr metaldragon.co.kr;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔧 관리 명령어

### PM2 (Next.js 앱)

```powershell
# 상태 확인
pm2 status

# 재시작
pm2 restart metaldragon

# 중지
pm2 stop metaldragon

# 로그 확인
pm2 logs metaldragon

# 모니터링
pm2 monit
```

### Nginx

```powershell
# 시작
cd C:\nginx
start nginx

# 중지
nginx -s stop

# 재시작
nginx -s reload

# 설정 테스트
nginx -t
```

---

## 📊 체크리스트

- [ ] 공인 IP 확인: **121.167.6.99** ✅
- [ ] 로컬 IP 확인
- [ ] 공유기 포트 포워딩 (80 → 80)
- [ ] PM2 설치 및 앱 시작
- [ ] Nginx 설치 및 설정
- [ ] 방화벽 규칙 추가
- [ ] DNS A 레코드 설정
- [ ] SSL 인증서 발급
- [ ] HTTPS 리다이렉트 설정
- [ ] 24시간 서버 가동 확인

---

## 🧪 테스트

### 1. 로컬 테스트
```
http://localhost
http://localhost:3000
```

### 2. 로컬 네트워크 테스트
```
http://[로컬IP]
```

### 3. 공인 IP 테스트
```
http://121.167.6.99
```

### 4. 도메인 테스트 (DNS 설정 후)
```
http://www.metaldragon.co.kr
https://www.metaldragon.co.kr
```

---

## ⚠️ 주의사항

### 1. 고정 IP 권장
- 현재 IP가 동적이라면 ISP에 고정 IP 신청
- 또는 DDNS 서비스 사용 (No-IP, DuckDNS 등)

### 2. 전력 관리
- PC 절전 모드 해제
- 디스플레이 끄기: 허용
- 하드디스크 끄기: 안 함
- 컴퓨터 절전 모드: 안 함

### 3. Windows 업데이트
- 자동 재시작 비활성화
- 유지 관리 시간 설정

### 4. 백업
```powershell
# 주기적 백업
pm2 save
```

---

## 🚀 빠른 시작 (자동화 스크립트)

C:\Vibe Coding\Homepage\metaldragon\windows-deploy.bat
