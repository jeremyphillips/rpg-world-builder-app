---
name: srd-monster-authoring
description: >-
  Assess, review, and author SRD 5.2.1 monsters against the shared creature,
  equipment, action, and spell-resolution models. Use when seeding a monster,
  auditing an existing monster seed, comparing a stat block to the SRD, or
  recording a mechanical gap. Read-only until authoring is explicitly approved.
---

# SRD monster authoring

Faithful SRD 5.2.1 stat blocks on the existing creature, equipment, action, and spell models. A gap is recorded. It is not fixed by a monster-only rule or a silent schema change.

Source text → [`open5e-srd`](../open5e-srd/SKILL.md). Spell effects → [`spell-resolution`](../spell-resolution/SKILL.md). This skill does not restate those rules or the resolver formulas.

Report template → [references/assessment-report.md](references/assessment-report.md). Rubric → [references/coverage-rubric.md](references/coverage-rubric.md). Extension gate → [references/model-extension.md](references/model-extension.md). Gap registry → [`srd-mechanical-coverage.md`](../../../packages/contracts/docs/srd-mechanical-coverage.md).

---

## Modes

| Mode | When | Writes |
| --- | --- | --- |
| `assess` | Unseeded SRD monster | Nothing |
| `review` | Seeded monster | Nothing |
| `author` | Create or revise a seed | Only after approval |

Honor an explicit mode. Otherwise a slug in `seedMonsterSlugs('srd-cc-5.2.1')` is `review`. An SRD monster that is not seeded is `assess`. Review, audit, or compare selects `review`. Author, seed, add, or update selects `author` and still stops before any write. Do not ask for a mode flag.

`assess` and `review` end at the report. They do not edit seeds, equipment, actions, contracts, resolvers, tests, docs, or the gap registry. They may run the existing Vitest commands below.

---

## Shared pipeline

Use this for every mode. Do not keep a second scorer or a private damage formula.

1. Open5e `srd-2024` detail. Confirm `document.key`. A missing property is a source-extraction concern, not proof the rule is absent and not automatically a modeling gap. Cross-check an incomplete record against the catalog excerpt or another full stat block before a fidelity claim.
2. Source-feature inventory in the report template. One row per feature. Legendary actions are inapplicable when the source has none.
3. Read the owning doc, then stop. Do not copy formulas into the report beyond the inputs, the resolver name, and the expected value.
4. Equipment and attack order below. Weapon totals go through `resolveInventoryWeaponAttackTotals` for `kind: 'weapon'`, and `resolveMonsterActionAttackProfile` for natural and authored attacks.
5. Spellcasting rows identify ability, spell ids, limits, and cast level. Effect, range, save, condition, concentration, and duration questions follow the spell-resolution skill. Cite that spell's modeling status. Do not copy its effects onto the monster.
6. Independent SRD literals for resolver-owned numbers. Do not derive the expected value from the same resolver.
7. Coverage rubric, including signature mechanics.
8. Gap lookup in `srd-mechanical-coverage.md`. One id per capability. `assess` and `review` propose new ids in the report. They do not write them.
9. Related unseeded creatures via the Open5e skill. Paginate `/v2/creatures/?document__key=srd-2024`, then diff `seedMonsterSlugs()`. Do not seed them.

### Where the rules live

| Concern | Read |
| --- | --- |
| AC, HP, attacks, saves, spell DC | [`monster-stat-blocks.md`](../../../packages/contracts/docs/monster-stat-blocks.md), `deriveMonsterStatBlock` |
| Hit die faces | `CREATURE_SIZE_HIT_DIE`. Largest permitted size wins in `resolveMonsterHitPoints`. Application convention for current SRD blocks. |
| Proficiency and XP | `CHALLENGE_RATING_MECHANICS` |
| Layering | [`runtime-resolution-boundaries.md`](../../../packages/contracts/docs/runtime-resolution-boundaries.md). `runtime/monster/` is current. Extend `runtime/creature/` when characters need the same math. |
| Action kinds, legendary, save conditions | [`action-architecture.md`](../../../packages/contracts/docs/action-architecture.md), [`monster-actions.md`](../../../packages/contracts/docs/effect-resolution/monster-actions.md) |
| Equipment, magic, adjustments | [`equipment-loadout.md`](../../../packages/contracts/docs/equipment-loadout.md), [`magic-properties.md`](../../../packages/contracts/docs/magic-properties.md) |
| Weapon, natural, override | [`weapon-action-modes.md`](../../../apps/dashboard/src/features/content/monsters/docs/weapon-action-modes.md) |
| Spell invocation | [`spellcasting-authoring.md`](../../../apps/dashboard/src/features/content/monsters/docs/spellcasting-authoring.md) |
| Catalog issues | [`catalog-validation.md`](../../../apps/dashboard/src/features/content/monsters/docs/catalog-validation.md), `collectMonsterCatalogIssues` |
| Provenance | [`content-provenance.md`](../../../packages/contracts/docs/content-provenance.md) |
| Senses, movement, defenses, languages | `creature.ts` and the vocab module. No separate rulebook. |
| Armor proficiency | Not stored and not an AC input. Dashboard row status treats owned armor or a shield as proficient. No non-proficiency AC penalty. |

Rendered sections come from [`monster-display.ts`](../../../apps/dashboard/src/features/content/monsters/lib/monster-display.ts) and `runtime/monster/` formatters. Do not add a snapshot harness.

---

## Do not

- Invent a rule to match a number.
- Edit contracts, resolvers, or schemas without a separate implementation approval.
- Add a monster-only resolver or a monster-local spell effect.
- Invent equipment for a claw, bite, breath, or other innate ability.
- Add an unexplained offset so a total matches.
- Treat prose as executable, or print an SRD number in prose to hide a derived mismatch.
- Import every discovered monster, rewrite an existing seed silently, or add an action kind per named ability.
- Close a gap because a descriptive fallback was approved.

---

## Derivation

Prefer an explicit SRD statement and the shared resolver. Infer proficiency, governing ability, natural armor, or an exceptional adjustment only when the stat block omits that detail. Record the inputs. Two plausible derivations lower confidence. A matching total is not proof of the chosen model.

Equipment order:

1. Innate attack, breath, or trait: natural-weapon preset, `save`, or `special`. No equipment row.
2. A catalog weapon the creature carries: owned instance plus `kind: 'weapon'`.
3. An SRD-named magic bonus: instance `magicProperties` preset. Do not copy it into `adjustments` or an action override.
4. A change that belongs to that instance and is not a preset: one `adjustments` row per target.
5. Different base dice than the catalog weapon: action `damage` override only. Type, ability modifier, and equipment damage effects still apply.
6. No catalog weapon and no natural preset: `kind: 'attack'`.

Name the rejected configuration when two setups can print the same line. `fixedAcOffset` needs a reason that natural armor and equipment cannot produce the AC. Natural weapons are proficient by policy. Catalog weapons use `proficiencies.weapons`. Do not infer proficiency from the attack bonus alone.

---

## Approvals

Report decisions A, B, and C. They can combine.

- **A.** Author with supported fields.
- **B.** Author with descriptive fallback in a trait, `special.description`, or a save outcome `note` for a rider. The gap stays open. Resolver-owned numbers still match.
- **C.** Investigate a shared extension. This does not allow a schema edit. Implementation is a further approval. Use [model-extension.md](references/model-extension.md).

Known SRD behavior that the model cannot execute may use B. Incomplete or uncertain source is not B. Reconcile the source first.

**Mechanically ready** requires fidelity Pass, derived parity Pass, no unsupported signature, and no signature left in prose when a resolver already owns that calculation. A signature outside the app's responsibility, such as tactical advantage, may stay descriptive. **Text-supported** may proceed with approved prose and open gaps. **Needs reconciliation** means the source or the derivation is not reliable.

`author` is Phase B, and only after A or B is approved:

1. `seedMonsterSlugs('srd-cc-5.2.1')` before writing. `getMonsterBySlug` throws when the slug is missing, so it is the wrong existence check.
2. An existing slug is a diff and waits for an update decision. Do not insert a second row. Do not edit other monsters or shared catalog rows to force a pass.
3. Reuse catalog equipment and spell ids. Add independent literals in `packages/catalog/src/monsters/index.test.ts`. Call `collectMonsterCatalogIssues` from that test when the seed adds those ids.
4. Update the gap registry and append a capability-log entry only in this approved pass.

---

## Review

Start from `getMonsterBySlug('srd-cc-5.2.1', slug)` and its excerpt. Then run the shared pipeline. Match every SRD feature to a stored field or mark it omitted. Compare the SRD literal, the stored input, and the resolved output. A seed that parses, or a number that matches, does not prove the derivation.

Classify each discrepancy with an owner, a severity, and confirmed or uncertain. Categories are in the report template. If a current shared mechanic already supports the behavior, recommend that mechanic. Do not propose a schema change. Recommend a representation change only when it improves fidelity, correctness, maintainability, or shared coverage. Leave a historical pattern in place when the change is stylistic.

Disposition, separate from the score: **Verified** for a named scope, **Corrections recommended**, **Text-supported**, or **Needs reconciliation**. Verified never means the whole monster when only some fields were tested. "No change" is a complete result.

---

## Tests

`pnpm --filter` runs in the package directory.

```bash
pnpm --filter @rpg/catalog exec vitest run --bail=0 src/monsters/index.test.ts
pnpm --filter @rpg/contracts exec vitest run --bail=0 src/rpg/runtime/monster/stat-block.test.ts
```

The contracts file is for a shared resolver change, which is outside Phase B. Pre-commit and pre-push stay deferred unless the user asks for that checkpoint.
