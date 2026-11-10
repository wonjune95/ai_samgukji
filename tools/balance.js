// 봇 대전 밸런스 측정 (브라우저 없이 Node.js로 실행)
// 사용: node tools/balance.js [대진당 게임 수=16] [map=duel|duel2] ['UNIT.gem_text.hp=50;' 같은 시험 패치]
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = ['01-data.js', '02-sim.js', '03-bot.js'].map(f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8')).join('\n');
const n = +process.argv[2] || 16, map = process.argv[3] || 'duel', patch = process.argv[4] || '';
vm.runInThisContext(src + ';globalThis.headless=headless;globalThis.headless3=headless3;' + patch);
const F = ['gpt', 'gem', 'cla'], tot = { gpt: 0, gem: 0, cla: 0 }, seat = [0, 0]; let to = 0;
for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
  let wa = 0, wb = 0;
  for (let s = 0; s < n; s++) {
    const sw = s % 2, r = headless(sw ? F[b] : F[a], sw ? F[a] : F[b], 1000 + s * 17 + a * 100 + b * 10, 'normal', 'normal', 1800, map);
    if (r.winner < 0) { to++; continue; }
    seat[r.winner]++; const w = r.winner === 0 ? r.f0 : r.f1; tot[w]++; if (w === F[a]) wa++; else wb++;
  }
  console.log(F[a], 'vs', F[b], wa + ':' + wb);
}
console.log('승률%', Object.entries(tot).map(([k, v]) => k + ' ' + Math.round(v / (2 * n) * 100)).join(' '), '| 자리', seat.join(':'), '| 시간초과', to);
