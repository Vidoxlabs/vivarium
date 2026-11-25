import path from 'node:path';

import { readSystemFacts } from './facts.mjs';

export const MANIFEST_SCHEMA = 1;

/**
 * Build the pinned manifest. Deterministic: same tree in, same bytes out,
 * with no timestamps and the systems in systems.config.json order.
 * @param {{ root: string, config: any, pins: Record<string, string> }} input
 */
export function buildManifest({ root, config, pins }) {
  const systems = config.systems.map((entry) => {
    const facts = readSystemFacts(root, entry.path);
    const commit = pins[entry.name];
    if (!commit) throw new Error(`no gitlink pin recorded for ${entry.name}`);
    return {
      name: entry.name,
      path: entry.path,
      url: entry.url,
      branch: entry.branch,
      commit,
      version: facts.version,
      license: facts.license,
      layer: entry.layer,
      role: entry.role,
      owns: entry.owns,
      importsToday: facts.importsToday,
      agentsFile: `${entry.path}/AGENTS.md`
    };
  });
  return { schema: MANIFEST_SCHEMA, umbrella: 'vivarium', systems };
}

/**
 * @param {any} manifest
 * @returns {string} JSON text with a trailing newline
 */
export function serializeManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/**
 * Index the manifest by system name.
 * @param {any} manifest
 */
export function byName(manifest) {
  return /** @type {Map<string, any>} */ (new Map(manifest.systems.map((s) => [s.name, s])));
}

/**
 * Workflow badge path for a system, using the workflow file in its own tree.
 * @param {any} system
 * @param {string | null} workflowFile
 */
export function badgePath(system, workflowFile) {
  const file = workflowFile ?? 'ci.yml';
  return `${system.url}/actions/workflows/${file}/badge.svg`;
}

/**
 * Render the history link for one moved pin.
 * @param {string} url
 * @param {string} from
 * @param {string} to
 */
export function compareUrl(url, from, to) {
  return `${url}/compare/${from}...${to}`;
}

/**
 * Resolve a manifest path against the repository root.
 * @param {string} root
 * @param {string} relative
 */
export function resolveIn(root, relative) {
  return path.join(root, ...relative.split('/'));
}
