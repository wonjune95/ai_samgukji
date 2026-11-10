# AI삼국지

ChatGPT·Gemini·Claude 세 진영이 겨루는 브라우저 3D 실시간 전략 게임입니다.
게임 계산은 각 플레이어의 브라우저가 하고, 서버는 페이지 제공과 온라인 대전 중계만 담당합니다.

> 이 프로젝트는 OpenAI, Google, Anthropic 및 Blizzard Entertainment와 관계가 없는 팬 제작물입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `src/` | 게임 소스 조각(HTML, JavaScript). `05y-pack.js`는 내장 3D 모델(GLB, gzip+base64) |
| `build.sh` | `src/`를 합쳐 `dist/index.html`(자체 서버용)과 `dist/ai-samgukji.html`(claude.ai 게시용) 생성 |
| `server/` | Node.js 서버: `/` 게임 페이지, `/ws` 온라인 대전 중계, `/healthz` 상태 확인 |
| `tools/` | 3D 모델 생성기(Python). 모델을 다시 만들 때만 필요 |
| `deploy/` | nginx, systemd 설정 예시 |

## 실행

### Docker

```bash
docker build -t ai-samgukji .
docker run -d --name ai-samgukji -p 8080:8080 --restart unless-stopped ai-samgukji
curl http://localhost:8080/healthz   # ok
```

### Node.js 직접 실행 (Node 18 이상)

```bash
sh build.sh
cd server && npm ci --omit=dev && cd ..
PORT=8080 node server/server.js
```

브라우저에서 `http://<VM 주소>:8080` 에 접속합니다. 방화벽에서 8080 포트(또는 프록시 포트)를 열어야 합니다.

## 운영 시 유의 사항

- **HTTPS 권장**: `deploy/nginx.conf` 처럼 역방향 프록시에서 TLS를 종료하고, `/ws` 경로에 WebSocket Upgrade 헤더를 넘겨야 합니다.
- **단일 인스턴스**: 방 정보는 서버 메모리에만 있으므로 여러 대로 늘리면 같은 방 참가자가 서로 다른 서버에 붙을 수 있습니다. 확장하려면 세션 고정(sticky session)이 필요합니다.
- **인증 없음**: 방 코드를 아는 사람은 누구나 참가할 수 있습니다. 순위표의 신원은 브라우저에 저장된 임의 토큰입니다.
- **nginx 뒤에서 실행**: API 빈도 제한이 실제 접속자 IP로 동작하도록 `TRUST_PROXY=1`을 설정합니다.
- **외부 리소스**: three.js는 이 서버의 `/vendor/`에서 제공합니다. 글꼴은 Google Fonts를 사용합니다(접속이 막히면 시스템 글꼴로 표시).
- **페이지 크기**: 약 10MB(서버가 gzip으로 약 7.4MB 전송, 재방문은 ETag로 304 응답). 첫 접속이 느릴 수 있습니다.

## 소스 수정 후 갱신

```bash
sh build.sh                      # dist/ 다시 생성
docker build -t ai-samgukji . && docker rm -f ai-samgukji && docker run -d --name ai-samgukji -p 8080:8080 ai-samgukji
```

systemd로 직접 실행 중이라면:

```bash
sh deploy/release.sh
sudo sh deploy/deploy.sh release.tgz   # /healthz 실패 시 직전 버전으로 자동 복구
```

## 데이터베이스

순위표와 공유 리플레이는 PostgreSQL을 사용합니다. `PGDATABASE` 환경변수가 없으면 해당 기능만 꺼지고 게임과 온라인 대전은 그대로 동작합니다. 표는 서버가 시작할 때 자동으로 만듭니다.

```bash
sudo -u postgres psql -c 'CREATE ROLE "ai-samgukji" LOGIN' -c 'CREATE DATABASE ai_samgukji OWNER "ai-samgukji"'
sudo install -d -o postgres -g postgres -m 700 /var/lib/pgsql/backups
sudo cp deploy/ai-samgukji-backup.{service,timer} /etc/systemd/system/ && sudo systemctl enable --now ai-samgukji-backup.timer
```

## GitHub Actions 자동 배포

`main`에 푸시하면 문법 검사, 빌드, 기동 시험, 시뮬레이션 시험을 실행합니다. 배포는 아래를 모두 설정해야 동작합니다.

1. GitHub에서 VM의 SSH 포트에 접속할 수 있어야 합니다(사설망이면 self-hosted runner 필요).
2. VM에 배포 전용 계정과 키를 만들고, 배포 스크립트만 root로 실행하도록 허용합니다.
   ```bash
   sudo install -m 755 deploy/deploy.sh /usr/local/sbin/ai-samgukji-deploy
   # /etc/sudoers.d/ai-samgukji-deploy
   # <계정> ALL=(root) NOPASSWD: /usr/local/sbin/ai-samgukji-deploy /tmp/ai-samgukji-release-*.tgz
   ```
3. 저장소 비밀값 `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_KEY`, `DEPLOY_KNOWN_HOSTS`와 변수 `DEPLOY_ENABLED=true`를 설정합니다.

## 3D 모델 다시 만들기(선택)

```bash
pip install numpy scikit-image fast-simplification
node tools/dump.js /tmp/prims.json
python3 tools/gen.py /tmp/prims.json /tmp/models.glb   # 수십 분 소요
python3 tools/pack.py /tmp/models.glb src/05y-pack.js
```
