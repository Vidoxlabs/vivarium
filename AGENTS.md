# Vivarium workspace

Vivarium is a public repository. Everything committed here can be read by anyone, so write
as if a stranger will read it: no private paths, addresses, hostnames, ports, handles,
secrets, or personal details, and no internal agent names beyond "internal agents".

This file is for code agents. A person can read it too, but the README is the front door.

## What Vivarium is

Vivarium is a personal agent platform: a person raises an assistant with a character and a
job, gives it memory they consent to keep, and works with it. It runs locally first, asks
before it acts outside the bounds the person set, and records what it did. Every route it
takes to a model, a file, or a service is one the person switched on.

This repository is the umbrella for seven systems. It pins them at exact commits and gives
an agent the context to work across them; it holds no product code. The product direction
lives in `docs/vision/design-brief.md`, and it is direction, not a claim about what runs
today.

### Naming

Vivarium is the product. bloom is Vivarium's user-interface system, not the product. Say
Vivarium for the product and bloom only for the interface system. docs is a separate,
product-neutral documentation hub; it is linked, not pinned.

## Read order

1. This file.
2. `vivarium.json` — the pins, versions, layers, and which system imports which.
3. `docs/system-map.md` — the picture and the pin table.
4. The target system's own `AGENTS.md` (see the table below).
5. That system's `docs/`.

Inside a submodule, that repository's `AGENTS.md` wins over this file where it is stricter or
more specific. Read it before you plan a change there.

## How the systems relate

| Layer | Systems | What the layer means |
| --- | --- | --- |
| floor | seed | The contracts every other system builds against. |
| peer | capillary, myosotis, drosera, aestivation | Peers do not import each other; they meet at seed's contracts. |
| composer | bloom | The only place the parts are put together, and the only user interface. |
| outside | trellis | Tests the tree from outside the call path, so the tree cannot hide a failure. |

**Imports today**, read from each system's `package.json` at the pinned commit: bloom pins
seed and drosera. No peer imports another, and nothing imports bloom. `vivarium.json` records
each pin; `docs/system-map.md` draws the edges. Derive the edges from the manifest, not from
memory, because a pin move can add one.

**What each system owns in Vivarium** is in `systems.config.json` under `owns`, one list per
system. Examples: seed owns the run contracts, the provider adapters, the model ladder, the
budgets, and the autonomy policy record; myosotis owns consent to keep and structural forget;
aestivation owns plans, verdicts, the questions to the person, and the assembly gate. When a
change belongs to a responsibility, it belongs in that system's repository.

## Where each system's rules live

| System | Its own rules |
| --- | --- |
| seed | `systems/seed/AGENTS.md` |
| capillary | `systems/capillary/AGENTS.md` |
| myosotis | `systems/myosotis/AGENTS.md` |
| drosera | `systems/drosera/AGENTS.md` |
| aestivation | `systems/aestivation/AGENTS.md` |
| bloom | `systems/bloom/AGENTS.md` |
| trellis | `systems/trellis/AGENTS.md` |

## Never edit a submodule from the umbrella

`systems/<name>/` is another repository at a pinned commit. A change there belongs in a pull
request in that repository, reviewed by that repository's rules. Then the pin moves here,
through the bump workflow or a `chore(systems)` pull request. Never commit a pin to a commit
that is not on that system's `main`, and never tidy a submodule's files from a branch here.

## Verification

```bash
npm test        # unit tests for the umbrella tool
npm run check   # drift, submodule health, cross-links, public safety, no TypeScript
```

Both run before every commit, and CI runs both plus the `systems` matrix, which runs each
system's own tests at its pin. `npm run check` is offline and deterministic; if it reports
drift, run `npm run sync` and commit what it rewrites.

## Internal agents are ordinary user agents

Vidoxlabs' own agents are created in the app through the same first-run setup, templates, and
editors as any user's, and live in the owner's user data, not in any repository. This
repository ships only generic templates. If something cannot be expressed through setup, it
is a missing feature for everyone, and it is specified here in public. The decision is
ADR-0002 in `docs/adr/`. Never add personal agent names or private details.

## Product behaviour an agent must preserve

- **No default autonomy level.** A person chooses one in setup; nothing is preselected and
  nothing quietly assumes a level. The decision is ADR-0003 in `docs/adr/`.
- **Model access only through routes the person controls.** A subscription the person already
  pays for, their own API key, or a local model. The decision is ADR-0004 in `docs/adr/`.
- **The web app reaches device context only through opt-in routes**, and a device-only step
  hands off to the paired companion. The decision is ADR-0005 in `docs/adr/`.

## Commits and pull requests

- Conventional commit messages that describe the change. No co-author trailers. No branch
  names in commit messages or pull request titles.
- One concern per branch and per pull request. Never force-push, rebase a published branch,
  amend a pushed commit, or rewrite history; fix forward.
- Never commit secrets, tokens, or `.env` files. Name a secret in documentation; never write
  its value.
- A claim about a system links to that system's README, docs, or code, and carries the
  system's own label when it is not implemented yet: implemented, specified, planned,
  observed.
- Merging is the owner's decision. Open the pull request, keep it green, and leave it for the
  merge order recorded in `SETUP.md`.

`CLAUDE.md` holds one line pointing here, matching the family.
