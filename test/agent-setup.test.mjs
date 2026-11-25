import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { defaultsIn, readSetupSteps, validate } from '../scripts/lib/agent-setup.mjs';
import { REPO_ROOT } from '../scripts/lib/paths.mjs';

const DIR = path.join(REPO_ROOT, 'templates', 'agent-setup');
const schema = JSON.parse(fs.readFileSync(path.join(DIR, 'agent.schema.json'), 'utf8'));
const setupScript = JSON.parse(fs.readFileSync(path.join(DIR, 'setup-script.json'), 'utf8'));

const examples = ['planner', 'builder', 'researcher'].map((name) => ({
  name,
  document: JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), 'utf8'))
}));

test('every example agent validates against the schema', () => {
  for (const { name, document } of examples) {
    const violations = validate(schema, document);
    assert.deepEqual(violations, [], `${name} does not validate`);
    assert.equal(document.schema, 1);
  }
});

test('the schema declares autonomy as required with no default anywhere', () => {
  assert.ok(schema.required.includes('autonomy'));
  assert.ok(schema.properties.autonomy.required.includes('level'));
  assert.deepEqual(defaultsIn(schema), []);
  assert.ok(!JSON.stringify(schema.properties.autonomy).includes('"default"'));
});

test('every example leaves the autonomy level to the person', () => {
  for (const { name, document } of examples) {
    assert.equal(document.autonomy.level, 'chosen-in-setup', name);
  }
});

test('an agent with no autonomy level is rejected', () => {
  const document = JSON.parse(JSON.stringify(examples[0].document));
  delete document.autonomy;
  const violations = validate(schema, document);
  assert.ok(violations.some((violation) => violation.path.endsWith('autonomy')));
});

test('a preselected level in an example would fail the placeholder test, so the shape is checked', () => {
  const document = JSON.parse(JSON.stringify(examples[0].document));
  document.autonomy.level = 3;
  // A real definition may hold a level the person chose; the schema allows 1 to 5.
  assert.deepEqual(validate(schema, document), []);
  // What the schema does not allow is a level outside the range or an unknown word.
  document.autonomy.level = 6;
  assert.equal(validate(schema, document).length, 1);
  document.autonomy.level = 'default';
  assert.equal(validate(schema, document).length, 1);
});

test('a key is not a route: modelRoutes carries a kind and a label only', () => {
  const document = JSON.parse(JSON.stringify(examples[0].document));
  document.modelRoutes[0] = { kind: 'api-key', key: 'placed-at-runtime' };
  const violations = validate(schema, document);
  assert.ok(violations.some((violation) => violation.message.includes('not an allowed property')));
});

test('an unknown context route is rejected', () => {
  const document = JSON.parse(JSON.stringify(examples[0].document));
  document.contextRoutes = ['clipboard'];
  assert.equal(validate(schema, document).length, 1);
});

test('setup lists the eight steps in order, each with a change-later path', () => {
  const steps = readSetupSteps(setupScript);
  assert.deepEqual(
    steps.map((step) => step.id),
    ['welcome', 'model-routes', 'workflow-style', 'autonomy', 'questions', 'context-routes', 'first-agent', 'review']
  );
  for (const step of steps) {
    assert.ok(step.changeLaterAt.startsWith('settings.'), step.id);
    assert.ok(step.explanationKey.startsWith('setup.'), step.id);
    assert.ok(step.choices.length > 0, step.id);
  }
});

test('the autonomy step offers five levels and preselects none', () => {
  const step = setupScript.steps.find((item) => item.id === 'autonomy');
  assert.deepEqual(step.choices.map((choice) => choice.value), [1, 2, 3, 4, 5]);
  assert.ok(!('selected' in step));
  assert.ok(!('default' in step));
});

test('the setup script names no secret and no endpoint', () => {
  const text = JSON.stringify(setupScript);
  assert.ok(!/(?:sk-|ghp_|gho_|github_pat_|AKIA|AIza|xox[bp]-)/.test(text));
  assert.ok(!text.includes('http://'));
});
