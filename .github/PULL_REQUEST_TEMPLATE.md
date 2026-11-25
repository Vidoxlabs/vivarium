## Summary

What changed, and why. One concern per pull request.

## Type

- [ ] Tooling (`scripts/`, `systems.config.json`)
- [ ] Docs (README, `docs/`, prose)
- [ ] Pin bump (`vivarium.json`, submodule pointers, generated files)
- [ ] CI (`.github/workflows/`)

## Systems touched

Tick a system only if this pull request moves its pin. Nothing here edits a submodule's files.

- [ ] seed
- [ ] capillary
- [ ] myosotis
- [ ] drosera
- [ ] aestivation
- [ ] bloom
- [ ] trellis
- [ ] none

## Checklist

- [ ] `npm test` passes
- [ ] `npm run check` passes
- [ ] `docs/docs-timeline.md` has an entry for this change (required for a pin bump)
- [ ] No file inside `systems/` was edited
- [ ] No secret, token, private path, address, or personal detail is in the diff, the commit
      messages, or this description
- [ ] Any claim about a system links to it, and carries its label when it is not implemented yet

## Choices made

Decisions inside the agreed scope, and why. Anything that needed the owner's decision belongs in
a decision record, not here.

## Questions

Anything a reviewer should decide, with the options and a recommendation.
