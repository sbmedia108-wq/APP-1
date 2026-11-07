/**
 * Quick material take-offs. Each calculator returns a list of catalogue lines
 * (material id + quantity) that can be dropped straight into a quote.
 */
import { MATERIAL_BY_ID } from './materials.ts';

export interface CalcLine {
  materialId: string;
  qty: number;
  note?: string;
}

export interface CalcField {
  key: string;
  label: string;
  unit: string;
  default: number;
}

export interface Calculator {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  fields: CalcField[];
  run: (v: Record<string, number>) => CalcLine[];
}

const ceil = (n: number) => Math.max(0, Math.ceil(n - 1e-9));
const PANEL_WIDTH_M = 1.83;

export const CALCULATORS: Calculator[] = [
  {
    id: 'fence',
    name: 'Panel fence',
    icon: 'fence',
    blurb: 'Panels, posts, gravel boards and postcrete for a run.',
    fields: [
      { key: 'length', label: 'Run length', unit: 'm', default: 18 },
      { key: 'gravelBoards', label: 'Gravel boards (1 = yes)', unit: '', default: 1 },
    ],
    run: ({ length, gravelBoards }) => {
      const panels = ceil(length / PANEL_WIDTH_M);
      const posts = panels + 1;
      const lines: CalcLine[] = [
        { materialId: 'panel-overlap-6x6', qty: panels },
        { materialId: gravelBoards ? 'post-concrete-8' : 'post-4x4-8', qty: posts },
        { materialId: 'postcrete', qty: posts * 2, note: '2 bags per post' },
      ];
      if (gravelBoards) lines.push({ materialId: 'gravel-board-concrete', qty: panels });
      return lines;
    },
  },
  {
    id: 'closeboard',
    name: 'Closeboard fence',
    icon: 'view-column',
    blurb: 'Posts, arris rails, featheredge and postcrete built in situ.',
    fields: [
      { key: 'length', label: 'Run length', unit: 'm', default: 20 },
      { key: 'rails', label: 'Rails per bay', unit: '', default: 3 },
    ],
    run: ({ length, rails }) => {
      const bays = ceil(length / 2.7);
      const posts = bays + 1;
      return [
        { materialId: 'post-4x4-8', qty: posts },
        { materialId: 'arris-rail', qty: bays * (rails || 3) },
        { materialId: 'featheredge', qty: ceil((length * 1000) / 100) + 5, note: '25mm overlap, +5 spare' },
        { materialId: 'gravel-board-concrete', qty: ceil(length / PANEL_WIDTH_M) },
        { materialId: 'postcrete', qty: posts * 2 },
        { materialId: 'nails-ring', qty: ceil(length / 10) },
      ];
    },
  },
  {
    id: 'decking',
    name: 'Decking',
    icon: 'table-large',
    blurb: 'Boards, joists at 400mm centres and screws.',
    fields: [
      { key: 'length', label: 'Length', unit: 'm', default: 4.8 },
      { key: 'width', label: 'Width', unit: 'm', default: 3.6 },
    ],
    run: ({ length, width }) => {
      const area = length * width;
      const rows = ceil(width / 0.13);
      const boards = ceil((rows * length) / 4.8 * 1.1);
      const joists = ceil(length / 0.4) + 1;
      const joistLengths = ceil((joists * width) / 4.8 * 1.1);
      return [
        { materialId: 'decking-board', qty: boards, note: '+10% waste' },
        { materialId: 'c24-6x2', qty: joistLengths, note: 'joists @ 400 centres' },
        { materialId: 'membrane', qty: ceil(area / 14) },
        { materialId: 'screws-box', qty: ceil(area / 6) },
      ];
    },
  },
  {
    id: 'patio',
    name: 'Patio',
    icon: 'view-grid',
    blurb: 'Paving, Type 1 at 100mm, sharp sand bed and cement.',
    fields: [
      { key: 'area', label: 'Area', unit: 'm²', default: 20 },
      { key: 'porcelain', label: 'Porcelain (1 = yes)', unit: '', default: 0 },
    ],
    run: ({ area, porcelain }) => [
      { materialId: porcelain ? 'porcelain-paving' : 'indian-sandstone', qty: ceil(area * 1.08), note: '+8% cuts' },
      { materialId: 'type1', qty: ceil((area * 0.1) / 0.6), note: '100mm compacted' },
      { materialId: 'sharp-sand', qty: ceil((area * 0.04) / 0.6) },
      { materialId: 'cement', qty: ceil(area / 2) },
      { materialId: 'skip-6', qty: area > 25 ? 2 : 1 },
    ],
  },
  {
    id: 'plaster',
    name: 'Board & skim',
    icon: 'wall',
    blurb: 'Plasterboard, multi-finish, scrim and beads for walls or ceilings.',
    fields: [
      { key: 'area', label: 'Area', unit: 'm²', default: 30 },
      { key: 'board', label: 'Boarding too (1 = yes)', unit: '', default: 1 },
    ],
    run: ({ area, board }) => {
      const lines: CalcLine[] = [{ materialId: 'multi-finish', qty: ceil(area / 10), note: '~10m² per bag' }];
      if (board) {
        lines.unshift({ materialId: 'plasterboard-125', qty: ceil((area / 2.88) * 1.1) });
        lines.push({ materialId: 'scrim', qty: ceil(area / 40) });
      }
      lines.push({ materialId: 'angle-bead', qty: ceil(area / 15) });
      return lines;
    },
  },
  {
    id: 'paint',
    name: 'Paint',
    icon: 'format-paint',
    blurb: 'Trade emulsion for walls at 12m² per litre.',
    fields: [
      { key: 'area', label: 'Wall area', unit: 'm²', default: 45 },
      { key: 'coats', label: 'Coats', unit: '', default: 2 },
    ],
    run: ({ area, coats }) => [
      { materialId: 'trade-emulsion', qty: ceil((area * (coats || 2)) / 12 / 10) },
      { materialId: 'caulk', qty: ceil(area / 20) },
    ],
  },
  {
    id: 'turf',
    name: 'Turf & soil',
    icon: 'grass',
    blurb: 'Turf plus topsoil to level at 50mm.',
    fields: [{ key: 'area', label: 'Area', unit: 'm²', default: 40 }],
    run: ({ area }) => [
      { materialId: 'turf', qty: ceil(area * 1.05) },
      { materialId: 'topsoil', qty: ceil((area * 0.05) / 0.7) },
    ],
  },
];

export function describeLine(l: CalcLine) {
  const m = MATERIAL_BY_ID[l.materialId];
  return m ? `${l.qty} × ${m.name}` : `${l.qty} × ${l.materialId}`;
}
