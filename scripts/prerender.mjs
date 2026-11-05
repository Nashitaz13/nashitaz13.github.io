import { readFileSync, writeFileSync, unlinkSync, copyFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

// Build-time HTML only: readable content survives a blocked/failed browser script.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const html = readFileSync('dist/index.html', 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender mount');
  const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
  // SSR's dev asset URLs must match the client build before hydration, including no-JS images.
  const content = renderToString(createElement(App)).replace(/\/(src\/assets\/[^"?]+)(\?no-inline)?/g, (url, source, query = '') => {
    const asset = manifest[source + query] ?? manifest[source];
    if (!asset) throw new Error(`Missing built asset: ${source}`);
    return '/' + asset.file;
  });
  writeFileSync('dist/index.html', html.replace('<div id="root"></div>', () => `<div id="root">${content}</div>`));
  unlinkSync('dist/.vite/manifest.json');
  copyFileSync('src/assets/icons/icons-credits.json', 'dist/icons-credits.json');
  copyFileSync('src/assets/icons/LICENSE.txt', 'dist/icons-LICENSE.txt');
  console.log('Prerendered public content with no browser JavaScript required for reading.');
} finally { await server.close(); }
