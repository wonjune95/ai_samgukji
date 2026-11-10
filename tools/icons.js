// 파비콘·앱 아이콘 생성기: 三 자를 세 진영 색의 칼날 획으로 그린 독자 문양
// 사용: NODE_PATH=<playwright가 설치된 node_modules> node tools/icons.js  (결과: icons/)
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'icons');
const COL = ['#2fd6a0', '#3f86ff', '#ff8a3d'], BG = '#0a1118', GOLD = '#ffd25e';

// 왼쪽은 비스듬히 자르고 오른쪽은 칼끝처럼 뾰족한 획
const blade = (x0, x1, y, h, c) => `<polygon fill="${c}" points="${x0 + h * .9},${y - h} ${x1 - h * 1.5},${y - h} ${x1},${y + h * .18} ${x1 - h * 1.7},${y + h} ${x0},${y + h}"/>`;
const strokes = (scale, h) => {
  const f = (v) => 256 + (v - 256) * scale;
  return blade(f(130), f(392), f(146), h, COL[0]) + blade(f(172), f(350), f(256), h, COL[1]) + blade(f(82), f(440), f(366), h, COL[2]);
};
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}</svg>\n`;
// 기본: 둥근 사각형과 금색 테두리
const main = svg(`<rect x="8" y="8" width="496" height="496" rx="96" fill="${BG}"/><rect x="24" y="24" width="464" height="464" rx="82" fill="none" stroke="${GOLD}" stroke-width="10"/>${strokes(1, 34)}`);
// 아주 작은 크기: 테두리를 빼고 획을 키운다
const small = svg(`<rect width="512" height="512" rx="90" fill="${BG}"/>${strokes(1.2, 54)}`);
// 마스크 가능 아이콘: 전면 배경, 안전 영역 안에 문양
const maskable = svg(`<rect width="512" height="512" fill="${BG}"/>${strokes(.74, 28)}`);
// iOS 홈 화면: 불투명 전면 배경
const apple = svg(`<rect width="512" height="512" fill="${BG}"/>${strokes(.92, 34)}`);

function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach(([size, b], i) => {
    const e = 6 + 16 * i;
    head[e] = size; head[e + 1] = size; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(b.length, e + 8); head.writeUInt32LE(off, e + 12); off += b.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p[1])]);
}

(async () => {
  const { chromium } = require('playwright');
  fs.mkdirSync(OUT, { recursive: true });
  const br = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await br.newPage({ deviceScaleFactor: 1 });
  const shot = async (src, size) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${src}`);
    return p.screenshot({ omitBackground: true });
  };
  fs.writeFileSync(path.join(OUT, 'icon.svg'), main);
  fs.writeFileSync(path.join(OUT, 'icon-192.png'), await shot(main, 192));
  fs.writeFileSync(path.join(OUT, 'icon-512.png'), await shot(main, 512));
  fs.writeFileSync(path.join(OUT, 'maskable-512.png'), await shot(maskable, 512));
  fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), await shot(apple, 180));
  const ip = [];
  for (const s of [16, 32, 48]) ip.push([s, await shot(s < 48 ? small : main, s)]);
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico(ip));
  fs.writeFileSync(path.join(OUT, 'favicon-32.png'), ip[1][1]);
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
