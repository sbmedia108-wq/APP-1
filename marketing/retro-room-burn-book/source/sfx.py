import numpy as np, wave
from scipy.signal import butter, lfilter
SR=48000; DUR=14.5; N=int(SR*DUR); L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(3)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); n=min(len(sig),N-i)
    L[i:i+n]+=sig[:n]*g*(1-max(0,pan)); R[i:i+n]+=sig[:n]*g*(1+min(0,pan))
def bp(x,lo,hi):
    b,a=butter(2,[lo/(SR/2),hi/(SR/2)],'band'); return lfilter(b,a,x)
def thud():
    t=np.arange(int(.5*SR))/SR
    body=np.sin(2*np.pi*(55*t+ 60*(1-np.exp(-t*30))/30))*np.exp(-t*9)
    slap=bp(rng.standard_normal(len(t)),300,3500)*np.exp(-t*45)*.9
    return body+slap
def flip(d=.75):
    t=np.arange(int(d*SR))/SR; n=rng.standard_normal(len(t)); u=t/d
    # paper swish: noise through a rising band, with a flutter and a small snap at the end
    out=np.zeros(len(t))
    for k,(lo,hi) in enumerate([(700,2500),(2000,6000),(5000,11000)]):
        c=(k+.5)/3; out+=bp(n,lo,hi)*np.exp(-((u-.25-.4*c)/.22)**2)
    out*=1+.35*np.sin(2*np.pi*38*t)
    snap=bp(rng.standard_normal(len(t)),1500,8000)*np.exp(-np.maximum(t-d*.82,0)*70)*(t>d*.82)*.8
    return out*.9+snap
def chime(notes,gap=.07,d=1.1):
    out=np.zeros(int((d+gap*len(notes))*SR))
    for k,f in enumerate(notes):
        t=np.arange(int(d*SR))/SR
        s=(np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*9)+.2*np.sin(2*np.pi*f*2*t))*np.exp(-t*5.5)
        s[:200]*=np.linspace(0,1,200); i=int(k*gap*SR); out[i:i+len(s)]+=s
    return out
add(flip(.45),.12,g=.35)            # whoosh as the book drops in
add(thud(),.52,g=1.0)
add(chime([1568,2093,2637,3136]),1.0,pan=.2,g=.10)
add(flip(),5.05,pan=-.25,g=.6);  add(chime([2093,2637,3136]),6.15,pan=.2,g=.08)
add(flip(),9.45,pan=-.25,g=.6);  add(chime([2093,2637,3136]),10.55,pan=.2,g=.08)
add(chime([1568,1976,2349,3136,3951],gap=.09,d=1.6),12.4,g=.11)
m=np.stack([L,R],1); m=np.tanh(m*1.1); m/=np.abs(m).max()/.89
f=int(.3*SR); m[-f:]*=np.linspace(1,0,f)[:,None]
w=wave.open('sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((m*32767).astype('<i2').tobytes()); w.close()
