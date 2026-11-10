// 클라이언트가 보낸 값 검증: 온라인 메시지와 공유 리플레이는 신뢰하지 않는다
'use strict';
const CMDS = new Set(['cmdMove', 'cmdPatrol', 'cmdAttack', 'cmdHold', 'cmdStop', 'cmdGather', 'cmdRepair', 'cmdSkill', 'cmdBuild', 'train', 'research', 'cancelQ', 'cancelBuild', 'setMode', 'castAbility', 'propose', 'betray', 'concede', 'setRally']);
const FACS = new Set(['gpt', 'gem', 'cla']);
const DIFS = new Set(['easy', 'normal', 'hard']);
const MAPS = new Set(['duel', 'duel2', 'three']);
const MAX_CMDS = 60000;

const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
const isId = (n) => isInt(n, 0, 1e9);

function cleanArg(a) {
  if (a === null || typeof a === 'boolean') return { ok: a };
  if (typeof a === 'number') return Number.isFinite(a) ? { ok: a } : null;
  if (typeof a === 'string') return a.length <= 24 ? { ok: a } : null;
  if (a && typeof a === 'object' && !Array.isArray(a)) {
    if (Array.isArray(a.u)) return a.u.length <= 500 && a.u.every(isId) ? { ok: { u: a.u } } : null;
    if (isId(a.e)) return { ok: { e: a.e } };
  }
  return null;
}

// 형식이 맞으면 필요한 필드만 다시 조립해 돌려주고, 아니면 null
function cleanReplay(o) {
  if (!o || typeof o !== 'object' || typeof o.v !== 'string' || !/^aisg\d{1,4}$/.test(o.v)) return null;
  const rec = o.rec;
  if (!rec || typeof rec !== 'object' || !rec.cfg || !Array.isArray(rec.cmds) || rec.cmds.length > MAX_CMDS) return null;
  const { players, seed, map } = rec.cfg;
  if (!Array.isArray(players) || players.length < 2 || players.length > 3 || !isInt(seed, 0, 2147483647)) return null;
  if (map != null && !MAPS.has(map)) return null;
  const P = [];
  for (const p of players) {
    if (!p || !FACS.has(p.f) || (p.d !== undefined && !DIFS.has(p.d))) return null;
    P.push(p.d ? { f: p.f, ai: !!p.ai, d: p.d } : { f: p.f, ai: !!p.ai });
  }
  const cmds = [];
  let last = 0;
  for (const c of rec.cmds) {
    if (!Array.isArray(c) || !isInt(c[0], last, 1e8) || !CMDS.has(c[1]) || !Array.isArray(c[2]) || c[2].length > 8) return null;
    const args = [];
    for (const a of c[2]) { const r = cleanArg(a); if (!r) return null; args.push(r.ok); }
    cmds.push([c[0], c[1], args]);
    last = c[0];
  }
  const cfg = { players: P, seed };
  if (map != null) cfg.map = map;
  return { v: o.v, rec: rec.net ? { cfg, cmds, net: 1 } : { cfg, cmds } };
}

const cleanNick = (s) => (typeof s === 'string' ? s.replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 12) : '');
const cleanFac = (f) => (FACS.has(f) ? f : 'gpt');

// 출진 정보: 2~3개 좌석과 시드
function cleanGo(go) {
  if (!go || typeof go !== 'object' || !Array.isArray(go.seats) || go.seats.length < 2 || go.seats.length > 3 || typeof go.seed !== 'number') return null;
  if (new Set(go.seats.map((s) => s && s[0])).size !== go.seats.length) return null;
  for (const s of go.seats) if (!Array.isArray(s) || typeof s[0] !== 'string' || !/^[a-z0-9]{1,12}$/.test(s[0]) || !FACS.has(s[1])) return null;
  const r = { seed: go.seed | 0, seats: go.seats.map((s) => [s[0], s[1]]) };
  if (go.map === 'duel2') r.map = 'duel2';
  return r;
}

module.exports = { cleanReplay, cleanNick, cleanFac, cleanGo };
