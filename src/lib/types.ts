export type ItemKind = 'labour' | 'material' | 'other';

export interface LineItem {
  id: string;
  kind: ItemKind;
  description: string;
  qty: number;
  unit: string;
  /** Price per unit in GBP, ex-VAT. */
  unitPrice: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'invoiced' | 'paid';

export interface Client {
  name: string;
  phone: string;
  address: string;
}

export interface Quote {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  status: QuoteStatus;
  title: string;
  trade: string;
  client: Client;
  items: LineItem[];
  notes: string;
  assumptions: string[];
  transcript: string;
  estimatedDays: number;
  depositPct: number;
  validDays: number;
  sentAt?: string;
  /** When to nudge the user to chase the client. */
  followUpAt?: string;
  /** Local file URIs of site photos. */
  photos?: string[];
  /** Sample job shipped with the app, not the user's own. */
  example?: boolean;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  trade: string;
  phone: string;
  email: string;
  postcode: string;
  dayRate: number;
  hourlyRate: number;
  markupPct: number;
  vatRegistered: boolean;
  vatNumber: string;
  defaultDepositPct: number;
  paymentTerms: string;
  bankDetails: string;
  quotePrefix: string;
  nextQuoteNumber: number;
  followUpDays: number;
  /** User's own cost prices by catalogue material id (ex-VAT, before markup). */
  priceBook: Record<string, number>;
}

export interface Tool {
  id: string;
  name: string;
  /** Kit ids this tool belongs to. */
  kits: string[];
  /** Name of person it is lent to, if any. */
  lentTo?: string;
  lentAt?: string;
  serial?: string;
  value?: number;
}

export interface Kit {
  id: string;
  name: string;
  icon: string;
}

export interface ToolCheck {
  kitId: string;
  /** Tool ids ticked as loaded. */
  loaded: string[];
  startedAt: string;
}
