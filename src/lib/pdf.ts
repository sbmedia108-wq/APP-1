import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { photoDataUri } from './files';
import { calcTotals, formatGBP } from './money';
import { monthLabel, summarise } from './receipts';
import type { BusinessProfile, Purchase, Quote } from './types';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function quoteHtml(q: Quote, p: BusinessProfile, kind: 'Quote' | 'Invoice' = 'Quote', photos: string[] = []): string {
  const t = calcTotals(q.items, p.vatRegistered, q.depositPct);
  const date = new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const rows = q.items
    .map(
      (i) => `<tr><td>${esc(i.description)}<div class="k">${i.kind}</div></td><td class="r">${i.qty} ${esc(i.unit)}</td><td class="r">${formatGBP(i.unitPrice)}</td><td class="r b">${formatGBP(i.qty * i.unitPrice)}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0B1726;margin:0;padding:40px;font-size:13px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #FFB020;padding-bottom:20px}
  h1{font-size:26px;margin:0 0 4px;letter-spacing:-.5px}.muted{color:#5B6B7F}.tag{background:#0B1726;color:#fff;padding:6px 12px;border-radius:6px;font-weight:700;letter-spacing:1px;font-size:12px}
  .grid{display:flex;gap:40px;margin:24px 0}.grid div{flex:1}.lbl{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#98A2B3;font-weight:700;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-top:8px}th{text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#5B6B7F;border-bottom:1px solid #E4E7EC;padding:8px 0}
  td{padding:10px 0;border-bottom:1px solid #F0F2F5;vertical-align:top}.r{text-align:right}.b{font-weight:700}.k{font-size:10px;color:#98A2B3;text-transform:capitalize}
  .tot{margin-left:auto;width:280px;margin-top:16px}.tot div{display:flex;justify-content:space-between;padding:4px 0}.grand{font-size:20px;font-weight:800;border-top:2px solid #0B1726;margin-top:6px;padding-top:10px!important}
  .ph{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.ph img{width:160px;height:120px;object-fit:cover;border-radius:8px}
  .notes{background:#F4F5F7;border-radius:10px;padding:16px;margin-top:24px;line-height:1.5}.foot{margin-top:28px;font-size:11px;color:#5B6B7F;line-height:1.6}
  </style></head><body>
  <div class="top"><div><h1>${esc(p.businessName || p.ownerName || 'Your Business')}</h1><div class="muted">${esc([p.phone, p.email].filter(Boolean).join(' · '))}</div>${p.vatRegistered && p.vatNumber ? `<div class="muted">VAT ${esc(p.vatNumber)}</div>` : ''}</div><span class="tag">${kind.toUpperCase()}</span></div>
  <div class="grid"><div><div class="lbl">For</div><b>${esc(q.client.name || '—')}</b><div class="muted">${esc(q.client.address)}</div></div>
  <div><div class="lbl">${kind} no.</div><b>${esc(q.number)}</b><div class="lbl" style="margin-top:10px">Date</div>${date}</div>
  <div><div class="lbl">Job</div><b>${esc(q.title)}</b><div class="muted">Approx. ${q.estimatedDays} day${q.estimatedDays === 1 ? '' : 's'} on site</div></div></div>
  <table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="tot"><div><span>Subtotal</span><span>${formatGBP(t.subtotal)}</span></div>${p.vatRegistered ? `<div><span>VAT 20%</span><span>${formatGBP(t.vat)}</span></div>` : ''}
  <div class="grand"><span>Total</span><span>${formatGBP(t.total)}</span></div>${q.depositPct ? `<div class="muted"><span>Deposit (${q.depositPct}%)</span><span>${formatGBP(t.deposit)}</span></div>` : ''}</div>
  ${q.notes ? `<div class="notes">${esc(q.notes)}</div>` : ''}
  ${photos.length ? `<div class="lbl" style="margin-top:24px">Site photos</div><div class="ph">${photos.map((src) => `<img src="${src}">`).join('')}</div>` : ''}
  <div class="foot">${kind === 'Quote' ? `This quote is valid for ${q.validDays} days. ` : ''}${esc(p.paymentTerms)}${p.bankDetails ? `<br><b>Bank:</b> ${esc(p.bankDetails)}` : ''}</div>
  </body></html>`;
}

export async function shareQuotePdf(q: Quote, p: BusinessProfile, kind: 'Quote' | 'Invoice' = 'Quote') {
  const photos = (await Promise.all((q.photos ?? []).slice(0, 8).map(photoDataUri))).filter((x): x is string => Boolean(x));
  const html = quoteHtml(q, p, kind, photos);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${kind} ${q.number}`, UTI: 'com.adobe.pdf' });
}

const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

const RECORD_CSS = `*{box-sizing:border-box}body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0B1726;margin:0;padding:40px;font-size:13px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #FFB020;padding-bottom:20px}
  h1{font-size:24px;margin:0 0 4px}.muted{color:#5B6B7F}.tag{background:#0B1726;color:#fff;padding:6px 12px;border-radius:6px;font-weight:700;letter-spacing:1px;font-size:12px;white-space:nowrap}
  .grid{display:flex;gap:32px;margin:24px 0}.grid div{flex:1}.lbl{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#98A2B3;font-weight:700;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-top:8px}th{text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#5B6B7F;border-bottom:1px solid #E4E7EC;padding:8px 0}
  td{padding:9px 0;border-bottom:1px solid #F0F2F5;vertical-align:top}.r{text-align:right}.b{font-weight:700}
  .tot{margin-left:auto;width:280px;margin-top:16px}.tot div{display:flex;justify-content:space-between;padding:4px 0}.grand{font-size:18px;font-weight:800;border-top:2px solid #0B1726;margin-top:6px;padding-top:10px!important}
  .foot{margin-top:28px;font-size:11px;color:#5B6B7F;line-height:1.6}.page{page-break-before:always;padding-top:8px}
  .orig{display:block;max-width:100%;max-height:900px;margin:12px auto 0;border:1px solid #E4E7EC;border-radius:6px}`;

function bizHeader(p: BusinessProfile, tag: string) {
  return `<div class="top"><div><h1>${esc(p.businessName || p.ownerName || 'Your Business')}</h1><div class="muted">${esc([p.ownerName && p.businessName ? p.ownerName : '', p.phone, p.email].filter(Boolean).join(' · '))}</div>${p.vatRegistered && p.vatNumber ? `<div class="muted">VAT ${esc(p.vatNumber)}</div>` : ''}</div><span class="tag">${tag}</span></div>`;
}

/** A clean purchase record for the user's own books, with the original receipt attached. */
export function purchaseHtml(x: Purchase, p: BusinessProfile, job?: Quote, photo?: string): string {
  const rows = x.items
    .map((i) => `<tr><td>${esc(i.description)}</td><td class="r">${i.qty} ${esc(i.unit)}</td><td class="r">${formatGBP(i.unitPrice)}</td><td class="r b">${formatGBP(i.qty * i.unitPrice)}</td></tr>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${RECORD_CSS}</style></head><body>
  ${bizHeader(p, 'PURCHASE RECORD')}
  <div class="grid"><div><div class="lbl">Supplier</div><b>${esc(x.supplier || '—')}</b><div class="muted">${esc(x.branch)}</div>${x.supplierVatNumber ? `<div class="muted">VAT ${esc(x.supplierVatNumber)}</div>` : ''}</div>
  <div><div class="lbl">Date</div><b>${fmtDate(x.date)}</b><div class="lbl" style="margin-top:10px">Receipt / invoice no.</div>${esc(x.reference || '—')}</div>
  <div><div class="lbl">Job</div><b>${esc(job ? job.title : 'General stock')}</b>${job ? `<div class="muted">${esc([job.number, job.client.name].filter(Boolean).join(' · '))}</div>` : ''}${x.paymentMethod ? `<div class="lbl" style="margin-top:10px">Paid by</div>${esc(x.paymentMethod)}` : ''}</div></div>
  <table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Unit price${x.pricesIncludeVat ? ' (inc VAT)' : ''}</th><th class="r">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="muted">No line items recorded</td></tr>'}</tbody></table>
  <div class="tot"><div><span>Net</span><span>${formatGBP(x.subtotal)}</span></div><div><span>VAT</span><span>${formatGBP(x.vat)}</span></div><div class="grand"><span>Total paid</span><span>${formatGBP(x.total)}</span></div></div>
  ${x.notes ? `<div class="foot"><b>Notes:</b> ${esc(x.notes)}</div>` : ''}
  <div class="foot">Purchase record prepared by ${esc(p.businessName || p.ownerName || 'the business')} from the supplier’s original ${photo ? 'receipt, attached on the next page' : 'receipt'}. This is an internal record, not a supplier invoice.</div>
  ${photo ? `<div class="page"><div class="lbl">Original receipt</div><img class="orig" src="${photo}"></div>` : ''}
  </body></html>`;
}

/** Month summary for the accountant / tax return, with every original receipt attached. */
export function monthHtml(monthKey: string, list: Purchase[], p: BusinessProfile, jobs: Record<string, Quote>, photos: Record<string, string>): string {
  const sum = summarise(list);
  const sorted = [...list].sort((a, b) => (a.date || a.createdAt).localeCompare(b.date || b.createdAt));
  const rows = sorted
    .map((x) => `<tr><td>${x.date ? new Date(x.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</td><td>${esc(x.supplier || '—')}<div class="muted">${esc(x.reference)}</div></td><td>${esc(x.quoteId && jobs[x.quoteId] ? jobs[x.quoteId]!.title : 'General')}</td><td class="r">${formatGBP(x.subtotal)}</td><td class="r">${formatGBP(x.vat)}</td><td class="r b">${formatGBP(x.total)}</td></tr>`)
    .join('');
  const pages = sorted
    .filter((x) => photos[x.id])
    .map((x) => `<div class="page"><div class="lbl">${esc(x.supplier || 'Receipt')} · ${fmtDate(x.date)} · ${formatGBP(x.total)}</div><img class="orig" src="${photos[x.id]}"></div>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${RECORD_CSS}</style></head><body>
  ${bizHeader(p, 'PURCHASES')}
  <div class="grid"><div><div class="lbl">Period</div><b>${monthLabel(monthKey)}</b></div><div><div class="lbl">Receipts</div><b>${sum.count}</b></div><div><div class="lbl">Total spent</div><b>${formatGBP(sum.total)}</b></div></div>
  <table><thead><tr><th>Date</th><th>Supplier</th><th>Job</th><th class="r">Net</th><th class="r">VAT</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="tot"><div><span>Net</span><span>${formatGBP(sum.net)}</span></div><div><span>VAT</span><span>${formatGBP(sum.vat)}</span></div><div class="grand"><span>Total</span><span>${formatGBP(sum.total)}</span></div></div>
  <div class="foot">Prepared from original supplier receipts, attached on the following pages.</div>
  ${pages}
  </body></html>`;
}

async function shareHtml(html: string, title: string) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title, UTI: 'com.adobe.pdf' });
}

export async function sharePurchasePdf(x: Purchase, p: BusinessProfile, job?: Quote) {
  const photo = x.photo ? await photoDataUri(x.photo) : undefined;
  await shareHtml(purchaseHtml(x, p, job, photo), `Purchase record ${x.supplier} ${x.date}`);
}

export async function shareMonthPdf(monthKey: string, list: Purchase[], p: BusinessProfile, quotes: Quote[]) {
  const photos: Record<string, string> = {};
  for (const x of list) if (x.photo) {
    const d = await photoDataUri(x.photo);
    if (d) photos[x.id] = d;
  }
  await shareHtml(monthHtml(monthKey, list, p, Object.fromEntries(quotes.map((q) => [q.id, q])), photos), `Purchases ${monthLabel(monthKey)}`);
}
