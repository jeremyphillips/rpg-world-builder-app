# Persisted mixed weapon proficiency grants — audit

New authoring projects **active mode only** (categories **or** specific items **or** none). Documents where **both** `categories` and `items` are non-empty are **valid at runtime** but require **reconciliation** in the class, monster, and level-0 rules editors before publish.

Detection matches [`isMixedWeaponProficiencyGrantSet`](../../src/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib.ts): both arrays non-empty after coerce.

## Catalog seeds (automated)

[`weapon-proficiency-mixed-grant.seed.test.ts`](../../../packages/catalog/src/classes/weapon-proficiency-mixed-grant.seed.test.ts) ratchets SRD class seeds: **no mixed grants** as of the last green run.

## Homebrew Mongo samples (manual)

Run against a dev/staging database when investigating user content. Adjust collection names if your deployment differs.

### Classes

```javascript
db.content.find(
  {
    type: 'class',
    'body.proficiencies.weapons.categories.0': { $exists: true },
    'body.proficiencies.weapons.items.0': { $exists: true },
  },
  { slug: 1, 'body.proficiencies.weapons': 1 },
)
```

### Monsters (creature grant set)

```javascript
db.content.find(
  {
    type: 'monster',
    'body.proficiencies.weapons.categories.0': { $exists: true },
    'body.proficiencies.weapons.items.0': { $exists: true },
  },
  { slug: 1, 'body.proficiencies.weapons': 1 },
)
```

### Campaign level-0 NPC rules

```javascript
db.campaigns.find(
  {
    'characterCreationRules.levelZeroNpcs.weaponProficiencies.categories.0': { $exists: true },
    'characterCreationRules.levelZeroNpcs.weaponProficiencies.items.0': { $exists: true },
  },
  { name: 1, 'characterCreationRules.levelZeroNpcs.weaponProficiencies': 1 },
)
```

## Findings log

| Date       | Scope               | Result                                        |
| ---------- | ------------------- | --------------------------------------------- |
| 2026-10-15 | SRD catalog classes | Clean — ratchet test passes                   |
| 2026-10-15 | Homebrew Mongo      | Not sampled in CI — run queries above locally |

When mixed grants appear, record entity id/slug and resolve in-app via reconciliation UI; do **not** auto-delete or bulk-migrate without author intent.
