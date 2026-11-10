# AI삼국지 — Claude Code 작업 안내

이 파일은 claude.ai에서 진행하던 작업을 이 저장소의 Claude Code 세션이 이어받기 위한 안내입니다.

## 프로젝트 개요
- ChatGPT·Gemini·Claude 세 진영의 브라우저 3D 실시간 전략 게임. 단일 HTML로 빌드됨.
- 진영 역할: ChatGPT(고가·보호막 정예), Gemini(모드 전환 공장·수리), Claude(2기 생산·맥락 지대·재생).
- 시뮬레이션: 고정 스텝 30TPS, 타일 32px, 76×76 맵, 시드 난수, 결정론적(같은 입력 → 같은 결과). 리플레이와 온라인 락스텝이 이 성질에 의존하므로 **시뮬레이션에 `Math.random()`이나 시간 의존 코드를 넣지 말 것**(`g.rng()` 사용).
- 렌더링: three.js r128 전역 빌드(`dist/index.html`은 `vendor/`를 서버에서 제공, `dist/ai-samgukji.html`은 jsDelivr). WebGL이 없거나 스크립트를 못 받으면 2D 렌더러로 대체.

## 구조
| 경로 | 내용 |
|---|---|
| `src/00-head.html` | CSS, DOM, CDN 스크립트 태그 |
| `src/01-data.js` | `UNIT`, `BLD`, `ABIL`, `SKILL`, 연구 수치 |
| `src/02-sim.js` | `class Game` 시뮬레이션, 맵 생성(`duel`, `duel2`, `three`) |
| `src/03-bot.js` | `class Bot`, `headless()`, `headless3()` |
| `src/04-bake.js` | 2D 대체용 스프라이트 모델(UN.*, BM.*) |
| `src/05-render.js` | 2D 렌더러 |
| `src/05y-pack.js` | 내장 3D 모델(GLB → gzip → base64). 직접 편집 금지, `tools/pack.py`로 생성 |
| `src/05z-3d.js` | 3D 렌더러, `Pack`(내장 GLB), `Models`(사용자 GLB 불러오기), 지형·장식·효과 |
| `src/05zz-net.js` | 온라인 대전(`Net`, 락스텝), `WSRoom`(자체 서버 중계), `Replay`, `Record`, 캠페인 |
| `src/06-ui.js` | UI, 입력, HUD, 타이틀 |
| `server/server.js` | 페이지 제공 + `/ws` 중계(관전·결과 보고 포함) + `/healthz` + `/api/*`(로비, 빠른 대전, 순위표, 공유 리플레이) |
| `server/db.js` | PostgreSQL 저장소. `PGDATABASE`가 없거나 DB 장애 시 해당 API만 503, 게임과 중계는 계속 동작 |
| `server/validate.js` | 온라인 메시지·공유 리플레이 입력 검증 |
| `icons/` | 파비콘·앱 아이콘(`tools/icons.js`로 생성) |
| `vendor/` | three.js r128 원본 파일(npm 패키지 그대로). 직접 편집 금지 |
| `tools/` | 3D 모델 생성기: `dump.js` → `gen.py`(designs.py 디자인 사용) → `pack.py` |

## 빌드와 실행
```bash
sh build.sh                          # dist/index.html(자체 서버용), dist/ai-samgukji.html(claude.ai 게시용)
cd server && npm ci --omit=dev && cd ..
PORT=8080 node server/server.js
```

운영 VM은 systemd 서비스 `ai-samgukji`로 `/opt/ai-samgukji`에서 실행합니다. DB는 PostgreSQL 16 `ai_samgukji`(Unix 소켓 peer 인증)입니다.
```bash
sh deploy/release.sh && sudo sh deploy/deploy.sh release.tgz   # 응답이 없으면 직전 버전으로 자동 복구
```

## 검증 방법(변경 후 반드시 실행)
1. 문법: `for f in src/0*.js; do node --check $f; done` (05y-pack.js 제외 가능)
2. 밸런스: `node tools/balance.js 16` — 진영별 승률 40~60%, 자리 승수 비슷한지 확인
3. 시뮬레이션 불변: 화면만 바꾼 변경이라면 변경 전후 `headless()` 결과가 같아야 함
4. 브라우저 시험: Playwright로 `dist/index.html`을 열어 `AISG.UI.ready` 대기 후 확인
   - GPU 없는 서버에서는 Chromium 인자 `--use-angle=swiftshader --use-gl=angle --enable-unsafe-swiftshader`
   - 소프트웨어 렌더러는 rAF 루프가 굶으므로 `AISG.UI.hold=true; AISG.UI.r.autoQ=false` 후 `U.r.draw(U, performance.now())`를 직접 호출해 캡처
   - 온라인 대전: 서버를 띄우고 두 페이지에서 `Net.make()` / `Net.enter(code)` / `Net.go()` 후 `Net.hash()` 비교
5. 3D 모델 변경 시: `node tools/dump.js /tmp/p.json && GEN_CACHE=/tmp/gc python3 tools/gen.py /tmp/p.json /tmp/m.glb && python3 tools/pack.py /tmp/m.glb src/05y-pack.js`
   - 의존성: `pip install numpy scikit-image fast-simplification`
   - 페이지 크기 상한 16MB(claude.ai 게시 기준). 현재 약 10MB

## 지켜야 할 제약
- 스타크래프트의 유닛 디자인, 그래픽, 음성, 이름, 코드를 복제하지 않는다. 장르 관례만 사용한다.
- 각 회사의 로고나 상표 이미지를 쓰지 않는다(독자 문양만). 비제휴 문구를 유지한다.
- 온라인 메시지는 신뢰하지 않는 입력으로 취급한다(`Net.exec`의 검증 유지, 서버의 크기·빈도 제한 유지).
- 프로토콜이 바뀌면 `05zz-net.js`의 `NET_V`를 올린다(구버전 리플레이·대전 혼선 방지). `TURN`·`DELAY`는 자체 서버 연결에서 4·2, claude.ai room에서 6·3이다.

## 알려진 문제와 다음 작업
- `duel2`(협곡 회랑) 지도에서 ChatGPT 승률이 높음(약 63%). 공정한 대전은 `duel` 권장.
- 신규 고급 유닛(정렬 창기병 등 9종)의 개별 강약은 측정되지 않음.
- 실제 GPU 프레임 속도, 휴대폰 터치, 사운드는 미검증.
- 순위표는 2인 대전만 집계하고 양쪽 보고가 일치해야 인정한다(상대 이탈 시 몰수승). 브라우저 보고 기반이라 여러 신원을 만든 자작 승리는 막지 못한다. 닉네임 금칙어 필터는 없다.
- 다음 후보: 글꼴 자체 제공, HTTPS, IP별 접속 제한, 새로고침 후 경기 복귀. Prometheus(`/metrics`)는 하지 않는다.

## 응답 방식(사용자 요청)
- 한국어 문어체, 건조하고 전문적인 어조. 구조: 핵심 요약 → 상세 설명 → 근거 및 출처.
- 확인되지 않은 내용은 "알 수 없습니다/확실하지 않음"으로 명시하고, 추측은 문장 앞에 `[추측]`을 붙인다.
- 공식 문서를 우선 출처로 제시하고, 비교는 표로 정리한다. 코드에는 언어를 명시한다.
