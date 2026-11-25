import fs from 'node:fs';
import path from 'node:path';

/** Workflow files each system runs its own tests in, most preferred first. */
const PREFERRED_WORKFLOWS = ['ci.yml', 'check.yml', 'test.yml'];

/**
 * @param {string} dir
 * @returns {string | null}
 */
function readWorkflowFile(dir) {
  const workflows = path.join(dir, '.github', 'workflows');
  let names;
  try {
    names = fs.readdirSync(workflows).filter((name) => /\.ya?ml$/.test(name));
  } catch {
    return null;
  }
  for (const preferred of PREFERRED_WORKFLOWS) {
    if (names.includes(preferred)) return preferred;
  }
  return names.sort()[0] ?? null;
}

/**
 * Read the facts about one checked-out system that the manifest records.
 * Everything comes from the working tree; no network call.
 * @param {string} root
 * @param {string} systemPath e.g. systems/seed
 */
export function readSystemFacts(root, systemPath) {
  const dir = path.join(root, systemPath);
  const facts = {
    version: 'unknown',
    license: 'unknown',
    importsToday: /** @type {{ name: string, pin: string }[]} */ ([]),
    workflowFile: null,
    hasAgents: false,
    hasLicense: false,
    hasPackage: false
  };

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    facts.hasPackage = true;
    facts.version = typeof pkg.version === 'string' ? pkg.version : 'unknown';
    facts.importsToday = readImportsToday(pkg);
  } catch {
    /* reported by the health check */
  }

  try {
    const licenceText = fs.readFileSync(path.join(dir, 'LICENSE'), 'utf8');
    facts.hasLicense = true;
    facts.license = /MIT License/i.test(licenceText) ? 'MIT' : 'unknown';
  } catch {
    /* reported by the health check */
  }

  try {
    facts.hasAgents = fs.statSync(path.join(dir, 'AGENTS.md')).isFile();
  } catch {
    /* reported by the health check */
  }

  facts.workflowFile = readWorkflowFile(dir);
  return facts;
}

/**
 * Dependencies a system pins to another family repository, e.g.
 * `"@vidoxlabs/seed": "github:Vidoxlabs/seed#<sha>"`.
 * @param {Record<string, any>} pkg
 * @returns {{ name: string, pin: string }[]} sorted by name
 */
export function readImportsToday(pkg) {
  const found = new Map();
  const groups = [pkg.dependencies, pkg.optionalDependencies, pkg.peerDependencies];
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue;
    for (const spec of Object.values(group)) {
      if (typeof spec !== 'string') continue;
      const match =
        /^github:Vidoxlabs\/([a-z]+)#([0-9a-f]{7,40})$/.exec(spec) ??
        /^https:\/\/github\.com\/Vidoxlabs\/([a-z]+)(?:\.git)?#([0-9a-f]{7,40})$/.exec(spec);
      if (!match) continue;
      found.set(match[1], { name: match[1], pin: match[2] });
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}
