# Metaldragon 배포 가이드

## 🚀 빠른 시작

### 필수 요구사항
- Docker Desktop for Windows 설치 및 실행
- Git Bash 또는 PowerShell

### 1분 시작 가이드

```bash
# 1. 프로젝트 디렉토리로 이동
cd metaldragon

# 2. 서비스 시작
manage.bat start

# 3. 브라우저에서 확인
# http://localhost:3000 - 메인 애플리케이션
# http://localhost:3002 - Grafana 대시보드
```

## 📦 관리 명령어

### 서비스 관리

```bash
# 서비스 시작
manage.bat start

# 서비스 중지
manage.bat stop

# 서비스 재시작
manage.bat restart

# 서비스 상태 확인
manage.bat status

# 로그 확인
manage.bat logs          # 모든 서비스
manage.bat logs app      # Next.js 앱만
manage.bat logs grafana  # Grafana만

# 이미지 재빌드
manage.bat build

# 전체 정리 (데이터 삭제)
manage.bat clean
```

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Next.js  │  │ Grafana  │            │
│  │   App    │  │  :3001   │            │
│  │  :3000   │  └──────────┘            │
│  └────┬─────┘                          │
│       │                                │
│  ┌────┴────────┬──────────┐            │
│  │   Redis     │   Loki   │ (내부)    │
│  │  (캐시)     │  (로그)  │            │
│  └─────────────┴──────────┘            │
│                ↑                       │
│          ┌─────┴──────┐                │
│          │  Promtail  │                │
│          │ (로그수집) │                │
│          └────────────┘                │
└─────────────────────────────────────────┘
```

## 🔧 환경 설정

### 환경 변수 (.env.production)

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `NEXT_PUBLIC_GOOGLE_CALENDAR_ID` - Google 캘린더 ID
- `NEXT_PUBLIC_GOOGLE_API_KEY` - Google API 키
- `YOUTUBE_API_KEY` - YouTube API 키
- `GRAFANA_ADMIN_PASSWORD` - Grafana 관리자 비밀번호

## 🔍 트러블슈팅

### Docker Desktop이 실행되지 않음
```bash
# Docker Desktop 수동 시작
"C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 포트 충돌 오류
```bash
# 포트 사용 확인
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 프로세스 종료
taskkill /F /PID [프로세스ID]
```

### 컨테이너가 시작되지 않음
```bash
# 로그 확인
manage.bat logs

# 컨테이너 재시작
manage.bat restart

# 완전 재빌드
manage.bat stop
manage.bat build
```

### 이미지 빌드 실패
```bash
# Docker 이미지 정리
docker system prune -a

# 재빌드
manage.bat build
```

## 🛡️ 보안

### 포트 노출 정책
- **외부 노출**: 3000 (App), 3001 (Grafana)
- **내부 네트워크**: 6379 (Redis), 3100 (Loki)

### 환경 변수 관리
- `.env.production` 파일은 절대 Git에 커밋하지 않음
- `.gitignore`에 포함 확인
- 프로덕션 배포 시 환경 변수 별도 관리

## 📊 모니터링

### Grafana 대시보드
1. http://localhost:3001 접속
2. 로그인: admin / metaldragon2025
3. Loki 데이터 소스 확인
4. 애플리케이션 로그 쿼리

### 로그 확인
```bash
# 실시간 로그
manage.bat logs app

# 특정 서비스
docker-compose logs -f [서비스명]
```

## 🔄 업데이트 및 배포

### 코드 변경 후 배포
```bash
# 1. Git 변경사항 확인
git status

# 2. 코드 업데이트
git pull

# 3. 재빌드 및 재시작
manage.bat build
```

### 환경 변수 변경
```bash
# 1. .env.production 수정
notepad .env.production

# 2. 서비스 재시작
manage.bat restart
```

## 📝 유지보수 체크리스트

### 일일
- [ ] 서비스 상태 확인: `manage.bat status`
- [ ] 로그 확인: `manage.bat logs app`

### 주간
- [ ] Docker 볼륨 사용량 확인
- [ ] Grafana 대시보드 리뷰

### 월간
- [ ] Docker 이미지 업데이트
- [ ] 백업 확인
- [ ] 보안 업데이트 확인

## 💾 백업

### 데이터 백업
```bash
# 볼륨 목록 확인
docker volume ls

# Redis 데이터 백업
docker run --rm -v metaldragon_redis-data:/data -v %cd%:/backup alpine tar czf /backup/redis-backup.tar.gz /data

# Grafana 데이터 백업
docker run --rm -v metaldragon_grafana-data:/data -v %cd%:/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

## 🆘 긴급 복구

```bash
# 1. 모든 서비스 중지
manage.bat stop

# 2. 데이터 백업 (선택사항)
docker-compose down -v  # 주의: 모든 데이터 삭제

# 3. 재시작
manage.bat start
```

## 📞 지원

문제 발생 시:
1. `manage.bat logs` 로그 확인
2. GitHub Issues 검색
3. Docker Desktop 재시작

---

**마지막 업데이트**: 2025-10-05
**버전**: 1.0.0
