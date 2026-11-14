# Monster action authoring

Dashboard monster actions: contracts define shapes and catalog issues; the monsters feature owns field UX, acquisition, previews, and normalization before save/publish.

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
| Form surfaces                | `components/form/actions/`   | Preview/detail JSX; `monster-action-sections.tsx` stays at form root   |
| Traits                       | `lib/traits/`                | Trait acquisition (not action workflow)                                |

Section move **eligibility** and data-loss flags are pure helpers in `@rpg/contracts`; transforms and confirmations stay in `use-monster-action-sections.ts`.

## Regression harness

Focused Vitest entry points after structural changes:

- `lib/actions/monster-action-editors.test.ts` — field matrix and visibility
- `lib/actions/validation/monster-action-*-routing.test.ts` / `claim-coverage.test.ts`
- `lib/actions/monster-action-editor-title.test.ts`
- `lib/actions/monster-action-save-round-trip.test.ts`
- `lib/normalize-monster-form-values.test.ts`
- `lib/actions/monster-action-row-snapshot.lib.test.ts`
