# Spell modeling workflow (catalog)

Human-reviewed modeling metadata on SRD spell seeds — status ladder, blockers, gaps,
manifest apply, and CI audit.

## Status ladder

Ordered rungs (see `packages/contracts/src/rpg/primitives/modeling/status.ts`):

| Rung                             | Persisted? | Editor     | Detail VM              |
| -------------------------------- | ---------- | ---------- | ---------------------- |
| `prose-only`                     | Derived    | Inert      | Prose                  |
| `non-meaningful-partial`         | Derived    | Inert      | Prose                  |
| `meaningful-partial`             | Explicit   | **Active** | Prose                  |
| `sufficient-for-display`         | Explicit   | Active     | Structured             |
| `sufficient-for-character-sheet` | Explicit   | Active     | Structured             |
| `mechanics-ready`                | Explicit   | Active     | Structured / mechanics |

**`meaningful-partial` certifies:** resolution is materially useful **and** the
dashboard resolution editor round-trips the stored shape without data loss. Residual
gaps are expected and allowed below `sufficient-for-display`.

**`non-meaningful-partial`** is derived when `resolution` exists but no explicit
status has been reviewed — or when the form cannot safely express the envelope (rare).

## Source of truth

```
spell-modeling-manifest.ts  →  apply script  →  level-*.json (modeling field)
                         ↘
              spell-modeling-audit.ts  →  generated inventory (CI)
```

- **Manifest:** [`src/spells/spell-modeling-manifest.ts`](../src/spells/spell-modeling-manifest.ts)
- **Apply:** `pnpm exec tsx packages/catalog/scripts/apply-spell-modeling-metadata.mjs`
- **Audit CLI:** `pnpm catalog:spell-modeling-audit` (from repo root)
- **Audit report:** `pnpm catalog:spell-modeling-report` or `pnpm exec tsx packages/catalog/scripts/generate-spell-modeling-report.mjs`
- **Generated inventory:** [`docs/analysis/spell-modeling-inventory.generated.md`](../../../docs/analysis/spell-modeling-inventory.generated.md)

Do not hand-edit per-spell tables in `docs/analysis/spell-progression-modeling.md` §2 —
that section was removed in favor of the generated inventory.

## Manifest entry shape

```ts
{
  reviewedAt?: '2026-07-15T00:00:00.000Z', // optional — manifest-owned review
  status?: 'meaningful-partial',
  blocker?: {
    code: 'effect-schema-missing',
    capabilityId?: 'stat-modifier', // spell-domain id; omit when no family yet
    note?: '...',
  },
  gaps?: [{ code: 'progression-schema-missing', note: '...' }], // residual only; omit when none; never []
}
```

### Blocker semantics

- **Prose-only:** `blocker` prevents promotion to `meaningful-partial`.
- **Editor-active (`meaningful-partial`):** `blocker` prevents the next rung, usually `sufficient-for-display`. Omit when only residual gaps remain.
- Do **not** duplicate `blocker.code` in `gaps`.
- **`blockedFrom`** is derived in audit reports only — not persisted on seeds.

Spell capability IDs: `packages/contracts/src/rpg/content/spell/modeling/spell-modeling-capability-ids.ts`.

## Reviewer checklist

1. Confirm resolution envelope parses (`spellResolutionSchema`).
2. Run dashboard round-trip: `resolutionToForm` → `resolutionToStored` identity.
3. Set `meaningful-partial` when editor-eligible; add residual `gaps` for prose riders.
4. Set `blocker` to the single causal limitation preventing the **next** status rung.
5. Promote to `sufficient-for-display` only when `formatResolutionSummarySections` produces useful output.
6. Never persist `gaps: []` — omit the key when there are no residual gaps.

## Gap codes

Union registry: `packages/contracts/src/rpg/content/spell/modeling/spell-modeling-gap-codes.ts`.

Targeting, application, and environment families are split by file under
`packages/contracts/src/rpg/content/spell/modeling/`.

Effect capability build priority and backlog grouping:
[`packages/contracts/docs/effect-resolution/effect-capability-roadmap.md`](../../../packages/contracts/docs/effect-resolution/effect-capability-roadmap.md).

Prose-only spells should persist **`blocker`** documenting the promotion limitation.
Summary and generated inventory report **prose-only without documented blocker**.

### Audit CLI filters

| Filter                    | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `--blocker <code>`        | Spells with this blocker code                |
| `--residual-gap <code>`   | Spells with this residual gap                |
| `--capability <id>`       | Spells whose blocker references a capability |
| `--blocked-from <status>` | Spells blocked from promotion to this status |
| `--undocumented-blocker`  | Prose-only spells missing `modeling.blocker` |

## Level seed shards

Large level files are split alphabetically under `src/spells/data/srd-cc-5.2.1/` using
`level-{n}-{firstInitial}-{lastInitial}.json` (e.g. `level-1-a-f.json`). The loader in
`index.ts` concatenates shards; scripts iterate `SRD_521_SPELL_LEVEL_SEED_FILES` from
`spell-level-seed-files.ts`.

## Related manifests

| Manifest                     | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `spell-seed-resolution.ts`   | Which slugs get `resolution` and how (full / derived / defer) |
| `spell-modeling-manifest.ts` | Reviewed `modeling` metadata (status, blocker, gaps)          |
| `spell-seed-progression.ts`  | Structured progression tracks (separate concern)              |

## Tests

- `spell-modeling-manifest.test.ts` — manifest ↔ seed parity
- `spell-modeling-audit.test.ts` — audit shape and promotion validation
