# Foundation composition editorial review

Review date: 2026-09-29

Collection revision: `foundation-5`

Fixture: 24 fixed seed/context cases in
[`foundation-composition-review.generated.md`](foundation-composition-review.generated.md)

## Acceptance

The reviewed fixture passes the actionable-fragment authoring standard:

- Every composition exceeds the 65% externally actionable target. The 24 cases
  contain 192 selected fragments; inward-facing lines appear only as contrast to
  behaviors, obligations, relationships, and live consequences.
- Traits provide repeatable table behaviors and recognizable triggers.
- Ideals reveal values through choices or routines rather than essay-like moral
  claims.
- Bonds identify concrete debts, records, keys, letters, promises, places,
  people, possessions, or unresolved events that another character can affect.
- Flaws create predictable trouble through behavior under pressure.
- Experiences use specific roles, objects, and acts and leave a witness, debt,
  record, grievance, investigation, missing answer, or other consequence open.
- Generic class and species labels appear only in social or training situations
  where the explicit taxonomy is natural, rather than as template-shaped
  character summaries.
- Alignment-sensitive slots now have two explicitly tagged candidates per
  alignment. Pairs were checked for different methods or pressures (for example
  lawful good promise-keeping versus speaking up about wrongdoing; chaotic evil
  entitlement versus punitive humiliation), not paraphrases of one temperament.
- Rich contexts demonstrate organization, residence, hometown, mentor, class,
  and species-aware prose where those references bind. Culture tokens are present
  in rich contexts but did not surface in this seed set; culture-bound fragments
  remain in the inventory for later fixture seeds.
- Sparse and missing-alignment contexts still produce complete, concrete
  compositions.

The inventory reports 182 fragments, explicit alignment coverage of at least two
per alignment for ideals, flaws, choice, and motivation, all declared relationship
conditions, all three inferred hook shapes, no repeated four-word openings, and no
text-overlap clusters at the editorial review threshold.

Selection smoke tests across 24 deterministic seeds confirm multiple explicit
alignment-tagged IDs are chosen for each alignment-sensitive slot without changing
generator weighting.

## Composition decision

Do not extend composition logic in this phase. The fixture does not show a
recurring failure that positive pair or story-arc linkage would solve. Shared
themes plus the revised fragments produce coherent-enough independent fields,
and the remaining variation is useful rather than contradictory.

Reconsider optional `pairId` or `arcId` metadata only if repeated fixture reviews
show one of these patterns:

1. ideals and flaws regularly imply incompatible decision rules;
2. experience, choice, and motivation repeatedly form contradictory timelines;
3. a relationship-bound passage regularly conflicts with another selected
   relationship claim.

Structured prose ingredients remain deferred until a concrete template or
language-model expansion consumer exists.
