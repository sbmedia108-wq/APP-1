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

test('price book overrides catalogue prices before markup', () => {
  const d = parseTranscriptOffline('need 10 bags of postcrete', { priceBook: { postcrete: 6 }, markupPct: 10 });
  assert.equal(d.items.find((i) => /postcrete/i.test(i.description))?.unitPrice, 6.6);
});

test('labour follows the pricing mode', async () => {
  const { applyPricingMode } = await import('../parser.ts');
  const base = parseTranscriptOffline('20 metres of fencing, two days with a labourer', { dayRate: 240 });
  const hour = applyPricingMode(base.items, { pricingMode: 'hour', dayRate: 240, hourlyRate: 30 });
  assert.equal(hour[0]?.unit, 'hour');
  assert.equal(hour[0]?.qty, 16);
  assert.equal(hour[0]?.unitPrice, 30);
  assert.equal(hour[1]?.unitPrice, 18); // labourer at 60%
  const job = applyPricingMode(base.items, { pricingMode: 'job', dayRate: 240 });
  const labour = job.filter((i) => i.kind === 'labour');
  assert.equal(labour.length, 1);
  assert.equal(labour[0]?.unit, 'job');
  assert.equal(labour[0]?.unitPrice, 2 * 240 + 2 * 144);
  assert.equal(job.length, base.items.length - 1);
});

test('imports a CSV with a header row', async () => {
  const { parseMaterialList } = await import('../materialImport.ts');
  const csv = 'Description,Unit,Trade Price,Category\n"Jacksons Jakcured post 100x100 2.4m",each,"£18.95",Fencing\nPostcrete 20kg,bag,6.40,\nBroken row,each,TBC,';
  const r = parseMaterialList(csv);
  assert.equal(r.items.length, 2);
  assert.equal(r.items[0]?.price, 18.95);
  assert.equal(r.items[0]?.category, 'Fencing');
  assert.equal(r.items[1]?.unit, 'bag');
  assert.equal(r.items[1]?.category, 'My materials');
  assert.equal(r.skipped.length, 1);
});

test('imports loose pasted lines from a phone', async () => {
  const { parseMaterialList } = await import('../materialImport.ts');
  const r = parseMaterialList('Postcrete 20kg, bag, 6.40\nSharp sand - bulk bag - £55\nGravel board £12.50\nMarley Eternit slate 85p\nrandom note');
  assert.deepEqual(r.items.map((m) => [m.name, m.unit, m.price]), [
    ['Postcrete 20kg', 'bag', 6.4],
    ['Sharp sand', 'bulk bag', 55],
    ['Gravel board', 'each', 12.5],
    ['Marley Eternit slate', 'each', 0.85],
  ]);
  assert.ok(r.skipped.some((s) => s.text === 'random note'));
});

test('custom materials are found by search and by voice parsing', async () => {
  const { parseMaterialList } = await import('../materialImport.ts');
  const { setCustomMaterials, searchMaterials: search } = await import('../materials.ts');
  const r = parseMaterialList('Name,Unit,Price\nJakcured rail 3.6m,length,9.80');
  setCustomMaterials(r.items);
  assert.equal(search('jakcured rail')[0]?.name, 'Jakcured rail 3.6m');
  const d = parseTranscriptOffline('need 14 jakcured rail', {});
  assert.equal(d.items.find((i) => /jakcured/i.test(i.description))?.qty, 14);
  setCustomMaterials([]);
});

test('receipts: totals, grouping and turning lines into materials', async () => {
  const r = await import('../receipts.ts');
  const base = { id: 'a', createdAt: '2026-11-03T10:00:00Z', branch: '', supplierVatNumber: '', reference: '', paymentMethod: '', notes: '', unreadable: [] };
  const p1 = r.fillTotals({ ...base, date: '2026-11-02', supplier: 'Screwfix', items: [{ id: '1', description: 'Postcrete 20kg', qty: 10, unit: 'bag', unitPrice: 7.68 }], subtotal: 0, vat: 12.8, total: 0, pricesIncludeVat: true });
  assert.equal(p1.total, 76.8);
  assert.equal(p1.subtotal, 64);
  const p2 = { ...p1, id: 'b', date: '2026-10-28', subtotal: 100, vat: 20, total: 120 };
  const months = r.groupByMonth([p2, p1]);
  assert.deepEqual(months.map((m) => m.key), ['2026-11', '2026-10']);
  assert.equal(months[0]!.label, 'November 2026');
  assert.deepEqual(r.summarise([p1, p2]), { count: 2, net: 164, vat: 32.8, total: 196.8 });
  const mats = r.purchaseToMaterials(p1);
  assert.equal(mats[0]!.price, 6.4);
  assert.equal(mats[0]!.category, 'From Screwfix');
});

test('waste removal phrasings', () => {
  for (const t of ['take the old ones away', 'take it all away', 'get rid of the old fence', 'rip out the old fence and dispose of it', 'clear it away after', 'the old panels to the tip']) {
    const d = parseTranscriptOffline(`replace six panels, ${t}, one day`, {});
    assert.ok(d.items.some((i) => /waste/i.test(i.description)), t);
  }
  const none = parseTranscriptOffline('replace six panels, one day', {});
  assert.ok(!none.items.some((i) => /waste/i.test(i.description)));
});

test('number words inside other words are left alone', () => {
  assert.equal(normaliseNumbers('the old ones and the tenant'), 'the old ones and the tenant');
  assert.match(normaliseNumbers('twenty-two panels'), /22 panels/);
});

test('reused / existing items are not added', () => {
  const d = parseTranscriptOffline('Replace six overlap panels, reuse the concrete posts, take the old ones away, about five hours', {});
  assert.ok(!d.items.some((i) => /concrete post/i.test(i.description)));
  assert.ok(d.items.some((i) => /overlap/i.test(i.description)));
  assert.ok(d.items.some((i) => /waste/i.test(i.description)));
});

test('own prices beat remembered prices from old quotes', async () => {
  const { applyRememberedPrices } = await import('../memory.ts');
  const hist = [{ ...mkQuote('Old', ''), items: [{ id: 'x', kind: 'material' as const, description: 'Postcrete 20kg', qty: 1, unit: 'bag', unitPrice: 9 }] }];
  const items = [{ id: 'y', kind: 'material' as const, description: 'Postcrete 20kg', qty: 1, unit: 'bag', unitPrice: 6.6 }];
  assert.equal(applyRememberedPrices(items, hist)[0]!.unitPrice, 9);
  assert.equal(applyRememberedPrices(items, hist, ['Postcrete 20kg'])[0]!.unitPrice, 6.6);
});

test('picks up client details, skips and a lad from speech', async () => {
  const { extractClient } = await import('../parser.ts');
  assert.deepEqual(extractClient('twenty two metres of closeboard, Mrs Jones on 07700 900123'), { name: 'Mrs Jones', phone: '07700 900123', address: '' });
  assert.equal(extractClient("client's Dave Smith, number 07700-900-456").name, 'Dave Smith');
  assert.equal(extractClient('about two days').phone, '');
  const d = parseTranscriptOffline('back bedroom ceiling, board and skim, about 12 square metres, a day, need a skip', {});
  assert.ok(d.items.some((i) => /skip/i.test(i.description)));
  const e = parseTranscriptOffline('decking out the back, 18 square metres, three days, me and the lad', {});
  assert.ok(e.items.some((i) => i.description === 'Labourer'));
  const f = parseTranscriptOffline('six panels, one day, Mrs Jones on 07700 900123', {});
  assert.equal(f.client.phone, '07700 900123');
  assert.ok(!f.items.some((i) => i.qty === 7700 || i.qty === 900123));
});
