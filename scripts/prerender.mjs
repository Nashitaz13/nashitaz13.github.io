import { readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

// Build-time HTML only: readable content survives a blocked/failed browser script.
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const html = readFileSync('dist/index.html', 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender mount');
  writeFileSync('dist/index.html', html.replace('<div id="root"></div>', () => `<div id="root">${renderToString(createElement(App))}</div>`));
  console.log('Prerendered public content with no browser JavaScript required for reading.');
} finally { await server.close(); }
