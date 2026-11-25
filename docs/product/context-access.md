# Context access

Status: `specified`. The routes and the pairing flow below are what bloom and drosera build
against; the companion and its tool faces are `planned`. capillary owns what a route returns,
with its source attached.

## Why there is a route at all

The web app runs on a server, so it cannot read a person's disk, their clipboard, or their
local applications. Rather than claim otherwise, Vivarium reaches device context only through
routes the person turns on, one at a time, each with a visible switch and a visible scope.

## The five web-app routes

| Route | What it reaches | How it connects | What the person sees when it is on |
| --- | --- | --- | --- |
| Upload and drag-in | A file or a folder the person chose, one time | Ordinary upload from the browser to the app | The file's name in the conversation, with the copy stored until they delete it |
| OAuth connector | One account on one service: files, mail, calendar, issues | The vendor's consent screen, then a token the app holds | "Connected to … on <date>", the scopes granted in plain words, and a Disconnect button |
| Browser extension | The page the person is on, when they press the button | An extension they install, which sends the page's text and URL on request | A badge on the page and an entry in the conversation saying which page was read |
| The agent's own browser | Public pages the agent visits itself | A hosted browser session owned by the agent, no access to the person's browser | Each URL it opened, in order, with the time |
| Paired companion | The device the companion runs on: files, folders it watches, local applications it exposes as tools | An outbound-only connection from the device to the app, started by a one-time code | The device's name, the folders it shares, and a live "connected" state with a Disconnect |

A route is off until it is turned on. Turning one on never turns another on. Revoking a route
takes effect at the next action, not at the next restart.

## Pairing a companion

1. **One-time code.** The app shows a six-word code and a short expiry. Nothing is paired
   until the person types that code into the companion on the device.
2. **Outbound only.** The companion opens the connection to the app and holds it open. The
   app never dials the device, so there is no port to open, no address to publish, and no
   inbound listener on the person's machine.
3. **The same settings, enforced locally.** The companion applies the agent's autonomy policy
   before it does anything, using the same policy record the app reads. A level the person
   lowered in the app is already in force on the device; a command that arrives from the
   server cannot raise it. Where the two disagree, the stricter wins.
4. **Visible, and revocable from either side.** The device can unpair itself without the app.
   The app can revoke a device without the device. Either way the connection is torn down and
   the token is dropped.

## Hand-off for a device-only step

Some steps can only happen on the device: reading a local file, running a command, operating
an application that has no API. The rule:

- **The web app does not pretend.** It says the step needs the device and offers the hand-off.
- **Hand-off means a paired companion.** If there is one, the step runs there, under the same
  autonomy policy, and the result comes back with the device's name attached. If there is
  none, the step waits: the person can pair a device, switch to the desktop app, or drop the
  needed file in.
- **No silent substitution.** The web app never fakes a local result, never asks the person to
  paste something a route could have carried, and never widens a scope to avoid the hand-off.

## What a code agent must preserve

- A route is opt-in, named, scoped, and revocable. Adding a route kind amends ADR-0005.
- Context arrives by reference with its source attached (capillary), not as an anonymous
  blob, and never widens what the agent may do.
- The companion is outbound-only. A design that needs an inbound connection to the device is
  a different design, and it needs the owner's decision.
- Nothing about a person's machine (paths, addresses, device identifiers) is committed to this
  repository. `npm run check` fails a file that carries one.
