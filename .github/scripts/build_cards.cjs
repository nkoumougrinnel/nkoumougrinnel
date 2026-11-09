// Génère assets/focus.svg et assets/areas.svg. Usage : node .github/scripts/build_cards.cjs
const fs = require('fs');
const OUT = require('path').resolve(__dirname, '../../assets');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const STYLE = `<style>
    .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; }
    .card { animation: rise .7s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .card { animation: none; } }
  </style>`;

// ── focus.svg : les 3 domaines de la section ABOUT ──
const FOCUS = [
  { n: '01', t: 'Development', c: '#7CA5D8', sub: ['Building digital solutions and', 'exploring software engineering.'],
    b: ['Web & mobile applications', 'Backend systems & APIs', 'Database management', 'AI-powered solutions'] },
  { n: '02', t: 'Networks & Security', c: '#E07A7A', sub: ['Understanding infrastructures,', 'communication and protection.'],
    b: ['Network configuration', 'Infrastructure labs', 'Traffic analysis', 'Security experiments', 'Technical documentation'] },
  { n: '03', t: 'Systems & IoT', c: '#5FB3A9', sub: ['Where software meets', 'physical systems.'],
    b: ['Embedded systems', 'Microcontrollers', 'Sensors & electronics', 'Hardware prototyping'] },
];
{
  const W = 900, CW = 288, GAP = 18, H = 282;
  let cards = '';
  FOCUS.forEach((f, i) => {
    const x = i * (CW + GAP);
    cards += `
  <g class="card" style="animation-delay:${i * 0.12}s">
    <rect x="${x + 0.5}" y="0.5" width="${CW - 1}" height="${H - 1}" rx="16" fill="#0D1626" stroke="#263B5B"/>
    <rect x="${x + 1}" y="1" width="${CW - 2}" height="3" rx="1.5" fill="${f.c}" fill-opacity="0.85"/>
    <text x="${x + 22}" y="38" class="mono" font-size="12" font-weight="700" letter-spacing="2" fill="${f.c}">${f.n} <tspan fill="#5B6B80">/</tspan></text>
    <text x="${x + 22}" y="66" class="sans" font-size="19" font-weight="700" fill="#E6EDF3">${esc(f.t)}</text>
    ${f.sub.map((s, k) => `<text x="${x + 22}" y="${92 + k * 18}" class="sans" font-size="13" fill="#8B98A9">${esc(s)}</text>`).join('\n    ')}
    <line x1="${x + 22}" y1="132" x2="${x + CW - 22}" y2="132" stroke="#263B5B"/>
    ${f.b.map((s, k) => `<circle cx="${x + 26}" cy="${156 + k * 24}" r="3" fill="${f.c}"/><text x="${x + 38}" y="${161 + k * 24}" class="sans" font-size="13.5" fill="#C9D1D9">${esc(s)}</text>`).join('\n    ')}
  </g>`;
  });
  fs.writeFileSync(`${OUT}/focus.svg`, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Development, Networks &amp; Security, Systems &amp; IoT">
  ${STYLE}${cards}
</svg>
`);
}

// ── areas.svg : ce qu'on trouve sur le profil ──
const AREAS = [
  { t: 'Software Engineering', d: 'Applications, backend services and APIs', c: '#7CA5D8', g: 'M4 7l-3 5 3 5M20 7l3 5-3 5M14 4l-4 16' },
  { t: 'Databases', d: 'Database design, management and experiments', c: '#9C8CE0', g: 'M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zM4 6c0 2 16 2 16 0M4 12c0 2 16 2 16 0' },
  { t: 'Networking', d: 'Topologies, configurations and infra labs', c: '#5FB3A9', g: 'M12 3v5M5 19v-4h14v4M12 8v7M9 3h6M3 19h4M17 19h4' },
  { t: 'Cybersecurity', d: 'Security labs, exercises and technical reports', c: '#E07A7A', g: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM9 12l2 2 4-4' },
  { t: 'Artificial Intelligence', d: 'AI experiments and intelligent applications', c: '#E0B15C', g: 'M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z' },
  { t: 'Embedded Systems', d: 'Microcontroller projects and hardware experiments', c: '#7FBF7F', g: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4' },
];
{
  const W = 900, CW = 441, GAP = 18, CH = 72, H = 3 * CH + 2 * 14;
  let cards = '';
  AREAS.forEach((a, i) => {
    const x = (i % 2) * (CW + GAP), y = Math.floor(i / 2) * (CH + 14);
    cards += `
  <g class="card" style="animation-delay:${i * 0.08}s">
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${CW - 1}" height="${CH - 1}" rx="14" fill="#0D1626" stroke="#263B5B"/>
    <rect x="${x + 16}" y="${y + 16}" width="40" height="40" rx="11" fill="${a.c}" fill-opacity="0.12" stroke="${a.c}" stroke-opacity="0.4"/>
    <g transform="translate(${x + 24} ${y + 24})" stroke="${a.c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${a.g}"/></g>
    <text x="${x + 72}" y="${y + 32}" class="sans" font-size="15" font-weight="700" fill="${a.c}">${esc(a.t)}</text>
    <text x="${x + 72}" y="${y + 52}" class="sans" font-size="13" fill="#8B98A9">${esc(a.d)}</text>
  </g>`;
  });
  fs.writeFileSync(`${OUT}/areas.svg`, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${AREAS.map(a => esc(a.t)).join(', ')}">
  ${STYLE}${cards}
</svg>
`);
}
console.log('ok');
