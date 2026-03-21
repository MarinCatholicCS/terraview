// ─── Year-range flag data (keyed by GeoJSON ADMIN country name) ───────────────
// yearEnd is inclusive; use 9999 for "still in use"

export const FLAG_DATA = {
  'Germany': [
    { yearStart: 1800, yearEnd: 1918, patternId: 'flag-germany-empire', name: 'German Empire' },
    { yearStart: 1919, yearEnd: 1932, patternId: 'flag-germany-weimar', name: 'Weimar Republic' },
    { yearStart: 1933, yearEnd: 1945, patternId: 'flag-germany-nazi',   name: 'Nazi Germany (Third Reich)' },
    { yearStart: 1946, yearEnd: 9999, patternId: 'flag-germany-modern', name: 'Federal Republic of Germany' },
  ],
  'Russia': [
    { yearStart: 1800, yearEnd: 1916, patternId: 'flag-russia-tsarist', name: 'Russian Empire' },
    { yearStart: 1917, yearEnd: 1991, patternId: 'flag-ussr',           name: 'Soviet Union (USSR)' },
    { yearStart: 1992, yearEnd: 9999, patternId: 'flag-russia-modern',  name: 'Russian Federation' },
  ],
  'United States of America': [
    { yearStart: 1800, yearEnd: 1848, patternId: 'flag-usa-48', name: 'United States (30 stars)' },
    { yearStart: 1849, yearEnd: 1958, patternId: 'flag-usa-48', name: 'United States (48 stars)' },
    { yearStart: 1959, yearEnd: 1959, patternId: 'flag-usa-49', name: 'United States (49 stars)' },
    { yearStart: 1960, yearEnd: 9999, patternId: 'flag-usa-50', name: 'United States (50 stars)' },
  ],
  'France': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-france', name: 'France' },
  ],
  'United Kingdom': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-uk', name: 'United Kingdom' },
  ],
  'Japan': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-japan', name: 'Japan' },
  ],
  'China': [
    { yearStart: 1800, yearEnd: 1911, patternId: 'flag-china-imperial', name: 'Qing Dynasty (Chinese Empire)' },
    { yearStart: 1912, yearEnd: 1949, patternId: 'flag-china-roc',      name: 'Republic of China' },
    { yearStart: 1950, yearEnd: 9999, patternId: 'flag-china-prc',      name: "People's Republic of China" },
  ],
  'Italy': [
    { yearStart: 1800, yearEnd: 1921, patternId: 'flag-italy',         name: 'Kingdom of Italy' },
    { yearStart: 1922, yearEnd: 1943, patternId: 'flag-italy-fascist', name: 'Fascist Italy' },
    { yearStart: 1944, yearEnd: 9999, patternId: 'flag-italy',         name: 'Italian Republic' },
  ],
  'Spain': [
    { yearStart: 1800, yearEnd: 1930, patternId: 'flag-spain-modern',   name: 'Kingdom of Spain' },
    { yearStart: 1931, yearEnd: 1938, patternId: 'flag-spain-republic', name: 'Spanish Republic' },
    { yearStart: 1939, yearEnd: 1977, patternId: 'flag-spain-franco',   name: 'Francoist Spain' },
    { yearStart: 1978, yearEnd: 9999, patternId: 'flag-spain-modern',   name: 'Kingdom of Spain' },
  ],
  'Austria': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-austria', name: 'Austria' },
  ],
  'Netherlands': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-netherlands', name: 'Netherlands' },
  ],
  'Belgium': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-belgium', name: 'Belgium' },
  ],
  'Poland': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-poland', name: 'Poland' },
  ],
  'Ukraine': [
    { yearStart: 1918, yearEnd: 1920, patternId: 'flag-ukraine',  name: 'Ukrainian People\'s Republic' },
    { yearStart: 1991, yearEnd: 9999, patternId: 'flag-ukraine',  name: 'Ukraine' },
  ],
  'Sweden': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-sweden', name: 'Sweden' },
  ],
  'Norway': [
    { yearStart: 1821, yearEnd: 9999, patternId: 'flag-norway', name: 'Norway' },
  ],
  'Denmark': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-denmark', name: 'Denmark' },
  ],
  'Finland': [
    { yearStart: 1918, yearEnd: 9999, patternId: 'flag-finland', name: 'Finland' },
  ],
  'Switzerland': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-switzerland', name: 'Switzerland' },
  ],
  'Greece': [
    { yearStart: 1822, yearEnd: 9999, patternId: 'flag-greece', name: 'Greece' },
  ],
  'Portugal': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-portugal', name: 'Portugal' },
  ],
  'Turkey': [
    { yearStart: 1800, yearEnd: 1922, patternId: 'flag-ottoman', name: 'Ottoman Empire' },
    { yearStart: 1923, yearEnd: 9999, patternId: 'flag-turkey',  name: 'Republic of Turkey' },
  ],
  'India': [
    { yearStart: 1858, yearEnd: 1946, patternId: 'flag-india-british', name: 'British India (Raj)' },
    { yearStart: 1947, yearEnd: 9999, patternId: 'flag-india-modern',  name: 'Republic of India' },
  ],
  'Israel': [
    { yearStart: 1948, yearEnd: 9999, patternId: 'flag-israel', name: 'State of Israel' },
  ],
  'Canada': [
    { yearStart: 1800, yearEnd: 1964, patternId: 'flag-canada-old',    name: 'Canada (Red Ensign)' },
    { yearStart: 1965, yearEnd: 9999, patternId: 'flag-canada-modern', name: 'Canada' },
  ],
  'Australia': [
    { yearStart: 1901, yearEnd: 9999, patternId: 'flag-australia', name: 'Australia' },
  ],
  'Mexico': [
    { yearStart: 1823, yearEnd: 9999, patternId: 'flag-mexico', name: 'Mexico' },
  ],
  'Brazil': [
    { yearStart: 1889, yearEnd: 9999, patternId: 'flag-brazil', name: 'Brazil' },
  ],
  'Argentina': [
    { yearStart: 1818, yearEnd: 9999, patternId: 'flag-argentina', name: 'Argentina' },
  ],
  'Egypt': [
    { yearStart: 1800, yearEnd: 1951, patternId: 'flag-egypt-kingdom',  name: 'Kingdom of Egypt' },
    { yearStart: 1952, yearEnd: 9999, patternId: 'flag-egypt-republic', name: 'Arab Republic of Egypt' },
  ],
  'Saudi Arabia': [
    { yearStart: 1932, yearEnd: 9999, patternId: 'flag-saudi', name: 'Kingdom of Saudi Arabia' },
  ],
  'Iran': [
    { yearStart: 1800, yearEnd: 1978, patternId: 'flag-iran-pahlavi',  name: 'Imperial State of Iran' },
    { yearStart: 1979, yearEnd: 9999, patternId: 'flag-iran-islamic',  name: 'Islamic Republic of Iran' },
  ],
  'South Africa': [
    { yearStart: 1928, yearEnd: 1993, patternId: 'flag-south-africa-old', name: 'South Africa (Apartheid era)' },
    { yearStart: 1994, yearEnd: 9999, patternId: 'flag-south-africa-new', name: 'Republic of South Africa' },
  ],
  'Serbia': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-serbia', name: 'Serbia' },
  ],
  'Croatia': [
    { yearStart: 1800, yearEnd: 9999, patternId: 'flag-serbia', name: 'Croatia / Yugoslavia region' },
  ],
};

// External image sources for flags that are too complex to hand-craft as SVG
// (text, coat-of-arms, many-star arrangements, embedded sub-flags, etc.)
// MapView fetches these and injects them as <image> elements inside <pattern>.
// Falls back to the local public/flags/{id}.svg if the fetch fails.
const wm = name =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`;

export const EXTERNAL_FLAG_URLS = {
  // ── Modern flags via flagcdn.com ──────────────────────────────────────────
  'flag-uk':               'https://flagcdn.com/gb.svg',
  'flag-usa-50':           'https://flagcdn.com/us.svg',
  'flag-australia':        'https://flagcdn.com/au.svg',
  'flag-brazil':           'https://flagcdn.com/br.svg',
  'flag-india-modern':     'https://flagcdn.com/in.svg',
  'flag-iran-islamic':     'https://flagcdn.com/ir.svg',
  'flag-portugal':         'https://flagcdn.com/pt.svg',
  'flag-saudi':            'https://flagcdn.com/sa.svg',
  'flag-south-africa-new': 'https://flagcdn.com/za.svg',
  // ── Historical flags via Wikimedia Commons ────────────────────────────────
  'flag-germany-nazi':  'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Germany_%281935-1945%29.svg',
  'flag-ussr':          'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_Soviet_Union.svg',
  'flag-china-imperial': wm('Flag of Qing Dynasty (1862-1889).svg'),
  'flag-canada-old':    wm('Canadian Red Ensign (1957-1965).svg'),
  'flag-india-british': wm('Flag of India (1906-1947).svg'),
  'flag-iran-pahlavi':  wm('State flag of Iran (1964-1979).svg'),
};

// Derived from FLAG_DATA — every patternId that needs a file in public/flags/
export const ALL_FLAG_IDS = [
  ...new Set(Object.values(FLAG_DATA).flat().map(v => v.patternId)),
];

// Most visually prominent / identifying color per flag pattern,
// used to fill non-main landmasses (islands, exclaves, etc.)
export const FLAG_PRIMARY_COLORS = {
  'flag-germany-empire':     '#000000', // black
  'flag-germany-weimar':     '#000000', // black
  'flag-germany-nazi':       '#CC0000', // red
  'flag-germany-modern':     '#000000', // black
  'flag-russia-tsarist':     '#003DA5', // blue
  'flag-ussr':               '#CC0000', // red
  'flag-russia-modern':      '#003DA5', // blue
  'flag-usa-48':             '#B22234', // red
  'flag-usa-49':             '#B22234', // red
  'flag-usa-50':             '#B22234', // red
  'flag-france':             '#0055A4', // blue
  'flag-uk':                 '#C8102E', // red
  'flag-japan':              '#BC002D', // red
  'flag-china-imperial':     '#FFDE00', // yellow
  'flag-china-roc':          '#FE0000', // red
  'flag-china-prc':          '#DE2910', // red
  'flag-italy':              '#009246', // green
  'flag-italy-fascist':      '#009246', // green
  'flag-spain-republic':     '#C60B1E', // red
  'flag-spain-franco':       '#AA151B', // red
  'flag-spain-modern':       '#AA151B', // red
  'flag-austria':            '#ED2939', // red
  'flag-netherlands':        '#AE1C28', // red
  'flag-belgium':            '#FAE042', // yellow
  'flag-poland':             '#DC143C', // red
  'flag-ukraine':            '#005BBB', // blue
  'flag-sweden':             '#006AA7', // blue
  'flag-norway':             '#EF2B2D', // red
  'flag-denmark':            '#C8102E', // red
  'flag-finland':            '#003580', // blue
  'flag-switzerland':        '#FF0000', // red
  'flag-greece':             '#0D5EAF', // blue
  'flag-portugal':           '#006600', // green
  'flag-turkey':             '#E30A17', // red
  'flag-ottoman':            '#C8102E', // red
  'flag-india-british':      '#CC0000', // red
  'flag-india-modern':       '#FF9933', // saffron
  'flag-israel':             '#0038B8', // blue
  'flag-canada-old':         '#C8102E', // red
  'flag-canada-modern':      '#FF0000', // red
  'flag-australia':          '#00008B', // dark blue
  'flag-mexico':             '#006847', // green
  'flag-brazil':             '#009C3B', // green
  'flag-argentina':          '#74ACDF', // blue
  'flag-egypt-kingdom':      '#007A3D', // green
  'flag-egypt-republic':     '#CE1126', // red
  'flag-saudi':              '#006C35', // green
  'flag-iran-pahlavi':       '#239F40', // green
  'flag-iran-islamic':       '#239F40', // green
  'flag-south-africa-old':   '#FF6200', // orange
  'flag-south-africa-new':   '#007A4D', // green
  'flag-yugoslavia':         '#0C4076', // blue
  'flag-serbia':             '#C6363C', // red
};

export function getFlagForYear(countryName, year) {
  const variants = FLAG_DATA[countryName];
  if (!variants) return null;
  return variants.find(v => year >= v.yearStart && year <= v.yearEnd) || null;
}
