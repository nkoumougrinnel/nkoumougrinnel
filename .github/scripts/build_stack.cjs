// Génère assets/stack-*.svg. Usage : npm i --no-save simple-icons@15 && node .github/scripts/build_stack.cjs
// Génère assets/stack-*.svg (tuiles d'icônes) pour le README du profil.
const si = require('simple-icons');
const fs = require('fs');
const OUT = require('path').resolve(__dirname, '../../assets');
const by = {}; for (const v of Object.values(si)) if (v && v.slug) by[v.slug] = v;

const CATS = [
  { file: 'stack-development.svg', title: 'DEVELOPMENT', accent: '#7CA5D8', items: [
    ['Python','python'],['Django','django'],['FastAPI','fastapi'],['React','react'],['TypeScript','typescript'],
    ['JavaScript','javascript'],['Node.js','nodedotjs'],['HTML5','html5'],['CSS','css'],['Vite','vite'],
    ['PostgreSQL','postgresql'],['SQLite','sqlite'],['Docker','docker'],['C','c'],['C++','cplusplus'],
    ['Git','git'],['GitHub','github'],['Postman','postman'],['ESLint','eslint'],['VS Code',null],
  ]},
  { file: 'stack-systems.svg', title: 'SYSTEMS & IoT', accent: '#5FB3A9', items: [
    ['Linux','linux'],['Ubuntu','ubuntu'],['GNU Bash','gnubash'],['VirtualBox','virtualbox'],['Cisco','cisco'],
    ['Arduino','arduino'],['ESP32','espressif'],['Raspberry Pi','raspberrypi'],
  ]},
  { file: 'stack-security.svg', title: 'CYBERSECURITY', accent: '#E07A7A', items: [
    ['Kali Linux','kalilinux'],['Wireshark','wireshark'],['Nmap',null],['Burp Suite','burpsuite'],['Metasploit','metasploit'],
    ['OWASP','owasp'],['SQLmap',null],['Nikto',null],['Gobuster',null],['Hydra',null],
    ['John the Ripper',null],['Hashcat','hashcat'],['OpenSSL','openssl'],['OpenVPN','openvpn'],['Suricata',null],
  ]},
];

const W = 900, COLS = 10, TILE = 58, STEP = 88, PADX = (W - (COLS - 1) * STEP - TILE) / 2, HEAD = 46, ROWH = 96;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function lum(hex) { const n = parseInt(hex, 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

// Éclaircit les couleurs de marque trop sombres pour rester lisibles sur la tuile (#0D1626).
const BG_L = lum('0D1626');
function readable(hex) {
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let k = 0; k < 20; k++) {
    const h = [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    if ((lum(h) + 0.05) / (BG_L + 0.05) >= 6) return '#' + h;
    [r, g, b] = [r, g, b].map((v) => v + (255 - v) * 0.15);
  }
  return '#C9D1D9';
}

for (const cat of CATS) {
  const rows = Math.ceil(cat.items.length / COLS);
  const H = HEAD + rows * ROWH + 6;
  let tiles = '';
  cat.items.forEach(([name, slug], i) => {
    const r = Math.floor(i / COLS), inRow = Math.min(COLS, cat.items.length - r * COLS);
    const rowOffset = (COLS - inRow) * STEP / 2; // centre la dernière ligne
    const x = PADX + rowOffset + (i % COLS) * STEP, y = HEAD + r * ROWH;
    const icon = slug && by[slug];
    let glyph;
    if (icon) {
      const color = readable(icon.hex);
      glyph = `<g transform="translate(${x + 15} ${y + 15}) scale(1.1667)" fill="${color}"><path d="${icon.path}"/></g>`;
    } else {
      glyph = `<text x="${x + TILE / 2}" y="${y + 35}" text-anchor="middle" class="mono" font-size="15" font-weight="700" fill="${cat.accent}">&gt;_</text>`;
    }
    const label = name.length > 12 ? name.replace('John the Ripper', 'John') : name;
    tiles += `
  <g class="tile" style="animation-delay:${(i * 0.04).toFixed(2)}s">
    <rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="14" fill="#0D1626" stroke="#263B5B"/>
    ${glyph}
    <text x="${x + TILE / 2}" y="${y + TILE + 17}" text-anchor="middle" class="sans" font-size="11" fill="#9BA9BA">${esc(label)}</text>
  </g>`;
  });

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(cat.title)}: ${esc(cat.items.map(i => i[0]).join(', '))}">
  <style>
    .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; }
    .tile { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .tile { animation: none; } }
  </style>
  <g>
    <rect x="${W / 2 - 4}" y="10" width="8" height="8" rx="2" transform="rotate(45 ${W / 2} 14)" fill="${cat.accent}"/>
    <text x="${W / 2}" y="38" text-anchor="middle" class="mono" font-size="12.5" font-weight="700" letter-spacing="3" fill="${cat.accent}">${esc(cat.title)} <tspan fill="#5B6B80" font-weight="500">· ${cat.items.length}</tspan></text>
  </g>${tiles}
</svg>
`;
  fs.writeFileSync(`${OUT}/${cat.file}`, svg);
  console.log(cat.file, cat.items.length, 'items,', H, 'px');
}
