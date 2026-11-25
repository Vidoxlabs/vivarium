import assert from 'node:assert/strict';
import test from 'node:test';

import { buildManifest, serializeManifest } from '../scripts/lib/manifest.mjs';
import { diffPins, formatSummary, formatPinLine, buildBumpBody } from '../scripts/lib/summary.mjs';
import { makeTree } from './helpers.mjs';

const config = {
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

test('buildManifest records the pins in config order and is deterministic', () => {
  const root = makeTree({
    'systems/seed/package.json': JSON.stringify({ name: 'seed', version: '1.2.3' }),
    'systems/seed/LICENSE': 'MIT License\n\nCopyright (c) 2026 Seed contributors\n',
    'systems/seed/AGENTS.md': '# Seed\n',
    'systems/seed/.github/workflows/ci.yml': 'name: ci\n',
    'systems/bloom/package.json': JSON.stringify({
      name: 'bloom',
      version: '0.4.0',
      dependencies: {
        '@vidoxlabs/seed': 'github:Vidoxlabs/seed#0d158cd7e1fb5098162c98d303ddde8172001062'
      }
    }),
    'systems/bloom/LICENSE': 'MIT License\n',
    'systems/bloom/AGENTS.md': '# Bloom\n'
  });
  const pins = {
    seed: '1111111111111111111111111111111111111111',
    bloom: '2222222222222222222222222222222222222222'
  };

  const first = buildManifest({ root, config, pins });
  const second = buildManifest({ root, config, pins });

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.systems.map((system) => system.name),
    ['seed', 'bloom']
  );
  assert.equal(first.systems[0].version, '1.2.3');
  assert.equal(first.systems[0].license, 'MIT');
  assert.deepEqual(first.systems[0].importsToday, []);
  assert.equal(first.systems[0].agentsFile, 'systems/seed/AGENTS.md');
  assert.deepEqual(first.systems[1].importsToday, [
    { name: 'seed', pin: '0d158cd7e1fb5098162c98d303ddde8172001062' }
  ]);
  assert.equal(serializeManifest(first), serializeManifest(second));
  assert.ok(serializeManifest(first).endsWith('\n'));
  assert.ok(!/"(generatedAt|timestamp)"/.test(serializeManifest(first)));
});

test('buildManifest refuses a system with no pin', () => {
  const root = makeTree({ 'systems/seed/package.json': '{"version":"1.0.0"}' });
  assert.throws(() => buildManifest({ root, config, pins: {} }), /no gitlink pin/);
});

test('diffPins reports only the pins that moved', () => {
  const previous = {
    systems: [
      { name: 'seed', commit: 'aaaaaaa', version: '1.0.0', url: 'https://github.com/Vidoxlabs/seed' },
      { name: 'bloom', commit: 'bbbbbbb', version: '2.0.0', url: 'https://github.com/Vidoxlabs/bloom' }
    ]
  };
  const next = {
    systems: [
      {
        name: 'seed',
        commit: 'cccccccccccccccccccccccccccccccccccccccc',
        version: '1.1.0',
        url: 'https://github.com/Vidoxlabs/seed'
      },
      {
        name: 'bloom',
        commit: 'bbbbbbb',
        version: '2.0.0',
        url: 'https://github.com/Vidoxlabs/bloom'
      }
    ]
  };
  const moved = diffPins(previous, next);
  assert.equal(moved.length, 1);
  assert.equal(moved[0].name, 'seed');
  assert.equal(moved[0].from, 'aaaaaaa');
});

test('formatPinLine prints the short form of both pins', () => {
  assert.equal(
    formatPinLine({ name: 'seed', from: 'aaaaaaa1111', to: 'bbbbbbb2222' }),
    'seed: aaaaaaa -> bbbbbbb'
  );
});

test('formatSummary is one line per moved pin and empty when nothing moved', () => {
  assert.equal(formatSummary([]), '');
  assert.equal(
    formatSummary([
      { name: 'seed', from: 'aaaaaaa1111', to: 'bbbbbbb2222' },
      { name: 'bloom', from: 'ccccccc3333', to: 'ddddddd4444' }
    ]),
    'seed: aaaaaaa -> bbbbbbb\nbloom: ccccccc -> ddddddd'
  );
});

test('buildBumpBody carries a compare link per moved pin', () => {
  const body = buildBumpBody({
    moved: [
      {
        name: 'seed',
        url: 'https://github.com/Vidoxlabs/seed',
        from: 'aaaaaaa1111',
        to: 'bbbbbbb2222',
        version: '1.1.0',
        previousVersion: '1.0.0'
      }
    ]
  });
  assert.match(body, /\| seed \| aaaaaaa \| bbbbbbb \| 1\.0\.0 -> 1\.1\.0 \|/);
  assert.match(body, /https:\/\/github\.com\/Vidoxlabs\/seed\/compare\/aaaaaaa1111\.\.\.bbbbbbb2222/);
});
