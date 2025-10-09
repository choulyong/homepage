# Metaldragon Docker 시작 스크립트
# Docker Desktop 상태 확인 및 자동 재시작

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Metaldragon Docker 시작 스크립트  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker Desktop 프로세스 확인
Write-Host "[1/5] Docker Desktop 상태 확인..." -ForegroundColor Yellow
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue

if ($null -eq $dockerProcess) {
    Write-Host "  → Docker Desktop이 실행되지 않음" -ForegroundColor Red
    Write-Host "  → Docker Desktop 시작 중..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "  → 60초 대기 중..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
} else {
    Write-Host "  ✓ Docker Desktop 실행 중" -ForegroundColor Green
}

# 2. Docker 데몬 연결 확인
Write-Host ""
Write-Host "[2/5] Docker 데몬 연결 확인..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$dockerReady = $false

while ($retryCount -lt $maxRetries -and -not $dockerReady) {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Docker 데몬 연결 성공" -ForegroundColor Green
            $dockerReady = $true
        } else {
            throw "Docker not ready"
        }
    } catch {
        $retryCount++
        Write-Host "  → 재시도 ($retryCount/$maxRetries)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $dockerReady) {
    Write-Host "  ✗ Docker 데몬 연결 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "해결 방법:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop을 수동으로 종료"
    Write-Host "  2. 시스템 재부팅"
    Write-Host "  3. Docker Desktop 재설치"
    Write-Host ""
    exit 1
}

# 3. 포트 3000 확인 및 정리
Write-Host ""
Write-Host "[3/5] 포트 3000 정리..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pid = $port3000.OwningProcess
    Write-Host "  → PID $pid가 포트 3000 사용 중, 종료..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✓ 포트 3000 정리 완료" -ForegroundColor Green
} else {
    Write-Host "  ✓ 포트 3000 사용 가능" -ForegroundColor Green
}

# 4. 기존 컨테이너 정리
Write-Host ""
Write-Host "[4/5] 기존 컨테이너 정리..." -ForegroundColor Yellow
Set-Location "C:\Vibe Coding\Homepage\metaldragon"
docker-compose down 2>&1 | Out-Null
Write-Host "  ✓ 컨테이너 정리 완료" -ForegroundColor Green

# 5. Docker Compose 실행
Write-Host ""
Write-Host "[5/5] Docker Compose 실행..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  ✓ 배포 성공!                     " -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "접속 정보:" -ForegroundColor Cyan
    Write-Host "  - Next.js App: " -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  - Grafana:     " -NoNewline
    Write-Host "내부 네트워크 전용" -ForegroundColor Gray
    Write-Host ""
    Write-Host "상태 확인:" -ForegroundColor Cyan
    Write-Host "  docker-compose ps" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "로그 확인:" -ForegroundColor Cyan
    Write-Host "  docker-compose logs -f app" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "  ✗ 배포 실패                      " -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "로그 확인:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
