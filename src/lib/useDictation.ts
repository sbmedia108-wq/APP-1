import { useCallback, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

/** Trade vocabulary to bias the recogniser (iOS contextualStrings / Android biasing). */
const TRADE_WORDS = [
  'closeboard', 'featheredge', 'arris rail', 'gravel board', 'postcrete', 'Type 1', 'MOT', 'sharp sand', 'ballast',
  'four by four', 'skim', 'multi-finish', 'bonding', 'plasterboard', 'noggins', 'joists', 'decking', 'Indian sandstone',
  'porcelain', 'membrane', 'EPDM', 'fascia', 'soffit', 'guttering', 'labourer', 'skip', 'muck away', 'wacker plate',
];

export type DictationState = 'idle' | 'listening' | 'unavailable' | 'denied' | 'error';

/**
 * Continuous UK-English dictation. Final segments are committed to `transcript`;
 * `interim` holds the words still being recognised so the UI can show them live.
 */
export function useDictation(initial = '') {
  const [state, setState] = useState<DictationState>('idle');
  const [transcript, setTranscript] = useState(initial);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string>();
  const committed = useRef(initial);
  // The recogniser is a device-wide singleton; only the screen that started it handles its events.
  const owner = useRef(false);

  useSpeechRecognitionEvent('start', () => owner.current && setState('listening'));
  useSpeechRecognitionEvent('end', () => {
    if (!owner.current) return;
    owner.current = false;
    setInterim('');
    setState((s) => (s === 'listening' ? 'idle' : s));
  });
  useSpeechRecognitionEvent('result', (e) => {
    if (!owner.current) return;
    const text = e.results[0]?.transcript ?? '';
    if (e.isFinal) {
      committed.current = `${committed.current} ${text}`.trim();
      setTranscript(committed.current);
      setInterim('');
    } else {
      setInterim(text);
    }
  });
  useSpeechRecognitionEvent('error', (e) => {
    if (!owner.current) return;
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    setError(e.message);
    setState(e.error === 'not-allowed' ? 'denied' : 'error');
  });

  const start = useCallback(async () => {
    setError(undefined);
    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setState('unavailable');
        return;
      }
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setState('denied');
        return;
      }
      owner.current = true;
      ExpoSpeechRecognitionModule.start({
        lang: 'en-GB',
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        contextualStrings: TRADE_WORDS,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('unavailable');
    }
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      setState('idle');
    }
  }, []);

  const setText = useCallback((t: string) => {
    committed.current = t;
    setTranscript(t);
  }, []);

  return { state, transcript, interim, error, start, stop, setText };
}
