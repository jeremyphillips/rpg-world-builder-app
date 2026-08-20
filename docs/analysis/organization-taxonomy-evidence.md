# Organization taxonomy evidence

**Status:** Supporting evidence  
**Canonical roadmap:** [`docs/roadmap/organization-taxonomy.md`](../roadmap/organization-taxonomy.md)  
**Runtime classification:** [`apps/dashboard/docs/organizations-classification.md`](../../apps/dashboard/docs/organizations-classification.md)

Reusable semantic gates and boundary decisions from the 150-concept discovery corpus, preset
authoring, and the functions/practices split. Research digest:
[`organization-taxonomy-discovery.md`](../discovery/organization-taxonomy-discovery.md). Frozen
Phases 1–8 record:
[`archive/organization-taxonomy-discovery-v0.1.md`](../discovery/archive/organization-taxonomy-discovery-v0.1.md).

## Documentation retention

> If a completed investigation's accepted conclusions are represented by current code/tests and its
> reusable reasoning has been captured in a canonical runtime doc or this evidence doc, delete the
> investigation document. Git history is the archive.

## Function admission

- **Reusable organizational mission** — spans multiple familiar organization types, not a single
  craft or trade name.
- **Not a practice** — narrow occupational specialties belong on Practices, not Functions.
- **Disjoint from Practices** — no shared ids between `ORGANIZATION_FUNCTION_IDS` and
  `ORGANIZATION_PRACTICE_IDS`.

## Practice admission

- **Distinctive operational specialty** — trades, methods, or clandestine crafts authors search for
  by name.
- **Discovery terms** — aliases and search terms live on classification entries; combobox search uses
  `getOrganizationPracticeDiscoveryTerms()` at the form boundary.
- **Presentation families** — UI-only grouping in
  `ORGANIZATION_PRACTICE_PRESENTATION_FAMILY_BY_ID`; not persisted, not eligibility rules.

## Functions / practices split

The pre-split activity partition keys are frozen in
[`organization-activity-migration.ts`](../../packages/contracts/src/rpg/vocab/organization-activity-migration.ts)
as `ORGANIZATION_ACTIVITY_PARTITION_IDS`. They are **partition keys** for regression tests — not a
claim that every id was historically persisted as `activities[]`.

Representative boundary cases live in
[`organization-activity-pressure.fixture.ts`](../../apps/dashboard/src/features/content/organizations/lib/presets/fixtures/organization-activity-pressure.fixture.ts).

## Preset / discovery gates

- **Ephemeral projection** — presets seed domain / form / functions / practices / affinities; preset
  id is never persisted.
- **Apply vs recommend** — preset `practices` are applied; `recommendedPractices` boost combobox
  order only. `practices ∩ recommendedPractices` must stay empty.
- **Discovery ownership** — a live preset label must not appear verbatim in another preset's
  `discoveryTerms` (contracts guard + dashboard mirror test).
- **150-corpus disposition** — frozen outcomes in
  [`organization-preset-coverage.fixture.ts`](../../apps/dashboard/src/features/content/organizations/lib/presets/fixtures/organization-preset-coverage.fixture.ts).
  `undiscoverable` must stay zero; `weak` / `no_start` rows are diagnostic, not debt to zero out.

## Deferred / rejected (from discovery)

| Candidate                                             | Disposition    | Reason                                                                                                 |
| ----------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `organizationKind` primary axis                       | **Superseded** | Replaced by Domain + Form + Functions + Practices                                                      |
| Clandestine visibility field                          | **Rejected**   | Visibility belongs in narrative / relationships, not classification                                    |
| Navy / temple / university as forced distinct presets | **Partial**    | Shipped as separate presets where discovery cleared; navy-family still shares military force signature |
| Craft-specific function siblings                      | **Rejected**   | Crafts belong on Practices (`blacksmithing`, `brewing`, …)                                             |
| `college` / `court` / `crew` Form ids                 | **Deferred**   | Insufficient cross-preset pressure at close                                                            |

## Outliers intentionally kept awkward

Discovery marked some concepts **acceptable** rather than **clean** when the authored name carries
the distinction and the model expresses honest partial coverage — e.g. academy vs university families
without a dedicated `college` Form id.

Reopen only under the stopping rule in [`organization-taxonomy.md`](../roadmap/organization-taxonomy.md).
