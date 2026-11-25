import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkGithubRepos,
  checkRelativeLinks,
  checkSystemsPaths,
  isExternal,
  resolveRelative
} from '../scripts/lib/links.mjs';
import { makeTree } from './helpers.mjs';

test('resolveRelative walks from the file, not from the root', () => {
  assert.equal(resolveRelative('README.md', 'docs/vision/design-brief.md'), 'docs/vision/design-brief.md');
  assert.equal(resolveRelative('docs/system-map.md', '../README.md'), 'README.md');
  assert.equal(resolveRelative('docs/product/model-access.md', '../adr/README.md'), 'docs/adr/README.md');
  assert.equal(resolveRelative('README.md', 'docs/x.md#section'), 'docs/x.md');
  assert.equal(resolveRelative('README.md', '#anchor'), null);
});

test('isExternal leaves schemes and anchors alone', () => {
  assert.ok(isExternal('https://example.com/x'));
  assert.ok(isExternal('mailto:someone@example.com'));
  assert.ok(isExternal('#anchor'));
  assert.ok(!isExternal('docs/system-map.md'));
});

test('a relative link that does not resolve is a finding', () => {
  const root = makeTree({ 'README.md': '# Readme\n', 'docs/present.md': '# Present\n' });
  const findings = checkRelativeLinks(
    root,
    'README.md',
    ['[ok](docs/present.md)', '[gone](docs/absent.md)', '[anchor](#license)', '[web](https://example.com)'].join('\n')
  );
  assert.equal(findings.length, 1);
  assert.equal(findings[0].line, 2);
  assert.match(findings[0].message, /docs\/absent\.md/);
});

test('images are checked like links', () => {
  const root = makeTree({ 'README.md': '# Readme\n' });
  const findings = checkRelativeLinks(root, 'README.md', '![banner](.github/assets/none.png)');
  assert.equal(findings.length, 1);
});

test('only allowlisted Vidoxlabs repositories may be linked', () => {
  const allowed = checkGithubRepos('README.md', '[seed](https://github.com/Vidoxlabs/seed)');
  assert.deepEqual(allowed, []);
  const rejected = checkGithubRepos('README.md', '[x](https://github.com/Vidoxlabs/unlisted)');
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].line, 1);
  assert.match(rejected[0].message, /unlisted/);
});

test('a clone URL with the .git suffix still matches the allowlist', () => {
  assert.deepEqual(checkGithubRepos('README.md', 'https://github.com/Vidoxlabs/vivarium.git'), []);
});

test('a systems/ path must exist in the checked-out submodule', () => {
  const root = makeTree({ 'systems/seed/AGENTS.md': '# Seed\n' });
  const good = checkSystemsPaths(root, 'AGENTS.md', 'read `systems/seed/AGENTS.md` first');
  assert.deepEqual(good, []);
  const bad = checkSystemsPaths(root, 'AGENTS.md', 'read `systems/seed/docs/absent.md` first');
  assert.equal(bad.length, 1);
  assert.match(bad[0].message, /systems\/seed\/docs\/absent\.md/);
});

test('pattern placeholders are not treated as paths', () => {
  const root = makeTree({});
  assert.deepEqual(checkSystemsPaths(root, 'AGENTS.md', 'read `systems/<name>/AGENTS.md`'), []);
  assert.deepEqual(checkSystemsPaths(root, 'AGENTS.md', 'see systems/*/docs/'), []);
});
