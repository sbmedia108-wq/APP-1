import sys, json, zipfile, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = __file__.rsplit('/', 1)[0]
def load_voice(name):
    # read the tensor as raw float32, no unpickling
    z = zipfile.ZipFile(f"{HERE}/pack/kokoro-voices/{name}.pt")
    data = [n for n in z.namelist() if n.endswith("data/0")][0]
    return np.frombuffer(z.read(data), dtype=np.float32).reshape(-1, 1, 256)
np.savez(f"{HERE}/voices.npz", bf_emma=load_voice("bf_emma"))
k = Kokoro(f"{HERE}/kokoro.onnx", f"{HERE}/voices.npz")
V = load_voice("bf_emma")
scripts = json.load(open(sys.argv[1])); out = sys.argv[2]
for vid, lines in scripts.items():
    for key, text in lines:
        ph = k.tokenizer.phonemize(text, "en-gb"); tok = k.tokenizer.tokenize(ph)
        for sp in (1.0, 0.97, 1.03, 0.95, 1.06):  # the fp16 model gives NaN for some text/speed pairs
            s = k.sess.run(None, {"input_ids": np.array([[0, *tok, 0]], dtype=np.int64), "style": V[len(tok)], "speed": np.array([sp], dtype=np.float32)})[0].squeeze()
            if not np.isnan(s).any(): break
        else: raise SystemExit(f"NaN audio for {vid} {key}")
        sr = 24000
        nz = np.where(np.abs(s) > 0.012)[0]  # trim the silence at each end
        s = s[max(nz[0] - int(.04 * sr), 0):nz[-1] + int(.08 * sr)]
        sf.write(f"{out}/{vid}__{key}.wav", s, sr)
        print(vid, key, sp, round(len(s)/sr, 2), round(float(np.abs(s).max()), 2), flush=True)
