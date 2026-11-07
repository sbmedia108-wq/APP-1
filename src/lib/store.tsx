import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_KITS, DEFAULT_PROFILE, DEFAULT_TOOLS, sampleQuotes } from './seed';
import { uid } from './id';
import type { BusinessProfile, Kit, LineItem, Quote, Tool } from './types';

const KEY = 'graft/state/v1';

interface State {
  profile: BusinessProfile;
  quotes: Quote[];
  tools: Tool[];
  kits: Kit[];
  onboarded: boolean;
}

const initial: State = {
  profile: DEFAULT_PROFILE,
  quotes: sampleQuotes(),
  tools: DEFAULT_TOOLS,
  kits: DEFAULT_KITS,
  onboarded: false,
};

interface Store extends State {
  ready: boolean;
  updateProfile: (p: Partial<BusinessProfile>) => void;
  createQuote: (draft: Partial<Quote> & { items: LineItem[] }) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  duplicateQuote: (id: string) => Quote | undefined;
  upsertTool: (t: Tool) => void;
  deleteTool: (id: string) => void;
  setOnboarded: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...(JSON.parse(raw) as Partial<State>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [state, ready]);

  const updateProfile = useCallback((p: Partial<BusinessProfile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })), []);

  const createQuote = useCallback((draft: Partial<Quote> & { items: LineItem[] }) => {
    const s = stateRef.current;
    const now = new Date().toISOString();
    const n = s.profile.nextQuoteNumber;
    const q: Quote = {
      id: uid(),
      number: `${s.profile.quotePrefix}-${String(n).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      title: 'New job',
      trade: s.profile.trade,
      client: { name: '', phone: '', address: '' },
      notes: '',
      assumptions: [],
      transcript: '',
      estimatedDays: 1,
      depositPct: s.profile.defaultDepositPct,
      validDays: 30,
      ...draft,
    };
    const next = { ...s, quotes: [q, ...s.quotes], profile: { ...s.profile, nextQuoteNumber: n + 1 } };
    stateRef.current = next;
    setState(next);
    return q;
  }, []);

  const updateQuote = useCallback(
    (id: string, patch: Partial<Quote>) =>
      setState((s) => ({ ...s, quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q)) })),
    [],
  );

  const deleteQuote = useCallback((id: string) => setState((s) => ({ ...s, quotes: s.quotes.filter((q) => q.id !== id) })), []);

  const duplicateQuote = useCallback(
    (id: string) => {
      const src = stateRef.current.quotes.find((q) => q.id === id);
      if (!src) return undefined;
      return createQuote({
        title: src.title,
        trade: src.trade,
        notes: src.notes,
        estimatedDays: src.estimatedDays,
        transcript: src.transcript,
        items: src.items.map((i) => ({ ...i, id: uid() })),
      });
    },
    [createQuote],
  );

  const upsertTool = useCallback(
    (t: Tool) => setState((s) => ({ ...s, tools: s.tools.some((x) => x.id === t.id) ? s.tools.map((x) => (x.id === t.id ? t : x)) : [...s.tools, t] })),
    [],
  );
  const deleteTool = useCallback((id: string) => setState((s) => ({ ...s, tools: s.tools.filter((t) => t.id !== id) })), []);
  const setOnboarded = useCallback(() => setState((s) => ({ ...s, onboarded: true })), []);

  const value = useMemo<Store>(
    () => ({ ...state, ready, updateProfile, createQuote, updateQuote, deleteQuote, duplicateQuote, upsertTool, deleteTool, setOnboarded }),
    [state, ready, updateProfile, createQuote, updateQuote, deleteQuote, duplicateQuote, upsertTool, deleteTool, setOnboarded],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
