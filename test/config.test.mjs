import assert from 'node:assert/strict';
import test from 'node:test';

import { LAYERS, normaliseUrl, validateConfig } from '../scripts/lib/config.mjs';
import { parseGitmodules } from '../scripts/lib/check.mjs';
import { parseSubmoduleStatus } from '../scripts/lib/git.mjs';

const base = {
  schema: 1,
  umbrella: 'vivarium',
  systems: [
    {
      name: 'seed',
      path: 'systems/seed',
      url: 'https://github.com/Vidoxlabs/seed',
      branch: 'main',
      layer: 'floor',
      role: 'Harness floor',
      owns: ['contracts']
    },
    {
      name: 'bloom',
      path: 'systems/bloom',
      url: 'https://github.com/Vidoxlabs/bloom',
      branch: 'main',
      layer: 'composer',
      role: 'User interface',
      owns: ['first-run setup']
    }
  ]
};

function clone() {
  return JSON.parse(JSON.stringify(base));
}

test('a well-formed config validates', () => {
  assert.deepEqual(validateConfig(base), []);
  assert.deepEqual(LAYERS, ['floor', 'peer', 'composer', 'outside']);
});

test('the layer list must hold exactly one floor and one composer', () => {
  const config = clone();
  config.systems[1].layer = 'peer';
  assert.ok(validateConfig(config).some((problem) => problem.includes('composer')));
});

test('paths, urls, branches, and owns are checked', () => {
  const config = clone();
  config.systems[0].path = 'elsewhere/seed';
  config.systems[0].url = 'git@github.com:Vidoxlabs/seed.git';
  config.systems[0].branch = '';
  config.systems[0].owns = [];
  const problems = validateConfig(config);
  assert.ok(problems.some((problem) => problem.includes('path')));
  assert.ok(problems.some((problem) => problem.includes('url')));
  assert.ok(problems.some((problem) => problem.includes('branch')));
  assert.ok(problems.some((problem) => problem.includes('owns')));
});

test('a repeated system name is rejected', () => {
  const config = clone();
  config.systems.push({ ...config.systems[0] });
  assert.ok(validateConfig(config).some((problem) => problem.includes('repeats')));
});

test('normaliseUrl drops the clone suffix', () => {
  assert.equal(
    normaliseUrl('https://github.com/Vidoxlabs/seed.git'),
    normaliseUrl('https://github.com/Vidoxlabs/seed')
  );
});

test('.gitmodules parses into one entry per submodule', () => {
  const text = [
    '[submodule "systems/seed"]',
    '\tpath = systems/seed',
    '\turl = https://github.com/Vidoxlabs/seed.git',
    '\tbranch = main',
    '\tshallow = true',
    '[submodule "systems/bloom"]',
    '\tpath = systems/bloom',
    '\turl = https://github.com/Vidoxlabs/bloom.git',
    '\tbranch = main'
  ].join('\n');
  assert.deepEqual(parseGitmodules(text), [
    { name: 'systems/seed', path: 'systems/seed', url: 'https://github.com/Vidoxlabs/seed.git', branch: 'main' },
    { name: 'systems/bloom', path: 'systems/bloom', url: 'https://github.com/Vidoxlabs/bloom.git', branch: 'main' }
  ]);
});

test('submodule status lines parse with their state prefix', () => {
  const entries = parseSubmoduleStatus(
    [
      ' 0d158cd7e1fb5098162c98d303ddde8172001062 systems/seed (heads/main)',
      '-4e61cca4ec1d158cd592afcd56a3280489aceedf systems/bloom',
      '+34c5c29c15f1d1f8baa6de6d5016f4809d68f098 systems/drosera (v2.4.0)',
      'U76d59fb1edb6b7093ae8a42ca29e4bfbd524f5e1 systems/trellis'
    ].join('\n')
  );
  assert.deepEqual(
    entries.map((entry) => entry.state),
    [' ', '-', '+', 'U']
  );
  assert.equal(entries[0].path, 'systems/seed');
  assert.equal(entries[1].commit, '4e61cca4ec1d158cd592afcd56a3280489aceedf');
  assert.equal(entries[2].describe, 'v2.4.0');
});
