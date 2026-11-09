// Same shape the server returns (see server/src/server.ts).
export type Step = {
  instruction: string;
  lookFor: string;
};

export type Guide = {
  understood: boolean;
  title: string;
  reassurance: string;
  device: string;
  clarifyingQuestion: string;
  steps: Step[];
  safetyWarning: string;
  whenToGetHelp: string;
  /** If the problem was too vague: short options to tap, e.g. "No sound". */
  choices?: string[];
};

export type Settings = {
  helperName: string;
  helperPhone: string;
  textScale: 1 | 1.2 | 1.4;
  readAloud: boolean;
  speechSpeed: "normal" | "slow";
};

export const DEFAULT_SETTINGS: Settings = {
  helperName: "",
  helperPhone: "",
  textScale: 1.2,
  readAloud: true,
  speechSpeed: "normal",
};
