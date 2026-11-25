import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { NEEDLES_FILE } from './paths.mjs';

/**
 * @param {string} root
 */
export function loadNeedles(root) {
  const file = path.join(root, NEEDLES_FILE);
  const needles = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(needles.tokenSha256) || !Array.isArray(needles.patterns)) {
    throw new Error(`${NEEDLES_FILE} must hold tokenSha256 and patterns arrays`);
  }
  return {
    tokenSha256: new Set(needles.tokenSha256.map((value) => String(value).toLowerCase())),
    patterns: needles.patterns.map((pattern) => ({
      id: pattern.id,
      description: pattern.description,
      scope: pattern.scope ?? 'both',
      source: pattern.source,
      flags: pattern.flags ?? ''
    }))
  };
}

/**
 * @param {string} value
 * @returns {string} lowercase hex SHA-256 of the value as given
 */
export function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Lowercase the text and split it on non-alphanumeric characters.
 * @param {string} text
 */
export function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/);
}

/**
 * Scan one text. Reports the line, never the matched word.
 * @param {string} text
 * @param {ReturnType<typeof loadNeedles>} needles
 * @param {{ kind?: 'files' | 'commits' }} [options]
 * @returns {{ line: number, rule: string, message: string }[]}
 */
export function scanText(text, needles, options = {}) {
  const kind = options.kind ?? 'files';
  const findings = [];
  const seen = new Set();

  /**
   * @param {number} line
   * @param {string} rule
   * @param {string} message
   */
  const push = (line, rule, message) => {
    const key = `${line}\u0000${rule}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({ line, rule, message });
  };

  for (const [index, line] of text.split('\n').entries()) {
    for (const token of tokenize(line)) {
      if (!token) continue;
      if (needles.tokenSha256.has(digest(token))) {
        push(index + 1, 'scrub-token', 'a hashed forbidden word appears on this line');
      }
    }
  }

  for (const pattern of needles.patterns) {
    if (pattern.scope !== 'both' && pattern.scope !== kind) continue;
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const regex = new RegExp(pattern.source, flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[0].length === 0) {
        regex.lastIndex += 1;
        continue;
      }
      const line = text.slice(0, match.index).split('\n').length;
      push(line, `scrub-pattern:${pattern.id}`, pattern.description);
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}
