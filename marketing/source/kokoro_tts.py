"""Kokoro (Apache-2.0) voiceover generator. usage: python3 kokoro_tts.py voice speed outdir [lines.txt]"""
import sys, soundfile as sf
from kokoro_onnx import Kokoro
K = '/tmp/claude-0/-home-user-APP-1/60ebac03-fad6-5156-a5c9-2f31bd489645/scratchpad/kokoro/'
voice, speed, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
lines = sys.argv[4] if len(sys.argv) > 4 else '/tmp/claude-0/-home-user-APP-1/60ebac03-fad6-5156-a5c9-2f31bd489645/scratchpad/tts/lines.txt'
k = Kokoro(K + 'kokoro-v1.0.onnx', K + 'voices-v1.0.bin')
for line in open(lines):
    if '|' not in line: continue
    i, text = line.strip().split('|', 1)
    text = text.replace('site queue dot U K', 'site queue dot U.K.').replace('twenty twenty seven', '2027')
    audio, sr = k.create(text, voice=voice, speed=speed, lang='en-gb')
    sf.write(f'{out}/l_{i}.wav', audio, sr)
    print(i, round(len(audio) / sr, 2))
