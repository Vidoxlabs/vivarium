# 0005: Web-app context routes

- **Status**: Accepted
- **Date**: 2026-11-25
- **Decided by**: the owner
- **Amends**: none

## Context

The desktop app can read a file because it runs where the file is. The web app cannot: it runs
on a server, and the person's device is somewhere else, behind a network they do not control.
Every product that has faced this has chosen between three bad options — pretend the server can
see the device, ask the person to paste things, or ship a browser extension nobody trusts.

There is a fourth option: make the connection outbound from the device, so nothing on the
person's machine listens for the internet.

## Decision

Vivarium launches with the desktop app and a cloud-hosted web app; mobile comes later. The web
app reaches device context only through five opt-in routes:

| Route | Reaches | Connects |
| --- | --- | --- |
| Upload and drag-in | one file or folder the person chose, one time | ordinary upload |
| OAuth connector | one account on one service | the vendor's consent screen |
| Browser extension | the page the person is on, when they press it | an extension they install |
| The agent's own browser | public pages the agent visits itself | a hosted browser session |
| Paired companion | folders and applications the device shares | an outbound-only connection from the device |

The companion pairing flow:

1. A **one-time code**, shown in the app with a short expiry, typed into the companion.
2. An **outbound-only connection** opened by the companion and held open. No inbound listener,
   no published address.
3. **The same autonomy settings, enforced locally.** The companion applies the agent's policy
   before it acts, using the same policy record; a command from the server cannot raise it, and
   where the two disagree the stricter wins.
4. **Revocable from either side**, taking effect at the next action.

The **hand-off rule**: a step that can only happen on the device is named as such, runs on the
paired companion under the same policy, and comes back with the device's name attached. With no
companion, the step waits; the web app never fakes a local result and never widens a scope to
avoid the hand-off.

## Consequences

- The web app is honest about what it cannot reach, and the honest answer is visible in the
  interface rather than in a footnote.
- A web user who wants local files needs a companion. That is a real limit, and it is the price
  of not opening a port on someone's machine.
- The companion must be built and tested as its own surface, with its own probes in trellis.
- Two enforcement points for the autonomy policy, app and companion, must agree. The policy
  record is the single source, and a disagreement resolves to the stricter.
- Context arrives by reference with its source attached (capillary), so a route's name travels
  with the packet and a person can see what was read and from where.

## Alternatives

**Server-side access to the device over a tunnel.** Rejected: it means an inbound path to a
person's machine, which is a security product of its own and one we are not building.

**Paste-only context.** Rejected as the only route: it is safe and useless for anything larger
than a paragraph.

**A browser extension as the only route.** Rejected: it reaches pages, not files or
applications, and it asks for broad permissions on every site to be useful.

**Mobile first.** Rejected: the two surfaces that make the product legible are the desktop and
the web app; mobile adds a third enforcement point before the first two agree.

## Changes

| Date | Change | By |
| --- | --- | --- |
| 2026-11-25 | First written | |
