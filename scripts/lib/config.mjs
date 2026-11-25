import fs from 'node:fs';
import path from 'node:path';

import { CONFIG_FILE } from './paths.mjs';

/** Layers a system can sit in, in the order the map draws them. */
export const LAYERS = ['floor', 'peer', 'composer', 'outside'];

/**
 * Read and validate the hand-edited systems config.
 * @param {string} root
 */
export function readConfig(root) {
  const file = path.join(root, CONFIG_FILE);
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  const problems = validateConfig(config);
  if (problems.length) {
    throw new Error(`${CONFIG_FILE} is not valid:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }
  return config;
}

/**
 * @param {unknown} config
 * @returns {string[]} human-readable problems, empty when valid
 */
export function validateConfig(config) {
  const problems = [];
  if (!config || typeof config !== 'object') return ['the file does not contain an object'];
  const value = /** @type {Record<string, any>} */ (config);
  if (value.schema !== 1) problems.push('schema must be 1');
  if (value.umbrella !== 'vivarium') problems.push('umbrella must be "vivarium"');
  if (!Array.isArray(value.systems) || value.systems.length === 0) {
    problems.push('systems must be a non-empty array');
    return problems;
  }
  const seen = new Set();
  for (const [index, system] of value.systems.entries()) {
    const at = `systems[${index}]`;
    if (typeof system.name !== 'string' || !/^[a-z]+$/.test(system.name)) {
      problems.push(`${at}.name must be a lowercase word`);
      continue;
    }
    if (seen.has(system.name)) problems.push(`${at}.name repeats ${system.name}`);
    seen.add(system.name);
    if (system.path !== `systems/${system.name}`) {
      problems.push(`${at}.path must be systems/<name>`);
    }
    if (typeof system.url !== 'string' || !system.url.startsWith('https://github.com/Vidoxlabs/')) {
      problems.push(`${at}.url must be an https clone URL under github.com/Vidoxlabs`);
    }
    if (typeof system.branch !== 'string' || !system.branch) problems.push(`${at}.branch is required`);
    if (!LAYERS.includes(system.layer)) problems.push(`${at}.layer must be one of ${LAYERS.join(', ')}`);
    if (typeof system.role !== 'string' || !system.role) problems.push(`${at}.role is required`);
    if (!Array.isArray(system.owns) || system.owns.length === 0 || system.owns.some((o) => typeof o !== 'string' || !o)) {
      problems.push(`${at}.owns must be a non-empty array of strings`);
    }
  }
  const floors = value.systems.filter((s) => s.layer === 'floor').map((s) => s.name);
  if (floors.length !== 1) problems.push('exactly one system must sit in the floor layer');
  const composers = value.systems.filter((s) => s.layer === 'composer').map((s) => s.name);
  if (composers.length !== 1) problems.push('exactly one system must sit in the composer layer');
  return problems;
}

/**
 * Normalise a clone URL for comparison (drop a trailing .git).
 * @param {string} url
 */
export function normaliseUrl(url) {
  return url.replace(/\.git$/, '').replace(/\/$/, '');
}
