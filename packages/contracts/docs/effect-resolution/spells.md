# Effect resolution — spells

Spell-specific adapter for the shared framework in [base.md](./base.md).

## Envelope location

Optional `resolution` on [`spellBodySchema`](../../src/rpg/content/spell/body.ts):

- `selectionMode`, optional `target`, optional `origin`, optional `areaOfEffect`
- `method`, `effects[]`, `outcomes[]`, optional `applicationPattern`

Root `effects[]` may coexist during migration (`hybrid` modeling status).

## Spell range vs resolution proximity

| Field                         | Role                                             |
| ----------------------------- | ------------------------------------------------ |
| Spell `range`                 | Descriptive metadata for spell cards and filters |
| `resolution.target.proximity` | Mechanical proximity for **targets** mode        |
| `resolution.origin`           | Mechanical distance for **point** mode           |

Preview and execution read resolution fields only — never infer selection from
spell `range`.

## Area of effect ownership

| Layer                     | Role                                                          |
| ------------------------- | ------------------------------------------------------------- |
| Spell `areaOfEffect`      | Descriptive metadata when resolution is absent                |
| `resolution.areaOfEffect` | **Authoritative** for resolution preview and future execution |

Rules:

- Formatters read **only** `resolution.areaOfEffect`.
- Seed scripts may copy spell-level geometry into resolution during migration.
- No ongoing sync requirement after migration.
- Non-blocking warning when both exist and differ:
  [`getSpellResolutionAreaMismatchWarning`](../../src/rpg/content/spell/resolution/spell-resolution-warnings.ts).

## Legacy normalization

Stored spells may still use `target.proximity.kind: 'self'`. On parse,
[`normalizeSpellResolutionInput`](../../src/rpg/content/spell/resolution/normalize-resolution.ts)
maps that to `selectionMode: 'self'` and removes the target block.

## Fixtures

Canonical examples: [`fixtures.ts`](../../src/rpg/content/spell/resolution/fixtures.ts)
(`FALSE_LIFE_RESOLUTION`, `FIREBALL_RESOLUTION`, `BURNING_HANDS_RESOLUTION`, …).

## Seed migration

- Manifest: [`spell-seed-resolution.ts`](../../../../catalog/src/spells/spell-seed-resolution.ts)
- Derive script: [`derive-resolution-from-spell.ts`](../../../../catalog/src/spells/lib/derive-resolution-from-spell.ts)
- Apply script: [`apply-spell-seed-resolution.mjs`](../../../../catalog/src/spells/scripts/apply-spell-seed-resolution.mjs)
- Audit tests: [`spell-resolution-targeting-audit.test.ts`](../../../../catalog/src/spells/spell-resolution-targeting-audit.test.ts)

## Partial targeting gaps

Resolved spells with incomplete targeting semantics are tagged in
[`spell-resolution-targeting-gaps.ts`](../../../../catalog/src/spells/spell-resolution-targeting-gaps.ts)
and surfaced on coverage inventory entries as `targetingGap`.

## Dashboard authoring

Mode visibility matrix, cleanup rules, and form round-trip:
[authoring.md](../../../../apps/dashboard/src/features/content/spells/resolution/docs/authoring.md).
