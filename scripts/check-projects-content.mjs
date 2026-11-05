import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { projects } from '../src/content/projects.ts';
import { projectEvidence } from '../src/content/projectEvidence.ts';

// Local editorial checks; audit source locations are never shipped to the application.
const auditPath = new URL('../docs/CONTENT_AUDIT.md', import.meta.url);
const audit = existsSync(auditPath) ? readFileSync(auditPath, 'utf8') : null;
const registered = audit === null ? null : new Set([...audit.matchAll(/^\| ([ESM]\d\d) \|/gm)].map(match => match[1]));
const knownSource = id => /^([ESM]\d\d|CV01)$/.test(id) && (registered === null || registered.has(id) || id === 'CV01');
const publicClaims = [];
for (const project of projects) {
  const presentation = projectEvidence[project.id];
  assert.ok(presentation && presentation.figure.nodes.length === presentation.figure.edges.length + 1);
  const claims = [project.membership, project.summary, ...Object.values(project.caseStudy), ...project.individualContributions];
  assert.ok(claims.every(claim => claim.sourceIds.length > 0));
  for (const claim of claims.filter(c => c.publish)) {
    assert.ok(['corroborated', 'owner-confirmed'].includes(claim.status), claim.id);
    assert.ok(claim.sourceIds.every(knownSource), claim.id);
    publicClaims.push(claim);
  }
  assert.equal(project.individualContributions.length, 0, 'Review personal contribution publication explicitly before enabling');
  for (const source of [...presentation.evidence, presentation.figure]) assert.ok(source.sourceIds.length > 0 && source.sourceIds.every(knownSource));
  for (const link of [...presentation.evidence, ...project.links]) {
    assert.ok(/^https:\/\/github\.com\//.test(link.href));
    if (link.href.includes('/blob/')) assert.match(link.href, /\/blob\/[a-f0-9]{40}\//);
  }
}
assert.equal(new Set(publicClaims.map(c => c.id)).size, publicClaims.length);
assert.equal(new Set(Object.values(projectEvidence).map(p => p.anchor)).size, 3);
assert.ok(!/\b[A-Z]:[\\/]|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i.test(JSON.stringify({projects, projectEvidence})));
console.log(`PASS: ${projects.length} projects, ${publicClaims.length} published claims, pinned evidence links, figure provenance and personal-attribution holds.`);
console.log(registered ? 'PASS: source IDs resolve against the local internal registry.' : 'SKIP: internal source-registry lookup (not included in public checkouts); source ID format and presence checked.');
