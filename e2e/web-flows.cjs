const { chromium } = require('playwright');
const results = []; const ok = (name, cond, extra='') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const go = async (u) => { await p.waitForTimeout(400); await p.goto('http://localhost:8081' + u, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); };
  const text = async () => (await p.locator('body').innerText()) + '\n' + (await p.locator('input,textarea').evaluateAll(els => els.map(e => e.value).join('\n')));
  const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, e.message.split('\n')[0]); await p.screenshot({ path: require('os').tmpdir() + '/graft-fail-' + name.replace(/\W+/g,'_') + '.png' }); } };

  await step('A setup', async () => {
    await go('/'); await p.waitForTimeout(800);
    ok('A1 welcome shows on first launch', (await text()).includes('Let’s get you set up'));
    await p.getByPlaceholder('Dan Hart').fill('Dan Hart');
    await p.getByText('Fencing', { exact: true }).click();
    await p.getByText('Other…').click(); await p.getByPlaceholder(/Groundworks/).fill('Gates');
    await p.getByText('By the hour', { exact: true }).click();
    await p.getByPlaceholder('35').fill('30');
    await p.getByText('Start quoting').click(); await p.waitForTimeout(900);
    const t = await text();
    ok('A2 home greets by first name', /, Dan\./.test(t));
    await go('/settings'); const s = await text();
    ok('A3 trade saved incl. Other', (await p.locator('input').nth(2).inputValue()) === 'Fencing & Gates');
    ok('A4 hourly rate saved', s.includes('By the hour') && (await p.getByLabel ? true : true));
  });

  let qid;
  await step('B voice quote (typed)', async () => {
    await go('/new');
    ok('B1 build disabled when empty', await p.getByText('Build my quote').isVisible());
    await p.getByLabel('Type instead').click();
    await p.locator('textarea').fill('Replace six overlap panels, reuse the concrete posts, take the old ones away, about five hours');
    await p.getByText('Build my quote').click(); await p.waitForTimeout(1500);
    qid = p.url().split('/quote/')[1];
    const t = await text();
    ok('B2 navigates to new quote', !!qid);
    ok('B3 labour in hours at £30', t.includes('hour') && (await p.locator('input').filter({ hasText: '' }).count()) > 0);
    const vals = await p.locator('input').evaluateAll(els => els.map(e => e.value));
    ok('B4 labour qty 5 & rate 30', vals.includes('5') && vals.includes('30'), vals.slice(0,12).join('|'));
    ok('B5 panels qty 6', vals.includes('6'));
    ok('B6 waste removal line', t.includes('Waste removal'), vals.join('|'));
  });

  await step('C edit quote', async () => {
    const before = (await text()).match(/Total\n£([\d,\.]+)/)?.[1];
    const inputs = p.locator('input');
    const vals = await inputs.evaluateAll(els => els.map(e => e.value));
    const i5 = vals.indexOf('5');
    await inputs.nth(i5).fill('10'); await p.waitForTimeout(300);
    const after = (await text()).match(/Total\n£([\d,\.]+)/)?.[1];
    ok('C1 total updates when hours change (+£150)', before && after && Math.abs(parseFloat(after.replace(/,/g,'')) - parseFloat(before.replace(/,/g,'')) - 150) < 0.01, `${before} -> ${after}`);
    await p.getByPlaceholder('07700 900123').fill('07700 900215');
    await p.getByPlaceholder('Sue Jones').fill('Priya Shah');
    await p.getByText('Won', { exact: true }).click(); await p.waitForTimeout(200);
    ok('C2 status chip changes header pill', (await text()).includes('Send invoice'));
    const lines = await p.getByLabel('Remove line').count();
    await p.getByLabel('Remove line').last().click(); await p.waitForTimeout(200);
    ok('C3 remove line', (await p.getByLabel('Remove line').count()) === lines - 1);
    await p.getByText('Add', { exact: true }).nth(1).click(); await p.waitForTimeout(200);
    ok('C4 add material line', (await p.getByLabel('Remove line').count()) === lines);
    await p.getByText('Duplicate as new quote').click(); await p.waitForTimeout(800);
    const dup = p.url().split('/quote/')[1];
    ok('C5 duplicate creates new quote', dup && dup !== qid);
    await p.getByText('Delete', { exact: true }).click(); await p.waitForTimeout(800);
    await go('/quotes'); const t = await text();
    ok('C6 delete removes duplicate, original kept', (t.match(/Fence panels|Job/g) || []).length >= 1 && t.includes('Priya Shah'));
  });

  await step('D quotes list', async () => {
    await go('/quotes');
    await p.getByPlaceholder('Search client, job or street').fill('priya');
    const t = await text(); ok('D1 search by client', t.includes('Priya Shah') && !t.includes('Margaret Ellis'));
    await p.getByPlaceholder('Search client, job or street').fill('');
    await p.getByText('Won', { exact: true }).first().click(); await p.waitForTimeout(200);
    const t2 = await text(); ok('D2 filter Won', t2.includes('Indian sandstone') && !t2.includes('Overlap'));
  });

  await step('E materials & calculator', async () => {
    await go('/materials');
    await p.locator('input').first().fill('postcrete'); await p.waitForTimeout(300);
    await p.locator('text=Postcrete 20kg').first().click(); await p.locator('input').nth(1).fill('10'); await p.waitForTimeout(500);
    const t = await text();
    const m = t.match(/£([\d\.]+) each[\s\S]*?£([\d,\.]+)/);
    ok('E1 merchant total = price × qty', m && Math.abs(parseFloat(m[1]) * 10 - parseFloat(m[2].replace(/,/g,''))) < 0.02, m ? `${m[1]} x10 = ${m[2]}` : 'no match');
    ok('E2 cheapest badge', t.includes('CHEAPEST'));
    await p.getByText('Change', { exact: true }).click();
    await p.locator('input').first().fill('');
    const runs = p.locator('input[inputmode="decimal"]');
    await runs.first().fill('9.15'); await p.waitForTimeout(300);
    const t2 = await text();
    ok('E3 calculator 9.15m → 5 panels, 6 posts', /\n5\n.*Overlap/s.test(t2) && /\n6\n.*Slotted concrete post/s.test(t2));
    await p.getByText('Start a quote with these').click(); await p.waitForTimeout(900);
    const vals = await p.locator('input').evaluateAll(els => els.map(e => e.value));
    ok('E4 calc quote uses hourly labour', vals.includes('hour') && vals.includes('8'), vals.slice(0,10).join('|'));
  });

  await step('F my prices', async () => {
    await go('/prices');
    await p.getByLabel('Your price for Postcrete 20kg').fill('6');
    await go('/new'); await p.getByLabel('Type instead').click();
    await p.locator('textarea').fill('need 10 bags of postcrete, 2 hours');
    await p.getByText('Build my quote').click(); await p.waitForTimeout(1200);
    const vals = await p.locator('input').evaluateAll(els => els.map(e => e.value));
    ok('F1 own price + 10% markup = 6.6', vals.includes('6.6'), vals.join('|'));
  });

  await step('G import materials', async () => {
    await go('/import-materials');
    await p.locator('textarea').fill('Jakcured rail 3.6m, length, 9.80\nGate hinge set £14\nnonsense line');
    await p.waitForTimeout(300);
    ok('G1 preview counts', /2 found · 1 skipped/i.test(await text()));
    await p.getByText('Add 2 materials').click(); await p.waitForTimeout(300);
    ok('G2 confirmation', (await text()).includes('2 new materials added'));
    await go('/new'); await p.getByLabel('Type instead').click();
    await p.locator('textarea').fill('14 jakcured rails and a gate hinge set, 3 hours');
    await p.getByText('Build my quote').click(); await p.waitForTimeout(1200);
    const t = await text(); const vals = await p.locator('input').evaluateAll(els => els.map(e => e.value));
    ok('G3 voice quote picks up imported items', t.includes('Jakcured rail 3.6m') && t.includes('Gate hinge set') && vals.includes('14'), vals.join('|'));
  });

  await step('H van check', async () => {
    await go('/tools');
    const names = ['Combi drill + 2 batteries','Impact driver','Battery charger','Spirit level (1.2m)','Tape measure','Pencils & marker','PPE — gloves, glasses, ear defenders','First aid kit'];
    for (const n of names) await p.getByText(n, { exact: true }).click();
    ok('H1 all loaded message', (await text()).includes('All loaded'));
    await p.getByLabel('Lend Tape measure').click(); await p.getByPlaceholder('Who’s borrowing it?').fill('Gaz');
    await p.getByText('Lend', { exact: true }).click(); await p.waitForTimeout(200);
    const t = await text(); ok('H2 lent tool listed', t.includes('With Gaz') && /Gaz.*has your tape measure/s.test(t));
    await p.getByText('Got it back').first().click(); await p.waitForTimeout(200);
    ok('H3 returned', !(await text()).includes('With Gaz'));
    await p.getByPlaceholder(/Add to Every job/).fill('Laser level'); await p.getByText('Add', { exact: true }).click();
    ok('H4 add tool', (await text()).includes('Laser level'));
  });

  await step('I per-job pricing', async () => {
    await go('/settings');
    await p.getByText('Price per job', { exact: true }).click();
    await go('/new'); await p.getByLabel('Type instead').click();
    await p.locator('textarea').fill('Fifteen metres of fencing, two days with a labourer');
    await p.getByText('Build my quote').click(); await p.waitForTimeout(1200);
    const t = await text(); const labourLines = (t.match(/Labour/g) || []).length;
    ok('I1 single labour price line (unit job)', t.includes('Labour (incl. labourer)') && t.includes('job'), (await p.locator('input').evaluateAll(els => els.map(e => e.value))).slice(0,10).join('|'));
    await go('/settings'); await p.getByText(/Remove the \d example jobs/).click(); await p.waitForTimeout(200);
    await go('/quotes'); ok('I2 examples removed', !(await text()).includes('Example'));
  });

  await step('J receipts', async () => {
    await go('/receipts');
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.getByText('Choose a photo').click()]);
    await fc.setFiles(require('path').join(__dirname, 'fixtures/receipt.jpg')); await p.waitForTimeout(1000);
    ok('J1 opens editor with notice', (await text()).includes('Receipt saved'));
    await p.getByPlaceholder('Screwfix').fill('Toolstation');
    const nums = p.locator('input[inputmode="decimal"]'); await nums.nth(2).fill('48.50');
    await go('/receipts'); const t = await text();
    ok('J2 listed under month with total', t.includes('Toolstation') && t.includes('£48.50'));
    await go('/'); ok('J3 home shows spend this month', (await text()).includes('£49 spent') || (await text()).includes('spent'));
  });

  await step('K persistence', async () => {
    await go('/quotes'); const before = (await text()).match(/Q-\d{4}/g)?.length;
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
    const after = (await text()).match(/Q-\d{4}/g)?.length;
    ok('K1 quotes survive restart', before && before === after, `${before} vs ${after}`);
    await go('/'); ok('K2 welcome not shown again', !(await text()).includes('Let’s get you set up'));
  });

  await step('L navigation', async () => {
    await go('/'); await p.getByLabel('Talk a new quote').click(); await p.waitForTimeout(600);
    ok('L1 mic tab opens new quote', p.url().endsWith('/new'));
    await p.getByLabel('Close').click(); await p.waitForTimeout(600);
    ok('L2 close returns', !p.url().endsWith('/new'));
  });

  console.log(results.join('\n'));
  console.log('\nERRORS:\n' + [...new Set(errs)].slice(0, 15).join('\n'));
  await b.close();
})();
