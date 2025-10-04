# GitHub Actions 자동 배포 설정 가이드

GitHub Actions를 사용하여 `master` 브랜치에 푸시할 때마다 자동으로 서버에 배포됩니다.

---

## 1️⃣ GitHub Secrets 설정

GitHub 저장소에서 민감한 정보를 안전하게 저장합니다.

### 1.1 Secrets 페이지 이동

1. GitHub 저장소 페이지 접속: https://github.com/choulyong/homepage
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭

### 1.2 필수 Secrets 추가

다음 4개의 Secret을 추가하세요:

#### SECRET 1: `SERVER_HOST`
- **Name**: `SERVER_HOST`
- **Value**: 서버 IP 주소 (예: `123.456.789.012`)

#### SECRET 2: `SERVER_USER`
- **Name**: `SERVER_USER`
- **Value**: SSH 사용자명 (예: `ubuntu` 또는 `root`)

#### SECRET 3: `SSH_PRIVATE_KEY`
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: SSH 개인키 전체 내용

**SSH 개인키 가져오기** (서버에서 실행):
```bash
cat ~/.ssh/id_ed25519
```

또는 새로 생성:
```bash
ssh-keygen -t ed25519 -C "github-actions@metaldragon.co.kr" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy
```

**개인키 예시**:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
(여러 줄)
...
-----END OPENSSH PRIVATE KEY-----
```

**⚠️ 중요**: 개인키 전체를 복사하여 붙여넣으세요 (BEGIN부터 END까지 포함)

**공개키를 서버에 등록**:
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### SECRET 4: `SSH_PORT` (선택사항)
- **Name**: `SSH_PORT`
- **Value**: SSH 포트 번호 (기본값 `22`)

---

## 2️⃣ 서버 준비

### 2.1 배포 디렉토리 생성

```bash
# 서버에 SSH 접속
ssh your_user@your_server_ip

# 배포 디렉토리 생성
sudo mkdir -p /var/www/metaldragon
sudo chown -R $USER:$USER /var/www/metaldragon

# Git 클론
cd /var/www
git clone https://github.com/choulyong/homepage.git metaldragon
cd metaldragon
```

### 2.2 환경변수 설정

```bash
# .env.production 파일 생성
cp .env.example .env.production
nano .env.production
```

**필수 환경변수 입력**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xhzqhvjkkfpeavdphoit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GRAFANA_ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
```

### 2.3 Docker 설치 확인

```bash
docker --version
docker-compose --version
```

없다면:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 3️⃣ 자동 배포 테스트

### 3.1 수동 워크플로우 실행

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **Deploy to Production** 워크플로우 선택
3. **Run workflow** 버튼 클릭
4. **Run workflow** 확인

### 3.2 배포 로그 확인

- Actions 탭에서 실행 중인 워크플로우 클릭
- 각 단계별 로그 확인
- ✅ 모든 단계가 초록색이면 성공

### 3.3 자동 배포 테스트

```bash
# 로컬에서 코드 변경
echo "test" >> README.md

# 커밋 및 푸시
git add README.md
git commit -m "test: Auto-deployment test"
git push origin master
```

- GitHub Actions가 자동으로 실행됨
- 약 2-3분 후 서버에 배포 완료

---

## 4️⃣ 배포 확인

### 4.1 서버에서 확인

```bash
# 서버 접속
ssh your_user@your_server_ip

# 배포 디렉토리 확인
cd /var/www/metaldragon

# Git 상태 확인
git log -1

# Docker 컨테이너 확인
docker-compose ps
```

### 4.2 웹사이트 확인

- 브라우저에서 https://metaldragon.co.kr 접속
- 변경사항이 반영되었는지 확인

---

## 5️⃣ 문제 해결

### 배포 실패 시

1. **Actions 로그 확인**:
   - GitHub → Actions → 실패한 워크플로우 클릭
   - 빨간색 단계 클릭하여 에러 메시지 확인

2. **SSH 연결 오류**:
   ```
   Error: dial tcp: lookup your_server_ip: no such host
   ```
   - `SERVER_HOST` Secret 값 확인
   - 서버 IP가 정확한지 확인

3. **권한 오류**:
   ```
   Permission denied (publickey)
   ```
   - `SSH_PRIVATE_KEY` Secret 값 확인
   - 서버의 `~/.ssh/authorized_keys`에 공개키가 등록되었는지 확인

4. **Docker 오류**:
   ```
   Error: Cannot connect to the Docker daemon
   ```
   - 서버에서 `sudo systemctl start docker` 실행
   - Docker 그룹에 사용자 추가: `sudo usermod -aG docker $USER`

### 수동 배포

자동 배포가 실패하면 수동으로 배포:

```bash
# 서버 접속
ssh your_user@your_server_ip

# 배포 스크립트 실행
cd /var/www/metaldragon
sudo ./deploy.sh
```

---

## 6️⃣ 배포 알림 설정 (선택사항)

### Slack 알림

`.github/workflows/deploy.yml`에 추가:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: Deployment to metaldragon.co.kr ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 이메일 알림

GitHub Settings → Notifications에서 설정:
- ✅ Actions: Workflow runs

---

## 📊 배포 통계

GitHub Actions 사용 제한 (무료 플랜):
- **월간 제한**: 2,000분
- **현재 배포 시간**: 약 2-3분
- **예상 배포 횟수**: 약 600-1000회/월

---

## 🔒 보안 모범 사례

1. **SSH 키 관리**:
   - 배포 전용 SSH 키 사용
   - 주기적으로 키 교체 (3-6개월)

2. **Secrets 보안**:
   - Secret 값 절대 로그에 출력하지 않기
   - 불필요한 권한 부여하지 않기

3. **브랜치 보호**:
   - Settings → Branches
   - `master` 브랜치 보호 규칙 추가
   - Pull Request 필수 설정

---

## ✅ 체크리스트

배포 자동화 설정 완료 확인:

- [ ] GitHub Secrets 4개 추가 완료
  - [ ] `SERVER_HOST`
  - [ ] `SERVER_USER`
  - [ ] `SSH_PRIVATE_KEY`
  - [ ] `SSH_PORT` (선택)
- [ ] 서버에 `/var/www/metaldragon` 디렉토리 생성
- [ ] `.env.production` 파일 설정
- [ ] Docker 설치 확인
- [ ] 수동 워크플로우 실행 테스트
- [ ] 자동 배포 테스트 (코드 푸시)
- [ ] 웹사이트 접속 확인

---

**모든 설정이 완료되면 이제 `git push`만으로 자동 배포됩니다!** 🚀
