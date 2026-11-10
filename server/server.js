// AI삼국지 자체 서버: 게임 페이지 제공 + 온라인 대전 중계(WebSocket)
// 게임 계산은 각 브라우저가 하고, 서버는 방 안의 상태(presence)만 전달한다.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8080);
const PAGE = process.env.PAGE || path.join(__dirname, '..', 'dist', 'index.html');
const VENDOR = process.env.VENDOR || path.join(__dirname, '..', 'dist', 'vendor');
const MAX_ROOMS = Number(process.env.MAX_ROOMS || 500);
const MAX_PEERS = 8;            // 방 하나당 최대 접속 수
const MAX_PRESENCE = 4096;      // presence JSON 최대 길이
const MAX_MSG_PER_SEC = 60;     // 연결당 초당 메시지 상한
const ROOM_RE = /^aisg-[a-z0-9]{3,8}$/;

// 응답 본문은 원본·gzip·ETag를 미리 준비한다(페이지가 약 10MB라 요청마다 압축하지 않는다)
const GZIP = { level: 9 };
const pack = (raw, gz) => {
  const tag = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
  return { raw, gz, etag: `"${tag}"`, etagGz: `"${tag}-gz"` };
};
const packSync = (raw) => pack(raw, zlib.gzipSync(raw, GZIP));

let page = packSync(fs.readFileSync(PAGE));
fs.watchFile(PAGE, { interval: 5000 }, () => {
  fs.readFile(PAGE, (err, raw) => {
    if (err) return;
    zlib.gzip(raw, GZIP, (e, gz) => { if (!e) page = pack(raw, gz); });
  });
});

// dist/vendor 아래 파일만 정확한 경로로 제공한다(경로에 버전이 있어 장기 캐시 가능)
const vendor = new Map();
const walk = (dir, base) => {
  let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const d of list) {
    const f = path.join(dir, d.name), u = `${base}/${d.name}`;
    if (d.isDirectory()) walk(f, u);
    else if (d.isFile()) vendor.set(u, packSync(fs.readFileSync(f)));
  }
};
walk(VENDOR, '/vendor');

const wantsGzip = (h) => String(h || '').split(',').some((s) => {
  const [enc, ...opts] = s.trim().toLowerCase().split(';');
  if (enc.trim() !== 'gzip') return false;
  const q = opts.map((o) => o.trim()).find((o) => o.startsWith('q='));
  return !q || Number(q.slice(2)) > 0;
});
const etagMatches = (h, etag) => !!h && (h.trim() === '*' || h.split(',').some((t) => t.trim().replace(/^W\//, '') === etag));
const sendAsset = (req, res, a, type, cache) => {
  const gz = wantsGzip(req.headers['accept-encoding']);
  const etag = gz ? a.etagGz : a.etag;
  const head = { 'content-type': type, 'cache-control': cache, etag, vary: 'Accept-Encoding', 'x-content-type-options': 'nosniff' };
  if (etagMatches(req.headers['if-none-match'], etag)) { res.writeHead(304, head); return res.end(); }
  const body = gz ? a.gz : a.raw;
  if (gz) head['content-encoding'] = 'gzip';
  head['content-length'] = body.length;
  res.writeHead(200, head); res.end(body);
};

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok'); }
  if (url === '/' || url === '/index.html') return sendAsset(req, res, page, 'text/html; charset=utf-8', 'no-cache');
  const asset = vendor.get(url);
  if (asset) return sendAsset(req, res, asset, url.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8', 'public, max-age=31536000, immutable');
  res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
});

const rooms = new Map(); // name -> Map(peerId -> {ws, presence})
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 });
const newId = () => Math.random().toString(36).slice(2, 10);
const send = (ws, m) => { if (ws.readyState === 1) ws.send(JSON.stringify(m)); };
const broadcast = (room, m, except) => { for (const [id, p] of room) if (id !== except) send(p.ws, m); };

wss.on('connection', (ws) => {
  let roomName = null, me = null, count = 0, windowStart = Date.now();
  ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { t: 'hello' });

  const leave = () => {
    if (!roomName) return;
    const room = rooms.get(roomName);
    if (room && room.get(me) && room.get(me).ws === ws) {
      room.delete(me); broadcast(room, { t: 'left', peer: me });
      if (!room.size) rooms.delete(roomName);
    }
    roomName = null;
  };

  ws.on('message', (raw) => {
    const now = Date.now();
    if (now - windowStart > 1000) { windowStart = now; count = 0; }
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    // presence는 최신 값이 이전 값을 대신하므로 과도하면 버린다(입장·퇴장은 항상 처리)
    if (++count > MAX_MSG_PER_SEC && m.t === 'pres') return;

    if (m.t === 'join') {
      if (typeof m.room !== 'string' || !ROOM_RE.test(m.room)) return send(ws, { t: 'error', msg: 'bad room' });
      leave();
      let room = rooms.get(m.room);
      if (!room) { if (rooms.size >= MAX_ROOMS) return send(ws, { t: 'error', msg: 'busy' }); room = new Map(); rooms.set(m.room, room); }
      // 재접속: 같은 peer id를 다시 요청하면 이어서 사용한다
      let id = typeof m.peer === 'string' && /^[a-z0-9]{8}$/.test(m.peer) ? m.peer : null;
      const prev = id && room.get(id);
      if (prev) { try { prev.ws.terminate(); } catch (e) {} }
      else { if (room.size >= MAX_PEERS) return send(ws, { t: 'error', msg: 'full' }); if (!id || room.has(id)) id = newId(); }
      me = id; roomName = m.room;
      room.set(me, { ws, presence: prev ? prev.presence : {} });
      send(ws, { t: 'joined', peer: me, peers: [...room].filter(([k]) => k !== me).map(([k, p]) => ({ peer: k, presence: p.presence })) });
      if (!prev) broadcast(room, { t: 'pres', peer: me, p: {} }, me);
      return;
    }
    if (!roomName) return;
    const room = rooms.get(roomName); if (!room) return;
    if (m.t === 'pres') {
      if (!m.p || typeof m.p !== 'object' || Array.isArray(m.p)) return;
      const s = JSON.stringify(m.p); if (s.length > MAX_PRESENCE) return;
      const self = room.get(me); if (!self || self.ws !== ws) return;
      self.presence = m.p; broadcast(room, { t: 'pres', peer: me, p: m.p }, me);
    } else if (m.t === 'leave') { leave(); }
  });
  ws.on('close', () => {
    // 일시적 단절일 수 있으므로 10초 뒤에도 돌아오지 않으면 방에서 뺀다
    const rn = roomName, id = me;
    setTimeout(() => {
      const room = rn && rooms.get(rn);
      if (room && room.get(id) && room.get(id).ws === ws) { room.delete(id); broadcast(room, { t: 'left', peer: id }); if (!room.size) rooms.delete(rn); }
    }, 10000);
  });
});

const hb = setInterval(() => {
  for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; try { ws.ping(); } catch (e) {} }
}, 20000);
wss.on('close', () => clearInterval(hb));

server.listen(PORT, () => console.log(`AI삼국지 서버: http://0.0.0.0:${PORT}`));
