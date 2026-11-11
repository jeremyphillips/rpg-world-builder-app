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

- Concept: a legendary-action section on the shared monster action model.
- Implemented: the section, one shared uses pool, optional in-lair uses, `action-reference` rows (including a movement allowance), shared-ability spells, `use-entry` spell references, catalog spells cast from the section, and the `onceUntilNextTurn` sentence. Legendary Actions store only `action-reference`, `spell`, and `special`.
- Not this model: per-option costs, movement execution, and encounter tracking of spent uses. A legendary save that is its own effect stays on `legendary-saves`. Condition riders stay on `save-conditions`.
- Evidence: [action-architecture.md](./action-architecture.md) and [effect-resolution/monster-actions.md](./effect-resolution/monster-actions.md).
- Representative: none seeded. Seeded SRD parity is unverified.
- Importance: essential when the source has the section.
- Owner: monster action sections.
- Approval: open. Implementation: section model implemented. Seed verification not started.

### `legendary-saves`

- Concept: a legendary action that is its own saving-throw effect, not a reference to an action in Actions.
- Deficiency: missing structured capability. Legendary Actions accept only `action-reference`, `spell`, and `special`, so these saves are authored as Custom ability rules text.
- Evidence: Lich Disrupt Life, Solar Blinding Gaze, Kraken Toxic Ink, Adult Black Dragon Cloud of Insects, Sphinx Weight of Years, and Adult Gold Dragon Banish (Open5e `srd-2024`).
- Current fallback: `special` rules text. A turn limit on a `special` prints a plain sentence, not the SRD's "Failure or Success:" lead-in, so authors write that restriction into the rules text. The prose does not close the gap.
- Importance: common in 5.2.1 legendary sections.
- Owner: the shared `save` kind and the monster legendary union. Condition-primary cases also depend on `save-conditions`.
- Approval: deferred. Implementation: not started.
- Reopen when: a legendary save needs a derived DC or damage math.

### `save-conditions`

- Concept: a saving-throw outcome that applies a condition such as grappled, restrained, or paralyzed.
- Deficiency: missing structured capability on the shared effect envelope.
- Evidence: monster saves accept damage only. Grapple or restraint stays in an outcome `note`. The spell roadmap already names the `condition` capability in [effect-capability-roadmap.md](./effect-resolution/effect-capability-roadmap.md).
- Current fallback: outcome `note` for a rider. An on-hit condition id with a prose qualification is a separate stored rider and does not close this gap.
- Importance: essential when the condition is the feature's main effect.
- Owner: not chosen. The shared effect envelope is a candidate, along with spell outcomes and on-hit damage. A condition effect would also need duration, removal, repeat saves, and escape, which that envelope does not express. Monsters, spells, characters, and other creature abilities are all possible consumers. Dire Wolf's bite applies Prone on a hit, which is an on-hit consumer rather than a save. Do not add a monster-only condition effect.
- Approval: open. Implementation: not started. Research only. No owner has been selected.

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
- Deficiency: missing stat-block presentation for the attack-bonus clause. `deriveSpellcastingLines` already computes both numbers. The save DC is printed when a listed spell has a saving-throw resolution.
- Evidence: [monster-stat-blocks.md](./monster-stat-blocks.md). `formatMonsterSpellEntry` prints `spell save DC N` only when that entry has a direct casting ability and one of its own spells has `resolution.method.kind === 'saving-throw'`. The number is the derived `saveDc`. A prose-only save spell does not count, and a missing resolution is not treated as "no save." Mage's Fireball supplies the method. The catalog fixture expects the excerpt sentence with DC 14. That is a monster SRD fixture for the save-DC clause only.
- Current fallback: none. Do not paste the SRD DC into description HTML. The spell attack bonus is still omitted. Do not add it from a separate attack such as Arcane Burst. Green Hag is the future case that needs both numbers, once a listed spell has `resolution.method.kind === 'attack'`.
- Importance: essential when the SRD sentence includes the number.
- Owner: `formatMonsterSpellEntry` and monster display. The math stays in `runtime/creature/spell-dc.ts`. Characters already use the same DC and attack functions.
- Approval: open. Implementation: save-DC clause verified for Mage. Attack-bonus clause not started.

### `weapon-alternate-modes`

- Concept: versatile two-hand damage as a second damage profile.
- Deficiency: missing runtime resolution of that alternate damage. A thrown melee weapon is one profile with melee and ranged modes and one attack bonus. Ammunition use is not part of this gap.
- Evidence: [weapon-action-modes.md](../../../apps/dashboard/src/features/content/monsters/docs/weapon-action-modes.md). Versatile stays on `unresolvedCapabilities`. Kobold Warrior's dagger sentence is a monster fixture for the thrown combined line.
- Current fallback: the primary line, plus the unresolved-capability flag. Do not invent a second bonus.
- Importance: standard. It becomes essential only when the SRD prints a second line the seed must match.
- Owner: weapon attack profile. Characters meet versatile and thrown through inventory, not monster weapon actions.
- Approval: open. Implementation: not started.

## Seed coverage inventory

Recorded 2026-11-09 from Open5e `srd-2024` details and the catalog fixtures. A listed literal is a monster SRD fixture. Anything else is unverified. None of these monsters is fully verified.

- **Kobold Warrior** (`srd-cc-5.2.1:kobold-warrior`, `srd-2024_kobold-warrior`). Fidelity not yet verified for the whole block. Open5e: AC 14, HP 7 (`3d6 - 3`), dagger `+4` and `4 (1d4 + 2)` as one melee-or-ranged line (reach 5 or 20/60). Monster fixtures: AC 14, dagger attack bonus 4. Descriptive: Pack Tactics, Sunlight Sensitivity. The dagger sentence is a monster fixture for melee and ranged on one bonus. Versatile damage remains `weapon-alternate-modes`. Disposition: text-supported. Outstanding seed correction: none from this review.
- **Skeleton** (`srd-cc-5.2.1:skeleton`, `srd-2024_skeleton`). Fidelity not yet verified. Open5e: AC 14, HP 13 (`2d8 + 4`), shortsword and shortbow `+5` and `6 (1d6 + 3)`, poison immunity, exhaustion and poisoned. The seed also stores a bludgeoning vulnerability. Open5e’s vulnerability list is empty, and no excerpt confirms it. Monster fixtures: schema and slug only. Disposition: corrections recommended for that vulnerability. The seed was not changed.
- **Knight** (`srd-cc-5.2.1:knight`, `srd-2024_knight`). Fidelity not yet verified. Open5e calls the AC natural armor. The seed reaches AC 18 with equipped plate, which matches the tested total. Greatsword and heavy crossbow use catalog weapons, a crossbow damage override, and radiant on-hit damage. Parry is a `special` reaction whose +2 AC stays prose. The seed stores a frightened immunity. Open5e’s condition list is empty, and no excerpt confirms it. Monster fixtures: initiative `+0 (10)`, HP 52, AC 18, both attack lines, the multiattack sentence, and Parry’s kind. Disposition: corrections recommended for frightened. The seed was not changed.
- **Mage** (`srd-cc-5.2.1:mage`, `srd-2024_mage`). Fidelity not yet verified. Monster fixtures: initiative `+2 (12)`, HP 81, AC 15, Arcane Burst `+6` / `16 (3d8 + 3)`, the multiattack sentence, derived spellcasting `saveDc` 14 and `attackBonus` 6, and the Spellcasting sentence `spell save DC 14`. The attack bonus is not printed. Spell bodies stay on the spell records. Gap: `spell-list-omits-dc-and-attack` for the attack-bonus clause only. `fixedAcOffset` stays, because the excerpt includes Mage Armor in the AC. Disposition: text-supported for the seed. No seed change.
- **Lich** (`srd-cc-5.2.1:lich`, `srd-2024_lich`). Text-supported for the non-legendary block. Monster fixtures: AC 20, HP 315, Paralyzing Touch `+12` / `15 (3d6 + 5)` cold plus Paralyzed until the lich's next turn, Eldritch Burst `+12` / `31 (4d12 + 5)` force, the multiattack sentence, and spellcasting `saveDc` 20 / `attackBonus` 12. Fireball and Lightning Bolt are stored with `castAtLevel` 5. The spell records stay level 3. Legendary actions are absent. Initiative resolves to Dexterity `+3`; the payload's `+17` is not stored. Languages "All" is not enumerated. Legendary Resistance is 4/day; the lair's fifth use stays in the name. Disposition: text-supported.
- **Hell Hound** (`srd-cc-5.2.1:hell-hound`, `srd-2024_hell-hound`). Fidelity not yet verified. Monster fixtures: initiative `+1 (11)`, HP 58, AC 15, bite `+5` / `7 (1d8 + 3)` plus `1d6`, the multiattack sentence, and Fire Breath’s heading and DC 12 / `17 (5d6)` body. Pack Tactics is trait prose. Fire immunity, darkvision, and Perception are stored and untested. Disposition: text-supported. No seed change.

## Shared capabilities

A monster SRD fixture is an assertion in `packages/catalog/src/monsters/index.test.ts`. A contract fixture is a resolver test that is not that seed.

- Natural armor. Supported and resolved. Monster fixture: Hell Hound AC 15. Kobold Warrior AC 14 is the same capability with a different bonus.
- Equipped weapon attack. Supported and resolved. Monster fixtures: Kobold dagger bonus 4. Knight greatsword and heavy crossbow bonuses.
- Weapon damage override. Supported and resolved. Monster fixture: Knight heavy crossbow `2d10` with no ability modifier in the expression.
- On-hit extra damage. Supported and resolved. Monster fixtures: Knight radiant `1d8`. Hell Hound bite fire `1d6`.
- On-hit condition with a prose qualification, and an on-hit note. The attack profile stores and prints them. They do not change the attack bonus or the damage total. Contract fixture: Paralyzing Touch. This does not close `save-conditions`. Repeat saves, removal, and escape are still absent.
- Unconditional magic-property on-hit damage. The same profile appends it after action effects. Contract fixture: an extra-fire preset. Flame Tongue's extra fire applies only while ablaze, so that damage stays descriptive.
- Natural weapon. Supported and resolved. Monster fixture: Hell Hound bite.
- Save damage and recharge. Supported and resolved. Monster fixture: Hell Hound Fire Breath.
- Multiattack sentence. Supported and resolved. Monster fixtures: Knight, Mage, Hell Hound.
- Spell save DC presentation. Supported and resolved when a listed spell’s resolution method is `saving-throw`. Monster fixture: Mage sentence with DC 14. Prose-only save spells still omit the DC.
- Spell attack bonus on the Spellcasting sentence. The number is derived (`attackBonus` 6 on Mage). It is not printed. Not a monster fixture for presentation.
- Thrown melee and ranged modes. Supported on one attack bonus. Monster fixture: Kobold Warrior dagger sentence. Versatile two-hand damage remains `weapon-alternate-modes`.

## Capability log

Append after an approved authoring pass.

- **Lich** (`srd-cc-5.2.1:lich`). Verified the non-legendary attack lines, multiattack sentence, and spellcasting save DC. Reused equipped-attack resolution, on-hit conditions, spell references, and Legendary Resistance. Opened no new gap. `legendary-actions`, `save-conditions`, and the lair's fifth resistance use stay open. Fixtures are the attack sentences, AC 20, and HP 315. Other SRD undead with on-hit conditions can reuse the same rider. The on-hit condition model was already in place; this seed did not add one.
