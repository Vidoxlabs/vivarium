# Development timeline

Newest first. One entry per slice: what landed, the pull request, and the pins at that time.
Times are ET.

## 25 November 2026

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

Pins at the first six slices:

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
