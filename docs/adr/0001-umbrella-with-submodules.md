# 0001: Umbrella with git submodules

- **Status**: Proposed
- **Date**: 2026-11-25
- **Decided by**: maintainers of this repository
- **Amends**: none

## Context

Vivarium is one product made of seven systems, each in its own public repository with its own
history, tests, CI, and release cadence. A person who wants to work on the product needs one
checkout in which the seven are at commits that are known to work together, and a code agent
needs one file it can read to know which commits those are.

Three things are true of the systems:

- They are separate repositories, and a change to one belongs in that one.
- They are read together: bloom pins seed and drosera, the peers meet at seed's contracts, and
  trellis tests the tree from outside.
- They move independently, and a pin can be six hours stale without anyone noticing.

## Decision

This repository is an umbrella that pins the seven systems as git submodules under `systems/`
and records the pins in a generated `vivarium.json`. `systems.config.json` holds what each
system is and owns; `npm run sync` moves every pin to the latest `main` and regenerates the
manifest, the map, and the README blocks; `npm run check` fails when the generated files drift
from the pins, when a submodule is not at its gitlink, when a link does not resolve, or when a
public-safety rule trips. Pins move only through pull requests.

## Consequences

- **A pin is a pull request.** The bump workflow opens one every six hours when something
  moved, with the compare links. A pin is never pushed straight to `main`.
- **Cloning needs one extra word.** `git clone --recurse-submodules`, or
  `git submodule update --init --recursive` afterwards. A plain clone gives an empty `systems/`
  and `npm run check` says so.
- **Drift is visible, not silent.** The generated files are committed, so a stale manifest is a
  failing check rather than a note nobody reads.
- **Two histories, on purpose.** Each system keeps its own history, and this repository's
  history is the history of the pins. Blaming a file means deciding which of the two to blame.
- **Submodule edits can be lost.** A change made inside `systems/<name>/` is not committed
  here, and a `sync` would move past it. The rule is in `AGENTS.md`: change a system in its own
  repository.

## Alternatives

**A monorepo.** All seven under one history. It would make a cross-system change one pull
request, and it would take seven repositories' CI, ledgers, and release notes and merge them
into one, which is a change of governance, not of layout. Rejected: each system's history and
release cadence is worth more than the convenience.

**A package-only umbrella.** Publish the seven to a registry and pin versions in a
`package.json`. It would remove submodules, and it would hide the code a person is meant to
read: this is an open, local-first family, and a version number is not a snapshot you can
inspect. It also needs a publish decision for every system. Rejected.

**A docs-only index.** One README that links the seven repositories, no pins. It would be
trivial to maintain and it would tell a code agent nothing about which commits work together.
Rejected: the pins are the product of this repository.

## The Dependabot alternative, not adopted

Dependabot has a `gitsubmodule` ecosystem and would open one pull request per submodule per
day. It is not enabled here, because:

- each pull request would move one pin and leave `vivarium.json`, `docs/system-map.md`, and the
  README blocks stale, so the required `check` would fail on every one of them;
- the seven pull requests would compete for the same generated files, so merging one would
  stale the other six.

The ready snippet, for the day someone adds the follow-up job that runs `npm run sync` on a
Dependabot branch:

```yaml
version: 2
updates:
  - package-ecosystem: gitsubmodule
    directory: /
    schedule:
      interval: daily
```

Adopting it needs one more piece: a workflow that, on a Dependabot pull request, checks out the
branch, runs `npm run sync`, commits the regenerated files, and pushes once. Without that piece,
the bump workflow stays the primary path.

## Why `docs` and `videsign` are linked, not pinned

`docs` is product-neutral and may serve more than one product; its existing sync already copies
every system's documentation, so pinning it would freeze a hub that is meant to be current for
readers, and would put a product-neutral repository inside one product's snapshot. `videsign`
is the design canon: a versioned reference, not a runtime dependency, and it is consumed by
more than this repository. Both are linked from the README and from `AGENTS.md`.

## Changes

| Date | Change | By |
| --- | --- | --- |
| 2026-11-25 | First written | |
