"""Original royalty-free background track for the Site Queue video, synthesised from scratch.
usage: python3 music.py out.wav total t_s2 t_s3 t_feat t_s5 t_s6"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
out, total, t2, t3, tf, t5, t6 = sys.argv[1], *map(float, sys.argv[2:8])
N = int(SR * total)
L = np.zeros(N); R = np.zeros(N)
BPM = 96; BEAT = 60 / BPM; BAR = BEAT * 4
rng = np.random.default_rng(7)

def note(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)
def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan))
def env(n, a, r):
    e = np.ones(n); ai = max(1, int(a * SR)); ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e
def saw(f, d):
    t = np.arange(int(d * SR)) / SR; return 2 * ((t * f) % 1) - 1

# A minor, F, C, G (i-VI-III-VII), voiced around middle C
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]

def bar_at(t): return int(t // BAR) % 4

# Pad: detuned saws through a low-pass, swelling each bar
t = 0.0
while t < total:
    c = CHORDS[bar_at(t)]; d = BAR + 0.4
    s = sum(saw(note(m) * dt, d) for m in c for dt in (0.997, 1.003)) / (len(c) * 2)
    cutoff = 700 if t < t3 else 1300
    s = lp(s, cutoff) * env(len(s), 0.6, 0.6)
    add(s, t, 0.16 if t < t2 else 0.13, pan=-0.15)
    add(s, t, 0.16 if t < t2 else 0.13, pan=0.15)
    t += BAR

# Riser into "Site Queue replaces all of it"
d = 2.0; n = rng.standard_normal(int(d * SR)); n = hp(n, 2000) * np.linspace(0, 1, len(n)) ** 2
add(n, t2 - d, 0.10)
def impact(t, g=0.5):
    d = 1.6; tt = np.arange(int(d * SR)) / SR
    k = np.sin(2 * np.pi * (35 + 80 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 3)
    nz = lp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 6) * 0.3
    add(k + nz, t, g)
impact(t2); impact(t6, 0.55)

# Drums
def kick():
    d = 0.35; tt = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (45 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
def hat():
    d = 0.06; x = hp(rng.standard_normal(int(d * SR)), 7000); return x * np.exp(-np.arange(len(x)) / SR * 70)
def clap():
    d = 0.2; x = lp(hp(rng.standard_normal(int(d * SR)), 900), 5000); return x * np.exp(-np.arange(len(x)) / SR * 22)
K, Hh, C = kick(), hat(), clap()
b = 0; t = 0.0
while t < t6:
    if t >= t3: add(K, t, 0.55)
    if t >= tf:
        add(Hh, t + BEAT / 2, 0.10, pan=0.3)
        if b % 2 == 1: add(C, t, 0.10, pan=-0.1)
    b += 1; t += BEAT

# Bass: root eighths with a soft saturated sine
t = t3 - (t3 % (BEAT / 2))
while t < t6:
    r = ROOTS[bar_at(t)]; d = BEAT / 2 * 0.9; tt = np.arange(int(d * SR)) / SR
    s = np.tanh(2.2 * np.sin(2 * np.pi * note(r) * tt)) * env(len(tt), 0.005, 0.05)
    add(lp(s, 900), t, 0.20); t += BEAT / 2

# Pluck arpeggio over the feature section
t = tf; i = 0
while t < t5 + BAR:
    c = CHORDS[bar_at(t)]; m = c[i % len(c)] + 12 + (12 if (i // len(c)) % 2 else 0)
    d = 0.4; tt = np.arange(int(d * SR)) / SR
    s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 9)
    add(s, t, 0.075, pan=0.35 if i % 2 else -0.35); t += BEAT / 2; i += 1

# Final chord rings out on the end card
c = CHORDS[0]; d = total - t6
s = sum(saw(note(m) * dt, d) for m in c + [69] for dt in (0.997, 1.003)) / 8
add(lp(s, 1500) * env(len(s), 0.05, d * 0.7), t6, 0.16)

mix = np.stack([L, R], 1)
fade = np.ones(N); fi = int(1.0 * SR); fo = int(2.0 * SR); fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('music', out, round(total, 2), 's')
