"""Original procedural pop tracks for the swot. promo videos.

Everything here is synthesised from scratch (no samples, no third-party music),
so the tracks are royalty-free and timed exactly to the video edits.
120 BPM: 1 beat = 0.5s, 1 bar = 2s.
"""
import sys, wave
import numpy as np

SR = 44100
BEAT = 0.5
BAR = 2.0
EIGHTH = BEAT / 2
SIX = BEAT / 4
rng = np.random.default_rng(7)


def mf(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.004, d=0.2, sustain=0.0):
    t = np.arange(n) / SR
    e = np.exp(-t / d) * (1 - sustain) + sustain
    att = np.clip(t / a, 0, 1) if a > 0 else 1
    return e * att


def saw(f, dur, cutoff=4000, detune=0.0):
    t = tt(dur)
    f = f * 2 ** (detune / 1200)
    K = max(1, min(int(cutoff / f), 80))
    ph0 = rng.random() * 2 * np.pi
    out = np.zeros_like(t)
    for k in range(1, K + 1):
        roll = 1.0 / (1 + (k * f / cutoff) ** 4)
        out += np.sin(2 * np.pi * k * f * t + ph0 * k) / k * roll
    return out * 0.6


def square(f, dur, cutoff=6000, vib=0.0):
    t = tt(dur)
    fm = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.15, 0, 1))
    ph = 2 * np.pi * np.cumsum(fm) / SR
    K = max(1, min(int(cutoff / f), 40))
    out = np.zeros_like(t)
    for k in range(1, K + 1, 2):
        roll = 1.0 / (1 + (k * f / cutoff) ** 4)
        out += np.sin(k * ph) / k * roll
    return out * 0.8


def filt_noise(n, lo, hi, seed):
    r = np.random.default_rng(seed)
    x = r.standard_normal(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    mask = 1 / (1 + (lo / np.maximum(fr, 1)) ** 4) * 1 / (1 + (fr / hi) ** 4)
    y = np.fft.irfft(X * mask, n)
    return y / (np.abs(y).max() + 1e-9)


# ---------- one-shot instruments ----------
def kick():
    t = tt(0.4)
    f = 48 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = filt_noise(len(t), 1500, 8000, 1) * np.exp(-t * 400) * 0.35
    return np.tanh((body + click) * 1.6) * 0.95


CLAP_N = filt_noise(int(0.3 * SR), 900, 3500, 2)


def clap():
    n = len(CLAP_N)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for off in (0, 0.011, 0.022):
        tt_ = np.clip(t - off, 0, None)
        e += (t >= off) * np.exp(-tt_ / 0.007) * 0.8
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) / 0.11) * 0.7
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.4
    return CLAP_N * e * 0.9 + body


HAT_N = filt_noise(int(0.25 * SR), 7000, 16000, 3)


def hat(open_=False):
    n = len(HAT_N)
    return HAT_N * env(n, 0.001, 0.12 if open_ else 0.03) * 0.55


CRASH_N = filt_noise(int(2.0 * SR), 3500, 15000, 4)


def crash():
    return CRASH_N * env(len(CRASH_N), 0.002, 0.7) * 0.5


def boom():
    t = tt(1.4)
    f = 40 + 60 * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 0.9


def whoosh(dur=0.5, seed=5):
    n = int(dur * SR)
    x = filt_noise(n, 600, 6000, seed)
    t = np.arange(n) / SR
    e = (t / dur) ** 3
    return x * e * 0.5


def blip(f0=900, f1=1500, dur=0.07):
    t = tt(dur)
    f = f0 + (f1 - f0) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * 0.5


def ding():
    t = tt(0.9)
    s = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((1318.5, 1), (1975.5, 0.6), (2637, 0.25)))
    return s * np.exp(-t / 0.28) * 0.35


def riser(dur):
    t = tt(dur)
    f = 250 * (14 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18
    nz = filt_noise(len(t), 2000, 12000, 6) * 0.35
    return (tone + nz) * (t / dur) ** 2.2


# ---------- mixing ----------
class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.bus = {k: np.zeros((self.n, 2)) for k in ("drums", "music", "fx", "send")}

    def add(self, bus, x, t, g=1.0, pan=0.0, send=0.0):
        i = int(round(t * SR))
        if i >= self.n:
            return
        x = x[: self.n - i]
        l = g * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        r = g * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.bus[bus][i : i + len(x), 0] += x * l
        self.bus[bus][i : i + len(x), 1] += x * r
        if send:
            self.bus["send"][i : i + len(x), 0] += x * l * send
            self.bus["send"][i : i + len(x), 1] += x * r * send


def reverb(x, secs=1.6, decay=0.45):
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = np.random.default_rng(10 + ch).standard_normal(n) * np.exp(-t / decay)
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt((ir ** 2).sum())
        L = len(x) + n
        N = 1 << (L - 1).bit_length()
        y = np.fft.irfft(np.fft.rfft(x[:, ch], N) * np.fft.rfft(ir, N), N)[: len(x)]
        out[:, ch] = y
    return out


def sidechain(n, kicks, depth=0.55, rel=0.11):
    g = np.ones(n)
    t = np.arange(n) / SR
    for k in kicks:
        i = int(k * SR)
        j = min(n, i + int(0.45 * SR))
        g[i:j] = np.minimum(g[i:j], 1 - depth * np.exp(-(t[i:j] - k) / rel))
    return g


def write_wav(path, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------- song builder ----------
def build(cfg):
    dur = cfg["dur"]
    m = Mix(dur)
    chords = cfg["chords"]  # list of (voicing midi list, bass root midi)
    drop, end = cfg["drop"], cfg["end"]
    kicks = []

    def chord_at(t):
        bar = int(np.floor((t - drop) / BAR))
        return chords[bar % len(chords)]

    # --- intro: soft pads + hats + riser + roll ---
    t = 0.0
    while t < drop - 1e-6:
        v, root = chord_at(t)
        for k, note in enumerate(v):
            for d in (-9, 9):
                x = saw(mf(note), BAR, cutoff=1200, detune=d) * env(int(BAR * SR), 0.25, 3.0)
                m.add("music", x, t, 0.06, pan=(-0.5 if d < 0 else 0.5), send=0.5)
        t += BAR
    for s in np.arange(drop - 2 * BAR if drop >= 4 else 0, drop, EIGHTH):
        m.add("drums", hat(), s + EIGHTH / 2 if s + EIGHTH / 2 < drop else s, 0.35, pan=0.3)
    for h in cfg.get("intro_hits", []):
        m.add("drums", kick(), h, 0.9)
        m.add("fx", boom(), h, 0.35)
    m.add("fx", riser(min(2.0, drop)), drop - min(2.0, drop), 0.55, send=0.3)
    roll_start = drop - BAR / 2
    s, i = roll_start, 0
    while s < drop - 1e-6:
        step = SIX if s < drop - BAR / 4 else SIX / 2
        prog = (s - roll_start) / (drop - roll_start)
        m.add("drums", clap(), s, 0.15 + 0.6 * prog, pan=0.0)
        s += step

    # --- drop impact ---
    m.add("fx", crash(), drop, 0.6, pan=0.1, send=0.3)
    m.add("fx", boom(), drop, 0.7)

    # --- groove ---
    t = drop
    while t < end - 1e-6:
        bar_i = int(round((t - drop) / BAR))
        v, root = chord_at(t)
        fill = (end - t) <= BAR + 1e-6 and cfg.get("fill", True)
        for b in range(4):
            bt = t + b * BEAT
            if bt >= end - 1e-6:
                break
            m.add("drums", kick(), bt, 1.0)
            kicks.append(bt)
            if b in (1, 3):
                m.add("drums", clap(), bt, 0.75, send=0.15)
            m.add("drums", hat(open_=(b % 2 == 1)), bt + EIGHTH, 0.5, pan=0.25)
            m.add("drums", hat(), bt + SIX * 3, 0.22, pan=0.3)
            m.add("drums", hat(), bt + SIX, 0.15, pan=0.2)
        # garage-y extra kick
        if bar_i % 2 == 1:
            m.add("drums", kick(), t + 3 * BEAT + EIGHTH + SIX, 0.6)
        # bass: bouncy eighths with octave jumps
        pat = [0, None, 12, 0, None, 0, 12, 10] if bar_i % 2 == 0 else [0, None, 12, 0, 0, None, 12, 7]
        for k, p in enumerate(pat):
            if p is None:
                continue
            x = saw(mf(root + p), 0.24, cutoff=900) * env(int(0.24 * SR), 0.003, 0.11)
            x += np.sin(2 * np.pi * mf(root + p - 12 if p == 0 else root) * tt(0.24)) * env(int(0.24 * SR), 0.003, 0.14) * 0.7
            m.add("music", x, t + k * EIGHTH, 0.42)
        # chord stabs on the offbeats (+ a 16th push)
        stab_times = [1, 3, 5, 7] if bar_i % 2 == 0 else [1, 3, 5, 6.5, 7]
        for st in stab_times:
            for note in v:
                for d, pan in ((-11, -0.6), (0, 0), (11, 0.6)):
                    x = saw(mf(note + 12), 0.2, cutoff=3800, detune=d) * env(int(0.2 * SR), 0.002, 0.075)
                    m.add("music", x, t + st * EIGHTH, 0.07, pan=pan, send=0.35)
        # pad underneath
        for note in v:
            x = saw(mf(note), BAR, cutoff=1600, detune=6) * env(int(BAR * SR), 0.05, 2.5, 0.4)
            m.add("music", x, t, 0.028, pan=-0.3, send=0.6)
            x = saw(mf(note), BAR, cutoff=1600, detune=-6) * env(int(BAR * SR), 0.05, 2.5, 0.4)
            m.add("music", x, t, 0.028, pan=0.3, send=0.6)
        # lead hook
        if t >= cfg.get("lead_from", drop) - 1e-6:
            mel = cfg["melody"][bar_i % len(cfg["melody"])]
            for k, nt in enumerate(mel):
                if nt is None:
                    continue
                ln = 1
                while k + ln < len(mel) and mel[k + ln] is None and ln < 3:
                    ln += 1
                dd = ln * EIGHTH * 0.95
                x = square(mf(nt), dd, cutoff=cfg.get("lead_cut", 5000), vib=0.006) * env(int(dd * SR), 0.004, 0.18 if ln == 1 else 0.35)
                m.add("music", x, t + k * EIGHTH, cfg.get("lead_g", 0.13), pan=0.05, send=0.4)
                # octave sparkle doubling
                x2 = np.sin(2 * np.pi * mf(nt + 12) * tt(dd)) * env(int(dd * SR), 0.002, 0.12)
                m.add("music", x2, t + k * EIGHTH, 0.05, pan=-0.2, send=0.5)
        # arps
        if t >= cfg.get("arp_from", 999) - 1e-6:
            tones = sorted(v) + [v[0] + 12]
            for k in range(16):
                nt = tones[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]] + 24
                x = square(mf(nt), 0.1, cutoff=7000) * env(int(0.1 * SR), 0.001, 0.035)
                m.add("music", x, t + k * SIX, 0.05, pan=(-0.55 if k % 2 else 0.55), send=0.5)
        if fill:
            for k in range(8):
                m.add("drums", clap(), t + BAR / 2 * 1 + k * SIX + BAR / 4 * 0, 0.18 + 0.05 * k, pan=(-0.2 if k % 2 else 0.2))
        t += BAR

    # --- final hit ---
    fv, froot = cfg["final"]
    m.add("fx", crash(), end, 0.75, send=0.4)
    m.add("fx", boom(), end, 0.9)
    m.add("drums", kick(), end, 1.0)
    for note in fv + [fv[0] + 12]:
        for d, pan in ((-12, -0.7), (0, 0), (12, 0.7)):
            x = saw(mf(note + 12), dur - end, cutoff=4000, detune=d) * env(int((dur - end) * SR), 0.003, 0.55)
            m.add("fx", x, end, 0.075, pan=pan, send=0.6)
    x = saw(mf(froot), dur - end, cutoff=700) * env(int((dur - end) * SR), 0.003, 0.5)
    m.add("fx", x, end, 0.4)

    # --- sound design sweeteners ---
    for w in cfg.get("whoosh", []):
        x = whoosh(0.45, seed=int(w * 10))
        m.add("fx", x, w - 0.45, 0.35, pan=0.0, send=0.2)
    for p in cfg.get("taps", []):
        m.add("fx", blip(700, 1200, 0.06), p, 0.35, send=0.2)
    for i_, p in enumerate(cfg.get("pops", [])):
        f0 = 600 * 2 ** (i_ % 6 / 6)
        m.add("fx", blip(f0, f0 * 1.9, 0.09), p, 0.4, pan=(-0.3 if i_ % 2 else 0.3), send=0.3)
    for d_ in cfg.get("dings", []):
        m.add("fx", ding(), d_, 0.7, send=0.5)

    # --- mixdown ---
    sc = sidechain(m.n, kicks)[:, None]
    music = m.bus["music"] * sc
    send = m.bus["send"] * sc
    wet = reverb(send) * 0.55
    mix = m.bus["drums"] * 0.95 + music + m.bus["fx"] + wet
    # gentle fade at very end
    tail = int(0.25 * SR)
    mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    return mix


# Chord voicings (midi) + bass root
Am = ([57, 60, 64], 45)
F = ([57, 60, 65], 41)
C = ([55, 60, 64], 48)
G = ([55, 59, 62], 43)
_ = None

TRACK1 = dict(
    dur=32.0, drop=4.0, end=30.0,
    chords=[Am, F, C, G],
    melody=[
        [76, _, 76, 79, _, 76, 74, 72],
        [69, _, 72, _, 74, 72, 69, _],
        [67, _, 72, 76, _, 79, 76, 74],
        [74, _, 71, _, 74, _, 79, _],
        [76, _, 76, 79, _, 76, 74, 72],
        [69, _, 72, _, 74, 72, 69, _],
        [67, _, 72, 76, _, 79, 76, 74],
        [71, 72, 74, _, 67, _, _, _],
    ],
    arp_from=16.0, lead_from=4.0,
    final=([60, 64, 67], 48),
    intro_hits=[0.0, 1.0, 1.5, 2.5],
    whoosh=[4.0, 8.0, 18.0, 21.0, 26.0, 30.0],
    taps=[9.5, 11.5, 13.8, 14.6],
    dings=[15.0, 19.0],
    pops=[21.5, 22.5, 23.5, 24.5, 25.0],
)

TRACK2 = dict(
    dur=22.0, drop=2.0, end=20.0,
    chords=[C, G, Am, F],
    melody=[
        [76, _, 79, _, 84, _, 79, 76],
        [74, _, 79, _, 83, _, 86, _],
        [84, _, 83, 81, _, 76, _, 81],
        [81, _, 84, _, 77, _, 79, _],
    ],
    arp_from=6.0, lead_from=2.0, lead_cut=7000, lead_g=0.11,
    final=([60, 64, 67], 48),
    intro_hits=[0.25, 0.9],
    whoosh=[2.0, 6.0, 16.0, 20.0],
    pops=[6 + i for i in range(10)] + [16.0, 17.0, 18.0, 19.0],
)

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "audio"
    write_wav(f"{out}/track1.wav", build(TRACK1))
    write_wav(f"{out}/track2.wav", build(TRACK2))
    print("ok")
