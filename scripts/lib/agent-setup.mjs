/**
 * A small JSON Schema validator for the agent-setup templates, using Node
 * built-ins only.
 *
 * Supported subset (documented, so a reviewer knows what is checked and what is
 * not):
 *   - `type` for object, array, string, number, integer, boolean
 *   - `required`, `properties`, `additionalProperties` (false or a schema)
 *   - `items` (one schema)
 *   - `enum`, `const`
 *   - `pattern`, `minLength`, `maxLength`
 *   - `minItems`, `maxItems`
 *   - `minimum`, `maximum`
 *   - `oneOf`
 *   - `$ref` into `#/$defs/<name>`
 *
 * Not supported, and therefore not used by the schema in this repository:
 * `anyOf`, `allOf`, `not`, `if`/`then`/`else`, `dependencies`, `patternProperties`,
 * numeric exclusive bounds, `format` assertions, and remote `$ref`.
 */

/**
 * @typedef {{ path: string, message: string }} Violation
 */

/**
 * @param {string} path
 * @param {(string | number)[]} [parts]
 */
function at(path, parts = []) {
  let out = path;
  for (const part of parts) {
    out += typeof part === 'number' ? `[${part}]` : out ? `.${part}` : part;
  }
  return out;
}

/**
 * @param {any} value
 * @param {string} type
 */
function hasType(value, type) {
  switch (type) {
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return true;
  }
}

/**
 * @param {string} ref
 * @param {any} root
 */
function resolveRef(ref, root) {
  if (!ref.startsWith('#/')) throw new Error(`only local $ref is supported: ${ref}`);
  const parts = ref.slice(2).split('/');
  let node = root;
  for (const part of parts) {
    node = node?.[part];
    if (node === undefined) throw new Error(`unresolved $ref: ${ref}`);
  }
  return node;
}

/**
 * @param {any} schema
 * @param {any} value
 * @param {any} root
 * @param {string} [path]
 * @returns {Violation[]}
 */
export function validate(schema, value, root = schema, path = '') {
  /** @type {Violation[]} */
  const violations = [];
  if (schema === true || schema === undefined) return violations;
  if (schema === false) return [{ path, message: 'no value is allowed here' }];

  if (schema.$ref) {
    return validate(resolveRef(schema.$ref, root), value, root, path);
  }

  if (schema.const !== undefined && value !== schema.const) {
    violations.push({ path, message: `must be ${JSON.stringify(schema.const)}` });
  }

  if (schema.enum && !schema.enum.some((option) => option === value)) {
    violations.push({ path, message: `must be one of ${schema.enum.map((o) => JSON.stringify(o)).join(', ')}` });
  }

  if (schema.type && !hasType(value, schema.type)) {
    violations.push({ path, message: `must be a ${schema.type}` });
    return violations;
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter((option) => validate(option, value, root, path).length === 0);
    if (matches.length !== 1) {
      violations.push({ path, message: 'must match exactly one of the allowed shapes' });
      return violations;
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      violations.push({ path, message: `must be at least ${schema.minLength} characters` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      violations.push({ path, message: `must be at most ${schema.maxLength} characters` });
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      violations.push({ path, message: `must match ${schema.pattern}` });
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      violations.push({ path, message: `must be at least ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      violations.push({ path, message: `must be at most ${schema.maximum}` });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      violations.push({ path, message: `must hold at least ${schema.minItems} items` });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      violations.push({ path, message: `must hold at most ${schema.maxItems} items` });
    }
    if (schema.items) {
      for (const [index, item] of value.entries()) {
        violations.push(...validate(schema.items, item, root, at(path, [index])));
      }
    }
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) violations.push({ path: at(path, [key]), message: 'is required' });
    }
    for (const [key, item] of Object.entries(value)) {
      const propertySchema = schema.properties?.[key];
      if (propertySchema !== undefined) {
        violations.push(...validate(propertySchema, item, root, at(path, [key])));
        continue;
      }
      if (schema.additionalProperties === false) {
        violations.push({ path: at(path, [key]), message: 'is not an allowed property' });
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        violations.push(...validate(schema.additionalProperties, item, root, at(path, [key])));
      }
    }
  }

  return violations;
}

/**
 * Every `default` keyword in a schema, with its path. The agent schema must have
 * none: a default for autonomy would pick a level on the person's behalf.
 * @param {any} schema
 * @param {string} [path]
 * @returns {string[]}
 */
export function defaultsIn(schema, path = '') {
  const found = [];
  if (!schema || typeof schema !== 'object') return found;
  if ('default' in schema) found.push(path || '(root)');
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'properties' && value && typeof value === 'object') {
      for (const [name, child] of Object.entries(value)) {
        found.push(...defaultsIn(child, `${path}/${name}`));
      }
    } else if (key === '$defs' && value && typeof value === 'object') {
      for (const [name, child] of Object.entries(value)) {
        found.push(...defaultsIn(child, `${path}/$defs/${name}`));
      }
    } else if (key === 'items') {
      found.push(...defaultsIn(value, `${path}/items`));
    } else if (key === 'oneOf' && Array.isArray(value)) {
      for (const [index, child] of value.entries()) {
        found.push(...defaultsIn(child, `${path}/oneOf/${index}`));
      }
    }
  }
  return found;
}

/**
 * The id, title, explanation key, and change-later path of every setup step.
 * @param {any} script
 */
export function readSetupSteps(script) {
  return (script.steps ?? []).map((step) => ({
    id: step.id,
    title: step.title,
    explanationKey: step.explanationKey,
    changeLaterAt: step.changeLaterAt,
    choices: (step.choices ?? []).map((choice) => choice.value)
  }));
}
