/**
 * Graft brand system.
 *
 * Ink navy carries authority and reads like a premium trade van livery.
 * Hi-vis amber is the single action colour — the colour of site safety,
 * instantly recognisable to the trade, used only for the thing to tap next.
 * WhatsApp green appears only on the send button so it's unmistakable.
 */
export const colors = {
  ink: '#0B1726',
  ink2: '#14253A',
  ink3: '#1E3550',
  amber: '#FFB020',
  amberDeep: '#E89600',
  amberSoft: '#FFF4DC',
  bg: '#F4F5F7',
  card: '#FFFFFF',
  line: '#E4E7EC',
  text: '#0B1726',
  muted: '#5B6B7F',
  faint: '#98A2B3',
  green: '#16A34A',
  greenSoft: '#E7F7EE',
  red: '#DC2626',
  redSoft: '#FDECEC',
  blue: '#2563EB',
  blueSoft: '#E8EFFE',
  whatsapp: '#25D366',
  white: '#FFFFFF',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const space = (n: number) => n * 4;

export const type = {
  hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.1, textTransform: 'uppercase' as const },
  money: { fontVariant: ['tabular-nums' as const] },
};

export const shadow = {
  shadowColor: '#0B1726',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

export const STATUS_META = {
  draft: { label: 'Draft', fg: colors.muted, bg: '#EEF0F3' },
  sent: { label: 'Sent', fg: colors.blue, bg: colors.blueSoft },
  accepted: { label: 'Won', fg: colors.green, bg: colors.greenSoft },
  declined: { label: 'Lost', fg: colors.red, bg: colors.redSoft },
  invoiced: { label: 'Invoiced', fg: colors.amberDeep, bg: colors.amberSoft },
  paid: { label: 'Paid', fg: colors.green, bg: colors.greenSoft },
} as const;
