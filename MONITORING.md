# 📊 Metaldragon Monitoring Stack

Loki + Grafana + Promtail을 사용한 중앙 집중식 로그 수집 및 시각화 시스템

## 🏗️ 구성 요소

- **Loki** (포트 3100): 로그 수집 및 저장
- **Promtail**: Docker 컨테이너 및 시스템 로그 수집
- **Grafana** (포트 3001): 로그 시각화 대시보드
- **Redis** (포트 6379): 로컬 개발용 캐시 (Upstash 대체)

## 🚀 시작하기

### 1. 모니터링 스택 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f grafana
```

### 2. Grafana 접속

```
URL: http://localhost:3001
기본 계정: admin / metaldragon
```

**초기 설정**:
1. Grafana에 로그인
2. 좌측 메뉴에서 "Explore" 클릭
3. Loki 데이터소스가 자동으로 설정되어 있음
4. 로그 쿼리 시작: `{job="docker"}` 또는 `{container="metaldragon-app"}`

### 3. 환경변수 설정 (선택사항)

`.env.local` 파일에 추가:

```env
# Grafana Admin Password
GRAFANA_ADMIN_PASSWORD=your_secure_password_here
```

### 4. 중지 및 정리

```bash
# 서비스 중지
docker-compose down

# 데이터까지 모두 삭제
docker-compose down -v
```

## 📝 로그 쿼리 예제

### 기본 쿼리

```logql
# 모든 Docker 컨테이너 로그
{job="docker"}

# 특정 컨테이너 로그
{container="metaldragon-app"}

# 에러 로그만 필터링
{job="docker"} |= "error"

# 정규식으로 필터링
{job="docker"} |~ "error|Error|ERROR"
```

### 고급 쿼리

```logql
# 최근 5분간 에러 발생 횟수
count_over_time({job="docker"} |= "error" [5m])

# HTTP 500 에러 필터링
{job="nginx"} | json | status="500"

# rate 계산 (초당 로그 수)
rate({job="docker"}[1m])
```

## 🎨 대시보드 추천

### 1. Next.js 애플리케이션 모니터링

- **패널 1**: 최근 로그 스트림
- **패널 2**: 에러 발생 추이 (시계열)
- **패널 3**: HTTP 상태 코드 분포
- **패널 4**: 응답 시간 히스토그램

### 2. 시스템 모니터링

- **패널 1**: Docker 컨테이너 상태
- **패널 2**: 메모리/CPU 사용량 (Docker stats)
- **패널 3**: 디스크 I/O

### 3. 보안 모니터링

- **패널 1**: 실패한 로그인 시도
- **패널 2**: 비정상 API 요청
- **패널 3**: Rate limit 초과 이벤트

## 🔧 문제 해결

### Loki에 로그가 안 보일 때

```bash
# Promtail 로그 확인
docker-compose logs promtail

# Loki 상태 확인
curl http://localhost:3100/ready

# Promtail 상태 확인
curl http://localhost:9080/ready
```

### Grafana 접속 안 될 때

```bash
# Grafana 컨테이너 재시작
docker-compose restart grafana

# Grafana 로그 확인
docker-compose logs grafana
```

### 디스크 공간 부족 시

```bash
# Loki 데이터 정리 (31일 이상 오래된 로그 자동 삭제됨)
# loki-config.yaml의 retention_period 설정 확인

# 수동으로 볼륨 정리
docker-compose down
docker volume rm metaldragon_loki-data
docker-compose up -d
```

## 📈 성능 최적화

### Loki 설정 튜닝

`loki-config.yaml`에서 조정 가능한 항목:

- `retention_period`: 로그 보관 기간 (기본 31일)
- `ingestion_rate_mb`: 로그 수집 속도 제한
- `max_query_series`: 쿼리 시 반환할 최대 시리즈 수

### Promtail 최적화

- 불필요한 로그 경로 제거
- 정규식 파싱 최소화
- batch_size 조정으로 네트워크 부하 감소

## 🔐 보안 권장사항

1. **Grafana 비밀번호 변경**: 초기 로그인 후 반드시 비밀번호 변경
2. **외부 접근 차단**: Grafana는 Nginx 리버스 프록시 뒤에 배치
3. **HTTPS 사용**: 프로덕션 환경에서는 SSL/TLS 필수
4. **로그 민감정보 필터링**: 비밀번호, API 키 등이 로그에 포함되지 않도록 주의

## 📚 추가 자료

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)

---

**Built with ❤️ by metaldragon**
