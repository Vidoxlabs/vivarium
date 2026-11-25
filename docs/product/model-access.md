# Model access

Status: `specified`. This page describes what Vivarium launches with; no adapter for these
routes is shipped yet. seed owns the provider adapters and the model ladder.

## The three launch routes

| Route | Who pays | Who holds the credential | What the person sees in settings |
| --- | --- | --- | --- |
| A subscription the person already has, used through the vendor's official sign-in program | the person, to the vendor, on the plan they chose before Vivarium existed | the vendor's own session, on the device or the companion, never copied into an agent definition | "Use a subscription I already have", with the vendor's sign-in screen |
| The person's own API key | the person, directly to the vendor, at the vendor's prices | the operating system credential store on desktop; the paired companion by default for the web app | "Use my own key", with the key field masked and a link to the vendor's billing page |
| A model on this machine or this device | the person, in hardware and electricity | nothing leaves the machine | "Use a model on this machine", with the model's name and size |

An agent has an ordered list of routes. The first route that can answer is used; the rest are
fallbacks. Changing the order changes which model answers first, and nothing else.

## What launches, and what does not

- **No hosted plan at launch.** Vivarium does not sell tokens, does not resell a vendor's
  plan, and does not put itself between the person and the vendor's price list.
- **No broker at launch.** There is no relay that holds a person's key and forwards requests
  on their behalf.
- **Hosted credits: later, maybe.** If Vivarium ever offers credit, it is a separate, clearly
  priced thing the person opts into, and the three routes above keep working without it.

## Where keys live

| Surface | Default | Opt-in |
| --- | --- | --- |
| Desktop app | The device credential store, read by the app, never written to a file Vivarium owns | — |
| Web app | The paired companion holds the key and makes the request; the browser never sees it | Encrypted storage on the web account, only if the person turns it on and sets it up explicitly |
| Agent definition | Never a key, never a token, never an endpoint. Only a route kind and a label | — |

The rule follows from the schema:
[`agent.schema.json`](../../templates/agent-setup/agent.schema.json) allows a route kind and a
short label, and the pattern check in `npm run check` fails a file that carries a key shape.
A key pasted into a description is a finding, not a feature.

## Subscription routes

A subscription program that requires the vendor's own runtime is used only through the
desktop app or through the paired companion. The web app does not pretend to be that runtime
and does not scrape a session. If a vendor offers no sign-in program that a third-party app
may use, that route is not offered: the person uses an API key or a local model instead.

## Vendor terms

Each route is governed by the vendor's own terms, and the person agrees to them with the
vendor, not with Vivarium. The design brief's sources list the terms that were read when the
routes were chosen; this page does not restate prices, quotas, plan names, or limits, because
a number copied here would be wrong within a month. When a vendor's terms change, the route's
documentation link in settings is the place to say so.

## What this means for a code agent

- Do not add a fourth route kind without an ADR that amends [ADR-0004](../adr/0004-model-access-routes.md).
- Do not write a key into an agent definition, a log, a test fixture, or an error message.
- Do not add a hosted plan, a relay, or a bundled credit without the owner's decision: it
  changes who bills whom.
- A route is a *kind* plus a *label*. Everything specific to a deployment stays in the
  person's own configuration, never in this repository.
