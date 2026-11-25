# Agent setup templates

Status: `specified`. These are shapes for first-run setup and for one agent definition. No
app reads them yet; the tests in `test/agent-setup.test.mjs` keep them honest.

## What is here

| File | What it is |
| --- | --- |
| `agent.schema.json` | A JSON Schema (draft 2020-12) for one agent definition: who it is, what it may do, where it thinks, what it may read, what it may keep |
| `setup-script.json` | The eight setup screens as data, in order, each with its choices and the setting where the answer is changed later |
| `planner.json`, `builder.json`, `researcher.json` | Three generic example agents that validate against the schema |
| `README.md` | This page |

## These are examples, not agents

The three example agents are generic: a planner, a builder, a researcher. They show the shape
and nothing else. They carry no personal details, no keys, no endpoints, and no autonomy
level: `autonomy.level` is the literal placeholder `"chosen-in-setup"`, which the schema
documents as "filled by the person during setup".

A person's own agents live in their user data, on their machine, never in a repository. This
repository ships only these templates.

## The autonomy rule, in one paragraph

The schema requires `autonomy.level` and gives it no `default` anywhere. The setup script's
autonomy screen has no preselected choice. `npm test` fails if a `default` keyword appears in
the schema, or if an example carries a level a running agent could hold. An agent therefore
cannot start until a person picks a level, and every later question the agent asks quotes the
setting that caused it. The decision is [ADR-0003](../../docs/adr/0003-first-run-setup-and-no-default-autonomy.md).

## Which parts of JSON Schema are checked

`scripts/lib/agent-setup.mjs` implements a documented subset with Node built-ins only: `type`,
`required`, `properties`, `additionalProperties`, `items`, `enum`, `const`, `pattern`,
`minLength`, `maxLength`, `minItems`, `maxItems`, `minimum`, `maximum`, `oneOf`, and local
`$ref` into `#/$defs/`. Anything outside that subset is not validated, so the schema here does
not use it. The module header lists what is unsupported and why.

## Adding a template

1. Copy the closest example and change the identity fields: `id`, `displayName`, `character`,
   `job`.
2. Leave `autonomy.level` as `"chosen-in-setup"`. A template never chooses for the person.
3. Keep `modelRoutes` to route kinds and labels. No keys, no endpoints, no account names.
4. Run `npm test`. A template that fails validation is not committed.

## Using the setup script

`setup-script.json` is the whole first-run flow as data: eight steps, each with an `id`, a
`title`, an `explanationKey` for translation, the `explanation` copy itself, the `choices`, and
a `changeLaterAt` path. The setup screen renders the step, writes the answer under
`setup.answers`, and shows the `changeLaterAt` path as the Change link on the review screen.
The prose version of the same eight screens is
[`docs/product/first-run-setup.md`](../../docs/product/first-run-setup.md).
