import assert from 'node:assert/strict';
import { lstatSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { profile } from '../src/content/profile.ts';

const root = resolve(import.meta.dirname, '../dist');
const files = readdirSync(root, { recursive: true });
const emails = new Set(profile.contacts.approved ? profile.contacts.items.filter(c => c.href.startsWith('mailto:')).map(c => c.href.slice(7).toLowerCase()) : []);
for (const relative of files) {
  const info = lstatSync(join(root, relative));
  assert.ok(!info.isSymbolicLink(), `Symlink in artifact: ${relative}`);
  if (!info.isFile()) continue;
  const path = relative.replaceAll('\\', '/');
  assert.ok(/^(index\.html|icons-credits\.json|icons-LICENSE\.txt|assets\/[^/]+\.(js|css|svg))$/.test(path), `Unexpected artifact file: ${path}`);
  if (!/\.(js|css|html)$/.test(path)) continue;
  const text = readFileSync(join(root, relative), 'utf8');
  assert.ok(!/\b[A-Z]:[\\/]|CONTENT_AUDIT|duingzforge|\/src\/main\.tsx/.test(text), `Private or development reference: ${path}`);
  assert.ok((text.match(/[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? []).every(email => emails.has(email.toLowerCase())), `Unapproved email: ${path}`);
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(html.includes(profile.name.text) && html.includes('profile.toml'), 'Missing prerendered public content');
assert.equal((html.match(/class="case-study"/g) ?? []).length, 3, 'Missing static case studies');
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]);
assert.ok(assets.some(path => path.endsWith('.js')) && assets.some(path => path.endsWith('.css')), 'Missing production JS/CSS');
for (const path of assets) assert.ok(existsSync(join(root, path.slice(1))), `Missing asset: ${path}`);
console.log(`PASS: Pages artifact contains prerendered content and ${new Set(assets).size} valid local asset references; only approved public files/emails.`);
