# Decision records

One file per decision that shapes this repository or the product it describes. A record says
what was decided, why, what it costs, and what else was considered. It is a record, not a
discussion: the discussion belongs in the pull request that lands it.

| Record | Title | Status |
| --- | --- | --- |
| [0001](0001-umbrella-with-submodules.md) | Umbrella with git submodules | Proposed |
| [0002](0002-internal-agents-use-the-public-setup.md) | Internal agents use the public setup | Accepted, owner confirmation, 27 November 2026 |
| [0003](0003-first-run-setup-and-no-default-autonomy.md) | First-run setup and no default autonomy | Accepted, owner confirmation, 27 November 2026 |
| [0004](0004-model-access-routes.md) | Model access routes | Accepted, owner confirmation, 27 November 2026 |
| [0005](0005-web-app-context-routes.md) | Web-app context routes | Accepted |

## Statuses

- **Proposed** — written and open for review; not yet binding.
- **Accepted** — decided. The owner's decision when it changes what a person gets or pays for;
  a maintainer's when it is internal to this repository.
- **Superseded by NNNN** — kept for the record, replaced by a later decision.
- **Rejected** — considered and not taken, with the reason.

## Adding a record

1. Copy [template.md](template.md) to `NNNN-short-title.md`, using the next number.
2. Fill every section. A Consequences section with nothing uncomfortable in it means the
   decision was not examined.
3. Add a row to the table above, and an entry to
   [docs-timeline.md](../docs-timeline.md).
4. Quote the owner's words when the decision is his, with the date and the channel, redacting
   anything private.

Numbers are never reused, including for a rejected record.
