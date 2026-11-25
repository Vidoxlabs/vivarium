import { spawnSync } from 'node:child_process';

/**
 * Run git and return its output.
 * @param {string[]} args
 * @param {{ cwd?: string, allowFailure?: boolean }} [options]
 */
export function git(args, options = {}) {
  const { cwd, allowFailure = false } = options;
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error) throw result.error;
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`git ${args.join(' ')} failed: ${stderr.trim() || `exit ${result.status}`}`);
  }
  return { ok: result.status === 0, status: result.status ?? 1, stdout, stderr };
}

/**
 * Parse `git submodule status` output.
 * @param {string} output
 * @returns {{ state: string, commit: string, path: string, describe: string }[]}
 */
export function parseSubmoduleStatus(output) {
  const entries = [];
  for (const line of output.split('\n')) {
    if (!line.trim()) continue;
    const match = /^([ +\-U])([0-9a-f]{40,64}) ([^ ]+)(?: \((.*)\))?$/.exec(line);
    if (!match) continue;
    entries.push({
      state: match[1],
      commit: match[2],
      path: match[3],
      describe: match[4] ?? ''
    });
  }
  return entries;
}

/** @param {string} root */
export function submoduleStatus(root) {
  return parseSubmoduleStatus(git(['submodule', 'status'], { cwd: root }).stdout);
}

/**
 * The gitlink SHA recorded in the umbrella index for one submodule path.
 * @param {string} root
 * @param {string} submodulePath
 * @returns {string | null}
 */
export function indexGitlink(root, submodulePath) {
  const result = git(['ls-tree', 'HEAD', '--', submodulePath], { cwd: root, allowFailure: true });
  if (!result.ok || !result.stdout.trim()) return null;
  const match = /^160000 commit ([0-9a-f]{40,64})\t/.exec(result.stdout.trim());
  return match ? match[1] : null;
}

/**
 * The commit a submodule working tree is checked out at, read locally.
 * @param {string} root
 * @param {string} submodulePath
 * @returns {string | null}
 */
export function checkoutHead(root, submodulePath) {
  const result = git(['rev-parse', 'HEAD'], {
    cwd: `${root}/${submodulePath}`,
    allowFailure: true
  });
  return result.ok ? result.stdout.trim() : null;
}

/**
 * Move every submodule to the tip of its tracked branch and stage the pointers.
 * @param {string} root
 * @returns {{ ok: boolean, stdout: string, stderr: string }}
 */
export function syncSubmodules(root) {
  const update = git(['submodule', 'update', '--init', '--remote', '--depth', '1'], {
    cwd: root,
    allowFailure: true
  });
  if (!update.ok) return update;
  git(['add', '--', 'systems'], { cwd: root, allowFailure: true });
  return update;
}

/**
 * Subject and body of every commit in a range.
 * @param {string} root
 * @param {string} range
 * @returns {{ sha: string, body: string }[]}
 */
export function commitMessages(root, range) {
  const result = git(['log', '--format=%H%x00%B%x01', range], { cwd: root, allowFailure: true });
  if (!result.ok) return [];
  return result.stdout
    .split('\u0001')
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [sha, ...rest] = chunk.split('\u0000');
      return { sha: sha.trim().slice(0, 7), body: rest.join('\u0000').trim() };
    });
}
