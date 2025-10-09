# Metaldragon 빠른 시작 가이드

## 🚨 현재 상황

Docker Desktop 연결 불안정으로 인해 배포가 진행되지 않습니다.

## ✅ 완료된 작업

1. **Docker 설정 완료**
   - ✅ Next.js 앱: **포트 3000 전용** (외부 접근)
   - ✅ Grafana/Loki/Redis: 내부 네트워크만 사용
   - ✅ Docker 이미지 빌드 성공 (31 페이지)

2. **배포 도구 준비**
   - ✅ `start.bat` - 자동 배포 스크립트
   - ✅ `manage.bat` - 관리 도구
   - ✅ `README_DEPLOY.md` - 상세 가이드

## 🔧 해결 방법 (3가지 옵션)

### 옵션 1: 시스템 재부팅 (⭐ 권장)

```powershell
# 1. 시스템 재부팅

# 2. 재부팅 후 실행
cd C:\Vibe Coding\Homepage\metaldragon
.\start.bat
```

### 옵션 2: Docker Desktop 완전 재시작

```powershell
# 1. 작업 관리자 열기 (Ctrl + Shift + Esc)

# 2. 다음 프로세스 모두 종료:
#    - Docker Desktop
#    - Docker Desktop Service
#    - com.docker.backend

# 3. Docker Desktop 재시작
"C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 4. 2분 대기 후
cd C:\Vibe Coding\Homepage\metaldragon
.\start.bat
```

### 옵션 3: WSL 재설정

```powershell
# PowerShell 관리자 권한으로

# WSL 종료
wsl --shutdown

# Docker Desktop 재시작
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2분 대기 후
cd C:\Vibe Coding\Homepage\metaldragon
.\start.bat
```

## 📝 start.bat 사용법

```batch
# 디렉토리 이동
cd C:\Vibe Coding\Homepage\metaldragon

# 배포 스크립트 실행
start.bat
```

스크립트가 자동으로:
1. ✅ Docker Desktop 상태 확인
2. ✅ 포트 3000 정리
3. ✅ 기존 컨테이너 중지
4. ✅ 새 컨테이너 시작

## 🎯 배포 성공 시 확인

### 1. 컨테이너 상태 확인
```bash
docker-compose ps
```

예상 출력:
```
NAME                   STATUS
metaldragon-app        Up
metaldragon-grafana    Up
metaldragon-loki       Up
metaldragon-redis      Up
metaldragon-promtail   Up
```

### 2. 브라우저 접속
- **http://localhost:3000** - 메인 애플리케이션

### 3. 로그 확인
```bash
# 모든 로그
docker-compose logs -f

# 앱 로그만
docker-compose logs -f app
```

## ⚠️ 트러블슈팅

### "Docker Desktop is not running"
```bash
# Docker Desktop 수동 시작
"C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2분 대기 후 재시도
.\start.bat
```

### "Port 3000 already in use"
```bash
# 포트 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID 확인 후)
taskkill /F /PID [프로세스번호]
```

### "Unable to get image"
```bash
# 이미지 다시 받기
docker-compose pull

# 재시작
.\start.bat
```

## 📦 파일 구조

```
metaldragon/
├── start.bat              # ⭐ 배포 스크립트
├── manage.bat             # 관리 도구
├── docker-compose.yml     # Docker 설정 (3000 포트 전용)
├── Dockerfile             # Next.js 이미지
├── .env.production        # 환경변수
├── README_DEPLOY.md       # 상세 가이드
└── QUICK_START.md         # 이 파일
```

## 🆘 여전히 안 될 때

1. **Docker Desktop 재설치**
   ```
   1. Docker Desktop 제거
   2. 시스템 재부팅
   3. Docker Desktop 최신 버전 설치
   4. WSL2 업데이트
   ```

2. **로그 확인**
   ```bash
   # Docker Desktop 로그
   %APPDATA%\Docker\log.txt

   # 앱 로그
   docker-compose logs app
   ```

3. **GitHub Issues 검색**
   - Docker Desktop 관련 이슈 검색
   - WSL2 관련 문제 확인

---

**작성일**: 2025-10-05
**버전**: 1.0.0
**포트 설정**: 3000 (Next.js 앱만 외부 노출)
