import assert from 'node:assert/strict';
import test from 'node:test';

import { digest, loadNeedles, scanText, tokenize } from '../scripts/lib/scrub.mjs';
import { scannableFiles, typescriptFiles } from '../scripts/lib/files.mjs';
import { REPO_ROOT } from '../scripts/lib/paths.mjs';
import { fixture, gitTree, makeTree } from './helpers.mjs';

const SLASH = fixture(String.fromCharCode(47));

/** A needles set whose token digest is built at runtime. */
function needlesFor(word) {
  return { tokenSha256: new Set([digest(word)]), patterns: [] };
}

test('the committed needles file holds the ten digests and the rule set', () => {
  const needles = loadNeedles(REPO_ROOT);
  assert.equal(needles.tokenSha256.size, 10);
  const ids = needles.patterns.map((pattern) => pattern.id);
  for (const expected of [
    'workstation-path',
    'private-ipv4',
    'loopback-host',
    'host-with-port',
    'workers-subdomain',
    'hosting-dashboard',
    'drive-folder',
    'drive-file',
    'hex32',
    'secret-openai',
    'secret-github',
    'secret-aws',
    'secret-google',
    'secret-slack',
    'model-suffix',
    'coined-product-name',
    'co-authored-by'
  ]) {
    assert.ok(ids.includes(expected), `missing pattern ${expected}`);
  }
});

test('tokenize lowercases and splits on non-alphanumerics', () => {
  assert.deepEqual(tokenize('Hello, World!'), ['hello', 'world', '']);
});

test('a hashed token is reported by line, never by word', () => {
  const word = fixture('priv', 'ate', 'word');
  const findings = scanText(`first line\nthe ${word} appears here\n`, needlesFor(word));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].line, 2);
  assert.ok(!findings[0].message.includes(word));
});

// Each rule fires on a fixture built from fragments, so this file never stores
// the literal it is testing for.
const CASES = [
  ['workstation-path', fixture(SLASH, 'Users', SLASH, 'someone', SLASH, 'project')],
  ['private-ipv4', fixture('10', '.', '0', '.', '0', '.', '7')],
  ['private-ipv4', fixture('192', '.', '168', '.', '1', '.', '20')],
  ['loopback-host', fixture('local', 'host')],
  ['loopback-host', fixture('127', '.', '0', '.', '0', '.', '1')],
  ['host-with-port', fixture('name', '.', 'example', ':', '80', '80')],
  ['workers-subdomain', fixture('demo', '.', 'workers', '.', 'dev')],
  ['hosting-dashboard', fixture('dash', '.', 'cloudflare', '.', 'com')],
  ['drive-folder', fixture('drive', '.', 'google', '.', 'com', SLASH, 'x')],
  ['drive-file', fixture('docs', '.', 'google', '.', 'com', SLASH, 'document', SLASH, 'd', SLASH, 'abc')],
  ['hex32', fixture('0123456789abcdef', '0123456789abcdef')],
  ['secret-openai', fixture('s', 'k', '-', 'a'.repeat(24))],
  ['secret-github', fixture('g', 'h', 'p', '_', 'a'.repeat(24))],
  ['secret-aws', fixture('AK', 'IA', 'ABCDEFGHIJKLMNOP')],
  ['secret-google', fixture('AI', 'za', 'a'.repeat(35))],
  ['secret-slack', fixture('xo', 'xb', '-', 'a'.repeat(24))],
  ['model-suffix', fixture('Pro', '-', 'L1')],
  ['coined-product-name', fixture('Vi', 'Orchid')]
];

for (const [id, text] of CASES) {
  test(`the ${id} pattern fires on its fixture`, () => {
    const needles = loadNeedles(REPO_ROOT);
    const findings = scanText(`lead in\n${text}\n`, needles);
    assert.ok(
      findings.some((finding) => finding.rule === `scrub-pattern:${id}`),
      `${id} did not fire`
    );
    assert.ok(findings.every((finding) => finding.line >= 1));
  });
}

test('an ordinary paragraph with a clock time is not a finding', () => {
  const needles = loadNeedles(REPO_ROOT);
  const text = 'The run finished at 06:05 and the file is named in the list below.';
  assert.deepEqual(scanText(text, needles), []);
});

test('the co-author rule only applies to commit messages', () => {
  const needles = loadNeedles(REPO_ROOT);
  const text = `${fixture('Co', '-', 'authored', '-', 'by')}: someone`;
  assert.deepEqual(scanText(text, needles, { kind: 'files' }), []);
  assert.equal(scanText(text, needles, { kind: 'commits' }).length, 1);
});

test('scanning skips the submodules, the needles file, and binaries', () => {
  const root = gitTree({
    'README.md': '# Readme\n',
    'scripts/scrub-needles.json': '{"tokenSha256":[],"patterns":[]}\n',
    'systems/seed/README.md': '# Seed\n',
    'systems/seed/leak.md': `${fixture('10', '.', '0', '.', '0', '.', '7')}\n`,
    '.github/assets/pixel.png': '\u0000\u0000\u0000'
  });
  const files = scannableFiles(root);
  assert.deepEqual(files, ['README.md']);
});

test('TypeScript outside the submodules is caught', () => {
  const root = gitTree({ 'scripts/typed.ts': 'export {};\n' });
  assert.deepEqual(typescriptFiles(root), ['scripts/typed.ts']);
});

test('a tree with no git repository scans nothing rather than throwing', () => {
  const root = makeTree({ 'README.md': '# Readme\n' });
  assert.deepEqual(scannableFiles(root), []);
});
