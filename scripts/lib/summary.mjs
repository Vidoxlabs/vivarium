import { compareUrl } from './manifest.mjs';
import { shortPin } from './map.mjs';

/**
 * @typedef {{ name: string, url: string, from: string, to: string, version: string, previousVersion: string }} MovedPin
 */

/**
 * @param {{ name: string, from: string, to: string }} entry
 */
export function formatPinLine(entry) {
  return `${entry.name}: ${shortPin(entry.from)} -> ${shortPin(entry.to)}`;
}

/**
 * The summary written to .sync-summary.txt and printed by `npm run sync`.
 * @param {{ name: string, from: string, to: string }[]} moved
 * @returns {string} one line per moved pin, no trailing newline; empty when nothing moved
 */
export function formatSummary(moved) {
  return moved.map(formatPinLine).join('\n');
}

/**
 * Compare two manifests and list the pins that moved.
 * @param {any | null} previous
 * @param {any} next
 * @returns {MovedPin[]}
 */
export function diffPins(previous, next) {
  /** @type {Map<string, any>} */
  const before = new Map((previous?.systems ?? []).map((system) => [system.name, system]));
  const moved = [];
  for (const system of next.systems) {
    const old = before.get(system.name);
    if (old && old.commit === system.commit) continue;
    moved.push({
      name: system.name,
      url: system.url,
      from: old ? old.commit : '',
      to: system.commit,
      version: system.version,
      previousVersion: old ? old.version : ''
    });
  }
  return moved;
}

/**
 * Pull-request body for a bump. Deterministic, so a re-run produces the same body.
 * @param {{ moved: MovedPin[], generatedAt?: string }} input
 * @returns {string}
 */
export function buildBumpBody({ moved }) {
  const lines = [
    'Pins moved by the scheduled bump of the seven systems.',
    '',
    '| System | From | To | Version | Compare |',
    '| --- | --- | --- | --- | --- |'
  ];
  for (const entry of moved) {
    const from = entry.from ? shortPin(entry.from) : 'new';
    const version = entry.previousVersion && entry.previousVersion !== entry.version
      ? `${entry.previousVersion} -> ${entry.version}`
      : entry.version;
    const compare = entry.from ? `[${from}...${shortPin(entry.to)}](${compareUrl(entry.url, entry.from, entry.to)})` : '-';
    lines.push(`| ${entry.name} | ${from} | ${shortPin(entry.to)} | ${version} | ${compare} |`);
  }
  lines.push(
    '',
    'Opened by the bump workflow after `npm run sync` regenerated `vivarium.json`,',
    '`docs/system-map.md`, and the generated blocks in `README.md`. The workflow',
    'dispatches `ci.yml` on this branch so the required `check` status lands here.',
    '',
    'Review the compare links, then squash-merge once `check` and `systems` are green.'
  );
  return `${lines.join('\n')}\n`;
}
