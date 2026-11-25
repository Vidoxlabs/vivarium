# Vivarium: the personal agent platform

Living document. Edit by PR; record changes in docs-timeline.md.

This is product direction, not a claim about what runs today. Where a section describes
behaviour, the behaviour may be `specified` or `planned`; the systems' own repositories carry
the claim labels for what is built. The decisions this edition rests on are recorded in
`docs/adr/`.

> **Edition note.** This edition was written in this repository from the owner's decisions of
> 25 November 2026 (ADR-0002 to ADR-0005) and the product specs in `docs/product/`. If the owner
> keeps a separate canonical brief, that copy wins and this file is replaced by it; the checklist
> entry is in `SETUP.md`.

## Owner decisions in this edition

| Decision | What it settles | Record |
| --- | --- | --- |
| 25 November 2026 | Vidoxlabs' internal agents are ordinary user agents, made through the same public setup; no private overlay, branch, or fork | ADR-0002 |
| 25 November 2026 | No autonomy level is preselected anywhere; setup is a scripted eight-step conversation | ADR-0003 |
| 25 November 2026 | Three model routes at launch: an existing subscription through the vendor's official program, the person's own API key, a local model. No hosted plan, no broker | ADR-0004 |
| 25 November 2026 | Desktop and web app first; the web app reaches device context only through five opt-in routes, with an outbound-only companion | ADR-0005 |

## 1. What Vivarium is

Vivarium is a personal agent platform. A person raises an assistant with a character and a job,
gives it memory they consent to keep, and works with it: it reads what they point it at, asks
before it acts outside the bounds they set, and leaves a record of what it did.

Three things make it what it is:

1. **Local first.** The desktop app runs on the person's machine with the person's files. A
   model may be remote; the working relationship is not.
2. **Consent, not capture.** Memory is kept because the person said to keep it, and forgetting is
   structural: the memory goes, not just the view of it.
3. **Routes the person controls.** Every model, account, and device the agent can reach is a
   route the person switched on, and each one can be revoked.

The seven systems are the parts of that product, not seven products: seed (the floor and the
contracts), capillary (context with sources attached), myosotis (memory and forget), drosera
(tools, skills, hooks, cookbooks), aestivation (plans, verdicts, questions, the assembly gate),
bloom (the app and the head agent), trellis (tests from outside the call path). A person meets
one product; the parts are how it is built.

**Who it is for.** A person who wants an assistant that works on their own material, keeps what
they tell it to keep, and does not require them to hand their files to a service to get help.
The second audience is the person who wants to build on it: the systems are public, MIT, and
small enough to read.

## 2. The person and the agent

### 2.1 Raising an agent

An agent is not a prompt saved under a name. It has:

- **A character**, in the person's own words: how it talks, what it cares about, what it will not
  do.
- **A job**: the work it takes on, stated once and revisited.
- **Bounded autonomy**: a level from 1 to 5, chosen by the person, with optional per-kind
  overrides for reading, writing, sending, spending, and deleting.
- **Memory it may keep**, under consent the person set.
- **Standing rules** the person wrote, short enough to read in one screen.
- **Tools and packs**: what it may use, and what it starts with.

The phrase matters: a person raises an agent the way they would raise a colleague's
responsibility. It starts narrow, it earns scope, and the person stays the one who grants it.

### 2.2 The head agent

The first agent a person meets is the head agent: the one that answers, delegates to the others,
and reports back. It is the agent in bloom's main window, and it is the one whose character the
person writes first.

### 2.3 Workflow styles

Two styles, one product:

- **Simple** keeps the machinery out of the way. The person sees the request, the answer, and
  any question the agent needs to ask. Plans, tool calls, and settings stay behind a link.
- **Advanced** shows the work: the plan before it runs, each tool call with its target, the
  setting behind each decision, and the receipts afterwards.

Advanced is not "more features"; it is the same features with the panels open. A person can
switch at any time and nothing about their agent changes except what they can see.

### 2.4 Questions, and the card that carries them

An agent asks when a bound is reached. Every question uses one shape:

> **You set this agent to _ask before anything leaves this computer_.**
> It wants to send the summary to a colleague.
> [Allow once] [Always allow for this kind of action] [Change the setting]

- The first line quotes the setting that caused it, in the person's words.
- **Change** opens that exact setting, not the top of the settings tree.
- One question, one action, one target.
- "Always allow" shows the new level before saving it.

A question that cannot name its setting is a defect, because it teaches the person nothing about
the machine they are running.

### 2.4a The eight setup steps

Setup is a scripted conversation, eight steps, run once and re-openable:

| Step | Asks | Where it changes later |
| --- | --- | --- |
| 1. What this is | begin, or look around first | `settings.about` |
| 2. Where the agent thinks | one or more model routes, ordered | `settings.models.routes` |
| 3. How much you want to see | simple or advanced | `settings.workflow.style` |
| 4. What it may do without asking | a level, 1 to 5, nothing preselected | `settings.autonomy.level` |
| 5. How it should reach you | inbox, inline, or digest, and quiet hours | `settings.questions.delivery` |
| 6. What it may read | the context routes, one switch each | `settings.context.routes` |
| 7. Your first agent | a template or a blank page, then name, character, job | `settings.agents.identity` |
| 8. What you chose | finish, or go back | `settings.setup.summary` |

The review step lists every answer with its Change link. The data version of this table is
`templates/agent-setup/setup-script.json`; the prose version is
`docs/product/first-run-setup.md`.

### 2.5 Internal agents

Vidoxlabs uses internal agents for its own work. They are ordinary user agents: created in the
app, through the same setup, stored in the owner's user data, never in a repository. There is no
private overlay, branch, or fork (ADR-0002). What internal agents need that setup cannot express
becomes a public feature with public tests, and this repository ships generic templates only.

## 3. Models

### 3.1 Principles

- The person pays someone they chose, at a price they can see.
- A key belongs to the person, on their device, or not at all.
- Which model answered is recorded, never guessed.
- A route can be removed without re-installing anything.

### 3.2 The three launch routes

1. **A subscription the person already has**, through the vendor's official sign-in program.
2. **The person's own API key**, paid to the vendor.
3. **A model on the person's machine.**

Ordered per agent: the first route that answers is used, the rest are fallbacks. A route whose
program needs the vendor's own runtime is used only through the desktop app or the paired
companion.

### 3.3 What is not offered

No hosted plan, no broker holding keys, no bundled credit at launch. **Hosted credits: later,
maybe** — separate, clearly priced, opt-in, and never a requirement for the three routes.

### 3.4 Where keys live

Desktop: the operating system credential store. Web: the paired companion holds the key and
makes the request, so the browser never sees it; encrypted storage on the web account is an
explicit opt-in. Agent definitions hold route kinds and labels only. Details in
`docs/product/model-access.md`.

## 4. Memory

### 4.1 Consent to keep

Nothing is kept without a recorded yes. Consent is per memory, or per kind of memory if the
person chose "ask once", and it is recorded before the memory is written, not after.

### 4.2 Structural forget

Forget removes the memory, not the view of it: a projection that still holds it is rebuilt, and a
stale read cannot resurrect it. The test is a read after the forget, not a deleted row.

### 4.3 Scope

Each agent has memory scope: its own, or shared with the person's other agents. Scope is
enforced on read as well as write, because a shared memory read by an agent that was never
granted it is the same failure with better manners.

## 5. Context

### 5.1 Context with its source attached

An agent works from context packets, not from a blur of text: each packet says where it came
from, how it was obtained, and what it may be used for. A packet that cannot name its source is
not usable, and the agent says so rather than guessing.

### 5.2 Bounded

Packets are bounded: a size, a count, and a reason. When the bound is reached, the agent asks for
more rather than quietly taking it.

### 5.3 Relations

Context has relations, not just contents: this file belongs to that project, this person wrote
that message. Relations are what let an agent answer "what changed since last week" without
reading everything again.

### 5.4 Desktop and web

The desktop app reads what the person points it at, on the machine. The web app cannot, and does
not pretend to: it reaches the device only through routes the person turns on.

### 5.5 The five web-app routes

| Route | Reaches | Connects | Visible as |
| --- | --- | --- | --- |
| Upload and drag-in | one file or folder, once | upload | the file in the conversation |
| OAuth connector | one account on one service | the vendor's consent screen | connected, with scopes in plain words |
| Browser extension | the page the person is on, on request | an extension they install | a badge, and the page named in the conversation |
| The agent's own browser | public pages | a hosted browser session | each URL, in order |
| Paired companion | folders and applications the device shares | an outbound-only connection | the device, its shares, and a live state |

Details and the pairing flow are in `docs/product/context-access.md`.

## 6. Surfaces

### 6.1 Desktop app

The full product: files, local models, keys in the credential store, the head agent, the
questions inbox, and settings. A person can work entirely offline with a local model.

### 6.2 Web app, companion, hand-off

The web app is hosted and reaches the person's accounts and their paired device. Pairing is a
one-time code and an outbound-only connection; the companion enforces the same autonomy policy
locally, and the stricter of the two wins. A step that can only happen on the device is named as
such and handed to the companion; with no companion it waits, and the web app never fakes the
result.

### 6.3 Mobile, later

Mobile is not in the first release. When it comes it is a third enforcement point for the same
policy record, and it arrives after the first two agree in tests.

## 7. What Vivarium is not

- **Not a chat window with a model behind it.** The agent has a job, bounds, memory, and receipts.
- **Not a model reseller.** No hosted plan at launch, no broker, no bundled credit.
- **Not a marketplace.** Packs and templates are examples someone can copy, not a store.
- **Not a private company tool.** The owner's agents are ordinary user agents (ADR-0002).

## 8. Open questions

Each has options and a recommendation, recorded here so a later edition can settle it.

1. **Mobile timing.** (a) After desktop and web are green in trellis; (b) alongside the web app;
   (c) when a first user asks. Recommendation: (a).
2. **Hosted credits.** (a) Never; (b) a separate paid tier the person opts into; (c) a small free
   allowance. Recommendation: (a) until the three routes are proven, then (b).
3. **Households.** One person per install, or several people sharing one agent set? Recommendation:
   one person for the first release, with memory scope as the seam to widen later.
4. **Agent to agent delegation.** The head agent delegating to other agents is designed; agents
   delegating to each other is not. Recommendation: keep it out until the assembly gate has a
   test for a delegated plan.

## 9. Sources

The vendor terms behind section 3 are cited in the owner's edition of this brief and are not
restated here: a price or a quota copied into a repository is wrong within a month. Each route's
documentation link in settings is the place a change is described. Claims about what a vendor
permits are `DOC-CLAIMED` until someone reads the terms again and records the date.
