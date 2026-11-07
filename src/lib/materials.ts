/**
 * Materials catalogue + merchant price lookup.
 *
 * Indicative prices are typical UK trade-counter prices (ex-VAT) used for instant
 * estimates when offline. Live prices come from a PriceProvider — the default
 * provider spreads the indicative price across merchants and deep-links into
 * each merchant's own search so the user can confirm stock and the real price
 * at their nearest branch. Swap in a live provider (merchant trade API or a
 * price-aggregation backend) via setPriceProvider().
 */

export interface Material {
  id: string;
  name: string;
  category: string;
  /** Added by the user (imported or typed in); price is their own price. */
  custom?: boolean;
  unit: string;
  /** Indicative ex-VAT trade price in GBP. */
  price: number;
  /** Words/phrases that identify this item in speech. Lower-case. */
  keywords: string[];
}

export const MATERIALS: Material[] = [
  // Fencing
  { id: 'post-4x4-8', name: '100x100mm (4x4) treated post 2.4m (8ft)', category: 'Fencing', unit: 'post', price: 14.5, keywords: ['4x4 8ft', '4x4 8', '4 x 4 8', 'four by four 8', '8ft post', '8 foot post', '8 ft post', '2.4m post', '2.4 metre post'] },
  { id: 'post-4x4-6', name: '100x100mm (4x4) treated post 1.8m (6ft)', category: 'Fencing', unit: 'post', price: 10.95, keywords: ['4x4 6', '6ft post', '6 foot post', '1.8m post'] },
  { id: 'post-concrete-8', name: 'Slotted concrete post 2.44m', category: 'Fencing', unit: 'post', price: 21.5, keywords: ['concrete post', 'slotted post', 'concrete posts'] },
  { id: 'gravel-board-concrete', name: 'Concrete gravel board 1.83m x 150mm', category: 'Fencing', unit: 'board', price: 13.75, keywords: ['concrete gravel board', 'gravel board', 'gravel boards'] },
  { id: 'panel-closeboard-6x6', name: 'Closeboard fence panel 6ft x 6ft', category: 'Fencing', unit: 'panel', price: 52, keywords: ['closeboard panel', 'close board panel', 'closeboard', 'close board'] },
  { id: 'panel-overlap-6x6', name: 'Overlap fence panel 6ft x 6ft', category: 'Fencing', unit: 'panel', price: 32, keywords: ['overlap panel', 'lap panel', 'fence panel', 'panels', 'panel'] },
  { id: 'featheredge', name: 'Featheredge board 125mm x 1.8m', category: 'Fencing', unit: 'board', price: 1.65, keywords: ['featheredge', 'feather edge', 'feather board'] },
  { id: 'arris-rail', name: 'Arris rail 3.0m', category: 'Fencing', unit: 'length', price: 6.4, keywords: ['arris rail', 'arris'] },
  { id: 'postcrete', name: 'Postcrete 20kg', category: 'Fencing', unit: 'bag', price: 7.25, keywords: ['postcrete', 'postmix', 'post mix', 'post fix'] },
  // Timber / decking
  { id: 'cls-3x2', name: 'CLS 38x63mm 2.4m', category: 'Timber', unit: 'length', price: 3.6, keywords: ['3x2', '3 by 2', 'three by two', 'cls'] },
  { id: 'c16-4x2', name: 'C16 47x100mm treated 3.6m', category: 'Timber', unit: 'length', price: 9.5, keywords: ['4x2', '4 by 2', 'four by two', 'c16'] },
  { id: 'c24-6x2', name: 'C24 47x150mm treated 4.8m (joist)', category: 'Timber', unit: 'length', price: 19.8, keywords: ['6x2', '6 by 2', 'six by two', 'joist', 'joists'] },
  { id: 'decking-board', name: 'Grooved decking board 32x125mm 4.8m', category: 'Timber', unit: 'board', price: 12.4, keywords: ['decking board', 'deck board', 'decking boards'] },
  { id: 'osb-18', name: 'OSB3 18mm 2440x1220', category: 'Timber', unit: 'sheet', price: 24.5, keywords: ['osb', 'sterling board'] },
  { id: 'ply-18', name: 'Structural ply 18mm 2440x1220', category: 'Timber', unit: 'sheet', price: 42, keywords: ['ply', 'plywood'] },
  // Landscaping
  { id: 'type1', name: 'MOT Type 1 sub-base (bulk bag)', category: 'Landscaping', unit: 'bulk bag', price: 58, keywords: ['type 1', 'type one', 'mot', 'sub base', 'sub-base', 'hardcore'] },
  { id: 'sharp-sand', name: 'Sharp sand (bulk bag)', category: 'Landscaping', unit: 'bulk bag', price: 55, keywords: ['sharp sand', 'grit sand'] },
  { id: 'building-sand', name: 'Building sand (bulk bag)', category: 'Building', unit: 'bulk bag', price: 52, keywords: ['building sand', 'soft sand'] },
  { id: 'ballast', name: 'Ballast 20mm all-in (bulk bag)', category: 'Building', unit: 'bulk bag', price: 56, keywords: ['ballast', 'all in', 'all-in'] },
  { id: 'gravel-20', name: 'Decorative gravel 20mm (bulk bag)', category: 'Landscaping', unit: 'bulk bag', price: 85, keywords: ['gravel', 'shingle', 'pea gravel'] },
  { id: 'membrane', name: 'Weed control membrane 1x14m', category: 'Landscaping', unit: 'roll', price: 11.5, keywords: ['membrane', 'weed membrane', 'terram'] },
  { id: 'indian-sandstone', name: 'Indian sandstone paving (m²)', category: 'Landscaping', unit: 'm²', price: 28, keywords: ['sandstone', 'indian stone', 'paving slab', 'paving', 'slabs'] },
  { id: 'porcelain-paving', name: 'Porcelain paving 600x900 (m²)', category: 'Landscaping', unit: 'm²', price: 36, keywords: ['porcelain', 'porcelain paving'] },
  { id: 'turf', name: 'Turf roll (m²)', category: 'Landscaping', unit: 'm²', price: 3.9, keywords: ['turf', 'turfing', 'lawn'] },
  { id: 'topsoil', name: 'Screened topsoil (bulk bag)', category: 'Landscaping', unit: 'bulk bag', price: 69, keywords: ['topsoil', 'top soil'] },
  { id: 'skip-6', name: '6 yard skip hire', category: 'Building', unit: 'skip', price: 260, keywords: ['skip', 'six yard skip', '6 yard skip'] },
  // Building
  { id: 'cement', name: 'General purpose cement 25kg', category: 'Building', unit: 'bag', price: 7.1, keywords: ['cement'] },
  { id: 'concrete-block', name: 'Dense concrete block 100mm', category: 'Building', unit: 'block', price: 1.95, keywords: ['block', 'blocks', 'breeze block', 'concrete blocks'] },
  { id: 'facing-brick', name: 'Facing brick (each)', category: 'Building', unit: 'brick', price: 0.85, keywords: ['facing brick', 'bricks', 'brick'] },
  // Plastering
  { id: 'plasterboard-125', name: 'Plasterboard 12.5mm 2400x1200', category: 'Plastering', unit: 'sheet', price: 9.8, keywords: ['plasterboard', 'plaster board', 'boards', 'board', 'sheets of board'] },
  { id: 'multi-finish', name: 'Multi-finish plaster 25kg', category: 'Plastering', unit: 'bag', price: 10.4, keywords: ['multi finish', 'multifinish', 'multi', 'finish plaster', 'skim'] },
  { id: 'bonding', name: 'Bonding coat 25kg', category: 'Plastering', unit: 'bag', price: 12.9, keywords: ['bonding', 'browning', 'hardwall'] },
  { id: 'scrim', name: 'Scrim tape 90m', category: 'Plastering', unit: 'roll', price: 3.2, keywords: ['scrim'] },
  { id: 'angle-bead', name: 'Thin coat angle bead 2.4m', category: 'Plastering', unit: 'length', price: 1.6, keywords: ['angle bead', 'beads', 'bead'] },
  // Decorating
  { id: 'trade-emulsion', name: 'Trade vinyl matt emulsion 10L', category: 'Decorating', unit: 'tub', price: 44, keywords: ['emulsion', 'matt', 'paint'] },
  { id: 'satinwood', name: 'Trade satinwood 2.5L', category: 'Decorating', unit: 'tin', price: 33, keywords: ['satinwood', 'satin', 'gloss', 'eggshell'] },
  { id: 'caulk', name: 'Decorators caulk 380ml', category: 'Decorating', unit: 'tube', price: 1.9, keywords: ['caulk', 'decorators caulk'] },
  // Tiling
  { id: 'tile-adhesive', name: 'Rapid set tile adhesive 20kg', category: 'Tiling', unit: 'bag', price: 18.5, keywords: ['tile adhesive', 'adhesive'] },
  { id: 'grout', name: 'Wall & floor grout 5kg', category: 'Tiling', unit: 'bag', price: 9.5, keywords: ['grout'] },
  // Plumbing / electrical
  { id: 'copper-15', name: '15mm copper pipe 3m', category: 'Plumbing', unit: 'length', price: 17.5, keywords: ['15mm copper', '15 mil copper', 'copper pipe', 'copper'] },
  { id: 'twin-earth-25', name: '2.5mm twin & earth 50m', category: 'Electrical', unit: 'drum', price: 62, keywords: ['2.5 twin and earth', 'twin and earth', 't&e', 'ring cable'] },
  // Roofing
  { id: 'epdm', name: 'EPDM rubber roofing (m²)', category: 'Roofing', unit: 'm²', price: 14.5, keywords: ['epdm', 'rubber roof', 'firestone'] },
  // Fixings
  { id: 'screws-box', name: 'Wood screws 5x70mm (box 200)', category: 'Fixings', unit: 'box', price: 8.5, keywords: ['screws', 'decking screws', 'wood screws'] },
  { id: 'nails-ring', name: 'Galvanised ring shank nails 1kg', category: 'Fixings', unit: 'box', price: 6.2, keywords: ['nails', 'ring shank', 'galvanised nails'] },
];

export const MATERIAL_BY_ID: Record<string, Material> = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

// The user's own materials, registered by the store so search and voice parsing see them.
let customMaterials: Material[] = [];
export function setCustomMaterials(list: Material[]) {
  for (const m of customMaterials) delete MATERIAL_BY_ID[m.id];
  customMaterials = list;
  for (const m of list) MATERIAL_BY_ID[m.id] = m;
}
/** User's materials first, so their own items win ties against the built-in catalogue. */
export const allMaterials = () => (customMaterials.length ? [...customMaterials, ...MATERIALS] : MATERIALS);

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/(\d)\s*(?:x|by)\s*(\d)/g, '$1x$2')
    .replace(/(\d)\s*(?:foot|feet|ft|')/g, '$1ft')
    .replace(/[^a-z0-9.²x ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Ranks catalogue items against a free-text query ("4x4 8 foot post"). */
export function searchMaterials(query: string, limit = 8): Material[] {
  const q = norm(query);
  if (!q) return [];
  const qTokens = q.split(' ');
  const scored = allMaterials().map((m) => {
    const hay = norm(`${m.name} ${m.keywords.join(' ')} ${m.category}`);
    let score = 0;
    for (const k of m.keywords) if (q.includes(norm(k))) score += 10 + norm(k).length;
    for (const t of qTokens) if (t.length > 1 && hay.includes(t)) score += t.length > 3 ? 3 : 2;
    return { m, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.m);
}

/** Best single catalogue match within a spoken phrase, or undefined. */
export function matchMaterial(phrase: string): Material | undefined {
  const p = norm(phrase);
  let best: { m: Material; len: number } | undefined;
  for (const m of allMaterials()) {
    for (const k of m.keywords) {
      const nk = norm(k);
      if (new RegExp(`(^|\\s)${nk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?(\\s|$)`).test(p) && (!best || nk.length > best.len)) {
        best = { m, len: nk.length };
      }
    }
  }
  return best?.m;
}

// ---------------------------------------------------------------------------
// Merchants & prices
// ---------------------------------------------------------------------------

export interface Merchant {
  id: string;
  name: string;
  /** Typical price relative to the indicative price (1 = same). */
  priceFactor: number;
  searchUrl: (q: string) => string;
  branchUrl: (postcode: string) => string;
  /** Typical click & collect lead time, for display. */
  collect: string;
}

const enc = encodeURIComponent;

export const MERCHANTS: Merchant[] = [
  { id: 'screwfix', name: 'Screwfix', priceFactor: 1.0, collect: 'Collect in 1 min', searchUrl: (q) => `https://www.screwfix.com/search?search=${enc(q)}`, branchUrl: (pc) => `https://www.screwfix.com/stores?postcode=${enc(pc)}` },
  { id: 'toolstation', name: 'Toolstation', priceFactor: 0.97, collect: 'Collect in 5 mins', searchUrl: (q) => `https://www.toolstation.com/search?q=${enc(q)}`, branchUrl: (pc) => `https://www.toolstation.com/branches?q=${enc(pc)}` },
  { id: 'travis', name: 'Travis Perkins', priceFactor: 1.04, collect: 'Next-day delivery', searchUrl: (q) => `https://www.travisperkins.co.uk/search?text=${enc(q)}`, branchUrl: (pc) => `https://www.travisperkins.co.uk/branch-locator?q=${enc(pc)}` },
  { id: 'jewson', name: 'Jewson', priceFactor: 1.06, collect: 'Next-day delivery', searchUrl: (q) => `https://www.jewson.co.uk/search?q=${enc(q)}`, branchUrl: (pc) => `https://www.jewson.co.uk/branch-finder?q=${enc(pc)}` },
  { id: 'selco', name: 'Selco', priceFactor: 0.99, collect: 'Same day', searchUrl: (q) => `https://www.selcobw.com/search?text=${enc(q)}`, branchUrl: (pc) => `https://www.selcobw.com/branches?q=${enc(pc)}` },
  { id: 'wickes', name: 'Wickes', priceFactor: 1.08, collect: 'Collect in 1 hr', searchUrl: (q) => `https://www.wickes.co.uk/search?text=${enc(q)}`, branchUrl: (pc) => `https://www.wickes.co.uk/store-finder?q=${enc(pc)}` },
  { id: 'bandq', name: 'B&Q', priceFactor: 1.12, collect: 'Collect in 1 hr', searchUrl: (q) => `https://www.diy.com/search?term=${enc(q)}`, branchUrl: (pc) => `https://www.diy.com/store-finder?q=${enc(pc)}` },
];

export interface PriceQuote {
  merchant: Merchant;
  material: Material;
  price: number;
  /** Total for the requested quantity. */
  total: number;
  /** 'indicative' = estimated from typical prices; 'live' = from a real merchant feed. */
  source: 'indicative' | 'live';
  url: string;
}

export interface PriceProvider {
  lookup(material: Material, qty: number, postcode: string): Promise<PriceQuote[]>;
}

/** Deterministic spread so the same item always shows the same ordering. */
function wobble(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 9) - 4) / 100; // -4% .. +4%
}

export const indicativeProvider: PriceProvider = {
  async lookup(material, qty) {
    return MERCHANTS.map((merchant) => {
      const price = Math.round(material.price * (merchant.priceFactor + wobble(merchant.id + material.id)) * 100) / 100;
      return {
        merchant,
        material,
        price,
        total: Math.round(price * qty * 100) / 100,
        source: 'indicative' as const,
        url: merchant.searchUrl(material.name),
      };
    }).sort((a, b) => a.price - b.price);
  },
};

let provider: PriceProvider = indicativeProvider;
export const setPriceProvider = (p: PriceProvider) => {
  provider = p;
};
export const lookupPrices = (material: Material, qty: number, postcode: string) => provider.lookup(material, qty, postcode);
