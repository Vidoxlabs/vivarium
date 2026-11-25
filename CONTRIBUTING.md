# Contributing

Vivarium is the umbrella for seven public systems. Most changes do not belong here: they belong
in the system's own repository. This page is about the umbrella: the pins, the generated files,
the checks, and the prose.

## Get a working tree

```bash
git clone --recurse-submodules https://github.com/Vidoxlabs/vivarium.git
cd vivarium
npm test
npm run check
```

Already cloned it without the systems? `git submodule update --init --recursive`.

Node 22.13 or newer; `.nvmrc` pins 22.13.1, which is what CI uses. There are no dependencies to
install.

## What belongs where

| If you want to change | Open the pull request in |
| --- | --- |
| a pin, `systems.config.json`, `scripts/`, the workflows, the README, the docs | this repository |
| anything inside `systems/<name>/` | that system's repository, then the pin moves here |

Never edit a file inside a submodule from a branch here. A submodule is another repository at a
pinned commit; a change there gets no review, no tests, and no history. Fix it where it lives,
then let the bump workflow move the pin.

## One concern per pull request

A pull request here does one thing: a pin bump, a tooling change, a docs change, or a CI change.
If a change needs two of those, it is two pull requests.

- Branch from `main`, name the branch for the change, and keep it short and descriptive.
- Never force-push, rebase a published branch, amend a pushed commit, or rewrite history. Fix
  forward with a new commit.
- Commits use conventional messages that describe the change: `feat:`, `fix:`, `docs:`, `ci:`,
  `chore(systems):`. No co-author trailers. No branch names in commit messages or pull request
  titles.
- Merges are squash-only, and the owner merges. Never merge your own pull request here.

## Before you open it

```bash
npm test        # unit tests for the tool
npm run check   # drift, submodule health, cross-links, public safety, no TypeScript
```

`npm run check` is offline and deterministic. If it reports drift, run `npm run sync` and commit
what it rewrites. If it reports a public-safety finding, fix the file: the scan reports the file
and line, never the matched word, and the rule set is in `scripts/scrub-needles.json`.

A pull request that touches a pin also updates `docs/docs-timeline.md` in the same pull request,
with the date and the new pins. A pull request that changes a decision updates the decision
record's **Changes** table.

## The claim discipline

Every capability statement in this repository carries one of four labels, and the label must be
true:

| Label | Means |
| --- | --- |
| `implemented` | code in the named repository does it, and that repository's tests exercise it |
| `specified` | a contract or spec here defines it, and no shipped code does it yet |
| `planned` | a roadmap row names it |
| `observed` | a dated run recorded evidence, kept with its receipts |

Do not upgrade a label without the evidence the next label requires. A public claim of a
capability that is neither `implemented` nor `observed` is a defect, not marketing.

## Public safety

Everything committed here can be read by anyone. Never commit, and never put in a pull request
body, an issue, or a commit message:

- workstation paths, private, LAN, or loopback addresses, hostnames, or port numbers;
- personal handles, account identifiers, or anything that identifies a person's machine;
- dashboard or file-sharing links that address a private resource;
- secrets, tokens, keys, or `.env` files. Name a secret in documentation; never write its value;
- personal agent names, or a person's private details.

`npm run check` enforces this with hashed words and patterns. It is a floor, not a guarantee:
if you would not put it on a public page, do not put it in a commit.

## Where to read next

- [AGENTS.md](AGENTS.md): the context file a code agent reads first.
- [docs/adr/](docs/adr/): the decisions behind the layout and the product.
- [docs/vision/design-brief.md](docs/vision/design-brief.md): the product direction.
- `SETUP.md`: what only the owner can do, and the merge order.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
