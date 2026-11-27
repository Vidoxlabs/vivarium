# Advanced system plan

Status: `planned`. This page extends [system-work.md](system-work.md): the same
rules apply, and none of this replaces it. Every item below is an advanced slice
for a later task **in that system's own repository**. Nothing here is a claim
that the work exists, and nothing here opens a pull request or an issue in a
system repository. Where a slice extends one already named in system-work.md, the
"extends" column says so; new slices get their capability ids from the owning
repository when that repository plans them, not from this page.

Each section names what the pinned system has **today**, with the system's own
label (`implemented`, `specified`, `planned`), and then the advanced slices that
grow it. "Today" claims link to the pinned source and carry its label; they are
not upgraded on this page.

## The eight focus areas

| Focus | Owning system or systems | Extends |
| --- | --- | --- |
| Better agent tools | drosera, with seed's tool identity | D1, D2, D3 |
| Context efficiency | capillary | C1, C2, C3 |
| Agent memory | myosotis | M1, M2, M3 |
| Personality | seed, with the setup templates | S1, S2 |
| Agent internal communications | aestivation, with bloom's assembly | A1, A2, A3 |
| User interaction | bloom | B1 to B5 |
| Testing frameworks | trellis | T1 to T4 |
| Planning with implementation | seed and aestivation | S3, S5 |

---

## 1. Better agent tools (drosera, with seed)

Goal: an agent's tools are admitted through one gate, described by honest
metadata, and revoked the moment the person says so.

**Today** (all `implemented` at the pinned commit): drosera ships the pack
format and tool faces ([src](../../systems/drosera/src/pack.mjs)), the
cookbook packs ([src](../../systems/drosera/src/cookbook.mjs)), the skill
documents and their markdown shape ([src](../../systems/drosera/src/skills.mjs)),
and the workspace coding hooks
([src](../../systems/drosera/src/workspace-coding.mjs)). seed defines tool
identity, the controlled verb grammar, and each registry entry's effect
(`read | write | destructive | credential`), third-party egress and owner-gate
flags ([tool-id contract](../../systems/seed/docs/contracts/tool-id.md),
`implemented`).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| One admission path | Every tool call, from any surface, passes the same admission gate. No flag, mode or harness bypasses it, and a run without a policy denies every non-read and says so, rather than inventing a default level | Depends on seed's `autonomy.policy` (S3) |
| Approvals bound to the exact request | An approval covers one tool id, one argument digest and one run, never a session or a "kind of action". The card the person answers shows the resolved program that will run, not only the typed command line | Extends S3; feeds bloom's approval screen (B3) |
| Action classes from tool metadata | One shared five-class vocabulary — read, reversible write, external or irreversible, spend, credential — derived from seed's tool metadata, with a `spend` declaration on tools that can spend. Metadata that is missing or ambiguous classifies upward, to the stricter class | Extends seed's tool identity; ruled in [ADR-0003](../adr/0003-first-run-setup-and-no-default-autonomy.md) |
| Owner-gated classes | Tools classed credential, destructive, external or spend are refused without an owner gate, at every autonomy level | Depends on the action-classes slice |
| Skill admission by digest | First-party and user skill documents are admitted against a recorded digest, so a skill cannot change after it was reviewed | Grows drosera's skill corpus |
| Packs resolve or the agent does not start | The packs an agent definition names resolve to a cookbook pack, or startup refuses with the missing pack named | D3 |

---

## 2. Context efficiency (capillary)

Goal: the agent sees what it needs, with its sources attached, inside a budget
the person can see — by reference, not by copying the workspace into the prompt.

**Today** (`implemented` at the pinned commit): capillary packs bounded
codebase and conversation packets
([src](../../systems/capillary/src/codebase-packet.mjs),
[src](../../systems/capillary/src/conversation.mjs)), keeps provenance on
records ([src](../../systems/capillary/src/provenance.mjs)), guards reads
against stale epochs ([src](../../systems/capillary/src/epoch-guard.mjs)), and
maintains relations between what the agent knows and where it came from
([src](../../systems/capillary/src/relations.mjs)).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| Route-named packets | Context from each of the five web routes arrives by reference, with the route named in the packet's source | C1 |
| Source records for everything | An upload, a connector item, a page or a paired device gets a source record, so a packet can always say where it came from | C2 |
| Budgeted assembly | The composer asks capillary for a packet under a token budget; the packet says what it included and what it left out, instead of silently truncating | Depends on seed's run budgets |
| Records that persist honestly | Transcript and working-record shapes ride the packer with the same provenance and epoch rules as codebase packets | Grows CAP-05 in capillary |
| The memory hand-over | A packet that becomes a candidate memory keeps its consent state across the hand-over to myosotis | C3, with myosotis M2 |

---

## 3. Agent memory (myosotis)

Goal: the person consents to what is kept, can scope it per agent, and a forget
is real — no stale read brings it back.

**Today** (`implemented` at the pinned commit): myosotis keeps consent as
grants and revocations ([src](../../systems/myosotis/src/consent.mjs)),
recalls under scope ([src](../../systems/myosotis/src/recall.mjs)), and
forgets structurally with epoch-stamped projections, proven by a test that
reads after the forget
([src](../../systems/myosotis/src/forget.mjs),
[test](../../systems/myosotis/test/confirmed-forget.test.mjs)).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| Per-agent scope | Memory scope is `agent` or `shared`, enforced on read as well as write, so one agent cannot read what another kept privately | M1 |
| Consent states before keeping | `ask-each-time` and `ask-once` are recorded before anything is kept, and the record says which one applied | M2, with capillary C3 |
| No resurrection | A forget cannot be undone by a stale projection, a cached packet or a re-ingested copy; read-after-forget is the acceptance test | M3, with capillary's epoch guard |
| Scoped recall | Recall answers only within the consenting scope, and a refusal names the scope it protected | Depends on per-agent scope |

---

## 4. Personality (seed, with the setup templates)

Goal: an agent's character, job and way of working are first-class records that
ride the definition — stable across sessions, owned by the person, never a grant
of authority.

**Today**: the setup templates carry the fields
([agent schema](../../templates/agent-setup/agent.schema.json), `specified`)
and the first-run flow defines how a person answers them
([first-run setup](../product/first-run-setup.md), `specified`). seed has the
closed schema style and the registry-document validation it will reuse
([src](../../systems/seed/src/schema.mjs), `implemented`). The decision that
internal agents use the same public setup is
[ADR-0002](../adr/0002-internal-agents-use-the-public-setup.md).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| Templates never run | An `agent.template` holds placeholders and can never execute; `setup.answers` turns a template into an `agent.definition`, which refuses placeholders anywhere | S1, S2 |
| Character and job as records | Display name, character, job and workflow style are part of the definition record, so a persona is data the person owns and edits, not prompt text a harness owns | S1 |
| Persona continuity | The character record is stable across sessions and surfaces, and a change to it is a visible edit, not a silent drift | Depends on the definition record |
| Standing rules are records, not prose | A standing rule matches one exact tool and scope, carries its own budget and expiry, is revocable by id, and never covers the credential class. Its text is display-only and is never read for matching | Depends on S3; ruled in [ADR-0003](../adr/0003-first-run-setup-and-no-default-autonomy.md) |

---

## 5. Agent internal communications (aestivation, with bloom's assembly)

Goal: when agents work together, the collaboration is records — bounded
delegation, reviewed results, one trace — and nothing can forge the person's
channel.

**Today** (`implemented` at the pinned commit): aestivation carries plans
([src](../../systems/aestivation/src/plan.mjs)), verdicts of approve or revise
([src](../../systems/aestivation/src/verdict.mjs)), held reasons at the gate
([src](../../systems/aestivation/src/gate.mjs)), intent fencing for untrusted
turns ([src](../../systems/aestivation/src/intent.mjs)) and corrections
([src](../../systems/aestivation/src/correction.mjs)).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| A question to the person | A question record carries the setting path that caused it, so the app can render "You set this agent to … Change" and the answer lands on that setting | A1, with seed S5 |
| Execution roles, not fixed identities | A small closed set of execution roles (coordinator, specialist, reviewer, verifier) binds user-created agents per run; an agent's identity is the person's, a role is the run's | Feeds bloom's assembly; distinct from S1 |
| Delegation that only narrows | A delegation record is validated, bounded and cancellable, and can only narrow the delegate's authority, never widen it | Depends on S3's classes |
| Verdicts a verifier cannot mint | Review sign-off is asymmetric — the verifier cannot produce what it verifies, and a judge is never the author of the plan it judges | Grows the gate and verdict records |
| The owner channel cannot be imitated | Tool output is delimited so it can never present itself as the person's answer; a result from a paired device is reviewed like any other | A3, with the trace stream |
| One trace per run | Every delegation, verdict, hold and tool result lands in one trace stream a person can read | With bloom's run view |

---

## 6. User interaction (bloom)

Goal: the person sees what an agent will do, answers exactly what it asked, and
can change any answer at the setting it came from.

**Today**: the terminal commands and the coding loop are the working surface —
bloom's ledger keeps the capability `specified` with its three slices
`landed` ([capability index](../../systems/bloom/docs/capabilities/index.json)),
and the README describes them as implemented; reconciling that label is bloom's
own task. The setup script the screens will render is
[specified](../../templates/agent-setup/setup-script.json).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| First-run setup, resumable and editable | The eight screens render from the setup script, open with nothing selected on the autonomy screen, survive restart, and persist in the person's data — never in a repository | B1, with S2 |
| Every answer carries its Change link | The review screen shows each answer with a link that opens that exact setting | B2 |
| The questions inbox | Question cards arrive with the setting link and the answer returns to that setting; an approval shows the resolved program and is bound to the exact request | B3, with seed S5 and the admission path |
| Pairing | A one-time code with expiry, a device list, and revoke from either side; the companion stays outbound-only | B4, with ADR-0005 |
| Two shells, one definition | Desktop and web read the same agent definition and autonomy policy; neither invents settings the other cannot see | B5 |
| Provider-neutral launch | Subscription sign-in, a personal key or a local model — one route record per kind, no broker, no credential stored by the app | [ADR-0004](../adr/0004-model-access-routes.md), with S4 |

---

## 7. Testing frameworks (trellis)

Goal: the tree is tested from outside the call path, so no system can hide a
failure — and the verdicts are dated evidence, not vibes.

**Today** (`implemented` at the pinned commit): trellis scores the family grid
([src](../../systems/trellis/src/grid.mjs)), runs point probes
([src](../../systems/trellis/src/probes.mjs)) and keeps per-point scoring
([src](../../systems/trellis/src/score.mjs)).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| The probe set, with negative tests | One probe per guarantee — setup with no preselected autonomy, definitions, admission, provenance, consent and forget, plan holds, delegation authority, trace integrity, provider neutrality, boundaries, hygiene — each asserting both the pass and the refusal | T1 to T3, grown |
| Dated verdicts on revisions | A verdict says pass, fail or unknown for a named revision, and unknown is a recorded state when evidence is missing — never a silent pass | With the family grid |
| The pairing probe | A companion that cannot be reached inbound, and a token that stops working after revoke | T2 |
| A grid entry per pin | Every repository's pin is tested from outside before it merges, so the umbrella cannot drift ahead of what it pins | T4 |
| Fail-closed is tested too | A missing corpus, an unreadable record and an absent policy fail with a stated error and a nonzero exit — the tests assert the refusal, not just the happy path | Cross-cutting |

---

## 8. Planning with implementation (seed and aestivation)

Goal: planning is not a prompt trick — it is records that pause, ask, clear,
implement and verify, and the run can always say what it is waiting for.

**Today** (`implemented` at the pinned commit): seed's run model has the
waiting-for-owner status and the pause-and-resume contracts
([run-model contract](../../systems/seed/docs/contracts/run-model.md),
[src](../../systems/seed/src/resume.mjs)), admission per objective
([src](../../systems/seed/src/admission.mjs)), and the provider seam and model
profiles for route selection
([src](../../systems/seed/src/provider.mjs),
[src](../../systems/seed/src/model-profile.mjs)).

**Advanced slices.**

| Slice | What it adds | Extends / depends on |
| --- | --- | --- |
| The policy read on every action | An `autonomy.policy` record — level plus per-class overrides, no default value anywhere — is read on every action, and no agent runs without one | S3 |
| Route kinds on the ladder | Subscription, own key, local model: a kind and a label per route, never a credential, and setup can finish without a route while the agent stays not-runnable with a typed reason | S4, [ADR-0004](../adr/0004-model-access-routes.md) |
| The question record | The action, the setting that caused it, the target and the answer — one record the inbox renders and the setting consumes | S5, with A1 |
| Holds that clear on one line | A plan pauses on a hold, shows its clearing condition, and resumes when the person answers it — the hold is a record, not a lost thought | A2, with the gate |
| Plans that survive restart | A paused run resumes with its plan, its holds and its trace; nothing about the pause is improvised on the way back | seed's pause-and-resume contracts |

---

## Sequencing

The order in [system-work.md](system-work.md) holds here: seed's contracts come
first because the other slices read them, the peers meet at those contracts,
bloom composes, and trellis tests the tree from outside. Within that:

1. seed: the definition, answers, policy and question records (focus 4 and 8) —
   every other area reads them.
2. drosera and capillary: the admission path and the packet budget (focus 1 and
   2), against seed's action classes.
3. myosotis: scope and consent states (focus 3), with capillary's hand-over.
4. aestivation: the question record, delegation and verdicts (focus 5), against
   seed's records.
5. bloom: setup, the inbox, pairing and the shells (focus 6), composing the
   records the others hold.
6. trellis: the probe set and dated verdicts (focus 7), last, so it tests what
   actually shipped.

## The research step every slice starts with

Each system repository has a research rule: before planning a change to a module
that serves a capability, the plan starts from the recorded evidence for that
capability — the claims, the decision axes with the test that holds each one,
and the open gaps — never from general knowledge. A capability with neither
evidence nor a recorded gap is stopped and reported, not planned. See each
system's own `AGENTS.md` for the exact calls. Slices on this page follow that
rule like any other: the owning repository plans them against its evidence, and
until that evidence step runs, "planned" here means direction, not a schedule.

## What is not in this list

The same exclusions as [system-work.md](system-work.md) apply: anything that
changes who bills whom, opens a port, or publishes personal data is an owner
decision, and the decision records say so.
