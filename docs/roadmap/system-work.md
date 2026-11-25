# System work

Status: `planned`. Every item below is a slice for a later task **in that system's own
repository**. Nothing here is a claim that the work exists, and nothing here opens a pull
request or an issue in a system repository.

Order within a system is the order to build. Across systems, seed's contracts come first,
because the other slices read them.

## seed

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| S1 | `agent.definition` record: id, display name, character, job, workflow style, model routes, context routes, tool grants, memory scope, standing rules, packs | [agent schema](../../templates/agent-setup/agent.schema.json), [first-run setup](../product/first-run-setup.md) | planned |
| S2 | `setup.answers` record: one entry per answered screen, with the setup script version | [setup script](../../templates/agent-setup/setup-script.json) | planned |
| S3 | `autonomy.policy` record: level plus per-action-class overrides, read on every action, with no default value | [ADR-0003](../adr/0003-first-run-setup-and-no-default-autonomy.md) | planned |
| S4 | Route kinds on the model ladder: subscription, own key, local model, each a kind plus a label, never a credential | [ADR-0004](../adr/0004-model-access-routes.md), [model access](../product/model-access.md) | planned |
| S5 | A question record: the action, the setting that caused it, the target, and the answer | [first-run setup](../product/first-run-setup.md) | planned |

## capillary

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| C1 | By-reference context from each of the five web routes, with the route named in the packet's source | [context access](../product/context-access.md) | planned |
| C2 | A source record for an upload, a connector item, a page, or a paired device, so a packet can say where it came from | [context access](../product/context-access.md) | planned |
| C3 | The capillary to myosotis hand-over: a packet that becomes a candidate memory keeps its consent state | [ADR-0005](../adr/0005-web-app-context-routes.md) | planned |

## myosotis

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| M1 | Per-agent memory scope: `agent` or `shared`, enforced on read as well as write | [agent schema](../../templates/agent-setup/agent.schema.json) | planned |
| M2 | Consent states `ask-each-time` and `ask-once`, recorded before anything is kept | [first-run setup](../product/first-run-setup.md) | planned |
| M3 | A forget that survives a stale projection, proven by a test that reads after the forget | [context access](../product/context-access.md) | planned |

## drosera

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| D1 | A connector broker: one connected account, its scopes in plain words, and a revoke that takes effect on the next call | [context access](../product/context-access.md) | planned |
| D2 | Companion tool faces: the device's shared folders and applications, offered as tools with a scope each | [context access](../product/context-access.md) | planned |
| D3 | Packs named by the agent definition (`packs`) resolve to a cookbook pack, or the agent does not start | [agent schema](../../templates/agent-setup/agent.schema.json) | planned |

## aestivation

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| A1 | A question to the person, carrying the setting path that caused it, so the app can render "You set this agent to … Change" | [first-run setup](../product/first-run-setup.md) | planned |
| A2 | A hold on any action triggered by untrusted content: the plan pauses, the person is asked, and the hold clears on one line | [context access](../product/context-access.md) | planned |
| A3 | The assembly gate applied to a paired companion's tool result, so a device result is reviewed like any other | [ADR-0005](../adr/0005-web-app-context-routes.md) | planned |

## bloom

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| B1 | First-run setup UI that renders `setup-script.json`, with the autonomy screen opening with nothing selected | [setup script](../../templates/agent-setup/setup-script.json) | planned |
| B2 | A review screen where every answer carries its Change link, and Change opens that exact setting | [first-run setup](../product/first-run-setup.md) | planned |
| B3 | The questions inbox, with the question-card shape and its setting link | [first-run setup](../product/first-run-setup.md) | planned |
| B4 | The pairing screen: one-time code, expiry, device list, and revoke from either side | [context access](../product/context-access.md) | planned |
| B5 | Desktop shell and web shell, both reading the same agent definition and autonomy policy | [ADR-0005](../adr/0005-web-app-context-routes.md) | planned |

## trellis

| Slice | What it adds | Comes from | Status |
| --- | --- | --- | --- |
| T1 | A setup probe: the eight steps render, and the autonomy step renders with no choice made | [setup script](../../templates/agent-setup/setup-script.json) | planned |
| T2 | A pairing probe: a companion that cannot be reached inbound, and a token that stops working after revoke | [context access](../product/context-access.md) | planned |
| T3 | A route probe per web route, asserting the route's source appears in the packet | [context access](../product/context-access.md) | planned |
| T4 | A family grid entry for this repository's pins, so a bump is tested from outside before it merges | [ADR-0001](../adr/0001-umbrella-with-submodules.md) | planned |

## What is not in this list

Anything that changes who bills whom, opens a port, or publishes personal data. Those are
owner decisions, and the decision records say so.
