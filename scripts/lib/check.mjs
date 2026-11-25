import fs from 'node:fs';
import path from 'node:path';

import { CONFIG_FILE, MANIFEST_FILE, MAP_FILE, MARKERS, README_FILE } from './paths.mjs';
import { indexGitlink, checkoutHead, git, submoduleStatus } from './git.mjs';
import { readConfig, normaliseUrl } from './config.mjs';
import { readSystemFacts } from './facts.mjs';
import { buildManifest, serializeManifest } from './manifest.mjs';
import { buildGenerated, extractBlock, hasBlock } from './map.mjs';
import { checkLinks } from './links.mjs';
import { loadNeedles, scanText } from './scrub.mjs';
import { markdownFiles, readText, scannableFiles, typescriptFiles } from './files.mjs';

/**
 * @typedef {{ file: string, line: number, rule: string, message: string }} Finding
 */

/**
 * Parse .gitmodules into one entry per submodule.
 * @param {string} text
 * @returns {{ name: string, path: string, url: string, branch: string }[]}
 */
export function parseGitmodules(text) {
  const entries = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const header = /^\[submodule "([^"]+)"\]$/.exec(line);
    if (header) {
      current = { name: header[1], path: '', url: '', branch: '' };
      entries.push(current);
      continue;
    }
    if (!current) continue;
    const pair = /^(\w+)\s*=\s*(.+)$/.exec(line);
    if (!pair) continue;
    if (pair[1] === 'path') current.path = pair[2];
    if (pair[1] === 'url') current.url = pair[2];
    if (pair[1] === 'branch') current.branch = pair[2];
  }
  return entries;
}

/**
 * Read the current pins, keyed by system name.
 * @param {string} root
 * @param {any} config
 * @returns {Record<string, string>}
 */
export function readPins(root, config) {
  const status = submoduleStatus(root);
  /** @type {Record<string, string>} */
  const pins = {};
  for (const system of config.systems) {
    const entry = status.find((item) => item.path === system.path);
    if (entry) pins[system.name] = entry.commit;
  }
  return pins;
}

/**
 * @param {string} root
 * @param {string} file
 * @returns {string | null}
 */
function readIfPresent(root, file) {
  const full = path.join(root, ...file.split('/'));
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

/**
 * @param {Finding[]} findings
 * @param {string} file
 * @param {string} rule
 * @param {string} message
 * @param {number} [line]
 */
function add(findings, file, rule, message, line = 0) {
  findings.push({ file, line, rule, message });
}

/**
 * 6.1: the generated files must match the tree, and the three lists must agree.
 * @param {string} root
 * @param {ReturnType<typeof readConfig>} config
 * @param {any} manifest
 * @param {Finding[]} findings
 */
function checkDrift(root, config, manifest, findings) {
  const committedManifest = readIfPresent(root, MANIFEST_FILE);
  const expectedManifest = serializeManifest(manifest);
  if (committedManifest === null) {
    add(findings, MANIFEST_FILE, 'drift', 'vivarium.json is missing; run npm run sync');
  } else if (committedManifest !== expectedManifest) {
    add(findings, MANIFEST_FILE, 'drift', 'vivarium.json does not match the pinned tree; run npm run sync');
  }

  const generated = buildGenerated(root, manifest);
  const committedMap = readIfPresent(root, MAP_FILE);
  if (committedMap === null) {
    add(findings, MAP_FILE, 'drift', 'docs/system-map.md is missing; run npm run sync');
  } else if (committedMap !== generated.systemMapDoc) {
    add(findings, MAP_FILE, 'drift', 'docs/system-map.md is stale; run npm run sync');
  }

  const readme = readIfPresent(root, README_FILE);
  if (readme !== null) {
    for (const [marker, block] of [
      [MARKERS.map, generated.mapBlock],
      [MARKERS.status, generated.statusBlock]
    ]) {
      const present = hasBlock(readme, marker);
      const partial =
        readme.includes(`<!-- ${marker}:start -->`) !== readme.includes(`<!-- ${marker}:end -->`);
      if (partial) {
        add(findings, README_FILE, 'drift', `the ${marker} markers are unbalanced`);
      } else if (present && extractBlock(readme, marker) !== block) {
        add(findings, README_FILE, 'drift', `the ${marker} block is stale; run npm run sync`);
      }
    }
  }

  // .gitmodules, systems.config.json, and vivarium.json list the same systems.
  const gitmodulesText = readIfPresent(root, '.gitmodules');
  const fromGitmodules = gitmodulesText ? parseGitmodules(gitmodulesText) : [];
  const fromManifest = manifest.systems;
  const names = {
    config: new Set(config.systems.map((system) => system.name)),
    gitmodules: new Set(fromGitmodules.map((entry) => entry.path.replace(/^systems\//, ''))),
    manifest: new Set(fromManifest.map((system) => system.name))
  };
  for (const [label, set] of Object.entries(names)) {
    if (set.size !== names.config.size) {
      add(findings, CONFIG_FILE, 'identity', `the ${label} list holds ${set.size} systems, the config holds ${names.config.size}`);
    }
    for (const name of names.config) {
      if (!set.has(name)) add(findings, CONFIG_FILE, 'identity', `the ${label} list is missing ${name}`);
    }
  }

  for (const system of config.systems) {
    const entry = fromGitmodules.find((item) => item.path === system.path);
    if (!entry) continue;
    if (normaliseUrl(`https://github.com/Vidoxlabs/${system.name}.git`) !== normaliseUrl(entry.url)) {
      add(findings, '.gitmodules', 'identity', `${system.path} points at a different clone URL`);
    }
    if (entry.branch !== system.branch) {
      add(findings, '.gitmodules', 'identity', `${system.path} tracks ${entry.branch || 'no branch'}, the config says ${system.branch}`);
    }
    const recorded = fromManifest.find((item) => item.name === system.name);
    const gitmodulesUrl = entry.url;
    if (recorded && normaliseUrl(gitmodulesUrl) !== normaliseUrl(recorded.url)) {
      add(findings, MANIFEST_FILE, 'identity', `${system.name} records a different URL than .gitmodules`);
    }
  }
}

/**
 * 6.2: every submodule is initialised, at its gitlink, and readable.
 * @param {string} root
 * @param {ReturnType<typeof readConfig>} config
 * @param {Finding[]} findings
 */
function checkHealth(root, config, findings) {
  const status = submoduleStatus(root);
  for (const system of config.systems) {
    const entry = status.find((item) => item.path === system.path);
    if (!entry) {
      add(findings, '.gitmodules', 'health', `${system.path} is not initialized; run git submodule update --init --recursive`);
      continue;
    }
    if (entry.state === '-') {
      add(findings, system.path, 'health', 'submodule is not initialized; run git submodule update --init --recursive');
    } else if (entry.state === '+') {
      add(findings, system.path, 'health', 'checked-out commit differs from the gitlink; run npm run sync');
    } else if (entry.state === 'U') {
      add(findings, system.path, 'health', 'submodule has merge conflicts');
    }
    const head = checkoutHead(root, system.path);
    const gitlink = indexGitlink(root, system.path);
    if (head && gitlink && head !== gitlink) {
      add(findings, system.path, 'health', 'checked-out commit differs from the gitlink');
    }
    const facts = readSystemFacts(root, system.path);
    for (const [present, file] of [
      [facts.hasAgents, 'AGENTS.md'],
      [facts.hasLicense, 'LICENSE'],
      [facts.hasPackage, 'package.json']
    ]) {
      if (!present) add(findings, `${system.path}/${file}`, 'health', 'file is missing or unreadable');
    }
  }
}

/**
 * Run every check. Offline: nothing here touches the network.
 * @param {{ root: string, commits?: string }} input
 * @returns {{ findings: Finding[], notes: string[] }}
 */
export function runChecks({ root, commits }) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {string[]} */
  const notes = [];

  const config = readConfig(root);
  const pins = readPins(root, config);
  const manifest = buildManifest({ root, config, pins });

  checkDrift(root, config, manifest, findings);
  checkHealth(root, config, findings);

  const documents = markdownFiles(root).map((file) => ({ file, text: readText(root, file) }));
  for (const finding of checkLinks(root, documents)) findings.push(finding);

  const needles = loadNeedles(root);
  for (const file of scannableFiles(root)) {
    const text = readText(root, file);
    for (const finding of scanText(text, needles, { kind: 'files' })) {
      findings.push({ file, ...finding });
    }
  }

  if (commits) {
    const output = git(['log', '--format=%H%x00%B%x01', commits], { cwd: root, allowFailure: true });
    if (!output.ok) {
      notes.push(`commit range ${commits} could not be read; skipped the commit-message scan`);
    } else {
      const chunks = output.stdout.split('\u0001').filter((chunk) => chunk.trim());
      for (const chunk of chunks) {
        const [sha, ...rest] = chunk.split('\u0000');
        const body = rest.join('\u0000');
        for (const finding of scanText(body, needles, { kind: 'commits' })) {
          findings.push({ file: `commit ${sha.trim().slice(0, 7)}`, line: finding.line, rule: finding.rule, message: finding.message });
        }
      }
    }
  }

  for (const file of typescriptFiles(root)) {
    add(findings, file, 'typescript', 'TypeScript files are not allowed outside systems/');
  }

  if (!hasBlock(readIfPresent(root, README_FILE) ?? '', MARKERS.map)) {
    notes.push('README.md has no generated blocks yet; the map and status checks are skipped');
  }

  return { findings, notes };
}
