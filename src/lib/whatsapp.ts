import { calcTotals, formatGBP } from './money.ts';
import type { BusinessProfile, Quote } from './types.ts';

/** UK mobile/landline to WhatsApp international format: "07700 900123" -> "447700900123". */
export function toWhatsAppNumber(phone: string): string {
  let d = phone.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = `44${d.slice(1)}`;
  if (d.startsWith('440')) d = `44${d.slice(3)}`; // "+44 (0)7700…"
  return d;
}

export function quoteMessage(q: Quote, p: BusinessProfile): string {
  const t = calcTotals(q.items, p.vatRegistered, q.depositPct);
  const first = q.client.name.trim().split(/\s+/)[0];
  const lines: string[] = [];
  lines.push(first ? `Hi ${first},` : 'Hi,');
  lines.push('');
  lines.push(`Thanks for having me round. Here's your quote for the *${q.title.toLowerCase()}*:`);
  lines.push('');
  for (const i of q.items) {
    const qty = i.qty === 1 && ['job', 'item'].includes(i.unit) ? '' : `${i.qty} ${i.unit}${i.qty === 1 ? '' : 's'} · `;
    lines.push(`• ${i.description} — ${qty}${formatGBP(i.qty * i.unitPrice)}`);
  }
  lines.push('');
  if (p.vatRegistered) {
    lines.push(`Subtotal: ${formatGBP(t.subtotal)}`);
    lines.push(`VAT (20%): ${formatGBP(t.vat)}`);
  }
  lines.push(`*Total: ${formatGBP(t.total)}*${p.vatRegistered ? '' : ' (no VAT)'}`);
  if (q.depositPct > 0) lines.push(`Deposit to book in: ${formatGBP(t.deposit)} (${q.depositPct}%)`);
  if (q.estimatedDays) lines.push(`Time on site: about ${q.estimatedDays} day${q.estimatedDays === 1 ? '' : 's'}`);
  if (q.notes.trim()) {
    lines.push('');
    lines.push(q.notes.trim());
  }
  lines.push('');
  lines.push(`Quote ${q.number} · valid for ${q.validDays} days.`);
  lines.push('Just reply here to book in. Any questions, give me a shout.');
  lines.push('');
  lines.push(p.ownerName || p.businessName);
  if (p.businessName && p.ownerName) lines.push(p.businessName);
  return lines.join('\n');
}

export function chaseMessage(q: Quote, p: BusinessProfile): string {
  const first = q.client.name.trim().split(/\s+/)[0];
  return `${first ? `Hi ${first}` : 'Hi'}, just checking you got the quote for the ${q.title.toLowerCase()} (${q.number})? Happy to answer any questions — I've got some availability coming up if you'd like to get booked in.\n\n${p.ownerName || p.businessName}`;
}

/** https link works on iOS, Android and web; opens the chat with text pre-filled. */
export function whatsAppUrl(phone: string, text: string): string {
  const n = toWhatsAppNumber(phone);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
