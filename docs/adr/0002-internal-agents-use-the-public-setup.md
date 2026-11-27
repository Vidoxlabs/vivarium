# 0002: Internal agents use the public setup

- **Status**: Accepted (owner confirmation, 27 November 2026)
- **Date**: 2026-11-27
- **Decided by**: the owner
- **Amends**: none

**Owner confirmation.** On 27 November 2026, in chat, the owner wrote: "I confirm that section
11 of my 26 November 2026 continuation directive ratifies the architectural substance of
Vivarium ADR-0002, ADR-0003 and ADR-0004."
The substance accepted is this: internal agents use the same public setup, templates and
editors as any user, and their configurations live in user data, not in a private product
overlay. The rejections of a private branch and a private fork below are read as forms of an
overlay; the confirmation does not name them. How public CI scans for names, and how many
example templates ship, go beyond the confirmation and are not owner-confirmed.

## Context

Vidoxlabs runs its own work with internal agents. The temptation is to give them a private
path: a private overlay repository, a private branch, or a fork of the templates with the
company's own names in it. Every one of those would mean the owner's own agents are built by
code no user sees, and that a capability internal agents need can live somewhere users cannot
ask for it.

The product also has to be able to answer a plain question: "can I make an agent like that?"
If the answer is "yes, if you had our private layer", the answer is no.

## Decision

There is no private overlay, no private branch, and no private fork.

- Vidoxlabs' internal agents are ordinary user agents, created in the app through the same
  first-run setup, the same templates, and the same editors as anyone's.
- They live in the owner's user data, never in a repository. This repository and the seven
  systems ship generic templates only.
- If internal agents need something the setup cannot express, that is a missing feature for
  every user. It is specified here in public, in `docs/product/`, and built for everyone.
- Public CI keeps personal names and private details out. `npm run check` hashes forbidden
  words and scans for patterns; a personal name in a template is a failing check, not a
  review note.

## Consequences

- The owner's own experience and a user's experience are the same experience, by construction.
- A feature internal agents want becomes public work with public tests. That is slower, and it
  is the point.
- The templates in `templates/agent-setup/` must stay generic. Three examples, no personal
  names, no keys, no endpoints.
- Anything that cannot be said in public cannot be part of how internal agents work; it stays
  in the owner's own user data, outside every repository.

## Alternatives

**A private overlay repository.** Rejected: a hidden layer undermines user trust and splits the
owner's experience from the user's. It would also make "how do I do what your agents do"
unanswerable.

**Private branches in the public repositories.** Rejected: a branch is still code that exists
in a public repository's history and gets reviewed, tested, and eventually merged, and it would
teach contributors that some work bypasses review.

**A private fork.** Rejected: it doubles the maintenance and guarantees the two copies drift,
and the drift is invisible until an internal agent behaves differently from what users get.

## Changes

| Date | Change | By |
| --- | --- | --- |
| 2026-11-25 | First written from the owner's decision | |
| 2026-11-27 | Accepted on the owner's confirmation, quoted above, with the scope of that confirmation stated | a maintainer, recording the owner's decision |
