const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto('file://'+__dirname+'/anim.html');await p.waitForLoadState('networkidle');
const only=process.argv[2]?process.argv[2].split(',').map(Number):null;
const FPS=30,N=Math.round(14.5*FPS);
const list=only?only.map(t=>Math.round(t*FPS)):[...Array(N).keys()];
for(const f of list){await p.evaluate(t=>render(t),f/FPS);
 await p.screenshot({path:`frames/${only?'t':'f'}${String(f).padStart(4,'0')}.png`});}
await b.close()})();
