# Auto-Start Scripts

이 폴더에는 Windows 재부팅 후 자동으로 서비스를 시작하는 스크립트들이 있습니다.

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
