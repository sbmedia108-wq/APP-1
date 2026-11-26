// Mitch SVG generator (shared by the promo videos)
const INK = '#15151C';
let __uid = 0;
function mitch(o = {}) {
  const F = o.fill || '#C8F23A', D = o.deep || '#9CC41A', id = 'm' + (__uid++);
  const stage = o.stage || 3;
  const Y = 126;
  const eye = (x, t) => {
    switch (t) {
      case 'happy': return `<path d="M${x-10} ${Y+4} q10 -14 20 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      case 'closed': return `<path d="M${x-10} ${Y} q10 10 20 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      case 'half': return `<ellipse cx="${x}" cy="${Y+2}" rx="10" ry="12" fill="${INK}"/><rect x="${x-14}" y="${Y-14}" width="28" height="12" fill="${F}"/><path d="M${x-12} ${Y-2} h24" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="${x+3}" cy="${Y+5}" r="3" fill="#fff"/>`;
      case 'star': return `<path d="M${x} ${Y-14} l4.5 9 10 1.2 -7.5 6.8 2.2 10 -9.2 -5.2 -9.2 5.2 2.2 -10 -7.5 -6.8 10 -1.2z" fill="#FFD84A" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
      case 'angry': return `<ellipse cx="${x}" cy="${Y+2}" rx="10" ry="12" fill="${INK}"/><circle cx="${x+3}" cy="${Y-2}" r="3.5" fill="#fff"/>`;
      case 'none': return '';
      default: return `<ellipse cx="${x}" cy="${Y}" rx="10" ry="13" fill="${INK}"/><circle cx="${x+3}" cy="${Y-5}" r="3.5" fill="#fff"/>`;
    }
  };
  const ev = o.eyes || 'open';
  let eyes = ev === 'wink' ? eye(125, 'open') + eye(175, 'happy') : eye(125, ev) + eye(175, ev);
  if (ev === 'angry') eyes += `<path d="M110 106 L138 113 M190 106 L162 113" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  const M = {
    smile: `<path d="M138 147 q12 12 24 0" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,
    smirk: `<path d="M139 150 q12 6 24 -4" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,
    flat: `<path d="M141 151 h18" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`,
    o: `<ellipse cx="150" cy="152" rx="5" ry="6" fill="${INK}"/>`,
    open: `<path d="M138 146 h24 q-2 16 -12 16 q-10 0 -12 -16z" fill="${INK}"/><path d="M144 156 q6 4 12 0" stroke="#F2547D" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M132 145 h36 q-2 20 -18 20 q-16 0 -18 -20z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="136" y="146" width="28" height="6" rx="2" fill="#fff"/>`,
    tongue: `<path d="M139 148 q12 6 24 -2" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M152 151 q0 12 7 12 q7 0 6 -14" fill="#F2547D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    cat: `<path d="M136 148 q7 8 14 0 q7 8 14 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  };
  const cheeks = o.noCheeks ? '' : `<ellipse cx="104" cy="149" rx="11" ry="6.5" fill="${o.cheek||'#F2547D'}" opacity="${o.cheekOp||.38}"/><ellipse cx="196" cy="149" rx="11" ry="6.5" fill="${o.cheek||'#F2547D'}" opacity="${o.cheekOp||.38}"/>`;
  const A = {
    headphones: `<path d="M58 128 C52 30 248 30 242 128" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="40" y="108" width="26" height="44" rx="11" fill="${o.acc1||'#8B6CFF'}" stroke="${INK}" stroke-width="5"/><rect x="234" y="108" width="26" height="44" rx="11" fill="${o.acc1||'#8B6CFF'}" stroke="${INK}" stroke-width="5"/>`,
    mic: `<path d="M52 148 q4 30 62 16" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/><rect x="108" y="156" width="16" height="13" rx="6" fill="${INK}"/>`,
    glasses: `<rect x="106" y="110" width="38" height="32" rx="10" fill="rgba(255,255,255,.35)" stroke="${INK}" stroke-width="5"/><rect x="156" y="110" width="38" height="32" rx="10" fill="rgba(255,255,255,.35)" stroke="${INK}" stroke-width="5"/><path d="M144 122 h12" stroke="${INK}" stroke-width="5"/>`,
    cap: `<rect x="122" y="58" width="56" height="22" rx="4" fill="${INK}"/><polygon points="150,30 222,54 150,78 78,54" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M150 54 L204 64 L204 92" stroke="#FFC93C" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="204" cy="96" r="7" fill="#FFC93C"/>`,
    shades: `<path d="M94 116 h112" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M99 114 h43 v8 q0 22 -21.5 22 q-21.5 0 -21.5 -22z" fill="${INK}"/><path d="M158 114 h43 v8 q0 22 -21.5 22 q-21.5 0 -21.5 -22z" fill="${INK}"/><path d="M107 121 l9 -0 M166 121 l9 0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
    chain: `<path d="M96 174 q54 34 108 0" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M96 174 q54 34 108 0" stroke="#FFC93C" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="7 4"/><circle cx="150" cy="193" r="13" fill="#FFC93C" stroke="${INK}" stroke-width="4.5"/><text x="150" y="199" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="16" fill="${INK}">M</text>`,
    flower: `<g transform="translate(214 82)">${[0,72,144,216,288].map(r=>`<ellipse cx="0" cy="-13" rx="9" ry="12" fill="#fff" stroke="${INK}" stroke-width="4" transform="rotate(${r})"/>`).join('')}<circle r="8" fill="#FFC93C" stroke="${INK}" stroke-width="4"/></g>`,
    snapback: `<ellipse cx="78" cy="86" rx="32" ry="9" fill="${o.acc2||INK}" stroke="${INK}" stroke-width="5" transform="rotate(-14 78 86)"/><path d="M88 90 q4 -62 62 -62 q58 0 62 62 z" fill="${o.acc1||'#2F6BFF'}" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/><path d="M150 30 v58" stroke="${INK}" stroke-width="3.5" opacity=".35"/><rect x="134" y="76" width="32" height="12" rx="6" fill="${F}" stroke="${INK}" stroke-width="4"/><circle cx="150" cy="28" r="6" fill="${INK}"/>`,
    flame: `<path d="M150 6 c12 20 34 28 34 50 c0 16 -15 24 -34 24 c-19 0 -34 -8 -34 -24 c0 -12 8 -20 13 -28 c2 10 8 15 13 15 c-6 -14 0 -26 8 -37z" fill="#FF5A36" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M150 40 c6 10 16 14 16 24 c0 8 -7 12 -16 12 c-9 0 -16 -4 -16 -12 c0 -8 8 -12 16 -24z" fill="#FFD84A"/>`,
    stars: `${[[86,100,1],[214,96,.8],[204,178,.7],[94,176,.6],[150,86,.55]].map(([x,y,s])=>`<path d="M${x} ${y-8*s} l${2.4*s} ${5.6*s} ${5.6*s} ${2.4*s} -${5.6*s} ${2.4*s} -${2.4*s} ${5.6*s} -${2.4*s} -${5.6*s} -${5.6*s} -${2.4*s} ${5.6*s} -${2.4*s}z" fill="#fff" opacity=".9"/>`).join('')}`,
    ring: `<ellipse cx="150" cy="188" rx="128" ry="16" fill="none" stroke="#FFD84A" stroke-width="6" transform="rotate(-5 150 188)" stroke-dasharray="160 80 400" />`,
    headband: `<g clip-path="url(#${id})"><rect x="40" y="86" width="220" height="18" fill="${o.acc1||'#F2405A'}"/><path d="M40 86 h220 M40 104 h220" stroke="${INK}" stroke-width="4"/><path d="M40 95 h220" stroke="#fff" stroke-width="3" opacity=".7"/></g>`,
    ball: `<g transform="translate(262 192)"><circle r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M0 -8 l7.6 5.5 -2.9 9 h-9.4 l-2.9 -9z" fill="${INK}"/><path d="M0 -8 v-13 M7.6 -2.5 l12 -4 M4.7 6.5 l7.5 11 M-4.7 6.5 l-7.5 11 M-7.6 -2.5 l-12 -4" stroke="${INK}" stroke-width="3"/></g>`,
    visor: `<rect x="88" y="106" width="124" height="40" rx="20" fill="${INK}"/><rect x="108" y="122" width="26" height="8" rx="4" fill="#C8F23A"/><rect x="166" y="122" width="26" height="8" rx="4" fill="#C8F23A"/><path d="M98 114 q10 -4 22 -4" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`,
    antenna: `<path d="M150 70 v-30" stroke="${INK}" stroke-width="5"/><circle cx="150" cy="34" r="9" fill="#C8F23A" stroke="${INK}" stroke-width="4.5"/>`,
    cardigan: `<g clip-path="url(#${id})"><path d="M40 160 h220 v60 h-220z" fill="${o.acc1||'#B97A4E'}"/><path d="M40 160 h220" stroke="${INK}" stroke-width="4.5"/><path d="M150 160 v50" stroke="${INK}" stroke-width="4"/><circle cx="140" cy="176" r="3.5" fill="${INK}"/><circle cx="140" cy="191" r="3.5" fill="${INK}"/></g>`,
    tea: `<g transform="translate(262 180)"><path d="M-16 -16 h28 v22 q0 12 -14 12 q-14 0 -14 -12z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M12 -10 q12 0 12 9 q0 8 -12 8" fill="none" stroke="${INK}" stroke-width="4.5"/></g>`,
    sparkle: `<path d="M250 52 l5 14 14 5 -14 5 -5 14 -5 -14 -14 -5 14 -5z" fill="#FFD84A" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M48 76 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" fill="#FFD84A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    sweat: `<path d="M224 88 q9 15 0 22 q-9 -7 0 -22z" fill="#7FC8FF" stroke="${INK}" stroke-width="3.5"/>`,
    zzz: `<text x="222" y="66" font-family="Bricolage Grotesque" font-weight="800" font-size="32" fill="${INK}">z</text><text x="248" y="40" font-family="Bricolage Grotesque" font-weight="800" font-size="22" fill="${INK}" opacity=".6">z</text>`,
    frost: `<path d="M57 63 l6 6 M63 63 l-6 6 M60 61 v10 M55 66 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M246 178 l6 6 M252 178 l-6 6 M249 176 v10 M244 181 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`
  };
  const acc = (o.acc || []).map(a => A[a]).join('');
  const glow = o.glow ? `<defs><radialGradient id="g${id}"><stop offset="0" stop-color="#FFE680" stop-opacity=".95"/><stop offset="1" stop-color="#FFE680" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="130" r="132" fill="url(#g${id})"/>` : '';
  let body;
  if (stage === 1) {
    body = `<ellipse cx="150" cy="212" rx="44" ry="7" fill="${INK}" opacity=".12"/>
      <circle cx="150" cy="140" r="62" fill="${F}" stroke="${INK}" stroke-width="6.5"/>
      <ellipse cx="128" cy="110" rx="14" ry="8" fill="#fff" opacity=".55" transform="rotate(-25 128 110)"/>`;
  } else {
    const cr = stage >= 3 ? `<rect x="66" y="84" width="168" height="102" rx="51" fill="none" stroke="${D}" stroke-width="5"/>
      <path d="M90 86 v26 M210 86 v26 M104 184 v-22 M196 184 v-22 M150 186 v-14" stroke="${D}" stroke-width="5" stroke-linecap="round"/>` : '';
    body = `<ellipse cx="150" cy="218" rx="80" ry="8" fill="${INK}" opacity=".12"/>
      <ellipse cx="118" cy="204" rx="16" ry="9" fill="${INK}"/><ellipse cx="182" cy="204" rx="16" ry="9" fill="${INK}"/>
      <path d="M56 140 q-18 4 -20 20" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M244 140 q18 4 20 20" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="52" y="70" width="196" height="130" rx="65" fill="${F}"/>
      <g clip-path="url(#${id})">${cr}</g>
      <rect x="52" y="70" width="196" height="130" rx="65" fill="none" stroke="${INK}" stroke-width="6.5"/>
      <ellipse cx="96" cy="94" rx="18" ry="8" fill="#fff" opacity=".5" transform="rotate(-20 96 94)"/>`;
  }
  const face = stage === 1 ? `<g transform="translate(0 8)">${eyes}${M[o.mouth||'o']}</g>` : cheeks + eyes + M[o.mouth || 'smile'];
  const inner = `${glow}${body}${face}${acc}`;
  const scaled = stage === 2 ? `<g transform="translate(30 42) scale(.8)">${inner}</g>` : inner;
  return `<svg viewBox="0 0 300 236" xmlns="http://www.w3.org/2000/svg" overflow="visible">
    <defs><clipPath id="${id}"><rect x="52" y="70" width="196" height="130" rx="65"/></clipPath></defs>${scaled}</svg>`;
}

const VARIANTS = [
  {name:'OG Mitch', line:'Unbothered since day one.', fill:'#C8F23A',deep:'#9CC41A',eyes:'half',mouth:'smirk',acc:['headphones'],bg:'#EEF7CF'},
  {name:'Donny Mitch', line:'Shades indoors. Gets away with it.', fill:'#9B82FF',deep:'#7A5CF0',eyes:'none',mouth:'smirk',acc:['shades','chain'],bg:'#E9E3FF',noCheeks:true},
  {name:'Blossom Mitch', line:'Soft. Sweet. Destroys you at Biology.', fill:'#FFB8CB',deep:'#F28DAA',eyes:'happy',mouth:'cat',acc:['flower'],bg:'#FFE6EE',cheek:'#E0406E',cheekOp:.45},
  {name:'Frosty Mitch', line:'Ice cold under exam pressure.', fill:'#A9DDFF',deep:'#7CC0EE',eyes:'wink',mouth:'grin',acc:['snapback','frost'],acc1:'#2F5BFF',acc2:'#15151C',bg:'#E2F2FF'},
  {name:'Lava Mitch', line:'Exam season? Beast mode.', fill:'#FF9A57',deep:'#EB7034',eyes:'angry',mouth:'grin',acc:['flame'],bg:'#FFE5D4',cheek:'#D8342A',cheekOp:.3},
  {name:'Cosmic Mitch', line:'Seen the universe. Still can’t do simultaneous equations.', fill:'#7479F0',deep:'#5A5FD8',eyes:'star',mouth:'open',acc:['stars','ring'],bg:'#E3E4FF',cheek:'#FF8FB1',cheekOp:.5},
  {name:'Gamer Mitch', line:'Says “GG” after every quiz.', fill:'#4FDCC6',deep:'#2DB8A2',eyes:'half',mouth:'tongue',acc:['headphones','mic'],acc1:'#15151C',bg:'#D9F7F1'},
  {name:'Five-a-side Mitch', line:'Celebrates right answers like a worldie.', fill:'#FFFFFF',deep:'#E2E2EA',eyes:'open',mouth:'open',acc:['headband','ball'],acc1:'#F2405A',bg:'#ECEAF0'},
  {name:'Glitch Mitch', line:'Downloaded the whole spec. 4% battery.', fill:'#C9CFDB',deep:'#A4ACBD',eyes:'none',mouth:'flat',acc:['visor','antenna'],bg:'#E6E9EF',noCheeks:true},
  {name:'Grandad Mitch', line:'“In my day we had textbooks.”', fill:'#FFD84A',deep:'#E8B91E',eyes:'closed',mouth:'smile',acc:['cardigan','tea'],acc1:'#B97A4E',bg:'#FFF3C8'},
];
