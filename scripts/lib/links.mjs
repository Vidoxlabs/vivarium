import fs from 'node:fs';
import path from 'node:path';

/** Repositories a public Vidoxlabs link may name. */
export const REPO_ALLOWLIST = [
  'seed',
  'capillary',
  'myosotis',
  'drosera',
  'aestivation',
  'bloom',
  'trellis',
  'vivarium',
  'docs',
  'videsign',
  '.github'
];

const LINK = /!?\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\)/g;
const GITHUB_VIDOXLABS = /https?:\/\/(?:www\.)?github\.com\/Vidoxlabs\/([A-Za-z0-9._-]+)/g;
const SYSTEMS_PATH = /(?:^|[\s`'"([])(systems\/[A-Za-z0-9._\/-]+)/g;

/**
 * Skip targets that are not paths inside this repository.
 * @param {string} target
 */
export function isExternal(target) {
  return /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target);
}

/**
 * Resolve a relative link to a path relative to the repository root.
 * @param {string} file repository-relative path of the file holding the link
 * @param {string} target
 */
export function resolveRelative(file, target) {
  const withoutAnchor = target.split('#')[0].split('?')[0];
  if (!withoutAnchor) return null;
  const base = path.posix.dirname(file);
  const joined = withoutAnchor.startsWith('/')
    ? withoutAnchor.slice(1)
    : path.posix.normalize(path.posix.join(base, withoutAnchor));
  return path.posix.normalize(joined);
}

/**
 * @param {string} root
 * @param {string} file repository-relative path
 * @param {string} text
 * @returns {{ line: number, rule: string, message: string }[]}
 */
export function checkRelativeLinks(root, file, text) {
  const findings = [];
  const lines = text.split('\n');
  for (const [index, line] of lines.entries()) {
    LINK.lastIndex = 0;
    let match;
    while ((match = LINK.exec(line))) {
      const target = match[1];
      if (isExternal(target)) continue;
      const resolved = resolveRelative(file, target);
      if (!resolved) continue;
      if (!fs.existsSync(path.join(root, ...resolved.split('/')))) {
        findings.push({
          line: index + 1,
          rule: 'links',
          message: `relative link does not resolve: ${target}`
        });
      }
    }
  }
  return findings;
}

/**
 * @param {string} file
 * @param {string} text
 * @param {string[]} [allowlist]
 * @returns {{ line: number, rule: string, message: string }[]}
 */
export function checkGithubRepos(file, text, allowlist = REPO_ALLOWLIST) {
  const findings = [];
  for (const [index, line] of text.split('\n').entries()) {
    GITHUB_VIDOXLABS.lastIndex = 0;
    let match;
    while ((match = GITHUB_VIDOXLABS.exec(line))) {
      const repo = match[1].replace(/\.git$/, '');
      if (!allowlist.includes(repo)) {
        findings.push({
          line: index + 1,
          rule: 'links',
          message: `Vidoxlabs repository link is not on the allowlist: ${repo}`
        });
      }
    }
  }
  return findings;
}

/**
 * Every systems/<name>/... path mentioned in an umbrella document must exist in
 * the checked-out submodule. Angle brackets, globs and brace forms are patterns,
 * not paths, so they are skipped.
 * @param {string} root
 * @param {string} file
 * @param {string} text
 * @returns {{ line: number, rule: string, message: string }[]}
 */
export function checkSystemsPaths(root, file, text) {
  const findings = [];
  for (const [index, line] of text.split('\n').entries()) {
    SYSTEMS_PATH.lastIndex = 0;
    let match;
    while ((match = SYSTEMS_PATH.exec(line))) {
      const target = match[1].replace(/[.,;:)]+$/, '');
      if (/[<>*{}]/.test(target)) continue;
      if (!fs.existsSync(path.join(root, ...target.split('/')))) {
        findings.push({
          line: index + 1,
          rule: 'links',
          message: `system path does not exist in the tree: ${target}`
        });
      }
    }
  }
  return findings;
}

/**
 * @param {string} root
 * @param {{ file: string, text: string }[]} documents
 * @param {string[]} [allowlist]
 */
export function checkLinks(root, documents, allowlist = REPO_ALLOWLIST) {
  const findings = [];
  for (const { file, text } of documents) {
    for (const finding of checkRelativeLinks(root, file, text)) findings.push({ file, ...finding });
    for (const finding of checkGithubRepos(file, text, allowlist)) findings.push({ file, ...finding });
    for (const finding of checkSystemsPaths(root, file, text)) findings.push({ file, ...finding });
  }
  return findings;
}
