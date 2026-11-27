# Development timeline

Newest first. One entry per slice: what landed, the pull request, and the pins at that time.
Times are ET.

## 27 November 2026

**Owner confirmation of three decision records** — PR #13. ADR-0002, ADR-0003 and ADR-0004 move
to Accepted on the owner's confirmation of this date, quoted in each record, and each record now
states what the confirmation covers and which of its details go beyond it. ADR-0005 is
unchanged. Pins unchanged.

## 25 November 2026

**Brief vocabulary in the agent setup** — PR #10. The schema's `autonomy.overrides` now uses the
design brief's five action classes (read, write, external, spend, credential) instead of the
placeholder set, the setup script carries the brief's five level names, and the question card
quotes a level by its product name. A test locks the class names, so a future edit cannot drift
from section 2.3 of the brief. Pins unchanged.


**Owner decisions and the canonical brief** — PR #9. `docs/vision/design-brief.md` is replaced with
the owner's second edition, verbatim, with only the required one-line header added under the title;
the reconstruction it replaces was written from the owner decisions of the same date and is now
history. `SETUP.md` records the four decisions taken with it: the seven `systems` checks become
required only after the first pin-bump run is green, pin bumps are merged by the owner with no
auto-merge, the bump workflow stays the path over Dependabot, and the docs source list stays in
`docs/sync.md` with no new capability row. Pins unchanged.

**Docs hub source** — PR in `Vidoxlabs/docs` #4: adds `vivarium` to `sources.json`, so the hub's
existing sync carries this repository's README, `AGENTS.md`, and `docs/`. Pins unchanged.

**Setup and close** — PR #8. `SETUP.md`, the owner checklist and merge order, the last timeline
entries, and a final `npm run sync` and `npm run check` on the top of the stack. Pins unchanged.

**Community files** — PR #7. `CONTRIBUTING.md`, `SECURITY.md`, `.github/CODEOWNERS`,
`.github/ISSUE_TEMPLATE/` (bug, feature, system pin, config), `.github/PULL_REQUEST_TEMPLATE.md`,
and `TRADEMARKS.md`. Pins unchanged.

**Docs and decisions** — PR #6. The development timeline, the decision-record index and
template, ADR-0001 to ADR-0005, and the living product brief in `docs/vision/`. Pins unchanged
from the previous entry.

**Product specs and templates** — PR #5. `docs/product/` (naming, first-run setup, model
access, context access), `templates/agent-setup/` with the agent schema, the eight-step setup
script and three generic examples, the subset validator, and `docs/roadmap/system-work.md`.
Pins unchanged.

**Agent context** — PR #4. `AGENTS.md`, the umbrella context file a code agent reads first, and
`CLAUDE.md` pointing at it. Pins unchanged.

**Banner, README, and system map** — PR #3. The light and dark banners with their PNGs, the
social card, the README, and the generated map and status blocks. `docs/system-map.md` follows
the same generation. Pins unchanged.

**Bump automation** — PR #2. `bump-systems.yml`, the cross-repository dispatch template, and the
summary-formatter test. Pins unchanged.

**Systems and tooling** — PR #1. The seven systems pinned as submodules, `systems.config.json`,
the generated `vivarium.json`, `scripts/vivarium.mjs` with `sync`, `check`, and `map`, the
scrub list, the unit tests, and `ci.yml`.

Pins through every slice in this run:

| System | Pin |
| --- | --- |
| seed | `0d158cd7e1fb5098162c98d303ddde8172001062` |
| capillary | `0caa855cca2780f29d1d11167f4f352ba28ee9f5` |
| myosotis | `4c7a8b8ef632c8b36a2f92d9be6d1cefdcf10db9` |
| drosera | `34c5c29c15f1d1f8baa6de6d5016f4809d68f098` |
| aestivation | `f506c9e9a25017ea354e68861ce9112e90d73374` |
| bloom | `4e61cca4ec1d158cd592afcd56a3280489aceedf` |
| trellis | `76d59fb1edb6b7093ae8a42ca29e4bfbd524f5e1` |

**Bootstrap** — the initial commit on `main`: the MIT licence, `.gitignore`, and a three-line
README. Repository settings and the `main` ruleset were applied at the same time.
