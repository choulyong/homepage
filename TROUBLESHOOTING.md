# Docker Desktop WSL2 연결 문제 해결

## 🚨 현재 문제

```
unable to get image: error during connect:
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

이는 Docker Desktop과 WSL2 간의 통신 문제입니다.

## ✅ 완료된 작업

1. **Docker 설정 완료** - Next.js 앱 빌드 성공 (31 페이지)
2. **포트 3000 전용 설정** - Grafana/Loki/Redis는 내부 네트워크
3. **배포 도구 생성** - start.bat, manage.bat, QUICK_START.md

## 🔧 해결 방법 (우선순위 순)

### 방법 1: 시스템 재부팅 (⭐ 가장 확실)

```powershell
# 1. 시스템 재부팅

# 2. 재부팅 후 PowerShell 실행
cd C:\Vibe Coding\Homepage\metaldragon
.\start.bat

# 성공 시:
# http://localhost:3000 접속 가능
```

### 방법 2: WSL 완전 재설정

```powershell
# PowerShell 관리자 권한으로

# 1. Docker Desktop 완전 종료
taskkill /F /IM "Docker Desktop.exe"
Stop-Service -Name "com.docker.service" -Force

# 2. WSL 완전 종료
wsl --shutdown

# 3. WSL 재시작
wsl

# 4. Docker Desktop 시작
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 5. 3분 대기 후
cd C:\Vibe Coding\Homepage\metaldragon
.\start.bat
```

### 방법 3: Docker Desktop 재설치

```
1. Docker Desktop 제거
   - 설정 > 앱 > Docker Desktop 제거

2. 시스템 재부팅

3. Docker Desktop 최신 버전 설치
   https://www.docker.com/products/docker-desktop

4. WSL2 업데이트
   wsl --update

5. Docker Desktop 시작 후
   cd C:\Vibe Coding\Homepage\metaldragon
   start.bat
```

### 방법 4: WSL 분산 업데이트

```powershell
# PowerShell 관리자 권한으로

# WSL 커널 업데이트
wsl --update

# WSL을 기본값으로 재설정
wsl --set-default-version 2

# 재부팅 후 다시 시도
```

## 📋 start.bat 사용법

재부팅 또는 문제 해결 후:

```batch
cd C:\Vibe Coding\Homepage\metaldragon
start.bat
```

스크립트가 자동으로:
1. ✅ Docker Desktop 상태 확인
2. ✅ 포트 3000 정리
3. ✅ 기존 컨테이너 중지
4. ✅ 새 컨테이너 시작

## 🎯 예상 결과

### 성공 시:

```
=====================================
  [SUCCESS] Deployment complete!
=====================================

Access:
  - Next.js App: http://localhost:3000
  - Grafana:     Internal network only
```

### 실패 시:

```bash
# 로그 확인
docker-compose logs

# 상태 확인
docker-compose ps

# Docker Desktop 상태
docker info
```

## 🔍 진단 명령어

```powershell
# Docker 연결 확인
docker info

# WSL 상태 확인
wsl --status

# WSL 배포판 목록
wsl --list --verbose

# 포트 사용 확인
netstat -ano | findstr :3000

# Docker Desktop 프로세스 확인
Get-Process "Docker Desktop"
```

## 📝 최종 체크리스트

- [ ] 시스템 재부팅 완료
- [ ] Docker Desktop 실행 확인
- [ ] WSL 정상 작동 확인
- [ ] `start.bat` 실행
- [ ] http://localhost:3000 접속
- [ ] 앱 정상 작동 확인

## 💡 참고사항

### 포트 설정
- **3000**: Next.js 앱만 외부 노출
- Grafana, Loki, Redis는 내부 네트워크 전용

### 파일 위치
```
C:\Vibe Coding\Homepage\metaldragon\
├── start.bat              # 배포 스크립트
├── manage.bat             # 관리 도구
├── QUICK_START.md         # 빠른 가이드
├── README_DEPLOY.md       # 상세 가이드
└── TROUBLESHOOTING.md     # 이 파일
```

---

**작성일**: 2025-10-05
**Docker 버전**: 28.3.2
**WSL 버전**: 2
