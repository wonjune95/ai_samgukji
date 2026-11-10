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
- **인증 없음**: 방 코드를 아는 사람은 누구나 참가할 수 있습니다.
- **외부 리소스**: 플레이어 브라우저가 `cdn.jsdelivr.net`(three.js)과 Google Fonts에 접속할 수 있어야 3D 화면이 나옵니다. 접속이 막히면 2D 화면으로 실행됩니다.
- **페이지 크기**: 약 10MB(gzip 시 약 7MB). 첫 접속이 느릴 수 있습니다.

## 소스 수정 후 갱신

```bash
sh build.sh                      # dist/ 다시 생성
docker build -t ai-samgukji . && docker rm -f ai-samgukji && docker run -d --name ai-samgukji -p 8080:8080 ai-samgukji
```

## 3D 모델 다시 만들기(선택)

```bash
pip install numpy scikit-image fast-simplification
node tools/dump.js /tmp/prims.json
python3 tools/gen.py /tmp/prims.json /tmp/models.glb   # 수십 분 소요
python3 tools/pack.py /tmp/models.glb src/05y-pack.js
```
