# 0003: First-run setup and no default autonomy

- **Status**: Accepted
- **Date**: 2026-11-25
- **Decided by**: the owner
- **Amends**: none

## Context

An agent that acts on a person's files, accounts, and money has to have a bound on what it does
without asking. The easy design is a default: pick level 3, let the person change it later.
That design makes the most important decision in the product on the person's behalf, and it
does it silently, at the moment they are least likely to look.

An agent that asks the wrong way is nearly as bad: a question with no explanation reads as
noise, and a question that cannot be traced back to a setting teaches the person nothing about
the machine they are running.

## Decision

1. **No autonomy level is preselected anywhere.** Not in the setup screen, not in the schema,
   not in the app, not in an example agent. `agent.schema.json` requires `autonomy.level` and
   carries no `default`; the setup script's autonomy step has no selected choice; an example
   carries the literal placeholder `chosen-in-setup`. `npm test` fails if a `default` keyword
   appears in the schema.
2. **Setup is a scripted eight-step conversation**, not a settings form: model routes, workflow
   style (simple or advanced), autonomy level, question delivery, context routes, and a first
   agent, then a review screen showing each answer with the place to change it. The data lives
   in `templates/agent-setup/setup-script.json`; the prose is
   `docs/product/first-run-setup.md`.
3. **Every question the agent asks links to the setting that caused it.** The question card
   says "You set this agent to …", with a Change link that opens that exact setting, not the
   top of the settings tree.
4. **Every step says where to change it later**, by the same `settings.*` path the question
   card uses.

## Consequences

- An agent cannot start until a person chooses a level. Setup can be paused; it cannot be
  skipped into a default.
- The autonomy screen is the longest in setup. That is deliberate.
- A new action class needs a level, or an explicit "inherits the agent's level", which is a
  schema change and a record in this repository.
- Tests can assert the absence of a default, so the rule does not depend on anyone remembering
  it.

## Alternatives

**A default of level 3, changeable later.** Rejected: it decides for the person, and the person
who never opens settings is exactly the one who would be surprised.

**A default that adapts from the first few questions.** Rejected: it hides the decision behind
behaviour the person cannot see, and it makes the level non-reproducible.

**Setup as a settings tree, entered anywhere.** Rejected: an agent needs the six choices before
its first run, in an order that explains each one. A tree gives orderless access and no
explanation.

## Changes

| Date | Change | By |
| --- | --- | --- |
| 2026-11-25 | First written | |
