"""ElevenLabs voiceover generator (key injected by the network proxy; never stored here).
usage: python3 eleven_tts.py VOICE_ID outdir [lines.txt]"""
import sys, json, subprocess
voice, out = sys.argv[1], sys.argv[2]
lines_path = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-APP-1/60ebac03-fad6-5156-a5c9-2f31bd489645/scratchpad/tts/lines.txt'
rows = [l.strip().split('|', 1) for l in open(lines_path) if '|' in l]
fix = lambda t: t.replace('twenty twenty seven', '2027').replace('site queue dot U K', 'sitequeue dot U.K.')
for n, (i, text) in enumerate(rows):
    body = {"text": fix(text), "model_id": "eleven_multilingual_v2",
            "previous_text": fix(rows[n - 1][1]) if n else None,
            "next_text": fix(rows[n + 1][1]) if n + 1 < len(rows) else None,
            "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True}}
    mp3 = f'{out}/l_{i}.mp3'
    code = subprocess.run(['curl', '-sS', '-m', '90', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128',
                           '-H', 'Content-Type: application/json', '-d', json.dumps(body), '-o', mp3, '-w', '%{http_code}'], capture_output=True, text=True).stdout
    if code != '200': sys.exit(f'{i} failed {code}: {open(mp3).read()[:300]}')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', f'{out}/l_{i}.wav'], check=True)
    dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{out}/l_{i}.wav'], capture_output=True, text=True).stdout.strip()
    print(i, dur)
