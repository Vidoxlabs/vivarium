# Security policy

## Reporting a vulnerability

Do not open a public issue for a security vulnerability.

Email **admin@vidoxlabs.dev** with a description, reproduction steps, and the impact you
believe it has. Include the repository name and a commit SHA if you can. You will get an
acknowledgement within 48 hours.

## Scope of this repository

This repository holds no product code. Its attack surface is the umbrella tooling and the
workflows that keep the tree honest:

| Surface | What a report might cover |
| --- | --- |
| `scripts/vivarium.mjs` and `scripts/lib/` | a way to make `npm run check` pass while a generated file drifts, or to make the scrub miss a forbidden literal |
| `scripts/scrub-needles.json` | a pattern that does not fire, or fires on something it should not |
| `.github/workflows/` | a workflow that can be made to push, open a pull request, or read a secret it should not |
| `templates/agent-setup/` | an example or a schema that could teach a person to store a key in an agent definition |
| the pins | a pin that points at a commit that is not on that system's `main` |

## The seven systems

Each system's own security surface is handled by that system's `SECURITY.md` and its own review.
Report there if the issue is in the code:

| System | Report in |
| --- | --- |
| seed | [Vidoxlabs/seed](https://github.com/Vidoxlabs/seed) |
| capillary | [Vidoxlabs/capillary](https://github.com/Vidoxlabs/capillary) |
| myosotis | [Vidoxlabs/myosotis](https://github.com/Vidoxlabs/myosotis) |
| drosera | [Vidoxlabs/drosera](https://github.com/Vidoxlabs/drosera) |
| aestivation | [Vidoxlabs/aestivation](https://github.com/Vidoxlabs/aestivation) |
| bloom | [Vidoxlabs/bloom](https://github.com/Vidoxlabs/bloom) |
| trellis | [Vidoxlabs/trellis](https://github.com/Vidoxlabs/trellis) |

The organisation-wide policy, including what is out of scope, is in the
[Vidoxlabs `.github` security policy](https://github.com/Vidoxlabs/.github/blob/main/SECURITY.md).
It applies to this repository as well.

## What we will not do

- We will not pay a bounty for a report about a documentation typo or a missing header.
- We will not treat a scanner's output as a report unless it names a reproduction.
- We will not confirm or deny a report in public before it is fixed.

## Supported versions

This repository is a live tree, not a versioned product: the supported version is the one on
`main`. The seven systems each state their own support in their own security policy.
