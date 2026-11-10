// AI삼국지 자체 서버: 게임 페이지 제공 + 온라인 대전 중계(WebSocket)
// 게임 계산은 각 브라우저가 하고, 서버는 방 안의 상태(presence)만 전달한다.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 8080);
const PAGE = process.env.PAGE || path.join(__dirname, '..', 'dist', 'index.html');
const MAX_ROOMS = Number(process.env.MAX_ROOMS || 500);
const MAX_PEERS = 8;            // 방 하나당 최대 접속 수
const MAX_PRESENCE = 4096;      // presence JSON 최대 길이
const MAX_MSG_PER_SEC = 60;     // 연결당 초당 메시지 상한
const ROOM_RE = /^aisg-[a-z0-9]{3,8}$/;

let page = fs.readFileSync(PAGE);
fs.watchFile(PAGE, { interval: 5000 }, () => { try { page = fs.readFileSync(PAGE); } catch (e) {} });

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok'); }
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
    return res.end(page);
  }
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
