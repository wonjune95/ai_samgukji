// PostgreSQL 저장소: 순위표와 공유 리플레이. PGDATABASE가 없거나 DB가 내려가도 게임 페이지와 대전 중계는 계속 동작해야 한다
'use strict';
const crypto = require('crypto');

const K = 32;                       // Elo 계수
const REPLAY_DAYS = 90;             // 공유 리플레이 보관 기간
const MAX_REPLAYS = 5000;           // 공유 리플레이 최대 개수

const SCHEMA = `
CREATE TABLE IF NOT EXISTS players (
  id text PRIMARY KEY,
  nick text NOT NULL,
  rating integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS players_rank ON players (rating DESC, wins DESC);
CREATE TABLE IF NOT EXISTS matches (
  id bigserial PRIMARY KEY,
  winner_id text NOT NULL REFERENCES players(id),
  loser_id text NOT NULL REFERENCES players(id),
  winner_fac text NOT NULL,
  loser_fac text NOT NULL,
  map text,
  ticks integer NOT NULL,
  forfeit boolean NOT NULL DEFAULT false,
  delta integer NOT NULL,
  played_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS replays (
  id text PRIMARY KEY,
  v text NOT NULL,
  rec jsonb NOT NULL,
  bytes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS replays_age ON replays (created_at);
`;

let pool = null, ready = false;

async function init() {
  if (!process.env.PGDATABASE) return;
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({ max: 4, connectionTimeoutMillis: 3000, idleTimeoutMillis: 30000, statement_timeout: 5000 });
    pool.on('error', (e) => console.error('DB 연결 오류:', e.message));
    setInterval(() => { purge().catch(() => {}); }, 3600 * 1000).unref();
  }
  try {
    await pool.query(SCHEMA);
    ready = true;
    console.log('DB 준비 완료');
    purge().catch(() => {});
  } catch (e) {
    console.error('DB 초기화 실패, 30초 후 다시 시도:', e.message);
    setTimeout(init, 30000).unref();
  }
}

const available = () => ready;
const playerId = (tok) => crypto.createHash('sha256').update(tok).digest('hex');

async function purge() {
  if (!ready) return;
  await pool.query(`DELETE FROM replays WHERE created_at < now() - interval '${REPLAY_DAYS} days'`);
  await pool.query('DELETE FROM replays WHERE id IN (SELECT id FROM replays ORDER BY created_at DESC OFFSET $1)', [MAX_REPLAYS]);
}

// 승자와 패자의 Elo를 한 트랜잭션으로 갱신한다
async function recordMatch(w, l, info) {
  if (!ready) return;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const up = 'INSERT INTO players (id, nick) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET nick = EXCLUDED.nick';
    const [a, b] = w.id < l.id ? [w, l] : [l, w];   // 교착을 피하려고 항상 같은 순서로 잠근다
    await c.query(up, [a.id, a.nick]);
    await c.query(up, [b.id, b.nick]);
    const r = await c.query('SELECT id, rating FROM players WHERE id = ANY($1) ORDER BY id FOR UPDATE', [[a.id, b.id]]);
    const rw = r.rows.find((x) => x.id === w.id).rating, rl = r.rows.find((x) => x.id === l.id).rating;
    const delta = Math.max(1, Math.round(K * (1 - 1 / (1 + 10 ** ((rl - rw) / 400)))));
    await c.query('UPDATE players SET rating = rating + $2, wins = wins + 1, updated_at = now() WHERE id = $1', [w.id, delta]);
    await c.query('UPDATE players SET rating = GREATEST(0, rating - $2), losses = losses + 1, updated_at = now() WHERE id = $1', [l.id, delta]);
    await c.query('INSERT INTO matches (winner_id, loser_id, winner_fac, loser_fac, map, ticks, forfeit, delta) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [w.id, l.id, w.fac, l.fac, info.map || 'duel', info.ticks, !!info.forfeit, delta]);
    await c.query('COMMIT');
    return delta;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally { c.release(); }
}

async function leaderboard(limit) {
  const r = await pool.query('SELECT nick, substr(id, 1, 4) AS tag, rating, wins, losses FROM players ORDER BY rating DESC, wins DESC, id LIMIT $1', [limit]);
  return r.rows;
}

async function saveReplay(v, rec, bytes) {
  const id = crypto.randomBytes(9).toString('base64url');
  await pool.query('INSERT INTO replays (id, v, rec, bytes) VALUES ($1, $2, $3, $4)', [id, v, JSON.stringify(rec), bytes]);
  return id;
}

async function loadReplay(id) {
  const r = await pool.query('SELECT v, rec FROM replays WHERE id = $1', [id]);
  return r.rows[0] || null;
}

module.exports = { init, available, playerId, recordMatch, leaderboard, saveReplay, loadReplay };
