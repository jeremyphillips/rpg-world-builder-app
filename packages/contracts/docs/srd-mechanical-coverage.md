# SRD mechanical coverage

Shared-model gaps that monster and class-feature authoring runs into. This is not a monster-only ruleset and not a modeling schema. Spell effects stay in the spell-resolution docs. Stat-block math stays in [monster-stat-blocks.md](./monster-stat-blocks.md).

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

### `creature-forms`

- Concept: multiple defined forms on one stat block, including stable profile identity, true-form designation, size overrides, a generated Shape-Shift action, and a derived Forms trait when that action is absent.
- Implemented: unified defined forms, central identity and destination resolution, size, movement, and speech overrides, the Shape-Shift kind in Actions and Bonus Actions, equipment and prerequisite sentences, `onlyInFormIds` on actions and traits, heading qualifiers, single-level form advisories, and lifecycle-planned removal that keeps an emptied restriction invalid.
- Not this model: stat-block replacement, mist restrictions, involuntary shifts, and Multiattack replacement. Those stay on `stat-block-replacement` or their own gaps.
- Evidence: [creature-forms.md](./creature-forms.md).
- Representative: none seeded.
- Importance: essential for lycanthropes, the Vampire, and the other Shape-Shift creatures.
- Owner: creature forms and the monster Shape-Shift action.
- Approval: open. Implementation: sizes and Shape-Shift started.

### `stat-block-replacement`

- Concept: a creature takes another creature’s stat block, such as Incubus Form, Succubus Form, or Shapechange.
- Not this model: `creature-forms`, which changes sizes on one stat block. The duration-bound spell counterpart is the spell modeling code `transformation-model-missing`.
- Importance: essential when the source replaces the block.
- Owner: deferred.
- Approval: deferred. Implementation: not started.

### `legendary-actions`

- Concept: a legendary-action section on the shared monster action model.
- Implemented: the section, one shared uses pool, optional in-lair uses, `action-reference` rows (including a movement allowance), shared-ability spells, `use-entry` spell references, catalog spells cast from the section, structured `save` rows (same schema and formatter as Actions), and the `onceUntilNextTurn` sentence. Legendary Actions store `action-reference`, `spell`, `special`, and `save`.
- Not this model: per-option costs, movement execution, and encounter tracking of spent uses. A legendary save that is its own effect stays on `legendary-saves`. Condition riders stay on `save-conditions`.
- Evidence: [action-architecture.md](./action-architecture.md) and [effect-resolution/monster-actions.md](./effect-resolution/monster-actions.md).
- Representative: none seeded. Seeded SRD parity is unverified.
- Importance: essential when the source has the section.
- Owner: monster action sections.
- Approval: open. Implementation: section model implemented. Seed verification not started.

### `legendary-saves`

- Concept: a legendary action that is its own saving-throw effect, not a reference to an action in Actions.
- **Implementation: partial.** Legendary Actions accept `kind: 'save'` and reuse the shared Save editor and `formatMonsterSaveAction`. End-to-end coverage is **`full`** for damage-area saves that fit the envelope (e.g. Lich Disrupt Life DC, emanation, half on success, `onceUntilNextTurn`) and **`partial`** when SRD qualifiers or condition-primary outcomes still need `description` or `save-conditions` work (e.g. Solar Blinding Gaze, compound teleport + save).
- Evidence: Lich Disrupt Life, Solar Blinding Gaze, Kraken Toxic Ink, Adult Black Dragon Cloud of Insects, Sphinx Weight of Years, and Adult Gold Dragon Banish (Open5e `srd-2024`). Inventory and exemplar matrix → [srd-action-inventory.md](./srd-action-inventory.md).
- Remaining fallback: `special` with prose `savingThrow` only when structured `save` cannot model the effect yet; do not duplicate envelope fields in prose.
- Importance: common in 5.2.1 legendary sections.
- Owner: the shared `save` kind and the monster legendary union. Condition-primary cases also depend on `save-conditions`.
- Approval: open for remaining exemplars. Implementation: section eligibility + dashboard acquisition; reference inlining (Approach A) not required when saves live in the legendary section.

### `save-conditions`

- Concept: a saving-throw outcome that applies a condition such as grappled, restrained, or paralyzed.
- **Implementation: partial (v1).** Shared ordered outcome effects (`outcome.effects`), `repeatSave` with second-stage condition replacement (`replacesConditionId`), and optional `failed-or-successful-save` notes ship on the shared resolution envelope — see [monster-actions.md](./effect-resolution/monster-actions.md).
- Remaining deferrals: play-time repeat enforcement, Aboleth-style layered removal, escape DC modeling as structured fields, and spell save UI for repeat-save (persist-only today).
- Importance: essential when the condition is the feature's main effect.
- Owner: shared effect envelope + ordered-effect primitive (monsters and spells).
- Approval: open for remaining deferrals.

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

### `learned-collection-acquisition`

- Concept: Wizard spellbook acquisition beyond level gains — copying found spells, copying a book, rebuilding from prepared spells, backup books, and the spellbook item's physical properties (Tiny, readable only by you or _Identify_, chosen appearance).
- Deficiency: missing structured capability. Only level-based acquisition exists (`spellSelection.acquisition`).
- Related fields: `spellSelection.model: 'prepareFromLearnedCollection'`, `collection: 'spellbook'`, `acquisition`, `requiredGear: ['spellbook']`, and the `spellbook` equipment item.
- Owner: the learned-collection model.
- Approval: deferred. Implementation: not started.
- Runtime impact: characters cannot add found spells to a spellbook today, and generated Wizard rules omit the sidebar.

### `spell-slot-tracking`

- Concept: expended spell slots and rest restoration.
- Deficiency: missing runtime resolution.
- Data: `SlotProgression.recovery`.
- Owner: a future character resource-state pass.
- Approval: open. Implementation: not started.
- Resolve when: a rest workflow restores pools using `restMeetsRecovery`.

### `spell-replacement-execution`

- Concept: level-up and Long Rest replacement for cantrips, repertoire, and prepared spells.
- Deficiency: missing runtime resolution.
- Data: compiled `mutation` and the `mutable` membership flag.
- Owner: a future level-up wizard and a sheet prepared-spells editor.
- Approval: open. Implementation: not started.
- Resolve when: both workflows enforce `trigger` and `limit`.

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
- **Creature forms.** Implemented `creature-forms` for stable identity, true-form designation, size overrides, form restrictions, and Shape-Shift; retained `stat-block-replacement` as deferred. No creature was seeded.
