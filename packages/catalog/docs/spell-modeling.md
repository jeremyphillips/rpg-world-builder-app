# Spell modeling workflow (catalog)

Human-reviewed modeling metadata on SRD spell seeds — status ladder, gaps, manifest
apply, and CI audit.

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
dashboard resolution editor round-trips the stored shape without data loss. Gaps are
expected and allowed below `sufficient-for-display`.

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
- **Audit report:** `pnpm exec tsx packages/catalog/scripts/generate-spell-modeling-report.mjs`
- **Generated inventory:** [`docs/analysis/spell-modeling-inventory.generated.md`](../../../docs/analysis/spell-modeling-inventory.generated.md)

Do not hand-edit per-spell tables in `docs/analysis/spell-progression-modeling.md` §2 —
that section was removed in favor of the generated inventory.

## Manifest entry shape

```ts
{
  reviewedAt: '2026-07-15T00:00:00.000Z',
  status: 'meaningful-partial',           // optional — omit for terminal prose-only
  gaps: [{ code: 'flammability-rules', note: '...' }],  // omit when none; never []
}
```

## Reviewer checklist

1. Confirm resolution envelope parses (`spellResolutionSchema`).
2. Run dashboard round-trip: `resolutionToForm` → `resolutionToStored` identity.
3. Set `meaningful-partial` when editor-eligible; add gap codes for prose riders.
4. Promote to `sufficient-for-display` only when `formatResolutionSummarySections` produces useful output.
5. Never persist `gaps: []` — omit the key when there are no known gaps.

## Gap codes

Union registry: `packages/contracts/src/rpg/content/spell/modeling/spell-modeling-gap-codes.ts`.

Targeting, application, and environment families are split by file under
`packages/contracts/src/rpg/content/spell/modeling/`.

## Related manifests

| Manifest                     | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `spell-seed-resolution.ts`   | Which slugs get `resolution` and how (full / derived / defer) |
| `spell-modeling-manifest.ts` | Reviewed `modeling` metadata (status + gaps)                  |
| `spell-seed-progression.ts`  | Structured progression tracks (separate concern)              |

## Tests

- `spell-modeling-manifest.test.ts` — manifest ↔ seed parity
- `spell-modeling-audit.test.ts` — audit shape and promotion validation
