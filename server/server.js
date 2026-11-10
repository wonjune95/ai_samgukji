// AI삼국지 자체 서버: 게임 페이지 제공 + 온라인 대전 중계(WebSocket)
// 게임 계산은 각 브라우저가 하고, 서버는 방 안의 상태(presence)만 전달한다.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const db = require('./db');
const { cleanReplay, cleanNick, cleanFac, cleanGo } = require('./validate');

const PORT = Number(process.env.PORT || 8080);
const PAGE = process.env.PAGE || path.join(__dirname, '..', 'dist', 'index.html');
const VENDOR = process.env.VENDOR || path.join(__dirname, '..', 'dist', 'vendor');
const ICONS = process.env.ICONS || path.join(__dirname, '..', 'dist', 'icons');
const MAX_ROOMS = Number(process.env.MAX_ROOMS || 500);
const MAX_PEERS = 8;            // 방 하나당 최대 접속 수
const MAX_PRESENCE = 4096;      // presence JSON 최대 길이
const MAX_MSG_PER_SEC = 60;     // 연결당 초당 메시지 상한
const ROOM_RE = /^aisg-[a-z0-9]{3,8}$/;
const MAX_SPECS = 16;           // 방 하나당 최대 관전자 수
const MAX_LOG = 2 * 1024 * 1024; // 방 하나당 보관할 명령 기록(관전 합류용) 상한
const MAX_REPLAY = 800 * 1024;  // 공유 리플레이 요청 본문 상한
const MIN_RANK_TICKS = 900;     // 30초 미만 경기는 순위에 넣지 않는다
const TRUST_PROXY = process.env.TRUST_PROXY === '1'; // nginx 뒤에서 실행할 때만 켠다

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
const vendor = new Map(), icons = new Map();
const walk = (dir, base, into) => {
  let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const d of list) {
    const f = path.join(dir, d.name), u = `${base}/${d.name}`;
    if (d.isDirectory()) walk(f, u, into);
    else if (d.isFile()) into.set(u, packSync(fs.readFileSync(f)));
  }
};
walk(VENDOR, '/vendor', vendor);
walk(ICONS, '/icons', icons);
const ICON_TYPES = { '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

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

// 요청 빈도 제한: 고정 창 방식
const limiter = (max, ms) => {
  const m = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of m) if (now - v.t > ms) m.delete(k); }, ms).unref();
  return (ip) => {
    const now = Date.now(); let v = m.get(ip);
    if (!v || now - v.t > ms) { v = { t: now, n: 0 }; m.set(ip, v); }
    return ++v.n <= max;
  };
};
const apiLimit = limiter(60, 10000), replayLimit = limiter(20, 3600 * 1000);
const clientIp = (req) => {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',').pop().trim();
  return req.socket.remoteAddress || '';
};
const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(JSON.stringify(o)); };
const readBody = (req, max) => new Promise((ok, no) => {
  const parts = []; let n = 0;
  req.on('data', (d) => { n += d.length; if (n > max) { parts.length = 0; no(new Error('too large')); } else parts.push(d); });
  req.on('end', () => ok(Buffer.concat(parts)));
  req.on('error', no);
});

const CODE_ABC = 'abcdefghjkmnpqrstuvwxyz23456789';
const newCode = () => { let c = ''; for (let i = 0; i < 6; i++) c += CODE_ABC[crypto.randomInt(CODE_ABC.length)]; return c; };
const alive = (room) => [...room.values()].some((p) => p.ws.readyState === 1);
const hostOf = (room) => [...room.values()].find((p) => p.presence && p.presence.host);
const seatInfo = (nick, fac) => ({ nick: cleanNick(nick) || '무명', fac: cleanFac(fac) });

// 빠른 대전: 단일 스레드이므로 대기 슬롯 하나로 두 사람을 원자적으로 짝짓는다
let quickSlot = null;
function quickMatch(v) {
  const q = quickSlot;
  if (q && q.v === v) {
    const room = rooms.get('aisg-' + q.code), fresh = Date.now() - q.at < 3000;
    if (Date.now() - q.at < 300000 && (room ? (room.size === 1 && !room.game && alive(room)) : fresh)) { quickSlot = null; return { code: q.code, host: false }; }
  }
  const code = newCode();
  quickSlot = { code, v, at: Date.now() };
  return { code, host: true };
}

function listRooms(v) {
  const waiting = [], live = [];
  for (const [name, room] of rooms) {
    const h = hostOf(room);
    if (!h || h.presence.v !== v || !h.presence.pub || !alive(room)) continue;
    const code = name.slice(5);
    if (room.game) {
      if (!room.game.final && live.length < 50) live.push({ code, specs: room.specs.size, players: room.game.seats.map((s, i) => seatInfo(room.game.nicks[i], s[1])), at: room.game.at });
    } else if (room.size < 3 && waiting.length < 50) waiting.push({ code, n: room.size, host: seatInfo(h.presence.nick, h.presence.fac) });
  }
  return { waiting, live };
}

let boardCache = null;
async function api(req, res, url) {
  if (!apiLimit(clientIp(req))) return json(res, 429, { error: 'rate' });
  const q = new URL(req.url, 'http://x').searchParams, v = q.get('v') || '';
  if (url === '/api/rooms' && req.method === 'GET') return json(res, 200, listRooms(v));
  if (url === '/api/quick' && req.method === 'POST') {
    if (!/^aisg\d{1,4}$/.test(v)) return json(res, 400, { error: 'version' });
    return json(res, 200, quickMatch(v));
  }
  if (url === '/api/leaderboard' && req.method === 'GET') {
    if (!db.available()) return json(res, 503, { error: 'unavailable' });
    if (!boardCache || Date.now() - boardCache.at > 5000) boardCache = { at: Date.now(), rows: await db.leaderboard(100) };
    return json(res, 200, { rows: boardCache.rows });
  }
  if (url === '/api/replays' && req.method === 'POST') {
    if (!db.available()) return json(res, 503, { error: 'unavailable' });
    if (!replayLimit(clientIp(req))) return json(res, 429, { error: 'rate' });
    let body; try { body = await readBody(req, MAX_REPLAY); } catch (e) { res.setHeader('connection', 'close'); return json(res, 413, { error: 'too large' }); }
    let o; try { o = JSON.parse(body); } catch (e) { return json(res, 400, { error: 'json' }); }
    const r = cleanReplay(o);
    if (!r) return json(res, 400, { error: 'invalid' });
    return json(res, 201, { id: await db.saveReplay(r.v, r.rec, body.length) });
  }
  const m = /^\/api\/replays\/([A-Za-z0-9_-]{12})$/.exec(url);
  if (m && req.method === 'GET') {
    if (!db.available()) return json(res, 503, { error: 'unavailable' });
    const r = await db.loadReplay(m[1]);
    return r ? json(res, 200, r) : json(res, 404, { error: 'not found' });
  }
  return json(res, 404, { error: 'not found' });
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url.startsWith('/api/')) return api(req, res, url).catch((e) => { console.error('API 오류:', e.message); if (!res.headersSent) json(res, 503, { error: 'unavailable' }); else res.end(); });
  if (url === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok'); }
  if (url === '/' || url === '/index.html') return sendAsset(req, res, page, 'text/html; charset=utf-8', 'no-cache');
  const icon = icons.get(url === '/favicon.ico' ? '/icons/favicon.ico' : url);
  if (icon) return sendAsset(req, res, icon, ICON_TYPES[path.extname(url)] || 'application/octet-stream', 'public, max-age=86400');
  const asset = vendor.get(url);
  if (asset) return sendAsset(req, res, asset, url.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8', 'public, max-age=31536000, immutable');
  res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found');
});

const rooms = new Map(); // name -> Map(peerId -> {ws, presence})
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 });
const newId = () => Math.random().toString(36).slice(2, 10);
const send = (ws, m) => { if (ws.readyState === 1) ws.send(JSON.stringify(m)); };
const broadcast = (room, m, except) => { for (const [id, p] of room) if (id !== except) send(p.ws, m); };

const sendSpecs = (room, m) => { if (room.specs.size) { const s = JSON.stringify(m); for (const w of room.specs) if (w.readyState === 1) w.send(s); } };
// 방에서 참가자를 뺀다. 마지막 참가자면 방을 없앤다
function dropPeer(name, room, id) {
  room.delete(id); broadcast(room, { t: 'left', peer: id });
  if (room.game && room.game.seatOf.has(id)) { sendSpecs(room, { t: 'gone', seat: room.game.seatOf.get(id) }); settle(room); }
  if (!room.size) { sendSpecs(room, { t: 'ended' }); rooms.delete(name); }
}

// 출진 이후 명령 기록을 모아 관전자에게 전달한다
function trackGame(room, me, p) {
  if (!room.game && p.host && p.go) {
    const go = cleanGo(p.go);
    if (go && go.seats.some((s) => s[0] === me)) {
      const peers = go.seats.map((s) => room.get(s[0]) || {});
      room.game = { go, seats: go.seats, seatOf: new Map(go.seats.map((s, i) => [s[0], i])), sealed: go.seats.map(() => -1), last: go.seats.map(() => -1), log: [], bytes: 0, results: new Map(), final: false, at: Date.now(), toks: peers.map((q) => q.tok || null), nicks: peers.map((q) => q.nick || '') };
    }
  }
  const g = room.game, seat = g ? g.seatOf.get(me) : undefined;
  if (seat === undefined) return;
  let changed = false;
  if (Number.isInteger(p.s) && p.s > g.sealed[seat]) { g.sealed[seat] = p.s; changed = true; }
  const add = [];
  if (Array.isArray(p.c)) for (const it of p.c) {
    if (!Array.isArray(it) || !Number.isInteger(it[0]) || it[0] <= g.last[seat] || !Array.isArray(it[1])) continue;
    g.last[seat] = it[0]; add.push(it);
    if (g.log) { g.bytes += JSON.stringify(it[1]).length; if (g.bytes > MAX_LOG) g.log = null; else g.log.push([seat, it[0], it[1]]); }
  }
  if (changed || add.length) sendSpecs(room, { t: 'g', seat, s: g.sealed[seat], a: add });
}

// 경기 결과 확정: 두 사람의 보고가 일치하거나, 상대가 방을 떠난 뒤 남은 사람이 보고한 경우만 순위에 반영한다
function settle(room) {
  const g = room.game;
  if (!g || g.final || !g.results.size) return;
  const entries = [...g.results], n = g.seats.length;
  let rank = null;
  if (entries.length === n) {
    const a = entries[0][1];
    g.final = true;
    if (n === 2 && entries.every(([, r]) => r.winner === a.winner && r.tick === a.tick && r.hash === a.hash)) rank = { winner: a.winner, ticks: a.tick, forfeit: false };
  } else if (n === 2 && entries[0][1].forfeit && entries[0][1].winner === entries[0][0] && !room.has(g.seats[1 - entries[0][0]][0])) {
    g.final = true;
    rank = { winner: entries[0][0], ticks: entries[0][1].tick, forfeit: true };
  }
  if (!rank || rank.ticks < MIN_RANK_TICKS || !g.toks[0] || !g.toks[1] || g.toks[0] === g.toks[1]) return;
  const who = (i) => ({ id: db.playerId(g.toks[i]), nick: cleanNick(g.nicks[i]) || '무명', fac: g.seats[i][1] });
  db.recordMatch(who(rank.winner), who(1 - rank.winner), { map: g.go.map, ticks: rank.ticks, forfeit: rank.forfeit }).catch((e) => console.error('전적 저장 실패:', e.message));
}

wss.on('connection', (ws) => {
  let roomName = null, me = null, count = 0, windowStart = Date.now(), specOf = null;
  ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { t: 'hello' });

  const leave = () => {
    if (!roomName) return;
    const room = rooms.get(roomName);
    if (room && room.get(me) && room.get(me).ws === ws) dropPeer(roomName, room, me);
    roomName = null;
  };

  ws.on('message', (raw) => {
    const now = Date.now();
    if (now - windowStart > 1000) { windowStart = now; count = 0; }
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    // presence는 최신 값이 이전 값을 대신하므로 과도하면 버린다(입장·퇴장은 항상 처리)
    if (++count > MAX_MSG_PER_SEC && m.t === 'pres') return;

    if (m.t === 'spec') {
      if (roomName || specOf || typeof m.room !== 'string' || !ROOM_RE.test(m.room)) return send(ws, { t: 'error', msg: 'bad room' });
      const room = rooms.get(m.room);
      if (!room || !room.game || !room.game.log || room.game.final) return send(ws, { t: 'error', msg: 'no game' });
      if (room.specs.size >= MAX_SPECS) return send(ws, { t: 'error', msg: 'full' });
      room.specs.add(ws); specOf = room;
      return send(ws, { t: 'spec', go: room.game.go, sealed: room.game.sealed, log: room.game.log });
    }
    if (m.t === 'join') {
      if (typeof m.room !== 'string' || !ROOM_RE.test(m.room)) return send(ws, { t: 'error', msg: 'bad room' });
      leave();
      let room = rooms.get(m.room);
      if (!room) { if (rooms.size >= MAX_ROOMS) return send(ws, { t: 'error', msg: 'busy' }); room = new Map(); room.specs = new Set(); room.game = null; rooms.set(m.room, room); }
      // 재접속: 같은 peer id를 다시 요청하면 이어서 사용한다
      let id = typeof m.peer === 'string' && /^[a-z0-9]{8}$/.test(m.peer) ? m.peer : null;
      const tok = typeof m.tok === 'string' && /^[a-f0-9]{32}$/.test(m.tok) ? m.tok : null;
      const prev = id && room.get(id);
      // 재접속은 처음 접속한 본인만 할 수 있다(peer id는 같은 방 참가자에게 공개된다)
      if (prev && prev.tok !== tok) return send(ws, { t: 'error', msg: 'peer taken' });
      if (prev) { try { prev.ws.terminate(); } catch (e) {} }
      else { if (room.size >= MAX_PEERS) return send(ws, { t: 'error', msg: 'full' }); if (!id || room.has(id)) id = newId(); }
      me = id; roomName = m.room;
      room.set(me, { ws, presence: prev ? prev.presence : {}, tok, nick: cleanNick(m.nick) });
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
      trackGame(room, me, m.p);
    } else if (m.t === 'result') {
      const g = room.game, seat = g ? g.seatOf.get(me) : undefined;
      if (seat === undefined || g.final || g.results.has(seat)) return;
      if (!Number.isInteger(m.winner) || m.winner < 0 || m.winner >= g.seats.length || !Number.isInteger(m.tick) || m.tick < 0 || !Number.isInteger(m.hash)) return;
      g.results.set(seat, { winner: m.winner, tick: m.tick, hash: m.hash, forfeit: !!m.forfeit });
      settle(room);
    } else if (m.t === 'leave') { leave(); }
  });
  ws.on('close', () => {
    // 일시적 단절일 수 있으므로 10초 뒤에도 돌아오지 않으면 방에서 뺀다
    const rn = roomName, id = me;
    if (specOf) { specOf.specs.delete(ws); specOf = null; }
    setTimeout(() => {
      const room = rn && rooms.get(rn);
      if (room && room.get(id) && room.get(id).ws === ws) dropPeer(rn, room, id);
    }, 10000);
  });
});

const hb = setInterval(() => {
  for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; try { ws.ping(); } catch (e) {} }
}, 20000);
wss.on('close', () => clearInterval(hb));

db.init();
server.listen(PORT, () => console.log(`AI삼국지 서버: http://0.0.0.0:${PORT}`));
