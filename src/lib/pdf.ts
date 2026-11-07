import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { calcTotals, formatGBP } from './money';
import type { BusinessProfile, Quote } from './types';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function quoteHtml(q: Quote, p: BusinessProfile, kind: 'Quote' | 'Invoice' = 'Quote'): string {
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
  <div class="foot">${kind === 'Quote' ? `This quote is valid for ${q.validDays} days. ` : ''}${esc(p.paymentTerms)}${p.bankDetails ? `<br><b>Bank:</b> ${esc(p.bankDetails)}` : ''}</div>
  </body></html>`;
}

export async function shareQuotePdf(q: Quote, p: BusinessProfile, kind: 'Quote' | 'Invoice' = 'Quote') {
  const html = quoteHtml(q, p, kind);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${kind} ${q.number}`, UTI: 'com.adobe.pdf' });
}
