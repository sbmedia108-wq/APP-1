import type { BusinessProfile, Kit, Quote, Tool } from './types.ts';

export const DEFAULT_PROFILE: BusinessProfile = {
  businessName: '',
  ownerName: '',
  trade: 'Fencing & Landscaping',
  phone: '',
  email: '',
  postcode: '',
  pricingMode: 'day',
  dayRate: 240,
  hourlyRate: 35,
  markupPct: 10,
  vatRegistered: false,
  vatNumber: '',
  defaultDepositPct: 25,
  paymentTerms: 'Deposit to book in, balance on completion. Bank transfer preferred.',
  bankDetails: '',
  quotePrefix: 'Q',
  nextQuoteNumber: 1001,
  followUpDays: 3,
  priceBook: {},
};

export const DEFAULT_KITS: Kit[] = [
  { id: 'everyday', name: 'Every job', icon: 'toolbox' },
  { id: 'fencing', name: 'Fencing', icon: 'fence' },
  { id: 'landscaping', name: 'Landscaping', icon: 'shovel' },
  { id: 'carpentry', name: 'Carpentry', icon: 'saw-blade' },
];

const t = (id: string, name: string, kits: string[], extra: Partial<Tool> = {}): Tool => ({ id, name, kits, ...extra });

export const DEFAULT_TOOLS: Tool[] = [
  t('drill', 'Combi drill + 2 batteries', ['everyday', 'fencing', 'carpentry', 'landscaping']),
  t('impact', 'Impact driver', ['everyday', 'fencing', 'carpentry']),
  t('charger', 'Battery charger', ['everyday']),
  t('level', 'Spirit level (1.2m)', ['everyday', 'fencing', 'landscaping', 'carpentry']),
  t('tape', 'Tape measure', ['everyday']),
  t('pencil', 'Pencils & marker', ['everyday']),
  t('ppe', 'PPE — gloves, glasses, ear defenders', ['everyday']),
  t('firstaid', 'First aid kit', ['everyday']),
  t('mitre', 'Mitre saw', ['carpentry', 'fencing']),
  t('circ', 'Circular saw', ['carpentry', 'fencing']),
  t('postdigger', 'Post hole digger / grafter', ['fencing']),
  t('bar', 'Digging bar', ['fencing', 'landscaping']),
  t('line', 'String line & pins', ['fencing', 'landscaping']),
  t('postlevel', 'Post level', ['fencing']),
  t('sledge', 'Sledgehammer', ['fencing', 'landscaping']),
  t('wacker', 'Wacker plate', ['landscaping']),
  t('disc', 'Disc cutter + diamond blade', ['landscaping']),
  t('mixer', 'Cement mixer', ['landscaping']),
  t('barrow', 'Wheelbarrow', ['landscaping', 'fencing']),
  t('chisels', 'Chisel set', ['carpentry']),
  t('multitool', 'Multi-tool', ['carpentry'], { lentTo: 'Gaz', lentAt: '2026-10-28T09:00:00.000Z' }),
];

const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Example history so job memory has something to work with on first launch. */
export function sampleQuotes(): Quote[] {
  return [
    {
      id: 'sample-1', number: 'Q-0998', createdAt: days(40), updatedAt: days(36), status: 'paid', example: true,
      title: 'Closeboard fence – 22m', trade: 'Fencing',
      client: { name: 'Margaret Ellis', phone: '07700 900412', address: '14 Orchard Way, Keynsham' },
      transcript: 'Twenty two metres of closeboard fence down the left boundary, concrete posts and gravel boards, old fence to the tip, two and a half days with a labourer',
      items: [
        { id: 'a', kind: 'labour', description: 'Labour', qty: 2.5, unit: 'day', unitPrice: 240 },
        { id: 'b', kind: 'labour', description: 'Labourer', qty: 2.5, unit: 'day', unitPrice: 140 },
        { id: 'c', kind: 'material', description: 'Slotted concrete post 2.44m', qty: 13, unit: 'post', unitPrice: 23.5 },
        { id: 'd', kind: 'material', description: 'Concrete gravel board 1.83m x 150mm', qty: 12, unit: 'board', unitPrice: 15 },
        { id: 'e', kind: 'material', description: 'Closeboard fence panel 6ft x 6ft', qty: 12, unit: 'panel', unitPrice: 57 },
        { id: 'f', kind: 'material', description: 'Postcrete 20kg', qty: 26, unit: 'bag', unitPrice: 8 },
        { id: 'g', kind: 'other', description: 'Waste removal & disposal', qty: 1, unit: 'job', unitPrice: 120 },
      ],
      notes: 'Supply and fit 22m closeboard fencing on concrete posts with gravel boards. Old fence removed and taken away.',
      assumptions: [], estimatedDays: 2.5, depositPct: 25, validDays: 30, sentAt: days(40),
    },
    {
      id: 'sample-2', number: 'Q-0999', createdAt: days(20), updatedAt: days(18), status: 'accepted', example: true,
      title: 'Indian sandstone patio – 24m²', trade: 'Landscaping',
      client: { name: 'Tom Briggs', phone: '07700 900733', address: '3 Mill Lane, Saltford' },
      transcript: 'Twenty four square metres of Indian sandstone patio, dig out, type one, full mortar bed, four days with a labourer and a skip',
      items: [
        { id: 'a', kind: 'labour', description: 'Labour', qty: 4, unit: 'day', unitPrice: 240 },
        { id: 'b', kind: 'labour', description: 'Labourer', qty: 4, unit: 'day', unitPrice: 140 },
        { id: 'c', kind: 'material', description: 'Indian sandstone paving (m²)', qty: 26, unit: 'm²', unitPrice: 30.8 },
        { id: 'd', kind: 'material', description: 'MOT Type 1 sub-base (bulk bag)', qty: 4, unit: 'bulk bag', unitPrice: 63.8 },
        { id: 'e', kind: 'material', description: 'Sharp sand (bulk bag)', qty: 2, unit: 'bulk bag', unitPrice: 60.5 },
        { id: 'f', kind: 'material', description: 'General purpose cement 25kg', qty: 12, unit: 'bag', unitPrice: 7.8 },
        { id: 'g', kind: 'other', description: '6 yard skip hire', qty: 1, unit: 'skip', unitPrice: 260 },
      ],
      notes: 'Excavate, lay 100mm compacted Type 1 and lay Indian sandstone on a full mortar bed, pointed. Waste removed by skip.',
      assumptions: [], estimatedDays: 4, depositPct: 25, validDays: 30, sentAt: days(20),
    },
    {
      id: 'sample-3', number: 'Q-1000', createdAt: days(5), updatedAt: days(5), status: 'sent', example: true,
      title: 'Fence panels – 6 replaced', trade: 'Fencing',
      client: { name: 'Priya Shah', phone: '07700 900215', address: '27 Wellsway, Bath' },
      transcript: 'Replace six overlap panels blown down in the wind, reuse the concrete posts, one day',
      items: [
        { id: 'a', kind: 'labour', description: 'Labour', qty: 1, unit: 'day', unitPrice: 240 },
        { id: 'b', kind: 'material', description: 'Overlap fence panel 6ft x 6ft', qty: 6, unit: 'panel', unitPrice: 35.2 },
      ],
      notes: 'Remove storm-damaged panels and fit 6 new overlap panels into existing concrete posts. Old panels taken away.',
      assumptions: [], estimatedDays: 1, depositPct: 0, validDays: 30, sentAt: days(5), followUpAt: days(2),
    },
  ];
}
