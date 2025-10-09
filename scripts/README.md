# Scripts Collection

이 폴더에는 시스템 자동화 스크립트들이 있습니다.

## 📂 Auto-Start Scripts

Windows 재부팅 후 자동으로 서비스를 시작하는 스크립트들입니다.

## 파일 설명

- `start-cloudflared.bat` - Cloudflared Tunnel을 시작하는 스크립트
- `start-nextjs.bat` - Next.js 서버를 시작하는 스크립트
- `setup-autostart.bat` - 자동 시작을 등록하는 스크립트 (관리자 권한 필요)
- `remove-autostart.bat` - 자동 시작을 제거하는 스크립트

## 설치 방법

1. **관리자 권한으로** `setup-autostart.bat`을 실행합니다
   - Windows 탐색기에서 우클릭 → "관리자 권한으로 실행"

2. 설치가 완료되면 다음 작업이 등록됩니다:
   - `MetalDragon-Cloudflared` - Cloudflare Tunnel
   - `MetalDragon-NextJS` - Next.js 서버

3. 이제 Windows 재부팅 시 자동으로 두 서비스가 시작됩니다

## 확인 방법

작업 스케줄러에서 등록된 작업 확인:
```bash
# 작업 스케줄러 열기
taskschd.msc

# 또는 명령어로 확인
schtasks /query /tn "MetalDragon-Cloudflared"
schtasks /query /tn "MetalDragon-NextJS"
```

## 로그 확인

자동 시작 로그는 다음 위치에 저장됩니다:
- `C:\cloudflared-startup.log` - Cloudflared 시작 로그
- `C:\nextjs-startup.log` - Next.js 시작 로그

## 제거 방법

자동 시작을 해제하려면:
```bash
scripts\remove-autostart.bat
```

## 수동 실행

자동 시작 설정 없이 서비스를 수동으로 시작하려면:
```bash
# Cloudflared 시작
scripts\start-cloudflared.bat

# Next.js 시작
scripts\start-nextjs.bat
```

## 주의사항

- 스크립트는 관리자 권한이 필요합니다
- 시스템 부팅 후 네트워크 연결까지 대기 시간이 포함되어 있습니다
  - Cloudflared: 10초 대기
  - Next.js: 15초 대기
- 로그 파일이 C 드라이브 루트에 생성됩니다

---

## 💾 Backup Scripts

데이터베이스와 파일을 백업하는 자동화 스크립트들입니다.

### 백업 스크립트 목록

- `backup-database.bat` - Supabase 데이터베이스 백업
- `backup-files.bat` - 업로드된 파일 백업 (public/uploads)
- `backup-full.bat` - 전체 백업 (데이터베이스 + 파일)
- `setup-backup-schedule.bat` - 자동 백업 스케줄 설정 (일일/주간)
- `remove-backup-schedule.bat` - 자동 백업 스케줄 제거

### 백업 설치 방법

1. **관리자 권한으로** `setup-backup-schedule.bat`을 실행합니다
   - Windows 탐색기에서 우클릭 → "관리자 권한으로 실행"

2. 설치가 완료되면 다음 작업이 등록됩니다:
   - `MetalDragon-DailyBackup` - 매일 오전 2시 전체 백업
   - `MetalDragon-WeeklyBackup` - 매주 일요일 오전 3시 전체 백업

3. 백업 파일 저장 위치:
   - 데이터베이스: `C:\Vibe Coding\Homepage\metaldragon\backups\database\`
   - 파일: `C:\Vibe Coding\Homepage\metaldragon\backups\files\`

### 수동 백업 실행

자동 스케줄 없이 수동으로 백업하려면:
```bash
# 전체 백업
scripts\backup-full.bat

# 데이터베이스만
scripts\backup-database.bat

# 파일만
scripts\backup-files.bat
```

### 백업 관리

- **오래된 백업 자동 삭제**: 30일 이상 된 백업은 자동으로 삭제됩니다
- **백업 확인**: 백업 디렉토리에서 생성된 파일 확인
- **스케줄 확인**: Task Scheduler (taskschd.msc)에서 확인 가능

### 데이터베이스 백업 주의사항

⚠️ **Supabase 데이터베이스 백업을 위해서는:**

1. **PostgreSQL 클라이언트 설치 필요**
   - [PostgreSQL 다운로드](https://www.postgresql.org/download/)
   - pg_dump 도구 사용

2. **Supabase 비밀번호 설정**
   - `backup-database.bat` 파일에서 PGPASSWORD 설정
   - 또는 환경변수로 설정

3. **대안: Supabase Dashboard 사용**
   - https://supabase.com/dashboard/project/xhzqhvjkkfpeavdphoit
   - Database > Backups
   - 수동 백업 생성

### 백업 복원

**데이터베이스 복원:**
```bash
# PostgreSQL 클라이언트로 복원
set PGPASSWORD=your_password
pg_restore -h db.xhzqhvjkkfpeavdphoit.supabase.co -p 5432 -U postgres -d postgres -v backup_file.sql
```

**파일 복원:**
```bash
# 백업 폴더를 public/uploads로 복사
xcopy "backups\files\uploads_TIMESTAMP" "public\uploads" /E /I /H /Y
```
