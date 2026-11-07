/**
 * Turns a pasted or imported materials list into catalogue items.
 * Accepts CSV/TSV with or without a header row (Excel, Google Sheets, merchant price lists)
 * and loose lines typed on a phone: "Postcrete 20kg, bag, 6.40", "Postcrete £6.40", "Sharp sand - bulk bag - £55".
 */
import type { Material } from './materials.ts';

export interface ImportResult {
  items: Material[];
  skipped: { line: number; text: string; reason: string }[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
export const customId = (name: string) => `custom-${slug(name)}`;

function splitRow(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === delim && !quoted) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

/** "£1,234.50", "6.40", "6.4 + VAT" -> number; undefined if it isn't a price. */
export function parsePrice(s: string): number | undefined {
  const m = s.replace(/,/g, '').match(/£?\s*(\d+(?:\.\d{1,2})?)\s*(?:p\b)?/i);
  if (!m) return undefined;
  let n = Number(m[1]);
  if (/^\s*\d+\s*p\s*$/i.test(s)) n = n / 100; // "85p"
  return n > 0 ? Math.round(n * 100) / 100 : undefined;
}

const isPriceCell = (s: string) => /^\s*£?\s*\d[\d,]*(\.\d{1,2})?\s*(p|\+\s*vat|ex\.?\s*vat|inc\.?\s*vat)?\s*$/i.test(s);

const HEADERS: Record<string, keyof Pick<Material, 'name' | 'unit' | 'price' | 'category'>> = {
  name: 'name', item: 'name', description: 'name', product: 'name', material: 'name', title: 'name',
  unit: 'unit', uom: 'unit', per: 'unit', 'pack size': 'unit', size: 'unit',
  price: 'price', cost: 'price', '£': 'price', 'unit price': 'price', 'trade price': 'price', 'price ex vat': 'price', 'net price': 'price',
  category: 'category', type: 'category', group: 'category', section: 'category',
};

function keywordsFor(name: string): string[] {
  const base = name.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
  const words = base.split(' ').filter((w) => w.length > 2 && !/^\d/.test(w));
  const kws = new Set([base]);
  if (words.length >= 2) kws.add(words.slice(0, 2).join(' '));
  return [...kws];
}

function make(name: string, unit: string, price: number, category: string): Material {
  const n = name.replace(/\s+/g, ' ').trim();
  return { id: customId(n), name: n, unit: unit.trim() || 'each', price, category: category.trim() || 'My materials', keywords: keywordsFor(n), custom: true };
}

export function parseMaterialList(text: string): ImportResult {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim());
  const delim = nonEmpty.some((l) => l.includes('\t')) ? '\t' : nonEmpty.filter((l) => l.includes(',')).length >= nonEmpty.length / 2 ? ',' : nonEmpty.some((l) => l.includes(';')) ? ';' : '';
  const items: Material[] = [];
  const skipped: ImportResult['skipped'] = [];
  let cols: (keyof typeof HEADERS | string)[] | undefined;
  let map: Partial<Record<'name' | 'unit' | 'price' | 'category', number>> | undefined;

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;
    const d = delim || (line.includes('\t') ? '\t' : line.includes(',') ? ',' : line.includes(';') ? ';' : '');
    const cells = d ? splitRow(line, d) : [line];

    // Header row?
    if (!map && cells.some((c) => HEADERS[c.toLowerCase()] === 'name') && !cells.some(isPriceCell)) {
      cols = cells.map((c) => c.toLowerCase());
      map = {};
      cols.forEach((c, i) => {
        const k = HEADERS[c as string];
        if (k && map![k] === undefined) map![k] = i;
      });
      return;
    }

    let name = '';
    let unit = '';
    let price: number | undefined;
    let category = '';
    if (map && map.name !== undefined && map.price !== undefined) {
      name = cells[map.name] ?? '';
      price = parsePrice(cells[map.price] ?? '');
      unit = map.unit !== undefined ? (cells[map.unit] ?? '') : '';
      category = map.category !== undefined ? (cells[map.category] ?? '') : '';
    } else if (cells.length >= 2) {
      // Positional: price is the first price-looking cell after the name
      const pi = cells.findIndex((c, i) => i > 0 && isPriceCell(c));
      if (pi > 0) {
        name = cells[0]!;
        price = parsePrice(cells[pi]!);
        unit = cells.slice(1, pi).join(' ');
        category = cells[pi + 1] ?? '';
      }
    } else {
      // Loose line: "Postcrete 20kg £6.40", "Sharp sand - bulk bag - £55"
      const m = line.match(/^(.*?)[\s\-–:@]*£\s*([\d,]+(?:\.\d{1,2})?)\s*(?:(?:per|\/|a|each)\s*(.+))?$/i) ?? line.match(/^(.*?)[\s\-–:@]+([\d,]+\.\d{2})\s*(?:(?:per|\/)\s*(.+))?$/);
      const pence = line.match(/^(.*?)[\s\-–:@]+(\d{1,2})p$/i);
      if (m) {
        const parts = m[1]!.split(/\s+[-–]\s+/);
        name = parts[0]!;
        unit = m[3] ?? parts[1] ?? '';
        price = parsePrice(m[2]!);
      } else if (pence) {
        name = pence[1]!;
        price = Number(pence[2]) / 100;
      } else {
        name = line; // reported below as having no price
      }
    }
    name = name.replace(/^["']|["']$/g, '').trim();
    if (!name) skipped.push({ line: idx + 1, text: line, reason: 'No item name found' });
    else if (price === undefined) skipped.push({ line: idx + 1, text: line, reason: 'No price found' });
    else items.push(make(name, unit, price, category));
  });

  // Last one wins if the same item appears twice
  const byId = new Map(items.map((m) => [m.id, m]));
  return { items: [...byId.values()], skipped };
}

/** Merges imported items into the user's list, updating prices of items they already have. */
export function mergeMaterials(existing: Material[], incoming: Material[]): { list: Material[]; added: number; updated: number } {
  const map = new Map(existing.map((m) => [m.id, m]));
  let added = 0;
  let updated = 0;
  for (const m of incoming) {
    if (map.has(m.id)) updated++;
    else added++;
    map.set(m.id, { ...map.get(m.id), ...m });
  }
  return { list: [...map.values()], added, updated };
}
