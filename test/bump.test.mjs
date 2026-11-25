import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBumpBody, formatSummary } from '../scripts/lib/summary.mjs';

const moved = [
  {
    name: 'seed',
    url: 'https://github.com/Vidoxlabs/seed',
    from: '0d158cd7e1fb5098162c98d303ddde8172001062',
    to: 'f444b3812345678901234567890123456789abcd',
    version: '0.11.0',
    previousVersion: '0.10.0'
  },
  {
    name: 'bloom',
    url: 'https://github.com/Vidoxlabs/bloom',
    from: '4e61cca4ec1d158cd592afcd56a3280489aceedf',
    to: '638e2522ec1d158cd592afcd56a3280489aceedf',
    version: '0.12.0',
    previousVersion: '0.12.0'
  }
];

test('the summary file format is one line per system, keyed by name', () => {
  const summary = formatSummary(moved);
  const lines = summary.split('\n');
  assert.equal(lines.length, 2);
  assert.equal(lines[0], 'seed: 0d158cd -> f444b38');
  assert.equal(lines[1], 'bloom: 4e61cca -> 638e252');
  // The workflow lifts the names from this file for the commit subject.
  assert.deepEqual(
    lines.map((line) => line.split(':')[0]),
    ['seed', 'bloom']
  );
});

test('the bump body is deterministic, so a re-run rewrites the same text', () => {
  assert.equal(buildBumpBody({ moved }), buildBumpBody({ moved }));
});

test('the bump body shows a version change only when the version moved', () => {
  const body = buildBumpBody({ moved });
  assert.match(body, /seed \| 0d158cd \| f444b38 \| 0\.10\.0 -> 0\.11\.0 \|/);
  assert.match(body, /bloom \| 4e61cca \| 638e252 \| 0\.12\.0 \|/);
});

test('the bump body links the compare view for every moved pin', () => {
  const body = buildBumpBody({ moved });
  for (const entry of moved) {
    assert.ok(body.includes(`${entry.url}/compare/${entry.from}...${entry.to}`), entry.name);
  }
});

test('a pin with no previous commit renders without a compare link', () => {
  const body = buildBumpBody({
    moved: [
      {
        name: 'trellis',
        url: 'https://github.com/Vidoxlabs/trellis',
        from: '',
        to: '76d59fb1edb6b7093ae8a42ca29e4bfbd524f5e1',
        version: '0.8.0',
        previousVersion: ''
      }
    ]
  });
  assert.match(body, /\| trellis \| new \| 76d59fb \| 0\.8\.0 \| - \|/);
});
