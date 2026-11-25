#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  MARKERS,
  MAP_FILE,
  MANIFEST_FILE,
  README_FILE,
  SUMMARY_FILE,
  REPO_ROOT
} from './lib/paths.mjs';
import { syncSubmodules } from './lib/git.mjs';
import { readConfig } from './lib/config.mjs';
import { buildManifest, serializeManifest } from './lib/manifest.mjs';
import { buildGenerated, hasBlock, replaceBlock } from './lib/map.mjs';
import { readPins, runChecks } from './lib/check.mjs';
import { diffPins, formatSummary, buildBumpBody } from './lib/summary.mjs';

const USAGE = `Usage: node scripts/vivarium.mjs <command>

  sync    Move every system to the latest main, regenerate the manifest, the map,
          and the generated blocks in README.md. Writes .sync-summary.txt.
  map     Regenerate only the map and status blocks from the current pins.
  check   Offline checks: drift, submodule health, cross-links, scrub, TypeScript.
          --commits <range>   also scan the commit messages in that range
`;

/**
 * @param {string} file
 * @param {string} body
 */
function writeIfChanged(file, body) {
  const full = path.join(REPO_ROOT, ...file.split('/'));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const current = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  if (current === body) return false;
  fs.writeFileSync(full, body);
  return true;
}

/**
 * @param {string} root
 * @param {any} config
 * @param {any} manifest
 */
function regenerate(root, config, manifest) {
  const generated = buildGenerated(root, manifest);
  writeIfChanged(MANIFEST_FILE, serializeManifest(manifest));
  writeIfChanged(MAP_FILE, generated.systemMapDoc);

  const readmePath = path.join(root, ...README_FILE.split('/'));
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const map = hasBlock(readme, MARKERS.map);
    const status = hasBlock(readme, MARKERS.status);
    if (map && status) {
      readme = replaceBlock(readme, MARKERS.map, generated.mapBlock);
      readme = replaceBlock(readme, MARKERS.status, generated.statusBlock);
      writeIfChanged(README_FILE, readme);
    } else if (map || status) {
      throw new Error('README.md has only one of the two generated blocks; restore both markers');
    } else {
      process.stdout.write('README.md has no generated blocks; left it alone\n');
    }
  }
  return generated;
}

function sync() {
  const update = syncSubmodules(REPO_ROOT);
  if (!update.ok) {
    process.stderr.write(`${update.stderr.trim()}\n`);
    process.exit(1);
  }

  const previous = fs.existsSync(path.join(REPO_ROOT, MANIFEST_FILE))
    ? JSON.parse(fs.readFileSync(path.join(REPO_ROOT, MANIFEST_FILE), 'utf8'))
    : null;

  const config = readConfig(REPO_ROOT);
  const pins = readPins(REPO_ROOT, config);
  const manifest = buildManifest({ root: REPO_ROOT, config, pins });
  regenerate(REPO_ROOT, config, manifest);

  const moved = diffPins(previous, manifest);
  const summary = formatSummary(moved);
  fs.writeFileSync(path.join(REPO_ROOT, SUMMARY_FILE), summary ? `${summary}\n` : '');
  process.stdout.write(summary ? `${summary}\n` : 'no pins moved\n');

  if (process.argv.includes('--body') && moved.length) {
    process.stdout.write(`\n${buildBumpBody({ moved })}\n`);
  }
}

function map() {
  const config = readConfig(REPO_ROOT);
  const pins = readPins(REPO_ROOT, config);
  const manifest = buildManifest({ root: REPO_ROOT, config, pins });
  regenerate(REPO_ROOT, config, manifest);
  process.stdout.write('regenerated vivarium.json, docs/system-map.md, and the README blocks\n');
}

/**
 * @param {string[]} args
 */
function check(args) {
  const index = args.indexOf('--commits');
  const commits = index === -1 ? undefined : args[index + 1];
  const { findings, notes } = runChecks({ root: REPO_ROOT, commits });
  for (const note of notes) process.stdout.write(`note ${note}\n`);
  for (const finding of findings) {
    const where = finding.line ? `${finding.file}:${finding.line}` : finding.file;
    process.stdout.write(`${where} ${finding.rule} ${finding.message}\n`);
  }
  if (findings.length) {
    process.stdout.write(`\n${findings.length} finding(s). Run npm run sync, or fix the file named above.\n`);
    process.exit(1);
  }
  process.stdout.write('check passed\n');
}

const [command, ...rest] = process.argv.slice(2);
switch (command) {
  case 'sync':
    sync();
    break;
  case 'map':
    map();
    break;
  case 'check':
    check(rest);
    break;
  default:
    process.stdout.write(USAGE);
    process.exit(command ? 1 : 0);
}
