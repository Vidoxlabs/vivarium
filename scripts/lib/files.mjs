import fs from 'node:fs';
import path from 'node:path';

import { NEEDLES_FILE, SYSTEMS_DIR } from './paths.mjs';
import { git } from './git.mjs';

/** Extensions that are never text, so never scanned for literals or links. */
const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.zip',
  '.gz',
  '.pdf'
]);

/**
 * Every file the umbrella tracks, as repository-relative paths.
 * Submodule contents are their own repositories, so the tree lists the gitlink
 * only and this returns nothing below systems/.
 * @param {string} root
 * @returns {string[]}
 */
export function trackedFiles(root) {
  const result = git(['ls-files', '-z'], { cwd: root, allowFailure: true });
  if (!result.ok) return [];
  return result.stdout
    .split('\u0000')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * @param {string} root
 * @param {string} file
 */
export function isBinaryFile(root, file) {
  if (BINARY_EXTENSIONS.has(path.extname(file).toLowerCase())) return true;
  const handle = fs.openSync(path.join(root, ...file.split('/')), 'r');
  try {
    const buffer = Buffer.alloc(8000);
    const read = fs.readSync(handle, buffer, 0, buffer.length, 0);
    return buffer.subarray(0, read).includes(0);
  } finally {
    fs.closeSync(handle);
  }
}

/**
 * @param {string} file
 */
export function isInsideSubmodules(file) {
  return file === SYSTEMS_DIR || file.startsWith(`${SYSTEMS_DIR}/`);
}

/**
 * Files the public-safety scan reads: tracked text outside systems/, without
 * the needles file itself.
 * @param {string} root
 * @returns {string[]}
 */
export function scannableFiles(root) {
  return trackedFiles(root).filter((file) => {
    if (isInsideSubmodules(file)) return false;
    if (file === NEEDLES_FILE) return false;
    if (file.split('/').some((part) => part === 'node_modules' || part === '.git')) return false;
    return !isBinaryFile(root, file);
  });
}

/**
 * Markdown the link checks read.
 * @param {string} root
 * @returns {string[]}
 */
export function markdownFiles(root) {
  return trackedFiles(root).filter(
    (file) => file.endsWith('.md') && !isInsideSubmodules(file)
  );
}

/**
 * TypeScript sources outside the submodules. The family is plain JavaScript.
 * @param {string} root
 * @returns {string[]}
 */
export function typescriptFiles(root) {
  return trackedFiles(root).filter(
    (file) => /\.(ts|tsx|mts|cts)$/.test(file) && !isInsideSubmodules(file)
  );
}

/**
 * Read a repository-relative text file.
 * @param {string} root
 * @param {string} file
 */
export function readText(root, file) {
  return fs.readFileSync(path.join(root, ...file.split('/')), 'utf8');
}
