import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- SVG generation helpers ---

function star(cx, cy, r = 5) {
  const inner = r * 0.382;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : inner;
    const angle = (i * Math.PI / 5) - Math.PI / 2;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function hst(colors) {
  const h = (200 / colors.length).toFixed(2);
  return colors.map((c, i) => `<rect x="0" y="${(i * 200 / colors.length).toFixed(2)}" width="300" height="${h}" fill="${c}"/>`).join('');
}

function vst(colors) {
  const w = (300 / colors.length).toFixed(2);
  return colors.map((c, i) => `<rect x="${(i * 300 / colors.length).toFixed(2)}" y="0" width="${w}" height="200" fill="${c}"/>`).join('');
}

function nordic(bg, cross, thin = null, vx = 90, vw = 50, hy = 75, hh = 50) {
  let s = `<rect width="300" height="200" fill="${bg}"/>`;
  s += `<rect x="${vx}" y="0" width="${vw}" height="200" fill="${cross}"/>`;
  s += `<rect x="0" y="${hy}" width="300" height="${hh}" fill="${cross}"/>`;
  if (thin) {
    const tw = Math.round(vw * 0.55);
    const th = Math.round(hh * 0.55);
    const tx = vx + Math.round((vw - tw) / 2);
    const ty = hy + Math.round((hh - th) / 2);
    s += `<rect x="${tx}" y="0" width="${tw}" height="200" fill="${thin}"/>`;
    s += `<rect x="0" y="${ty}" width="300" height="${th}" fill="${thin}"/>`;
  }
  return s;
}

// --- Flag SVG content variables ---

const GERMAN_EMPIRE = hst(['#000000', '#FFFFFF', '#CC0000']);
const GERMANY_MODERN = hst(['#000000', '#DD0000', '#FFCE00']);

const NAZI_GERMANY = `
<rect width="300" height="200" fill="#CC0000"/>
<circle cx="150" cy="100" r="68" fill="#FFFFFF"/>
<polygon points="${
  [[-11,-33],[11,-33],[11,-11],[33,-11],[33,11],[11,11],[11,33],[-11,33],[-11,11],[-33,11],[-33,-11],[-11,-11]]
    .map(([x,y]) => {
      const rx = (x*0.7071 - y*0.7071 + 150).toFixed(1);
      const ry = (x*0.7071 + y*0.7071 + 100).toFixed(1);
      return `${rx},${ry}`;
    }).join(' ')
}" fill="#000000"/>`;

const RUSSIA_TRICOLOR = hst(['#FFFFFF', '#003DA5', '#CC0000']);

const USSR_FLAG = (() => {
  const starPts = star(36, 22, 15);
  return `
<rect width="300" height="200" fill="#CC0000"/>
<polygon points="${starPts}" fill="#FFD700"/>
<path d="M 42,108 C 20,70 40,34 76,32 C 112,30 130,60 118,88 A 18,18 0 0,1 100,91 C 115,68 108,44 76,44 C 48,44 36,68 44,97 Z" fill="#FFD700"/>
<rect x="105" y="82" width="7" height="33" rx="3" fill="#FFD700" transform="rotate(18,108.5,98.5)"/>
<rect x="52" y="30" width="46" height="14" rx="2" fill="#FFD700" transform="rotate(-42,75,37)"/>
<rect x="71" y="43" width="8" height="47" rx="3" fill="#FFD700" transform="rotate(-42,75,66.5)"/>`;
})();

const USA_FLAG = (starCount) => {
  const stripeH = (200 / 13).toFixed(2);
  let stripes = '';
  for (let i = 0; i < 13; i++) {
    stripes += `<rect x="0" y="${(i * 200 / 13).toFixed(2)}" width="300" height="${stripeH}" fill="${i % 2 === 0 ? '#B22234' : '#FFFFFF'}"/>`;
  }
  const cantonW = 120;
  const cantonH = (7 * 200 / 13).toFixed(2);
  stripes += `<rect x="0" y="0" width="${cantonW}" height="${cantonH}" fill="#3C3B6E"/>`;
  const rows = starCount === 48 ? 8 : 9;
  const cols6 = starCount === 48 ? 6 : 6;
  const cols5 = 5;
  const starR = 3.5;
  const marginX = cantonW / (cols6 * 2 + 1);
  const marginY = parseFloat(cantonH) / (rows * 2 + 1);
  let stars = '';
  for (let row = 0; row < rows; row++) {
    const is6Row = starCount === 48 ? true : row % 2 === 0;
    const cols = is6Row ? cols6 : cols5;
    const xOffset = is6Row ? marginX : marginX * 2;
    const cy = marginY * (row * 2 + 2);
    for (let col = 0; col < cols; col++) {
      const cx = xOffset + col * marginX * 2;
      stars += `<polygon points="${star(cx, cy, starR)}" fill="#FFFFFF"/>`;
    }
  }
  return stripes + stars;
};

const FRANCE_FLAG = vst(['#0055A4', '#FFFFFF', '#EF4135']);

const UK_FLAG = `
<rect width="300" height="200" fill="#012169"/>
<polygon points="0,0 50,0 300,175 300,200 250,200 0,25" fill="#FFFFFF"/>
<polygon points="250,0 300,0 300,25 50,200 0,200 0,175" fill="#FFFFFF"/>
<polygon points="0,0 25,0 300,170 300,200 275,200 0,30" fill="#C8102E"/>
<polygon points="275,0 300,0 300,30 25,200 0,200 0,170" fill="#C8102E"/>
<rect x="0" y="72" width="300" height="56" fill="#FFFFFF"/>
<rect x="114" y="0" width="72" height="200" fill="#FFFFFF"/>
<rect x="0" y="84" width="300" height="32" fill="#C8102E"/>
<rect x="126" y="0" width="48" height="200" fill="#C8102E"/>`;

const JAPAN_FLAG = `
<rect width="300" height="200" fill="#FFFFFF"/>
<circle cx="150" cy="100" r="60" fill="#BC002D"/>`;

const CHINA_IMPERIAL = `
<rect width="300" height="200" fill="#FFDE00"/>
<text x="150" y="130" text-anchor="middle" font-size="100" font-family="serif" fill="#CC0000">龍</text>`;

const CHINA_ROC = `
<rect width="300" height="200" fill="#FE0000"/>
<rect x="0" y="0" width="150" height="100" fill="#27348B"/>
<circle cx="75" cy="50" r="30" fill="#FFFFFF"/>
<polygon points="${star(75, 50, 20)}" fill="#27348B"/>
${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
  const a = (i * 30 - 90) * Math.PI / 180;
  return `<rect x="73" y="32" width="4" height="18" fill="#27348B" transform="rotate(${i*30},75,50)"/>`;
}).join('')}`;

const CHINA_PRC = (() => {
  const bigStar = star(38, 26, 18);
  const smallStars = [
    star(70, 10, 7),
    star(82, 24, 7),
    star(82, 42, 7),
    star(70, 54, 7),
  ];
  return `<rect width="300" height="200" fill="#DE2910"/>
<polygon points="${bigStar}" fill="#FFDE00"/>
${smallStars.map(s => `<polygon points="${s}" fill="#FFDE00"/>`).join('')}`;
})();

const ITALY_FLAG = vst(['#009246', '#FFFFFF', '#CE2B37']);

const ITALY_FASCIST = `
${vst(['#009246', '#FFFFFF', '#CE2B37'])}
<g transform="translate(150,95)" fill="#555555" opacity="0.7">
<rect x="-3" y="-38" width="6" height="76"/>
<rect x="-22" y="20" width="44" height="8" rx="2"/>
<polygon points="-3,-38 3,-38 8,-50 -8,-50" fill="#888"/>
</g>`;

const SPAIN_REPUBLIC = hst(['#C60B1E', '#FFC400', '#6A2D8F']);
const SPAIN_FRANCO = `
${hst(['#AA151B', '#F1BF00', '#AA151B'])}
<g transform="translate(130,100)" opacity="0.7">
<rect x="-8" y="-30" width="16" height="60" fill="#5B3A29"/>
<circle cx="0" cy="-35" r="12" fill="none" stroke="#5B3A29" stroke-width="4"/>
</g>`;
const SPAIN_MODERN = hst(['#AA151B', '#F1BF00', '#AA151B']);

const AUSTRIA_FLAG = hst(['#ED2939', '#FFFFFF', '#ED2939']);
const NETHERLANDS_FLAG = hst(['#AE1C28', '#FFFFFF', '#21468B']);
const BELGIUM_FLAG = vst(['#000000', '#FAE042', '#EF3340']);
const POLAND_FLAG = hst(['#FFFFFF', '#DC143C']);
const UKRAINE_FLAG = hst(['#005BBB', '#FFD500']);

const SWEDEN_FLAG = nordic('#006AA7', '#FECC02');
const NORWAY_FLAG = nordic('#EF2B2D', '#FFFFFF', '#002868');
const DENMARK_FLAG = nordic('#C8102E', '#FFFFFF');
const FINLAND_FLAG = nordic('#FFFFFF', '#003580');

const SWITZERLAND_FLAG = `
<rect width="300" height="200" fill="#FF0000"/>
<rect x="90" y="65" width="120" height="70" fill="#FFFFFF"/>
<rect x="120" y="35" width="60" height="130" fill="#FFFFFF"/>`;

const GREECE_FLAG = (() => {
  let s = '';
  for (let i = 0; i < 9; i++) {
    s += `<rect x="0" y="${(i * 200 / 9).toFixed(2)}" width="300" height="${(200 / 9).toFixed(2)}" fill="${i % 2 === 0 ? '#0D5EAF' : '#FFFFFF'}"/>`;
  }
  s += `<rect x="0" y="0" width="133" height="111" fill="#0D5EAF"/>`;
  s += `<rect x="0" y="44" width="133" height="23" fill="#FFFFFF"/>`;
  s += `<rect x="55" y="0" width="23" height="111" fill="#FFFFFF"/>`;
  return s;
})();

const PORTUGAL_FLAG = `
${vst(['#006600', '#FF0000', '#FF0000'])}
<rect x="0" y="0" width="120" height="200" fill="#006600"/>
<circle cx="120" cy="100" r="42" fill="#FFD700" opacity="0.9"/>
<circle cx="120" cy="100" r="28" fill="#003399"/>
<rect x="108" y="82" width="24" height="36" fill="#FFFFFF" opacity="0.7"/>
<circle cx="120" cy="100" r="10" fill="#FFD700"/>`;

const TURKEY_FLAG = `
<rect width="300" height="200" fill="#E30A17"/>
<circle cx="135" cy="100" r="50" fill="#FFFFFF"/>
<circle cx="150" cy="100" r="40" fill="#E30A17"/>
<polygon points="${star(200, 85, 18)}" fill="#FFFFFF"/>`;

const OTTOMAN_FLAG = `
<rect width="300" height="200" fill="#C8102E"/>
<circle cx="130" cy="100" r="52" fill="#FFFFFF"/>
<circle cx="145" cy="100" r="42" fill="#C8102E"/>
<polygon points="${star(195, 82, 18)}" fill="#FFFFFF"/>`;

const INDIA_MODERN = `
${hst(['#FF9933', '#FFFFFF', '#138808'])}
<circle cx="150" cy="100" r="26" fill="none" stroke="#000080" stroke-width="3"/>
${Array.from({length:24},(_,i)=>{
  const a = (i*15-90)*Math.PI/180;
  return `<line x1="${(150+9*Math.cos(a)).toFixed(1)}" y1="${(100+9*Math.sin(a)).toFixed(1)}" x2="${(150+26*Math.cos(a)).toFixed(1)}" y2="${(100+26*Math.sin(a)).toFixed(1)}" stroke="#000080" stroke-width="1.5"/>`;
}).join('')}`;

const ISRAEL_FLAG = `
<rect width="300" height="200" fill="#FFFFFF"/>
<rect x="0" y="40" width="300" height="25" fill="#0038B8"/>
<rect x="0" y="135" width="300" height="25" fill="#0038B8"/>
<polygon points="150,75 162,95 180,95 166,110 172,130 150,117 128,130 134,110 120,95 138,95" fill="none" stroke="#0038B8" stroke-width="4"/>
<polygon points="150,125 162,105 180,105 166,90 172,70 150,83 128,70 134,90 120,105 138,105" fill="none" stroke="#0038B8" stroke-width="4"/>`;

const CANADA_OLD_SIMPLE = `
<rect width="300" height="200" fill="#C8102E"/>
<rect x="0" y="0" width="75" height="100" fill="#012169"/>
<polygon points="0,0 20,0 75,65 75,100 55,100 0,35" fill="#FFFFFF"/>
<polygon points="55,0 75,0 75,35 20,100 0,100 0,65" fill="#FFFFFF"/>
<polygon points="0,0 10,0 75,70 75,100 65,100 0,30" fill="#C8102E"/>
<polygon points="65,0 75,0 75,30 10,100 0,100 0,70" fill="#C8102E"/>
<rect x="0" y="36" width="75" height="28" fill="#FFFFFF"/>
<rect x="31" y="0" width="19" height="100" fill="#FFFFFF"/>
<rect x="0" y="42" width="75" height="16" fill="#C8102E"/>
<rect x="35" y="0" width="11" height="100" fill="#C8102E"/>`;

const CANADA_MODERN = `
<rect x="0" y="0" width="75" height="200" fill="#FF0000"/>
<rect x="75" y="0" width="150" height="200" fill="#FFFFFF"/>
<rect x="225" y="0" width="75" height="200" fill="#FF0000"/>
<path d="M 150,55 L 158,75 L 178,68 L 165,85 L 180,95 L 160,95 L 155,115 L 150,100 L 145,115 L 140,95 L 120,95 L 135,85 L 122,68 L 142,75 Z" fill="#FF0000"/>`;

const UK_CANTON = `
<rect width="150" height="100" fill="#012169"/>
<polygon points="0,0 25,0 150,87 150,100 125,100 0,13" fill="#FFFFFF"/>
<polygon points="125,0 150,0 150,13 25,100 0,100 0,87" fill="#FFFFFF"/>
<polygon points="0,0 12,0 150,92 150,100 138,100 0,8" fill="#C8102E"/>
<polygon points="138,0 150,0 150,8 12,100 0,100 0,92" fill="#C8102E"/>
<rect x="0" y="36" width="150" height="28" fill="#FFFFFF"/>
<rect x="61" y="0" width="19" height="100" fill="#FFFFFF"/>
<rect x="0" y="42" width="150" height="16" fill="#C8102E"/>
<rect x="66" y="0" width="9" height="100" fill="#C8102E"/>`;

const AUSTRALIA_FLAG = `
<rect width="300" height="200" fill="#00008B"/>
${UK_CANTON}
<polygon points="${star(50, 145, 14)}" fill="#FFFFFF"/>
${[star(220, 62, 7), star(258, 82, 7), star(240, 118, 7), star(202, 108, 7), star(252, 143, 7)].map(s => `<polygon points="${s}" fill="#FFFFFF"/>`).join('')}`;

const MEXICO_FLAG = `
${vst(['#006847', '#FFFFFF', '#CE1126'])}
<g transform="translate(150,100)">
<circle r="28" fill="#7CB0D2"/>
<ellipse rx="14" ry="18" fill="#5A8F3C"/>
<polygon points="-5,-8 5,-8 5,8 -5,8" fill="#8B4513"/>
<path d="M -18,-8 C -12,-20 12,-20 18,-8 C 12,-5 -12,-5 -18,-8 Z" fill="#CC0000"/>
</g>`;

const BRAZIL_FLAG = `
<rect width="300" height="200" fill="#009C3B"/>
<polygon points="150,15 278,100 150,185 22,100" fill="#FEDF00"/>
<circle cx="150" cy="100" r="58" fill="#002776"/>
<path d="M 95,85 A 55,55 0 0,1 205,85" fill="none" stroke="#FFFFFF" stroke-width="10"/>
<text x="150" y="110" text-anchor="middle" fill="#009C3B" font-size="11" font-weight="bold" font-family="sans-serif" letter-spacing="2">ORDEM E PROGRESSO</text>
${[star(108,83,5), star(120,72,5), star(134,64,5), star(150,60,5), star(166,64,5), star(180,72,5), star(192,83,5)].map(s=>`<polygon points="${s}" fill="#FFFFFF"/>`).join('')}`;

const ARGENTINA_FLAG = `
${hst(['#74ACDF', '#FFFFFF', '#74ACDF'])}
<circle cx="150" cy="100" r="22" fill="#F6B40E"/>
${Array.from({length:16},(_,i)=>{
  const a = (i*22.5)*Math.PI/180;
  const isStr = i%2===0;
  const r1=24, r2=isStr?40:36;
  return `<line x1="${(150+r1*Math.cos(a)).toFixed(1)}" y1="${(100+r1*Math.sin(a)).toFixed(1)}" x2="${(150+r2*Math.cos(a)).toFixed(1)}" y2="${(100+r2*Math.sin(a)).toFixed(1)}" stroke="#F6B40E" stroke-width="${isStr?5:3}"/>`;
}).join('')}
<circle cx="150" cy="100" r="14" fill="#85340A"/>
<circle cx="150" cy="100" r="10" fill="#F6B40E"/>`;

const EGYPT_KINGDOM = `
<rect width="300" height="200" fill="#007A3D"/>
<circle cx="150" cy="90" r="35" fill="none" stroke="#FFFFFF" stroke-width="6"/>
<path d="M 135,90 A 35,35 0 0,1 165,90" fill="none" stroke="#FFFFFF" stroke-width="6"/>
${[star(130,130,8), star(150,130,8), star(170,130,8)].map(s=>`<polygon points="${s}" fill="#FFFFFF"/>`).join('')}`;

const EGYPT_REPUBLIC = `
${hst(['#CE1126', '#FFFFFF', '#000000'])}
<g transform="translate(150,100)" fill="#C09300">
<circle r="18" fill="none" stroke="#C09300" stroke-width="4"/>
<rect x="-3" y="-22" width="6" height="44"/>
<rect x="-18" y="8" width="36" height="6"/>
<polygon points="-6,-22 6,-22 6,22 -6,22" fill="none"/>
</g>`;

const SAUDI_FLAG = `
<rect width="300" height="200" fill="#006C35"/>
<text x="150" y="95" text-anchor="middle" fill="#FFFFFF" font-size="24" font-family="serif">لا إله إلا الله</text>
<text x="150" y="125" text-anchor="middle" fill="#FFFFFF" font-size="20" font-family="serif">محمد رسول الله</text>
<line x1="90" y1="148" x2="210" y2="148" stroke="#FFFFFF" stroke-width="3"/>
<ellipse cx="150" cy="155" rx="20" ry="8" fill="#FFFFFF"/>`;

const IRAN_PAHLAVI = `
${hst(['#239F40', '#FFFFFF', '#DA0000'])}
<circle cx="150" cy="100" r="30" fill="#C09A1A"/>
<g transform="translate(150,100)" fill="#C09A1A">
<path d="M -8,-25 L 8,-25 L 15,5 L 0,15 L -15,5 Z" opacity="0.7"/>
<circle r="12" fill="none" stroke="#C09A1A" stroke-width="3"/>
<text x="0" y="5" text-anchor="middle" font-size="16" fill="#C09A1A">☀</text>
</g>`;

const IRAN_ISLAMIC = `
${hst(['#239F40', '#FFFFFF', '#DA0000'])}
<text x="150" y="108" text-anchor="middle" fill="#DA0000" font-size="22" font-family="serif">الله أكبر</text>
<rect x="0" y="63" width="300" height="8" fill="#239F40" opacity="0.5"/>
<rect x="0" y="129" width="300" height="8" fill="#DA0000" opacity="0.5"/>`;

const SOUTH_AFRICA_OLD = `
${hst(['#FF6200', '#FFFFFF', '#003DA5'])}
<g transform="translate(100,100)" opacity="0.6">
<rect x="-30" y="-6" width="60" height="12" fill="#CC0000"/>
<rect x="-6" y="-30" width="12" height="60" fill="#CC0000"/>
</g>`;

const SOUTH_AFRICA_NEW = `
<rect width="300" height="200" fill="#FFFFFF"/>
<polygon points="0,0 0,200 120,100" fill="#007A4D"/>
<polygon points="0,0 115,100 0,200 30,200 145,100 30,0" fill="#FFB612"/>
<rect x="0" y="0" width="300" height="55" fill="#DE3831"/>
<rect x="0" y="145" width="300" height="55" fill="#002395"/>
<rect x="0" y="55" width="300" height="37" fill="#000000"/>
<rect x="0" y="108" width="300" height="37" fill="#000000"/>
<polygon points="0,0 115,100 0,200 30,200 145,100 30,0" fill="#FFB612"/>`;

const YUGOSLAVIA_FLAG = `
${hst(['#0C4076', '#FFFFFF', '#C60C30'])}
<polygon points="${star(150, 100, 30)}" fill="#FFDE00"/>
<polygon points="${star(150, 100, 24)}" fill="none" stroke="#0C4076" stroke-width="2"/>`;

const SERBIA_FLAG = hst(['#C6363C', '#0C4076', '#FFFFFF']);

const BRITISH_INDIA = `
<rect width="300" height="200" fill="#CC0000"/>
<rect x="0" y="0" width="150" height="100" fill="#012169"/>
<polygon points="0,0 25,0 150,87 150,100 125,100 0,13" fill="#FFFFFF"/>
<polygon points="125,0 150,0 150,13 25,100 0,100 0,87" fill="#FFFFFF"/>
<polygon points="0,0 12,0 150,92 150,100 138,100 0,8" fill="#C8102E"/>
<polygon points="138,0 150,0 150,8 12,100 0,100 0,92" fill="#C8102E"/>
<rect x="0" y="36" width="150" height="28" fill="#FFFFFF"/>
<rect x="61" y="0" width="19" height="100" fill="#FFFFFF"/>
<rect x="0" y="42" width="150" height="16" fill="#C8102E"/>
<rect x="66" y="0" width="9" height="100" fill="#C8102E"/>`;

// --- Flag ID to content mapping ---

const FLAGS = {
  'flag-germany-empire':   GERMAN_EMPIRE,
  'flag-germany-weimar':   GERMANY_MODERN,
  'flag-germany-nazi':     NAZI_GERMANY,
  'flag-germany-modern':   GERMANY_MODERN,
  'flag-russia-tsarist':   RUSSIA_TRICOLOR,
  'flag-ussr':             USSR_FLAG,
  'flag-russia-modern':    RUSSIA_TRICOLOR,
  'flag-usa-48':           USA_FLAG(48),
  'flag-usa-49':           USA_FLAG(49),
  'flag-usa-50':           USA_FLAG(50),
  'flag-france':           FRANCE_FLAG,
  'flag-uk':               UK_FLAG,
  'flag-japan':            JAPAN_FLAG,
  'flag-china-imperial':   CHINA_IMPERIAL,
  'flag-china-roc':        CHINA_ROC,
  'flag-china-prc':        CHINA_PRC,
  'flag-italy':            ITALY_FLAG,
  'flag-italy-fascist':    ITALY_FASCIST,
  'flag-spain-republic':   SPAIN_REPUBLIC,
  'flag-spain-franco':     SPAIN_FRANCO,
  'flag-spain-modern':     SPAIN_MODERN,
  'flag-austria':          AUSTRIA_FLAG,
  'flag-netherlands':      NETHERLANDS_FLAG,
  'flag-belgium':          BELGIUM_FLAG,
  'flag-poland':           POLAND_FLAG,
  'flag-ukraine':          UKRAINE_FLAG,
  'flag-sweden':           SWEDEN_FLAG,
  'flag-norway':           NORWAY_FLAG,
  'flag-denmark':          DENMARK_FLAG,
  'flag-finland':          FINLAND_FLAG,
  'flag-switzerland':      SWITZERLAND_FLAG,
  'flag-greece':           GREECE_FLAG,
  'flag-portugal':         PORTUGAL_FLAG,
  'flag-turkey':           TURKEY_FLAG,
  'flag-ottoman':          OTTOMAN_FLAG,
  'flag-india-british':    BRITISH_INDIA,
  'flag-india-modern':     INDIA_MODERN,
  'flag-israel':           ISRAEL_FLAG,
  'flag-canada-old':       CANADA_OLD_SIMPLE,
  'flag-canada-modern':    CANADA_MODERN,
  'flag-australia':        AUSTRALIA_FLAG,
  'flag-mexico':           MEXICO_FLAG,
  'flag-brazil':           BRAZIL_FLAG,
  'flag-argentina':        ARGENTINA_FLAG,
  'flag-egypt-kingdom':    EGYPT_KINGDOM,
  'flag-egypt-republic':   EGYPT_REPUBLIC,
  'flag-saudi':            SAUDI_FLAG,
  'flag-iran-pahlavi':     IRAN_PAHLAVI,
  'flag-iran-islamic':     IRAN_ISLAMIC,
  'flag-south-africa-old': SOUTH_AFRICA_OLD,
  'flag-south-africa-new': SOUTH_AFRICA_NEW,
  'flag-yugoslavia':       YUGOSLAVIA_FLAG,
  'flag-serbia':           SERBIA_FLAG,
};

// --- Write SVG files ---

const outputDir = join(__dirname, '..', 'public', 'flags');
mkdirSync(outputDir, { recursive: true });

let count = 0;
for (const [id, content] of Object.entries(FLAGS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">${content}</svg>`;
  writeFileSync(join(outputDir, `${id}.svg`), svg, 'utf8');
  count++;
}

console.log(`Generated ${count} SVG flag files in ${outputDir}`);
