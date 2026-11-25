import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root, resolved from this file's location. */
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const CONFIG_FILE = 'systems.config.json';
export const MANIFEST_FILE = 'vivarium.json';
export const MAP_FILE = 'docs/system-map.md';
export const README_FILE = 'README.md';
export const SYSTEMS_DIR = 'systems';
export const NEEDLES_FILE = 'scripts/scrub-needles.json';
export const SUMMARY_FILE = '.sync-summary.txt';

export const BODY_FILE = '.sync-body.md';

/** Markers that fence the generated blocks in README.md. */
export const MARKERS = {
  map: 'vivarium:map',
  status: 'vivarium:status'
};
