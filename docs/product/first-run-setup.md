# First-run setup

Status: `specified`. The eight screens below are the contract bloom builds against; seed's
records for them are `planned` and do not exist yet. Nothing on this page is implemented.

## Purpose

A person opens Vivarium for the first time and ends up with an agent they chose: a name, a
character, a job, a model route, a workflow style, an autonomy level, a way to be asked
questions, and the context routes they turned on. Setup is a conversation, not a settings
form: each screen asks one thing, explains it in plain words, and says where to change it
later.

The machine-readable version of these eight steps is
[`templates/agent-setup/setup-script.json`](../../templates/agent-setup/setup-script.json), so
the setup screen renders data rather than a hand-written flow.

## The eight screens

### 1. Welcome: what this is

- **Asks**: begin, or look around first and finish setup later.
- **Copy**: "Vivarium gives you an agent you raise yourself. It remembers what you let it
  remember, asks before it acts outside your bounds, and shows you what it did. Setup takes a
  few minutes and every answer can be changed later."
- **Stores**: the resume point only. Proposed record: `setup.answers`, field `progress`.
- **Change later**: `settings.about`.

### 2. Model routes: where the agent thinks

- **Asks**: at least one route. A subscription the person already pays for, their own API
  key, or a model on this machine. Routes are ordered: the first that answers is used.
- **Copy**: "Choose at least one route to a model. A subscription you already pay for, your
  own API key, or a model running on this machine. Keys stay with you: the desktop app keeps
  them in this computer's credential store."
- **Stores**: the ordered route kinds and their labels. Never a key, never an endpoint. The
  key itself goes to the operating system credential store, or to the companion when the app
  is the web app. Proposed record: `agent.definition`, field `modelRoutes`.
- **Change later**: `settings.models.routes`.

### 3. Workflow style: how much you want to see

- **Asks**: simple or advanced.
- **Copy**: "Simple keeps the machinery out of the way and shows the result. Advanced shows
  the plan, the tools it used, and the settings behind each decision while the work runs."
- **Stores**: `workflowStyle` on the agent. Changing it never changes the autonomy level.
- **Change later**: `settings.workflow.style`.

### 4. Autonomy: what it may do without asking

- **Asks**: a level from 1 to 5, with a plain sentence per level, and an optional per-kind
  override for reading, writing, sending, spending, and deleting.
- **No preselected option.** The screen opens with nothing chosen. There is no default in the
  schema, no default in the setup script, and no fallback in the app: an agent cannot start
  until the person picks. This is the rule the whole setup exists to protect
  (ADR-0003).
- **Copy**: "Pick a level. At 1 the agent asks about almost everything; at 5 it handles
  routine work and tells you afterwards. Nothing is chosen for you, and you can change it per
  kind of action later."
- **Stores**: the level and any overrides, as a policy record the runtime reads on every
  action. Proposed record: `autonomy.policy`.
- **Change later**: `settings.autonomy.level`, and `settings.autonomy.overrides` per kind.

### 5. Questions: how it should reach you

- **Asks**: delivery (inbox, inline, or digest) and optional quiet hours.
- **Copy**: "Choose where questions land, and when nothing may interrupt. Every question
  names the setting that caused it, with a Change link."
- **Stores**: `questions.delivery` and `questions.quietHours`.
- **Change later**: `settings.questions.delivery`, `settings.questions.quietHours`.

### 6. Context routes: what it may read

- **Asks**: which of the five routes are on. Upload and drag-in, connected accounts, a
  browser extension, the agent's own browser, a paired companion. Each can be on or off, and
  each says what it reaches before it is turned on.
  See [context-access.md](context-access.md).
- **Copy**: "Turn on the routes you want. On the web, the agent reaches your device only
  through these: files you drop in, connected accounts, a browser extension, its own browser,
  or a paired companion. You can see and revoke each route at any time."
- **Stores**: the enabled routes and their scopes. Proposed record: `agent.definition`,
  field `contextRoutes`.
- **Change later**: `settings.context.routes`.

### 7. First agent: your first agent

- **Asks**: start from a template or a blank page, then a name, a character in the person's
  words, and a job. Templates come from
  [`templates/agent-setup/`](../../templates/agent-setup/README.md) and are examples, not
  presets: the autonomy level is left at `chosen-in-setup` and the person fills it in screen 4.
- **Copy**: "Start from a template or from a blank page. Give it a name, a character in your
  own words, and the job you want it to take on. Templates are examples; the agent is yours."
- **Stores**: the agent definition, in the person's user data. Proposed record:
  `agent.definition`.
- **Change later**: `settings.agents.identity`.

### 8. Review: what you chose

- **Asks**: finish, or go back and change something. One screen lists every answer with a
  Change link beside it. Nothing starts until Finish.
- **Copy**: "One screen with every answer and a Change link beside it. Nothing starts until
  you press Finish, and each line points at the setting it came from."
- **Stores**: the completed `setup.answers` record, with the version of the setup script it
  answered.
- **Change later**: `settings.setup.summary`.

## The question-card rule

Every question the agent asks the person during work follows one shape:

> **You set this agent to _ask before anything leaves this computer_.**
> It wants to send the summary to a colleague.
> [Allow once] [Always allow for this kind of action] [Change the setting]

- The first line quotes the setting that caused the question, in the person's own words, and
  the word **Change** opens that exact setting (`settings.autonomy.level`, not the top of the
  settings tree).
- The question is one action, in plain words, with the target named.
- "Always allow" writes an override for that action class and shows the new level before it
  is saved.
- A question never asks about two things at once, and never bundles a settings change with an
  approval.

## What is stored, and where

| Record (proposed) | Holds | Owner | Status |
| --- | --- | --- | --- |
| `setup.answers` | which screen was answered, when, and the script version | seed | planned |
| `agent.definition` | id, display name, character, job, workflow style, model routes, context routes, tool grants, memory scope, standing rules, packs | seed | planned |
| `autonomy.policy` | the level and per-kind overrides, read on every action | seed | planned |

seed's current contracts (`docs/contracts/run-model.md`, `provider.md`, `tool-id.md`,
`edge-gate.md`) do not define these records yet. Until they do, the shapes here are
`specified` and the validator in
[`scripts/lib/agent-setup.mjs`](../../scripts/lib/agent-setup.mjs) is the only check.

## What setup must never do

- Preselect an autonomy level, a workflow style, a model route, or a context route.
- Store a key, a token, or an endpoint in the agent definition.
- Turn a context route on because it was on for another agent.
- Hide a choice behind an "advanced" toggle that the simple style cannot reach.
