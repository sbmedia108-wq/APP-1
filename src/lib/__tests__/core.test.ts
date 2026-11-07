/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcTotals, lineTotal } from '../money.ts';
import { normaliseNumbers, parseTranscriptOffline } from '../parser.ts';
import { findSimilarJobs, rememberedPrice } from '../memory.ts';
import { toWhatsAppNumber, quoteMessage, whatsAppUrl } from '../whatsapp.ts';
import { CALCULATORS } from '../calculators.ts';
import { searchMaterials, matchMaterial, lookupPrices, MATERIAL_BY_ID } from '../materials.ts';
import type { Quote, BusinessProfile } from '../types.ts';

const item = (kind: 'labour' | 'material', qty: number, unitPrice: number, description = 'x') => ({ id: description, kind, description, qty, unit: 'each', unitPrice });

test('totals with VAT and deposit', () => {
  const t = calcTotals([item('labour', 2, 220), item('material', 10, 14.5)], true, 25);
  assert.equal(t.labour, 440);
  assert.equal(t.materials, 145);
  assert.equal(t.subtotal, 585);
  assert.equal(t.vat, 117);
  assert.equal(t.total, 702);
  assert.equal(t.deposit, 175.5);
  assert.equal(calcTotals([item('labour', 1, 100)], false).total, 100);
  assert.equal(lineTotal({ qty: 3, unitPrice: 0.1 }), 0.3);
});

test('spoken numbers are normalised', () => {
  assert.match(normaliseNumbers('twenty two metres'), /22 m/);
  assert.match(normaliseNumbers('two and a half days'), /2\.5 days/);
  assert.match(normaliseNumbers('four by four eight foot posts'), /4x4 8 ft posts/);
  assert.match(normaliseNumbers('one hundred and fifty'), /150/);
});

test('offline parser builds a fencing quote from speech', () => {
  const d = parseTranscriptOffline('Twenty metres of fencing, concrete posts and gravel boards, take the old one to the tip, two days with a labourer', { dayRate: 250 });
  assert.equal(d.trade, 'Fencing');
  assert.match(d.title, /20m/);
  const panels = d.items.find((i) => /panel/i.test(i.description));
  assert.equal(panels?.qty, 11);
  const posts = d.items.find((i) => /concrete post/i.test(i.description));
  assert.equal(posts?.qty, 12);
  assert.equal(d.items[0]?.description, 'Labour');
  assert.equal(d.items[0]?.qty, 2);
  assert.equal(d.items[0]?.unitPrice, 250);
  assert.ok(d.items.some((i) => i.description === 'Labourer'));
  assert.ok(d.items.some((i) => /waste/i.test(i.description)));
});

test('offline parser picks explicit quantities', () => {
  const d = parseTranscriptOffline('need twelve four by four eight foot posts and 24 bags of postcrete, 6 hours', {});
  const posts = d.items.find((i) => i.description.includes('2.4m'));
  assert.equal(posts?.qty, 12);
  assert.equal(d.items.find((i) => /postcrete/i.test(i.description))?.qty, 24);
  assert.equal(d.items[0]?.unit, 'hour');
});

const mkQuote = (title: string, transcript: string, updatedAt = '2026-01-01'): Quote => ({
  id: title, number: 'Q1', createdAt: updatedAt, updatedAt, status: 'accepted', title, trade: '', transcript,
  client: { name: 'Sue', phone: '', address: '' }, items: [item('labour', 2, 240, 'Labour')], notes: '', assumptions: [],
  estimatedDays: 2, depositPct: 0, validDays: 30,
});

test('memory finds similar past jobs', () => {
  const hist = [mkQuote('Closeboard fence 20m', 'replace closeboard fence with concrete posts'), mkQuote('Bathroom tiling', 'tile walls and floor'), mkQuote('Patio 30m²', 'indian sandstone patio')];
  const r = findSimilarJobs('new closeboard fencing down the side with concrete posts', hist, false);
  assert.equal(r[0]?.quote.title, 'Closeboard fence 20m');
  assert.equal(r.length, 1);
  assert.equal(rememberedPrice('labour', hist), 240);
});

test('whatsapp formatting', () => {
  assert.equal(toWhatsAppNumber('07700 900123'), '447700900123');
  assert.equal(toWhatsAppNumber('+44 (0)7700 900123'), '447700900123');
  const p = { businessName: 'Hart Fencing', ownerName: 'Dan Hart', vatRegistered: false } as BusinessProfile;
  const msg = quoteMessage({ ...mkQuote('Fence', ''), client: { name: 'Sue Smith', phone: '07700900123', address: '' } }, p);
  assert.match(msg, /^Hi Sue,/);
  assert.match(msg, /\*Total: £480\.00\*/);
  assert.match(whatsAppUrl('07700900123', 'hi there'), /^https:\/\/wa\.me\/447700900123\?text=hi%20there$/);
});

test('calculators and materials', () => {
  const fence = CALCULATORS.find((c) => c.id === 'fence')!.run({ length: 18, gravelBoards: 0 });
  assert.deepEqual(fence.map((l) => l.qty), [10, 11, 22]);
  for (const c of CALCULATORS) for (const l of c.run(Object.fromEntries(c.fields.map((f) => [f.key, f.default])))) assert.ok(MATERIAL_BY_ID[l.materialId], l.materialId);
  assert.equal(searchMaterials('4x4 8 foot post')[0]?.id, 'post-4x4-8');
  assert.equal(matchMaterial('20 bags of postcrete')?.id, 'postcrete');
});

test('price lookup sorts cheapest first', async () => {
  const r = await lookupPrices(MATERIAL_BY_ID['post-4x4-8']!, 10, 'BS1 4DJ');
  assert.ok(r.length >= 5);
  for (let i = 1; i < r.length; i++) assert.ok(r[i]!.price >= r[i - 1]!.price);
  assert.equal(r[0]!.total, Math.round(r[0]!.price * 10 * 100) / 100);
});

test('closeboard with concrete posts does not add stray single items', () => {
  const d = parseTranscriptOffline('Twenty metres of closeboard fencing down the side with concrete posts and gravel boards, old fence to the tip, two and a half days with a labourer', {});
  assert.equal(d.items.filter((i) => /Assumed 1/.test(i.description)).length, 0);
  assert.ok(!d.items.some((i) => /closeboard fence panel/i.test(i.description)));
  assert.equal(d.items.find((i) => /concrete post/i.test(i.description))?.qty, 9);
  assert.ok(!d.assumptions.some((a) => a.startsWith('Assumed 1')));
});
