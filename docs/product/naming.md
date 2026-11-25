# Naming

Status: `specified`. This page is the rule for user-facing copy; nothing here claims a
feature runs today.

## The rule

- **Vivarium is the product.** One product, one name, one front door.
- **bloom is Vivarium's user-interface system**, not a product. Say Vivarium for the product
  and bloom only for the interface system.
- **docs is a separate, product-neutral documentation hub.** It is linked, not pinned,
  because it may serve more than one product and it already syncs every system's
  documentation.

The family rule from the systems themselves: public repositories use only proper nouns of
things a public repository backs, plus generalized role terms. Vivarium is an ordinary word,
which fits that rule.

## How the seven read in user-facing copy

People meet one product. The seven are described as parts of it, in plain words, and never as
separate products with their own front doors.

| System | Say it like this | Never say |
| --- | --- | --- |
| seed | "The foundation: the records, the contracts, and the connection to each model." | "the seed product" |
| capillary | "Where context comes from, with the source still attached." | "the context app" |
| myosotis | "Memory: what it keeps, with your consent, and what it forgets for good." | "the memory product" |
| drosera | "The tools and skills it can use, and the packs you can add." | "the tools platform" |
| aestivation | "How it plans, reviews its own work, and asks you before it goes ahead." | "the review engine" |
| bloom | "The app you open." After first mention only: "the interface". | "the bloom platform", "bloom by Vidoxlabs" |
| trellis | "The checks that run from outside, so a failure cannot hide." | "the test product" |

## Where the names appear

- **Repository names** stay as they are: `seed`, `bloom`, `capillary`, `myosotis`, `drosera`,
  `aestivation`, `trellis`. A repository name is an address, not a product.
- **Product copy, help text, and settings** use Vivarium for the product and the plain
  description above for the part. A person should never have to learn seven names to use one
  product.
- **Code and contracts** use the system names, because a code agent needs to know which
  repository owns a responsibility. `systems.config.json` holds that mapping.

## What this means for a pull request

If a change renames something a person reads, the question is: does it rename a part of
Vivarium, or does it rename Vivarium? A part keeps its system name in code and its plain
description in copy. Renaming the product is not a documentation change; it is a product
decision, and it belongs to the owner.
