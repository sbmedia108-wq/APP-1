# Makes music.wav: a simple original backing track for the showcase video.
# Plucked arpeggio, soft bass and a light beat. C - G - Am - F at 104 bpm.
# Needs: pip install numpy soundfile.  Run: python3 make_music.py
import numpy as np, soundfile as sf
sr = 48000; bpm = 104; beat = 60 / bpm; bars = 16; n = int(sr * beat * 4 * bars)
out = np.zeros(n)
def note(f, t, dur, amp, decay, harm=(1, .35, .12)):
    m = int(dur * sr); x = np.arange(m) / sr
    w = sum(a * np.sin(2 * np.pi * f * (i + 1) * x) for i, a in enumerate(harm)) * np.exp(-x * decay) * amp
    w[:200] *= np.linspace(0, 1, 200)
    s = int(t * sr); e = min(s + m, n); out[s:e] += w[:e - s]
hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
chords = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]
for b in range(bars):
    ch = chords[b % 4]; t0 = b * 4 * beat
    for i, k in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
        note(hz(ch[k] + 12), t0 + i * beat / 2, .5, .16, 7)
    for i in (0, 2):
        note(hz(ch[0] - 12), t0 + i * beat, beat * 1.8, .22, 2.2, (1, .2))
    for i in range(4):
        m = int(.18 * sr); x = np.arange(m) / sr
        k = np.sin(2 * np.pi * (55 * x + (110 - 55) * (1 - np.exp(-x * 30)) / 30)) * np.exp(-x * 22) * .35
        s = int((t0 + i * beat) * sr); out[s:s + m] += k[:max(0, min(m, n - s))]
        m2 = int(.05 * sr); h = np.random.default_rng(b * 4 + i).standard_normal(m2) * np.exp(-np.arange(m2) / sr * 90) * .04
        s = int((t0 + i * beat + beat / 2) * sr); out[s:s + m2] += h[:max(0, min(m2, n - s))]
f = int(sr * .6); out[:f] *= np.linspace(0, 1, f)
sf.write("music.wav", out / np.abs(out).max() * .8, sr)
