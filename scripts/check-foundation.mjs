import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { profile as verifiedProfile } from '../src/content/profile.ts';
import { projects as verifiedProjects } from '../src/content/projects.ts';
import { projectEvidence } from '../src/content/projectEvidence.ts';

// Native-browser integration checks, with no test-runner package or product dependency.
const root = resolve(import.meta.dirname, '..');
const motionMode = process.argv.includes('--motion');
const uxMode = motionMode || process.argv.includes('--ux');
const profileMode = uxMode || process.argv.includes('--profile');
const projectsMode = profileMode || process.argv.includes('--projects');
const heroMode = projectsMode || process.argv.includes('--hero');
const output = join(root, motionMode ? 'docs/validation/phase07_5' : uxMode ? 'docs/validation/phase07' : profileMode ? 'docs/validation/phase06' : projectsMode ? 'docs/validation/phase05' : heroMode ? 'docs/validation/phase04' : 'docs/validation/phase03');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chromePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => p && existsSync(p));
assert.ok(chromePath, 'Set CHROME_PATH to an installed Chrome/Chromium browser.');
assert.ok(existsSync(join(root, 'dist/index.html')), 'Run npm run build first.');
mkdirSync(output, { recursive: true });
const children = [];
const report = { status: 'RUNNING', browser: 'Chrome headless, Windows host', views: [], menu: [], privacy: [], runtimeErrors: [] };
let ws;
const screencast = [];
let traceStream;
const guard = setTimeout(() => { children.forEach(child => child.kill()); process.exit(2); }, 90000);
function start(args) {
  const child = spawn(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), ...args], { cwd: root, stdio: 'ignore', windowsHide: true });
  children.push(child);
  return child;
}
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(url)).ok) return; } catch { /* wait for startup */ }
    await sleep(100);
  }
  throw new Error(`Local server did not start: ${url}`);
}

try {
  start(['--host', '127.0.0.1', '--port', '5175', '--strictPort']);
  start(['preview', '--host', '127.0.0.1', '--port', '4180', '--strictPort']);
  await ready('http://127.0.0.1:5175/'); await ready('http://127.0.0.1:4180/');
  for (const path of ['/Bui_Ngoc_Thai_Resume.pdf', '/docs/CONTENT_AUDIT.md', '/prompt.md', '/design/phase02/hybrid.html']) {
    const response = await fetch(`http://127.0.0.1:5175${path}`);
    assert.equal(response.status, 403, `Source reference was not denied: ${path}`);
    report.privacy.push({ path, status: response.status });
  }
  const files = readdirSync(join(root, 'dist'), { recursive: true }).filter(f => statSync(join(root, 'dist', f)).isFile());
  assert.ok(!files.some(f => /\.pdf$|\.md$|\.map$|design|docs|prompt/i.test(f)), 'Private/reference files in dist');
  for (const file of files.filter(f => /\.(js|css|html)$/.test(f))) {
    // React includes URL-scheme handling; actual contact links are checked in the rendered DOM.
    // The pinned public manuscript filename is a source link, not a conference acceptance claim.
    const text = readFileSync(join(root, 'dist', file), 'utf8').replaceAll('A_Drift-Aware_MLOps_Framework_for_Multi-Model_Serving_CSONET.tex', 'public-manuscript.tex');
    assert.ok(!/\b[A-Z]:[\\/]|CONTENT_AUDIT|duingzforge|CSoNet|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i.test(text), `Unexpected private content in ${file}`);
  }
  report.bundleFiles = files;

  const profile = join(tmpdir(), `portfolio-phase03-chrome-${process.pid}`);
  mkdirSync(profile, { recursive: true });
  const chrome = spawn(chromePath, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore', windowsHide: true });
  children.push(chrome);
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  assert.ok(existsSync(portFile), 'Chrome did not start');
  const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  const browser = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  ws = new WebSocket(browser.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') report.runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Page.screencastFrame') {
      screencast.push({data:message.params.data,timestamp:message.params.metadata.timestamp});
      void send('Page.screencastFrameAck',{sessionId:message.params.sessionId},message.sessionId);
    }
    if (message.method === 'Tracing.tracingComplete') traceStream = message.params.stream;
  };
  const send = async (method, params = {}, sessionId) => {
    const message = await new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
    if (message.error) throw new Error(`${method}: ${message.error.message}`);
    return message.result;
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const tab = (method, params) => send(method, params, sessionId);
  const evaluate = async expression => {
    const result = await tab('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.ok(!result.exceptionDetails, result.exceptionDetails?.text);
    return result.result.value;
  };
  const navigate = async url => {
    await tab('Page.navigate', { url });
    // Allow the old document to unload before probing the new React mount.
    await sleep(200);
    for (let i = 0; i < 100; i++) { if (await evaluate('!!document.querySelector("#intro-title")')) break; await sleep(100); }
    assert.ok(await evaluate('!!document.querySelector("#intro-title")'), 'App did not mount');
    await evaluate('document.fonts.ready.then(() => true)');
  };
  const key = async key => {
    for (const type of ['keyDown', 'keyUp']) await tab('Input.dispatchKeyEvent', {
      type, key, code: key, windowsVirtualKeyCode: { Tab: 9, Enter: 13, Escape: 27 }[key],
      ...(type === 'keyDown' && key === 'Enter' ? { text: '\r' } : {}),
    });
  };
  await tab('Page.enable'); await tab('Runtime.enable');
  if (motionMode) await tab('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  // Confirm both the development app and built preview actually mount.
  await navigate('http://127.0.0.1:5175/'); report.developmentMount = 'PASS';
  const sizes = [[1440, 900], [1024, 768], ...(heroMode ? [[820, 1180]] : []), [768, 1024], [390, 844], [320, 844]];
  for (const [width, height] of sizes) {
    await tab('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await navigate('http://127.0.0.1:4180/');
    const row = await evaluate(`(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,sections:[...document.querySelectorAll('main>section')].map(el=>el.id),h2:document.querySelectorAll('h2').length,brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).length,minimumMetadata:Math.min(...[...document.querySelectorAll('.metadata,.eyebrow,.section-label>span')].map(el=>parseFloat(getComputedStyle(el).fontSize))),shortTargets:[...document.querySelectorAll('a,summary')].filter(el=>el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height<43.9).length,hasTerminal:!!document.querySelector('.profile-terminal'),hasPrivateActions:!!document.querySelector('a[href^="mailto:"],a[href^="tel:"],a[href$=".pdf"]')}))()`);
    assert.ok(row.scrollWidth <= width + 1, `${width}px overflow`);
    assert.equal(row.h1, 1); assert.equal(row.h2, 4);
    assert.deepEqual(row.sections, ['intro', 'projects', 'expertise', 'about', 'contact']);
    assert.equal(row.brokenAnchors, 0); assert.ok(row.minimumMetadata >= 13); assert.equal(row.shortTargets, 0);
    assert.equal(row.hasPrivateActions, false);
    if (heroMode) {
      const hero = await evaluate(`(() => {
        const identity=document.querySelector('.hero__identity'), terminal=document.querySelector('.profile-terminal'), code=document.querySelector('.profile-terminal__code'), cta=document.querySelector('.hero .primary-link');
        const a=identity.getBoundingClientRect(),b=terminal.getBoundingClientRect();
        return {count:document.querySelectorAll('.profile-terminal').length,name:document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim().replace(/\\.$/,''),nameSize:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),identityShare:a.width/(a.width+b.width),beside:b.left>=a.right-1,ctaBeforeTerminal:cta.getBoundingClientRect().bottom<=b.top,terminalScroll:code.scrollWidth,terminalWidth:code.clientWidth,selectable:getComputedStyle(code).userSelect!=='none',code:code.textContent,controls:terminal.querySelectorAll('input,textarea,button,[contenteditable="true"]').length,animations:[...terminal.querySelectorAll('*')].filter(el=>getComputedStyle(el).animationName!=='none').length};
      })()`);
      assert.equal(hero.count, 1); assert.equal(hero.name, verifiedProfile.name.text);
      assert.ok(hero.terminalScroll <= hero.terminalWidth + 1); assert.ok(hero.selectable);
      assert.equal(hero.controls, 0); assert.equal(hero.animations, 0);
      assert.ok(hero.code.includes(JSON.stringify(verifiedProfile.name.text)) && hero.code.includes(JSON.stringify(verifiedProfile.positioning.text)));
      assert.ok(verifiedProfile.expertise.filter(item => item.publish).every(item => hero.code.includes(JSON.stringify(item.category))));
      if (width >= 1024) { assert.ok(hero.beside); assert.ok(hero.identityShare >= .55 && hero.identityShare <= .60); }
      else assert.ok(hero.ctaBeforeTerminal);
      const selected = await evaluate(`(() => {const code=document.querySelector('.profile-terminal__code');const range=document.createRange();range.selectNodeContents(code);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);const complete=selection.toString()===code.textContent;selection.removeAllRanges();return complete})()`);
      assert.ok(selected, 'Terminal text selection');
      row.hero = { ...hero, code: undefined, fullTextSelection: 'PASS' };
    }
    report.views.push(row);
    if (profileMode) {
      const content = await evaluate(`(() => ({
        categories:[...document.querySelectorAll('.expertise__category h3')].map(el=>el.textContent),
        claims:[...document.querySelectorAll('#expertise [data-claim],#about [data-claim]')].map(el=>({id:el.dataset.claim,text:el.textContent})),
        technologies:[...document.querySelectorAll('.expertise__context .project-stack')].map(el=>[...el.children].map(item=>item.textContent)),
        targets:[...document.querySelectorAll('.expertise__examples a')].map(el=>el.hash),
        about:document.querySelector('#about').innerText,
        contact:{text:document.querySelector('.contact__content').textContent,links:document.querySelectorAll('#contact a').length,forms:document.querySelectorAll('#contact form,input,textarea').length},
        forbidden:document.querySelectorAll('#expertise progress,#expertise meter,#about time,a[download],a[href^="mailto:"],a[href^="tel:"],a[href$=".pdf"]').length,
        minBody:Math.min(...[...document.querySelectorAll('.expertise__context>p,.about__content p:not(.metadata),.contact__content p')].map(el=>parseFloat(getComputedStyle(el).fontSize)))
      }))()`);
      const published = verifiedProfile.expertise.filter(c=>c.publish);
      assert.deepEqual(content.categories, published.map(c=>c.category));
      assert.deepEqual(content.technologies, published.map(c=>c.technologies));
      assert.deepEqual(content.targets, published.flatMap(c=>c.projectIds.map(id=>'#'+projectEvidence[id].anchor)));
      const expectedClaims = [...published, verifiedProfile.name, verifiedProfile.positioning, ...verifiedProfile.about].filter(c=>c.publish);
      assert.equal(content.claims.length, expectedClaims.length);
      for (const claim of expectedClaims) {
        assert.ok(['corroborated','owner-confirmed'].includes(claim.status) && claim.sourceIds.length>0, `Unsupported profile claim ${claim.id}`);
        assert.ok(content.claims.some(c=>c.id===claim.id&&c.text===claim.text), `Profile publication mismatch ${claim.id}`);
      }
      assert.equal(content.forbidden,0); assert.ok(content.minBody>=16);
      assert.equal(verifiedProfile.contacts.approved,false); assert.equal(verifiedProfile.contacts.items.length,0);
      assert.equal(verifiedProfile.resume.approved,false); assert.equal(verifiedProfile.publication.approved,false);
      assert.equal(content.contact.links,0); assert.equal(content.contact.forms,0);
      assert.equal(content.contact.text,'Contact details are not publicly listed.');
      assert.ok(!/GPA|certified|years of experience|graduat|available for|2027/i.test(content.about));
      row.profile = {categories:content.categories,claims:content.claims.length,caseLinks:content.targets.length,minBody:content.minBody,contact:'PASS: no approved channels, no contact actions'};
      for (const selector of ['#expertise','#about','#contact']) {
        const rect = await evaluate(`(() => {const r=document.querySelector('${selector}').getBoundingClientRect();return{x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`);
        const shot = await tab('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});
        writeFileSync(join(output,`${selector.slice(1)}-${width}.png`),Buffer.from(shot.data,'base64'));
      }
      const closing = await evaluate(`(() => {const r=document.querySelector('#expertise').getBoundingClientRect();return{x:0,y:r.top+scrollY,width:innerWidth,height:document.documentElement.scrollHeight-(r.top+scrollY)}})()`);
      const shot = await tab('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...closing,scale:1}});
      writeFileSync(join(output,`closing-${width}.png`),Buffer.from(shot.data,'base64'));
    }
    if (projectsMode) {
      const cases = await evaluate(`(() => {
        const cases=[...document.querySelectorAll('.case-study')];
        return {overview:document.querySelectorAll('.project-row').length,ids:cases.map(el=>el.id),hidden:cases.filter(el=>getComputedStyle(el).display==='none'||el.closest('details')).length,headings:cases.map(el=>[...el.querySelectorAll('h4')].map(h=>h.textContent)),text:cases.map(el=>el.innerText),claims:[...document.querySelectorAll('.projects [data-claim]')].map(el=>({id:el.dataset.claim,text:el.textContent})),figures:cases.map(el=>{const svg=el.querySelector('svg');return {accessible:!!svg.querySelector('title')&&!!svg.querySelector('desc')&&svg.getAttribute('role')==='img',labels:[...svg.querySelectorAll('text')].map(t=>parseFloat(getComputedStyle(t).fontSize)*svg.getBoundingClientRect().width/svg.viewBox.baseVal.width)}}),sources:[...document.querySelectorAll('.project-row a[href^="https://"]')].map(a=>a.href)};
      })()`);
      assert.equal(cases.overview, 3); assert.equal(cases.hidden, 0);
      assert.deepEqual(cases.ids, Object.values(projectEvidence).map(p => p.anchor));
      for (const [i, project] of verifiedProjects.entries()) {
        const expected = Object.values(project.caseStudy).filter(c => c.publish);
        for (const claim of expected) assert.ok(cases.claims.some(c => c.id === claim.id && c.text === claim.text), `${project.id}: missing or altered ${claim.id}`);
        assert.ok(!cases.headings[i].includes('My contribution'), 'Unconfirmed authorship');
        assert.ok(cases.figures[i].accessible && cases.figures[i].labels.every(size => size >= 13), 'SVG accessible name/label size');
      }
      assert.deepEqual(cases.sources, verifiedProjects.flatMap(p => p.links.map(l => l.href)));
      assert.equal(await evaluate(`document.querySelectorAll('[id]').length===new Set([...document.querySelectorAll('[id]')].map(el=>el.id)).size`), true, 'Duplicate IDs');
      row.projects = { overview: cases.overview, anchors: cases.ids, publishedClaims: cases.claims.length, figures: cases.figures, sourceLinks: 'PASS' };
      for (const selector of ['.project-rows', ...cases.ids.map(id => '#' + id)]) {
        const rect = await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)}); const r=el.getBoundingClientRect();return {x:Math.max(0,r.left+scrollX),y:r.top+scrollY,width:r.width,height:r.height}})()`);
        const shot = await tab('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
        writeFileSync(join(output, `${selector.replace(/^[.#]/, '')}-${width}.png`), Buffer.from(shot.data, 'base64'));
      }
    }
    if (width <= 768) {
      await evaluate('document.querySelector("summary").focus()'); await key('Enter');
      assert.equal(await evaluate('document.querySelector("details").open'), true);
      assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
      await key('Escape');
      assert.ok(await evaluate('!document.querySelector("details").open&&document.activeElement.tagName==="SUMMARY"'));
      await key('Enter');
      await evaluate(`document.querySelector('.mobile-menu a[href="#projects"]').focus()`); await key('Enter');
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      assert.equal(await evaluate('location.hash'), '#projects');
      assert.equal(await evaluate('document.querySelector("details").open'), false);
      assert.equal(await evaluate(`document.querySelector('.mobile-menu a[aria-current="location"]').hash`), '#projects');
      report.menu.push({ width, enterToggle: 'PASS', escapeFocus: 'PASS', anchorClose: 'PASS', currentLocation: 'PASS' });
      await navigate('http://127.0.0.1:4180/');
    }
    const metrics = await tab('Page.getLayoutMetrics');
    const shot = await tab('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: metrics.cssContentSize.height, scale: 1 } });
    writeFileSync(join(output, `${projectsMode ? 'projects' : heroMode ? 'hero' : 'foundation'}-${width}.png`), Buffer.from(shot.data, 'base64'));
  }
  if (projectsMode) {
    await navigate('http://127.0.0.1:4180/');
    let tabsToCase = 0;
    while (!(await evaluate(`document.activeElement?.matches('.project-actions a[href="#project-eks-cilium"]')`)) && tabsToCase < 20) {
      await key('Tab'); tabsToCase++;
    }
    assert.ok(tabsToCase < 20, 'Project summary reachable by sequential Tab navigation');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
    await key('Enter'); await sleep(100);
    assert.equal(await evaluate('location.hash'), '#project-eks-cilium');
    assert.equal(await evaluate('document.activeElement.id'), 'project-eks-cilium');
    await key('Tab');
    assert.ok(await evaluate(`document.activeElement.matches('#project-eks-cilium .evidence-list a')`), 'Native destination focus and source tab order');
    report.projectTabFlow = { sequentialTabs: tabsToCase, caseFocus: 'PASS', sourceFocus: 'PASS' };
    report.caseNavigation = [];
    for (const {anchor} of Object.values(projectEvidence)) {
      await navigate('http://127.0.0.1:4180/');
      await evaluate(`document.querySelector('.project-actions a[href="#${anchor}"]').focus()`);
      assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
      await key('Enter'); await sleep(100);
      assert.equal(await evaluate('location.hash'), '#' + anchor);
      assert.ok(await evaluate(`Math.abs(document.getElementById('${anchor}').getBoundingClientRect().top-24)<2`));
      assert.equal(await evaluate(`document.querySelector('.mobile-menu a[aria-current="location"]').hash`), '#projects');
      await tab('Page.reload'); await sleep(250);
      assert.equal(await evaluate('location.hash'), '#' + anchor);
      assert.ok(await evaluate(`Math.abs(document.getElementById('${anchor}').getBoundingClientRect().top-24)<2`), 'Refresh destination');
      await evaluate(`document.querySelector('#${anchor} .case-study__return').focus()`); await key('Enter'); await sleep(100);
      assert.equal(await evaluate('location.hash'), '#projects');
      await evaluate('history.back()'); await sleep(150);
      assert.equal(await evaluate('location.hash'), '#' + anchor);
      await evaluate('history.forward()'); await sleep(150);
      assert.equal(await evaluate('location.hash'), '#projects');
      await navigate('http://127.0.0.1:4180/#' + anchor);
      assert.ok(await evaluate(`Math.abs(document.getElementById('${anchor}').getBoundingClientRect().top-24)<2`), 'Direct hash destination');
      report.caseNavigation.push({anchor,keyboard:'PASS',focus:'PASS',refresh:'PASS',backForward:'PASS',directHash:'PASS'});
    }
  }
  if (profileMode) {
    report.profileNavigation = [];
    await navigate('http://127.0.0.1:4180/#expertise');
    const links = await evaluate(`[...document.querySelectorAll('.expertise__examples a')].map(a=>a.hash)`);
    for (let i=0;i<links.length;i++) {
      await evaluate(`document.querySelectorAll('.expertise__examples a')[${i}].focus()`);
      assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
      await key('Enter'); await sleep(100);
      assert.equal(await evaluate('location.hash'),links[i]);
      assert.ok(await evaluate(`document.activeElement.id===location.hash.slice(1)`));
      await evaluate('history.back()'); await sleep(100);
      assert.equal(await evaluate('location.hash'),'#expertise');
      report.profileNavigation.push({target:links[i],keyboard:'PASS',focus:'PASS',returnHistory:'PASS'});
    }
    for (const id of ['expertise','about','contact']) {
      await navigate('http://127.0.0.1:4180/#'+id);
      assert.equal(await evaluate(`document.querySelector('.mobile-menu a[aria-current="location"]').hash`),'#'+id);
      assert.ok(await evaluate(`document.querySelector('#${id}').getBoundingClientRect().top<innerHeight`));
    }
  }
  if (uxMode) {
    const selected = () => evaluate(`document.querySelector('.desktop-nav a[aria-current="location"]').hash`);
    const pointer = (x,y) => tab('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
    await tab('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await navigate('http://127.0.0.1:4180/#intro');
    const history = await evaluate('({hash:location.hash,length:history.length})');
    report.scrollNavigation = [];
    for (const [destination,expected] of [['#projects','projects'],['#project-sagelms','projects'],['#expertise','expertise'],['#intro','intro']]) {
      await evaluate(`scrollTo(0,document.querySelector('${destination}').getBoundingClientRect().top+scrollY-24)`);
      await sleep(160);
      assert.equal(await selected(),'#'+expected,`Scroll active ${destination}`);
      assert.deepEqual(await evaluate('({hash:location.hash,length:history.length})'),history,'Scrolling must not mutate URL/history');
      report.scrollNavigation.push({destination,active:expected,urlUnchanged:'PASS'});
    }
    for (const id of ['projects','expertise']) {
      for (const [offset,expected] of [[-4,id==='projects'?'intro':'projects'],[4,id]]) {
        await evaluate(`scrollTo(0,document.querySelector('#${id}').getBoundingClientRect().top+scrollY-Math.round(innerHeight*.5)+${offset})`);
        await sleep(160); assert.equal(await selected(),'#'+expected,'Section boundary '+id+'/'+offset);
      }
    }
    await evaluate(`scrollTo(0,document.querySelector('#about').getBoundingClientRect().top+scrollY-Math.round(innerHeight*.5)+4)`); await sleep(160);
    assert.equal(await selected(),'#about','Short About section while scrolling');
    await evaluate('scrollTo(0,document.documentElement.scrollHeight)'); await sleep(160);
    assert.equal(await selected(),'#contact','Bottom-of-document contact');
    await navigate('http://127.0.0.1:4180/#about');
    assert.equal(await selected(),'#about','Explicit short anchor wins at bottom');
    // Same-hash activation must also restore anchor intent after manual scrolling.
    await evaluate('scrollTo(0,0)'); await sleep(160); assert.equal(await selected(),'#intro');
    await evaluate(`document.querySelector('.desktop-nav a[href="#about"]').focus()`); await key('Enter'); await sleep(160);
    assert.equal(await selected(),'#about','Same-hash link activation');
    report.boundariesAndHashIntent='PASS';

    await navigate('http://127.0.0.1:4180/');
    const rowRect=await evaluate(`(() => {const el=document.querySelector('.project-row');el.scrollIntoView();const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    await pointer(2,2); await sleep(220);
    const before=await evaluate(`({color:getComputedStyle(document.querySelector('.project-row h3 a')).color,height:document.querySelector('.project-row').getBoundingClientRect().height})`);
    await pointer(rowRect.x+10,rowRect.y+10); await sleep(220);
    const hovered=await evaluate(`({color:getComputedStyle(document.querySelector('.project-row h3 a')).color,height:document.querySelector('.project-row').getBoundingClientRect().height,transform:getComputedStyle(document.querySelector('.project-row')).transform})`);
    assert.notEqual(hovered.color,before.color); assert.equal(hovered.height,before.height); assert.equal(hovered.transform,'none');
    await pointer(2,2); await evaluate(`document.querySelector('.project-row .project-action').focus()`); await key('Tab'); await sleep(220);
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'),'solid');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.project-row h3 a')).color`),hovered.color);
    const stateShot=async name=>{const s=await tab('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(output,name),Buffer.from(s.data,'base64'));};
    await stateShot('project-row-keyboard.png');
    await navigate('http://127.0.0.1:4180/'); await pointer(2,2); await sleep(220);
    const terminalBefore=await evaluate(`getComputedStyle(document.querySelector('.profile-terminal')).borderTopColor`);
    const terminalRect=await evaluate(`(() => {const r=document.querySelector('.profile-terminal').getBoundingClientRect();return{x:r.x,y:r.y}})()`);
    await pointer(terminalRect.x+20,terminalRect.y+20); await sleep(220);
    assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.profile-terminal')).borderTopColor`),terminalBefore);
    assert.equal(await evaluate(`document.querySelector('.profile-terminal').querySelectorAll('button,input,[tabindex]').length`),0);
    await stateShot('terminal-hover.png');
    await pointer(2,2);
    report.hoverFocus={rowColor:'PASS',rowGeometry:'UNCHANGED',keyboardOutline:'PASS',terminalBorder:'PASS',terminalTabStops:0};

    await tab('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await navigate('http://127.0.0.1:4180/');
    await evaluate(`document.querySelector('summary').focus()`);
    for(const type of ['keyDown','keyUp']) await tab('Input.dispatchKeyEvent',{type,key:' ',code:'Space',windowsVirtualKeyCode:32,...(type==='keyDown'?{text:' '}: {})});
    assert.equal(await evaluate(`document.querySelector('details').open`),true,'Space opens native menu');
    await key('Escape'); assert.ok(await evaluate(`!document.querySelector('details').open&&document.activeElement.tagName==='SUMMARY'`));
    report.menuSpaceEscape='PASS';
    report.zoomReflow=[];
    // A 200% layout reflow proxy: half the CSS viewport, double physical pixel density.
    // This is not a claim that Chrome's native toolbar zoom was changed.
    for(const physical of [1440,1024]) {
      const width=physical/2;
      await tab('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:2,mobile:false});
      await navigate('http://127.0.0.1:4180/');
      assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
      assert.ok(await evaluate(`document.querySelector('.profile-terminal__code').scrollWidth<=document.querySelector('.profile-terminal__code').clientWidth+1`));
      await stateShot(`zoom-reflow-${physical}.png`);
      await evaluate(`document.querySelector('#expertise').scrollIntoView()`); await stateShot(`zoom-reflow-closing-${physical}.png`);
      report.zoomReflow.push({physicalWidth:physical,cssWidth:width,deviceScaleFactor:2,overflow:'PASS',method:'200% layout reflow proxy; native browser zoom not changed'});
    }
    await tab('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    const motion=await evaluate(`['.project-row','.project-row h3 a','.profile-terminal','.profile-terminal__titlebar','.section-nav a','.project-action'].map(selector=>({selector,duration:getComputedStyle(document.querySelector(selector)).transitionDuration,animation:getComputedStyle(document.querySelector(selector)).animationName}))`);
    assert.ok(motion.every(item=>item.duration==='0s'&&item.animation==='none')); report.motion=motion;
    await tab('Emulation.setEmulatedMedia',{features:[]});
    await tab('Emulation.setDeviceMetricsOverride',{width:320,height:844,deviceScaleFactor:1,mobile:true});
    await navigate('http://127.0.0.1:4180/');
  }
  if (motionMode) {
    await tab('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await tab('Emulation.setEmulatedMedia',{features:[]});
    await tab('Page.addScriptToEvaluateOnNewDocument',{source:`window.motionShifts=[]; new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.motionShifts.push(e.value)})).observe({type:'layout-shift',buffered:true});`});
    const shot=async name=>{const s=await tab('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(output,name),Buffer.from(s.data,'base64'))};
    const terminalState=()=>evaluate(`({text:document.querySelector('.profile-terminal__code').textContent,height:document.querySelector('.profile-terminal__code').getBoundingClientRect().height,typing:!!document.querySelector('[data-typing]'),caret:document.querySelectorAll('.is-typing').length,animations:document.getAnimations().filter(a=>a.playState==='running').length})`);
    await tab('Page.startScreencast',{format:'jpeg',quality:75,maxWidth:960,maxHeight:600,everyNthFrame:2});
    await navigate('http://127.0.0.1:4180/');
    const initial=await terminalState(); assert.ok(initial.typing && initial.text.includes('Bùi Ngọc Thái'));
    await shot('motion-initial.png'); await sleep(850); const mid=await terminalState(); await shot('motion-mid.png');
    assert.equal(initial.height,mid.height); assert.ok(mid.caret<=1); await sleep(1600); const final=await terminalState(); await shot('motion-settled.png');
    assert.equal(initial.height,final.height); assert.equal(initial.text,final.text); assert.equal(final.typing,false); assert.equal(final.caret,0); assert.equal(final.animations,0);
    await tab('Page.stopScreencast');
    mkdirSync(join(output,'recording'),{recursive:true});
    screencast.forEach((frame,index)=>writeFileSync(join(output,'recording',`${index}.jpg`),Buffer.from(frame.data,'base64')));
    writeFileSync(join(output,'recording/frames.json'),JSON.stringify(screencast.map(({timestamp})=>timestamp)));
    assert.equal(await evaluate('window.motionShifts.reduce((a,b)=>a+b,0)'),0,'Entrance/typewriter layout shift');
    await evaluate(`document.querySelector('#expertise').scrollIntoView()`); await sleep(450); await evaluate('scrollTo(0,0)'); await sleep(100);
    assert.equal((await terminalState()).typing,false,'Typing must not restart after scroll');
    await tab('Performance.enable');
    await send('Tracing.start',{categories:'devtools.timeline,toplevel,blink.user_timing',transferMode:'ReturnAsStream'});
    const metrics=async()=>Object.fromEntries((await tab('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
    const start=await metrics();
    await evaluate(`window.frameDeltas=[];window.frameProbe=new Promise(resolve=>{let last=performance.now(),n=0;function tick(t){window.frameDeltas.push(t-last);last=t;if(++n<100)requestAnimationFrame(tick);else resolve(true)}requestAnimationFrame(tick)});true`);
    for(let i=0;i<90;i++) await tab('Input.dispatchMouseEvent',{type:'mouseMoved',x:100+i*10,y:200+(i%5)*20});
    await evaluate('window.frameProbe'); const end=await metrics();
    const frames=await evaluate('window.frameDeltas.slice(1).sort((a,b)=>a-b)');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.motion-light')).pointerEvents`),'none');
    await shot('pointer-light.png');
    const idleStart=await metrics(); await sleep(700); const idleEnd=await metrics();
    await send('Tracing.end');
    for(let i=0;i<100&&!traceStream;i++) await sleep(20);
    if(traceStream) {
      let trace='';let chunk;
      do {chunk=await send('IO.read',{handle:traceStream});trace+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString('utf8'):chunk.data;} while(!chunk.eof);
      writeFileSync(join(output,'pointer-trace.json'),trace);await send('IO.close',{handle:traceStream});
    }
    report.motionExpansion={initial:{...initial,text:undefined},mid:{...mid,text:undefined},final:{...final,text:undefined},layoutShift:0,pointer:{events:90,frameMedianMs:frames[Math.floor(frames.length/2)],frameP95Ms:frames[Math.floor(frames.length*.95)],taskDurationSeconds:end.TaskDuration-start.TaskDuration,scriptDurationSeconds:end.ScriptDuration-start.ScriptDuration,layoutCount:end.LayoutCount-start.LayoutCount},idle:{sampleMs:700,taskDurationSeconds:idleEnd.TaskDuration-idleStart.TaskDuration}};
    // Test interruption, hidden-state completion and reduced-motion changes during playback.
    for(const reason of ['selection','visibility','reduced']) {
      await navigate('http://127.0.0.1:4180/');
      if(reason==='selection') await evaluate(`(()=>{const r=document.createRange();r.selectNodeContents(document.querySelector('.profile-terminal__code'));getSelection().removeAllRanges();getSelection().addRange(r)})()`);
      if(reason==='visibility') await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);
      if(reason==='reduced') await tab('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await sleep(80); assert.equal((await terminalState()).typing,false,reason+' interruption'); assert.equal((await terminalState()).caret,0);
      await tab('Emulation.setEmulatedMedia',{features:[]});
    }
    await navigate('http://127.0.0.1:4180/#project-mlops');assert.equal((await terminalState()).typing,false,'Direct case hash skips intro');
    const fallback=await tab('Page.addScriptToEvaluateOnNewDocument',{source:`Element.prototype.animate=()=>{throw new Error('Simulated animation failure')}`});
    await navigate('http://127.0.0.1:4180/'); await sleep(2200); assert.equal((await terminalState()).caret,0);assert.ok((await terminalState()).text.includes('Cloud & Infrastructure'));
    await tab('Page.removeScriptToEvaluateOnNewDocument',{identifier:fallback.identifier});
    await tab('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    await tab('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await navigate('http://127.0.0.1:4180/');await sleep(2300);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.motion-light')).display`),'none','Coarse-pointer static fallback');
    const target=await evaluate(`(()=>{const r=document.querySelector('.primary-link').getBoundingClientRect();return{x:r.x+20,y:r.y+20}})()`);
    await tab('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[target]});await sleep(150);await shot('touch-press.png');
    assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.primary-link')).transform`),'none',JSON.stringify(await evaluate(`({reduce:matchMedia('(prefers-reduced-motion:reduce)').matches,pressed:document.querySelector('.primary-link').className,active:document.querySelector('.primary-link').matches(':active')})`)));
    await tab('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);
    assert.equal(await evaluate('location.hash'),'#projects');
    await tab('Emulation.setTouchEmulationEnabled',{enabled:false});
    await tab('Emulation.setDeviceMetricsOverride',{width:320,height:844,deviceScaleFactor:1,mobile:true});
    await tab('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await navigate('http://127.0.0.1:4180/');assert.equal((await terminalState()).typing,false);assert.equal((await terminalState()).animations,0);
    report.motionExpansion.interruptions='PASS: selection, synthetic visibility change, dynamic reduced motion, direct hash, simulated WAAPI failure';
    report.motionExpansion.touch='PASS: coarse-pointer fallback and native CTA tap';
    await tab('Emulation.setScriptExecutionDisabled',{value:true});
    await tab('Page.navigate',{url:'http://127.0.0.1:4180/'}); await sleep(200);
    const noJs=await tab('DOMSnapshot.captureSnapshot',{computedStyles:[]});
    assert.ok(noJs.strings.some(s=>s.includes('Bùi Ngọc Thái'))&&noJs.strings.includes('profile.toml'),'Prerender readable with JavaScript disabled');
    await tab('Emulation.setScriptExecutionDisabled',{value:false});
    report.motionExpansion.noJavaScript='PASS: production HTML terminal and name retained with script execution disabled';
  }
  await navigate('http://127.0.0.1:4180/'); await key('Tab');
  assert.ok(await evaluate('document.activeElement.classList.contains("skip-link")&&getComputedStyle(document.activeElement).outlineStyle==="solid"'));
  await key('Enter'); assert.equal(await evaluate('document.activeElement.id'), 'main');
  report.skipLink = 'PASS';
  if (heroMode) {
    await evaluate('document.querySelector(".hero .primary-link").focus()');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
    await key('Enter'); assert.equal(await evaluate('location.hash'), '#projects');
    report.heroCta = 'PASS';
  }
  await navigate('http://127.0.0.1:4180/#contact');
  assert.ok(await evaluate('document.querySelector("#contact").getBoundingClientRect().top<innerHeight'));
  report.directAnchor = 'PASS';
  await tab('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.ok(await evaluate('matchMedia("(prefers-reduced-motion:reduce)").matches&&getComputedStyle(document.querySelector(".primary-link")).transitionDuration==="0s"'));
  report.reducedMotion = 'PASS';
  await evaluate('document.head.insertAdjacentHTML("beforeend", "<style>body,h1,h2,h3{font-family:Arial,sans-serif!important}</style>")');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  report.fallbackFontAt320 = 'PASS (Arial stress check on Windows, not Linux/macOS testing)';
  if (heroMode) {
    assert.ok(await evaluate('document.querySelector(".profile-terminal__code").scrollWidth<=document.querySelector(".profile-terminal__code").clientWidth+1'));
    report.terminalFallbackAt320 = 'PASS';
  }
  assert.equal(report.runtimeErrors.length, 0);
  report.status = 'PASS';
  await send('Browser.close');
  console.log(`PASS: dev/production mounts, ${sizes.length} viewports, mobile keyboard/menu/anchors, skip link, reduced motion, bundle boundaries and four denied dev paths.${heroMode ? ' Hero geometry, verified terminal text, selection, wrapping and CTA checked.' : ''}${projectsMode ? ' Projects: published claims, figures, sequential Tab, source focus, direct hash, refresh and back/forward checked.' : ''}${profileMode ? ' Expertise/About/Contact: published text, technologies, case links, privacy gates, focus and section navigation checked.' : ''}`);
} catch (error) {
  report.status = 'FAIL'; report.error = error.stack; console.error(error.message); process.exitCode = 1;
} finally {
  writeFileSync(join(output, 'browser-report.json'), JSON.stringify(report, null, 2));
  clearTimeout(guard); ws?.close(); children.forEach(child => child.kill());
}
