import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Write a throwaway tree and return its root.
 * @param {Record<string, string>} files relative paths to contents
 */
export function makeTree(files = {}) {
  const root = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vivarium-')), 'tree');
  fs.mkdirSync(root, { recursive: true });
  for (const [file, contents] of Object.entries(files)) {
    const full = path.join(root, ...file.split('/'));
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
  return root;
}

/**
 * A throwaway tree that is also a git repository with everything staged.
 * @param {Record<string, string>} files
 */
export function gitTree(files = {}) {
  const root = makeTree(files);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '-A'], { cwd: root });
  return root;
}

/**
 * Build a fixture string from fragments, so no forbidden literal is stored in
 * this repository.
 * @param {...string} fragments
 */
export function fixture(...fragments) {
  return fragments.join('');
}
