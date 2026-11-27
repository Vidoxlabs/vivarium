# 0004: Model access routes

- **Status**: Accepted (owner confirmation, 27 November 2026)
- **Date**: 2026-11-27
- **Decided by**: the owner
- **Amends**: none

**Owner confirmation.** On 27 November 2026, in chat, the owner wrote: "I confirm that section
11 of my 26 November 2026 continuation directive ratifies the architectural substance of
Vivarium ADR-0002, ADR-0003 and ADR-0004."
The substance accepted is this: Vivarium launches with officially supported subscription
access, the person's own API keys, and local models, with no hosted-credit plan and no
credential broker at launch. The confirmation chooses no model provider and makes no
decision on where keys are stored. The key-storage bullets below (the operating system's
credential store, the paired companion as the web default, and opt-in storage on the web
account), the vendor-runtime rule that depends on the companion of ADR-0005, the terms for
any later hosted credit, and the schema and scan mechanics go beyond the
confirmation and are not owner-confirmed.

## Context

A personal agent needs a model, and the model is the one part of the product that costs money
on every use. There are three honest ways a person can pay for that: they already pay a vendor
for a subscription, they pay a vendor directly for API use, or they run a model on hardware
they own.

The dishonest ways are familiar: resell someone's plan, hold their key on a server and forward
requests, or give away credit that a vendor will eventually invoice. Each changes who bills
whom without changing what the person sees, which is the worst kind of surprise.

## Decision

Vivarium launches with three routes, and only three:

1. **A subscription the person already has**, used through the vendor's official sign-in
   program. The person pays the vendor, on the plan they chose before Vivarium existed.
2. **The person's own API key**, paid to the vendor at the vendor's prices.
3. **A model on the person's own machine**, paid for in hardware and electricity.

- **No hosted plan at launch**, and **no broker**: no relay holds a person's key and forwards
  requests on their behalf.
- **Hosted credits: later, maybe.** If credit is ever offered, it is separate, clearly priced,
  opt-in, and the three routes keep working without it.
- **Keys stay with the person by default.** The desktop app keeps a key in the operating
  system's credential store. The web app uses the paired companion by default, so the browser
  never holds the key. Storage on the web account is an explicit, encrypted opt-in, not a
  default.
- **A subscription program that requires the vendor's own runtime is used only through the
  desktop app or the paired companion.** The web app does not impersonate a vendor's runtime
  and does not scrape a session.
- **An agent definition holds route kinds and labels, never a key, a token, or an endpoint.**
  The schema has no field for one, and the public-safety scan fails a file that carries a key
  shape.

The reasoning and the route table live in `docs/product/model-access.md`.

## Consequences

- The person's bill is always a bill from someone they chose, and Vivarium's price list does not
  include tokens.
- A feature that needs a server-side model call must be traced to one of the three routes, or
  it does not ship. That will rule some ideas out.
- The web app depends on a paired companion for key-based routes. That is a real cost: without
  a companion, the web app is limited to routes that need no key of the person's.
- Route order is a user setting, so two people with the same agent can get different answers.
  The record of which route answered belongs in the run record, not in a guess.
- Vendor terms change. The documentation link in settings is where a change is described, and
  this page deliberately restates no prices or quotas.

## Alternatives

**A hosted plan with bundled credit.** Rejected at launch: it puts Vivarium between the person
and the vendor's bill, and it needs a margin decision before the product has users.

**A key broker.** Rejected: it would make Vivarium the custodian of every user's key, which is
the largest possible security surface for the smallest possible convenience.

**API keys only.** Rejected: most people who would use this already pay for a subscription, and
telling them to pay twice is a worse product.

**Local models only.** Rejected as the only route: it excludes the person whose machine cannot
run one, and it makes the first run a hardware conversation.

## Changes

| Date | Change | By |
| --- | --- | --- |
| 2026-11-25 | First written | |
| 2026-11-27 | Accepted on the owner's confirmation, quoted above, with the scope of that confirmation stated | a maintainer, recording the owner's decision |
