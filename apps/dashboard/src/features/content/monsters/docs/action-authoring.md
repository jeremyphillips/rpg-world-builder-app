# Monster action authoring

Dashboard monster actions: contracts define shapes and catalog issues; the monsters feature owns field UX, acquisition, previews, and normalization before save/publish. Shape-Shift is acquired from Actions or Bonus Actions once a form other than the true form exists. Its equipment and prerequisite fields sit with the other action mechanics. Defined forms and true-form designation are edited under Creature Details. Actions and custom or template traits can limit a row to selected forms; Shape-Shift cannot.

## Pipeline

```text
@rpg/contracts (monster/action/, eligibility, catalog issues)
        │
        ▼
normalize-monster-form-values ──► API write hooks (authoritative publish)
        │
        ▼
MonsterActionSections + useMonsterActionSections (section moves, snapshots)
        │
        ▼
monsterActionDetailFields + components/form/actions/* (detail body, previews)
        │
        ▼
content/lib/forms (shared resolution, equipment range, requirement syncs)
```

**Contracts:** [`packages/contracts/docs/action-architecture.md`](../../../../../packages/contracts/docs/action-architecture.md), effect resolution notes under `packages/contracts/docs/effect-resolution/`.

**Field order in detail bodies:** [action-trait-field-order.md](./action-trait-field-order.md) (preview → advisory → prose → mechanics regions).

**Spell rows and shared casting ability:** [spellcasting-authoring.md](./spellcasting-authoring.md).

**Catalog readiness on publish:** [catalog-validation.md](./catalog-validation.md) and `resolve-monster-publish-catalog-readiness.lib.ts` on the monster form shell.

## `lib/casting` vs `lib/actions`

Cross-tab spellcasting source resolution lives under **`monsters/lib/casting/`** (traits and actions both consume it). Do not nest that hub under `lib/actions/casting/`.

| Area                         | Path                         | Role                                                                   |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| Casting sources & dependents | `lib/casting/`               | Shared spell ability sources, labels, summaries re-exported for traits |
| Acquisition                  | `lib/actions/acquisition/`   | Draft rows when adding kinds/presets                                   |
| Previews                     | `lib/actions/previews/`      | Stat-block sentences and attack summaries (lib builders)               |
| References                   | `lib/actions/references/`    | Equipment links, multiattack graph, list titles                        |
| Validation fixtures          | `lib/actions/validation/`    | Claim coverage and issue-routing harness                               |
| Detail composition           | `lib/actions/detail-fields/` | `monsterActionDetailFields` and per-region composers                   |
| Save pipeline                | `lib/actions/save/`          | Outcomes, slots, resolution target, round-trip harness                 |
| Spell rows (action-local)    | `lib/actions/spell/`         | Spell frequency, cast level, casting fields — not `lib/casting/`       |
| Legendary row fields         | `lib/actions/legendary/`     | Legendary detail fields and category helpers                           |
| Weapon damage override       | `lib/actions/weapon/`        | Catalog damage mapping and override field                              |
| Recharge limited use         | `lib/actions/recharge/`      | Recharge value + detail field                                          |
| Form surfaces                | `components/form/actions/`   | Preview/detail JSX; tab shell is `action-sections.tsx`                 |
| Traits tab lib               | `lib/traits/`                | Trait acquisition, form fields, editor title                           |

Section move **eligibility** and data-loss flags are pure helpers in `@rpg/contracts`; transforms and confirmations stay in `use-monster-action-sections.ts`.

**Action repeatability:** publish rules and add-menu disable/focus states both read
`collectRepeatabilityViolations` / `acquisitionStateForItem` from
[`packages/contracts/src/rpg/content/monster/action/monster-action-repeatability.ts`](../../../../../packages/contracts/src/rpg/content/monster/action/monster-action-repeatability.ts).
A disabled add item uses the same message as publish validation; existing rows are never
removed when a rule is violated.

## Regression harness

Focused Vitest entry points after structural changes:

- `lib/actions/monster-action-editors.test.ts` — field matrix and visibility
- `lib/actions/validation/monster-action-*-routing.test.ts` / `claim-coverage.test.ts`
- `lib/actions/monster-action-editor-title.test.ts`
- `lib/actions/save/monster-action-save-round-trip.test.ts`
- `lib/normalize-monster-form-values.test.ts`
- `lib/actions/monster-action-row-snapshot.lib.test.ts`
