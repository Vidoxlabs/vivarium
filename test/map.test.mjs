import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAP_LEGEND,
  buildMapBlock,
  buildMermaid,
  buildStatusBlock,
  buildSystemMapDoc,
  extractBlock,
  hasBlock,
  replaceBlock,
  shortPin
} from '../scripts/lib/map.mjs';
import { makeTree } from './helpers.mjs';

const manifest = {
  schema: 1,
  umbrella: 'vivarium',
  systems: [
    {
      name: 'seed',
      path: 'systems/seed',
      url: 'https://github.com/Vidoxlabs/seed',
      branch: 'main',
      commit: '0d158cd7e1fb5098162c98d303ddde8172001062',
      version: '0.10.0',
      license: 'MIT',
      layer: 'floor',
      role: 'Harness floor',
      owns: ['contracts'],
      importsToday: [],
      agentsFile: 'systems/seed/AGENTS.md'
    },
    {
      name: 'drosera',
      path: 'systems/drosera',
      url: 'https://github.com/Vidoxlabs/drosera',
      branch: 'main',
      commit: '34c5c29c15f1d1f8baa6de6d5016f4809d68f098',
      version: '2.4.0',
      license: 'MIT',
      layer: 'peer',
      role: 'Tools',
      owns: ['tool faces'],
      importsToday: [],
      agentsFile: 'systems/drosera/AGENTS.md'
    },
    {
      name: 'capillary',
      path: 'systems/capillary',
      url: 'https://github.com/Vidoxlabs/capillary',
      branch: 'main',
      commit: '0caa855cca2780f29d1d11167f4f352ba28ee9f5',
      version: '1.3.0',
      license: 'MIT',
      layer: 'peer',
      role: 'Context',
      owns: ['context'],
      importsToday: [],
      agentsFile: 'systems/capillary/AGENTS.md'
    },
    {
      name: 'myosotis',
      path: 'systems/myosotis',
      url: 'https://github.com/Vidoxlabs/myosotis',
      branch: 'main',
      commit: '4c7a8b8ef632c8b36a2f92d9be6d1cefdcf10db9',
      version: '1.2.0',
      license: 'MIT',
      layer: 'peer',
      role: 'Memory',
      owns: ['consent'],
      importsToday: [],
      agentsFile: 'systems/myosotis/AGENTS.md'
    },
    {
      name: 'bloom',
      path: 'systems/bloom',
      url: 'https://github.com/Vidoxlabs/bloom',
      branch: 'main',
      commit: '4e61cca4ec1d158cd592afcd56a3280489aceedf',
      version: '0.12.0',
      license: 'MIT',
      layer: 'composer',
      role: 'User interface',
      owns: ['first-run setup'],
      importsToday: [
        { name: 'drosera', pin: '34c5c29c15f1d1f8baa6de6d5016f4809d68f098' },
        { name: 'seed', pin: '0d158cd7e1fb5098162c98d303ddde8172001062' }
      ],
      agentsFile: 'systems/bloom/AGENTS.md'
    },
    {
      name: 'trellis',
      path: 'systems/trellis',
      url: 'https://github.com/Vidoxlabs/trellis',
      branch: 'main',
      commit: '76d59fb1edb6b7093ae8a42ca29e4bfbd524f5e1',
      version: '0.8.0',
      license: 'MIT',
      layer: 'outside',
      role: 'Testing',
      owns: ['probes'],
      importsToday: [],
      agentsFile: 'systems/trellis/AGENTS.md'
    }
  ]
};

test('shortPin keeps seven characters', () => {
  assert.equal(shortPin('0d158cd7e1fb5098162c98d303ddde8172001062'), '0d158cd');
});

test('the diagram declares every system, the imports, contracts, and probes', () => {
  const mermaid = buildMermaid(manifest);
  assert.match(mermaid, /^flowchart BT/);
  for (const system of manifest.systems) assert.ok(mermaid.includes(`    ${system.name}["`), system.name);
  assert.match(mermaid, /bloom -->\|imports seed 0d158cd\| seed/);
  assert.match(mermaid, /bloom -->\|imports drosera 34c5c29\| drosera/);
  assert.match(mermaid, /capillary -\.->\|contracts\| seed/);
  assert.match(mermaid, /bloom -\.->\|contracts\| seed/);
  assert.match(mermaid, /capillary -\.->\|"context to memory, planned"\| myosotis/);
  assert.match(mermaid, /trellis -\.->\|probes\| bloom/);
  assert.equal(mermaid.match(/linkStyle/g).length, 2);
  assert.ok(!mermaid.includes('trellis -.->|probes| trellis'));
});

test('the diagram is deterministic and ends with the class definitions', () => {
  assert.equal(buildMermaid(manifest), buildMermaid(manifest));
  assert.match(buildMermaid(manifest), /classDef floor stroke-width:3px/);
});

test('the map block is fenced by markers and carries the legend', () => {
  const block = buildMapBlock(manifest);
  assert.ok(block.startsWith('<!-- vivarium:map:start -->'));
  assert.ok(block.endsWith('<!-- vivarium:map:end -->'));
  assert.ok(block.includes('```mermaid'));
  assert.ok(block.includes(MAP_LEGEND));
});

test('the status block links each pin and badges each system workflow', () => {
  const root = makeTree({
    'systems/seed/.github/workflows/ci.yml': 'name: ci\n',
    'systems/bloom/.github/workflows/check.yml': 'name: check\n'
  });
  const block = buildStatusBlock(root, manifest);
  assert.ok(block.startsWith('<!-- vivarium:status:start -->'));
  assert.match(
    block,
    /\| seed \| \[0d158cd\]\(https:\/\/github\.com\/Vidoxlabs\/seed\/commit\/0d158cd7e1fb5098162c98d303ddde8172001062\) \| 0\.10\.0 \|/
  );
  assert.ok(block.includes('https://github.com/Vidoxlabs/bloom/actions/workflows/check.yml/badge.svg'));
  assert.ok(block.includes('no workflow'));
});

test('the system map document repeats the diagram and lists the pins', () => {
  const doc = buildSystemMapDoc(manifest);
  assert.match(doc, /^# System map/);
  assert.ok(doc.includes('```mermaid'));
  assert.match(doc, /\| \[seed\]\(https:\/\/github\.com\/Vidoxlabs\/seed\) \| floor \|/);
});

test('blocks can be detected, extracted, and replaced in place', () => {
  const readme = [
    '# Title',
    '',
    buildMapBlock(manifest),
    '',
    'between',
    '',
    buildStatusBlock(makeTree({}), manifest),
    '',
    'tail'
  ].join('\n');
  assert.ok(hasBlock(readme, 'vivarium:map'));
  assert.ok(hasBlock(readme, 'vivarium:status'));
  assert.equal(extractBlock(readme, 'vivarium:map'), buildMapBlock(manifest));
  assert.ok(!hasBlock(readme, 'vivarium:other'));
  assert.equal(extractBlock(readme, 'vivarium:other'), null);

  const replaced = replaceBlock(readme, 'vivarium:map', '<!-- vivarium:map:start -->\nnew\n<!-- vivarium:map:end -->');
  assert.ok(replaced.includes('new'));
  assert.ok(!replaced.includes('```mermaid'));
  assert.ok(replaced.includes('between'));
  assert.throws(() => replaceBlock('# no blocks', 'vivarium:map', 'x'), /missing/);
});
