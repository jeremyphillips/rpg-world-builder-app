# SRD mechanical coverage

Shared-model gaps that monster authoring runs into. This is not a monster-only ruleset and not a modeling schema. Spell effects stay in the spell-resolution docs. Stat-block math stays in [monster-stat-blocks.md](./monster-stat-blocks.md).

Agents assess and review monsters without editing this file. An approved authoring or implementation pass updates a gap and appends the capability log. Approving a prose fallback does not close the gap.

## Lifecycle

`open` → `proposed` → `approved` → `implemented` → `verified`, plus `deferred` and `rejected`.

Keep the evidence when a gap is verified. Deficiency types are not interchangeable:

- Missing structured capability.
- Missing runtime resolution.
- Missing authoring UI.
- Missing stat-block presentation.
- Incomplete source data. This is not a schema gap.
- Supported but unverified. This is not a reason to add a field.

## Gaps

### `legendary-actions`

- Concept: a legendary-action section and its costs.
- Deficiency: missing structured capability and missing stat-block section.
- Evidence: [action-architecture.md](./action-architecture.md) and [effect-resolution/monster-actions.md](./effect-resolution/monster-actions.md). No legendary section on the monster schema.
- Representative: none seeded. Trait and spell examples such as hag coven casting are a different id.
- Current fallback: none. Do not force legendary rows into actions, bonus actions, or reactions.
- Importance: essential when the source has the section.
- Owner: monster action sections. Character applicability is low. Limited-use recovery can already be shared.
- Approval: open. Implementation: not started.

### `save-conditions`

- Concept: a saving-throw outcome that applies a condition such as grappled, restrained, or paralyzed.
- Deficiency: missing structured capability on the shared effect envelope.
- Evidence: monster saves accept damage only. Grapple or restraint stays in an outcome `note`. The spell roadmap already names the `condition` capability in [effect-capability-roadmap.md](./effect-resolution/effect-capability-roadmap.md).
- Current fallback: outcome `note` for a rider. That fallback leaves this gap open.
- Importance: essential when the condition is the feature's main effect.
- Owner: shared effect envelope, then monster saves. Characters meet the same hole through spells and features. Do not add a monster-only condition effect.
- Approval: open. Implementation: not started.

### `trait-spellcasting`

- Concept: a trait that casts spells, such as Coven Magic, rather than a spell action.
- Deficiency: missing structured capability. Traits store a name and a description.
- Evidence: [spellcasting-authoring.md](../../../apps/dashboard/src/features/content/monsters/docs/spellcasting-authoring.md). An Open5e payload that omits the trait is incomplete source data on that assessment, not this gap.
- Current fallback: trait description. Prose does not close the gap.
- Importance: essential for creatures whose casting is the trait.
- Owner: a later shared casting section. The spell action's ability shape is the one to reuse. Character applicability is indirect. Species and class traits can need the same "this feature casts these spells" shape.
- Approval: open. Implementation: not started.

### `spell-list-omits-dc-and-attack`

- Concept: the printed spellcasting sentence's save DC and, when the SRD prints it, spell attack bonus.
- Deficiency: missing stat-block presentation. `deriveSpellcastingLines` already computes both. `formatMonsterSpellEntry` does not print them.
- Evidence: [monster-stat-blocks.md](./monster-stat-blocks.md). Mage's derived numbers have no test assertion, so they are unverified. Do not treat this as a missing resolver.
- Current fallback: none in the generated sentence. Do not paste the SRD DC into description HTML to hide the omission.
- Importance: essential when the SRD sentence includes the number.
- Owner: `formatMonsterSpellEntry` and monster display. The math stays in `runtime/creature/spell-dc.ts`. Characters already use the same DC and attack functions.
- Approval: open. Implementation: not started.

### `weapon-alternate-modes`

- Concept: a second attack line for versatile damage or a separate thrown attack.
- Deficiency: missing runtime resolution of that second line. The current policy is one weapon-action line. Versatile damage is not applied. Thrown range stays on the same line and is flagged `unresolvedCapabilities`.
- Evidence: [weapon-action-modes.md](../../../apps/dashboard/src/features/content/monsters/docs/weapon-action-modes.md) and the fixture tests in `stat-block.test.ts`. The primary attack is supported. Kobold Warrior's dagger is the seeded thrown case. The catalog test asserts its attack bonus only.
- Current fallback: the primary line, plus the unresolved-capability flag. Do not invent a second bonus.
- Importance: standard. It becomes essential only when the SRD prints a second line the seed must match.
- Owner: weapon attack profile. Characters meet versatile and thrown through inventory, not monster weapon actions.
- Approval: open. Implementation: not started.

## Seed coverage inventory

Status is **not assessed** until a later approved pass records a review. The Hell Hound and Mage reviews that calibrated the skill stayed in the chat report and did not change this table. Nothing below is a claim of complete SRD parity.

The catalog test parses all five seeds and asserts the slug set. It does not call `collectMonsterCatalogIssues`, and it does not render traits, defenses, senses, or spell lists.

- **Kobold Warrior** (`srd-cc-5.2.1:kobold-warrior`). Tested literals: AC 14, dagger attack bonus 4. Untested: HP, saves, skills, traits. Descriptive prose in the seed: Pack Tactics, Sunlight Sensitivity. May exercise `weapon-alternate-modes`. Not asserted here. Status: not assessed.
- **Skeleton** (`srd-cc-5.2.1:skeleton`). Tested: schema load and slug only. Untested: AC, HP, attacks, defenses. Status: not assessed.
- **Knight** (`srd-cc-5.2.1:knight`). Tested literals: initiative `+0 (10)`, HP 52, AC 18, greatsword `+5` / `10` / `2d6+3` plus `1d8` radiant, heavy crossbow `+2` / `11` / `2d10` plus `1d8`, multiattack sentence, Parry stored as a reaction of kind `special`. Untested: saves, skills, the Parry sentence. Parry's AC bonus is prose. Status: not assessed.
- **Mage** (`srd-cc-5.2.1:mage`). Tested literals: initiative `+2 (12)`, HP 81, AC 15, Arcane Burst `+6` / `16` / `3d8+3`, multiattack sentence. Untested: spell list, per-spell limits, shared casting, Misty Step, Protective Magic, spell DC, spell attack. Spell bodies stay on the spell records. Related gap: `spell-list-omits-dc-and-attack`, unverified for this seed. Status: not assessed.
- **Hell Hound** (`srd-cc-5.2.1:hell-hound`). Tested literals: initiative `+1 (11)`, HP 58, AC 15, bite `+5` / `7` / `1d8+3` plus `1d6`, natural-weapon bite, multiattack sentence, Fire Breath heading `Fire Breath (Recharge 5–6)` and the DC 12 / 15-foot cone / `17 (5d6)` body. Untested: fire immunity, Pack Tactics rendering, senses, skills. Pack Tactics is trait prose. Fire Breath is a resolved save. Status: not assessed.

## Capability log

Append after an approved authoring pass. No entries yet.

- Monster slug.
- Mechanics newly verified, and mechanics reused.
- Gaps opened or exercised. Gaps resolved, if any.
- Regression fixtures added.
- Other SRD monsters now considered authorable.
- Whether a model change was required.
