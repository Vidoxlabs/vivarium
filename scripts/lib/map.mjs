import { MARKERS } from './paths.mjs';
import { readSystemFacts } from './facts.mjs';

/** Short keyword per system, used as the second line of each map node. */
const KEYWORDS = {
  seed: 'harness floor',
  capillary: 'context',
  myosotis: 'memory',
  drosera: 'tools',
  aestivation: 'review',
  bloom: 'interface',
  trellis: 'probes'
};

/** Layer styling, kept to the two layers that need distinguishing by weight. */
const CLASS_FOR_LAYER = {
  floor: ':::floor',
  outside: ':::outside'
};

/**
 * @param {string} commit
 * @returns {string} first seven characters
 */
export function shortPin(commit) {
  return commit.slice(0, 7);
}

/**
 * Order the systems for the diagram: bloom, the four peers, trellis, seed.
 * @param {any} manifest
 */
function diagramOrder(manifest) {
  const rank = (system) => {
    if (system.layer === 'composer') return 0;
    if (system.layer === 'peer') return 1;
    if (system.layer === 'outside') return 2;
    return 3;
  };
  return [...manifest.systems].sort((a, b) => rank(a) - rank(b));
}

/**
 * Build the Mermaid diagram. Edges are declared in a fixed order so the
 * linkStyle indexes stay deterministic.
 * @param {any} manifest
 * @returns {string}
 */
export function buildMermaid(manifest) {
  const ordered = diagramOrder(manifest);
  const byName = new Map(manifest.systems.map((s) => [s.name, s]));
  const seed = manifest.systems.find((s) => s.layer === 'floor');
  const lines = ['flowchart BT'];

  for (const system of ordered) {
    const keyword = KEYWORDS[system.name] ?? system.layer;
    lines.push(`    ${system.name}["${system.name} · ${keyword}"]${CLASS_FOR_LAYER[system.layer] ?? ''}`);
  }
  lines.push('');

  /** @type {string[]} */
  const importEdges = [];
  for (const system of ordered) {
    for (const dep of system.importsToday) {
      importEdges.push(`    ${system.name} -->|imports ${dep.name} ${shortPin(dep.pin)}| ${dep.name}`);
    }
  }

  /** @type {string[]} */
  const contractEdges = [];
  for (const system of ordered) {
    if (system.layer !== 'peer' && system.layer !== 'composer') continue;
    contractEdges.push(`    ${system.name} -.->|contracts| ${seed.name}`);
  }
  const capillary = byName.get('capillary');
  const myosotis = byName.get('myosotis');
  if (capillary && myosotis) {
    contractEdges.push(`    capillary -.->|"context to memory, planned"| myosotis`);
  }

  /** @type {string[]} */
  const probeEdges = [];
  const trellis = manifest.systems.find((s) => s.layer === 'outside');
  if (trellis) {
    for (const system of ordered) {
      if (system.name === trellis.name) continue;
      probeEdges.push(`    trellis -.->|probes| ${system.name}`);
    }
  }

  lines.push(...importEdges);
  if (contractEdges.length) lines.push(...contractEdges);
  if (probeEdges.length) lines.push(...probeEdges);

  const contractStart = importEdges.length;
  const probeStart = contractStart + contractEdges.length;
  lines.push('');
  if (contractEdges.length) {
    const indexes = contractEdges.map((_, i) => contractStart + i).join(',');
    lines.push(`    linkStyle ${indexes} stroke-dasharray: 6 4`);
  }
  if (probeEdges.length) {
    const indexes = probeEdges.map((_, i) => probeStart + i).join(',');
    lines.push(`    linkStyle ${indexes} stroke-dasharray: 2 4`);
  }
  lines.push('    classDef floor stroke-width:3px');
  lines.push('    classDef outside stroke-dasharray: 4 3');
  return lines.join('\n');
}

export const MAP_LEGEND =
  'Solid is an import today, labelled with the pinned short SHA. Dashed is a contract. ' +
  'Dotted is a probe from outside the call path. Edges marked planned are not built yet.';

/**
 * @param {any} manifest
 */
export function buildMapBlock(manifest) {
  return [
    `<!-- ${MARKERS.map}:start -->`,
    '```mermaid',
    buildMermaid(manifest),
    '```',
    '',
    MAP_LEGEND,
    `<!-- ${MARKERS.map}:end -->`
  ].join('\n');
}

/**
 * @param {string} root
 * @param {any} manifest
 */
export function buildStatusBlock(root, manifest) {
  const rows = manifest.systems.map((system) => {
    const facts = readSystemFacts(root, system.path);
    const badge = facts.workflowFile
      ? `[![${system.name} tests](${system.url}/actions/workflows/${facts.workflowFile}/badge.svg)](${system.url}/actions/workflows/${facts.workflowFile})`
      : 'no workflow';
    return `| ${system.name} | [${shortPin(system.commit)}](${system.url}/commit/${system.commit}) | ${system.version} | ${badge} |`;
  });
  return [
    `<!-- ${MARKERS.status}:start -->`,
    '| System | Pin | Version | CI |',
    '| --- | --- | --- | --- |',
    ...rows,
    `<!-- ${MARKERS.status}:end -->`
  ].join('\n');
}

/**
 * @param {any} manifest
 */
export function buildSystemMapDoc(manifest) {
  const rows = manifest.systems.map(
    (system) =>
      `| [${system.name}](${system.url}) | ${system.layer} | ${system.role} | [${shortPin(system.commit)}](${system.url}/commit/${system.commit}) | ${system.version} |`
  );
  return [
    '# System map',
    '',
    'Generated by `npm run map` from `vivarium.json`. Edit `systems.config.json` or the pinned',
    'commits, then run `npm run sync`. Do not edit this file by hand.',
    '',
    '## The tree',
    '',
    '```mermaid',
    buildMermaid(manifest),
    '```',
    '',
    MAP_LEGEND,
    '',
    '## Pins',
    '',
    '| System | Layer | Role | Pin | Version |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    ''
  ].join('\n');
}

/**
 * Everything the tool generates from the pins.
 * @param {string} root
 * @param {any} manifest
 */
export function buildGenerated(root, manifest) {
  return {
    mapBlock: buildMapBlock(manifest),
    statusBlock: buildStatusBlock(root, manifest),
    systemMapDoc: buildSystemMapDoc(manifest)
  };
}

/**
 * @param {string} text
 * @param {string} marker
 */
export function hasBlock(text, marker) {
  return text.includes(`<!-- ${marker}:start -->`) && text.includes(`<!-- ${marker}:end -->`);
}

/**
 * The text of a marked block, markers included.
 * @param {string} text
 * @param {string} marker
 * @returns {string | null}
 */
export function extractBlock(text, marker) {
  const start = text.indexOf(`<!-- ${marker}:start -->`);
  const end = text.indexOf(`<!-- ${marker}:end -->`);
  if (start === -1 || end === -1 || end < start) return null;
  return text.slice(start, end + `<!-- ${marker}:end -->`.length);
}

/**
 * Replace a marked block, keeping the text around it.
 * @param {string} text
 * @param {string} marker
 * @param {string} block
 * @returns {string}
 */
export function replaceBlock(text, marker, block) {
  const start = text.indexOf(`<!-- ${marker}:start -->`);
  const end = text.indexOf(`<!-- ${marker}:end -->`);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md is missing the ${marker} markers`);
  }
  const after = end + `<!-- ${marker}:end -->`.length;
  return `${text.slice(0, start)}${block}${text.slice(after)}`;
}
