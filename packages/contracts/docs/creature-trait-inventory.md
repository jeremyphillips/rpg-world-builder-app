# Creature trait inventory

Audit of descriptive traits on SRD 5.2.1 creatures, and the preset disposition for each row. This is the source record for trait templates. Implementation plans link here. They do not replace this list.

Presets generate stat-block sentences. They do not roll advantage, spend Legendary Resistance, or apply regeneration. Species grants stay a separate system. See [Generated sentence policy](#generated-sentence-policy) and [Ownership](#ownership).

## Source

Open5e API v2, `GET /v2/creatures/?document__key=srd-2024&fields=name,key,traits`, all four pages. 331 creatures. Every `key` is prefixed `srd-2024_`. Aboleth detail confirms `document.key` is `srd-2024`.

Parenthetical titles such as `(3/Day, or 4/Day in Lair)` are part of the printed name. Counts below use the name with that parenthetical removed, then split a name again when the body is mechanically different.

Catalog cross-check: [monsters.json](../../catalog/src/monsters/data/srd-cc-5.2.1/monsters.json) has three trait rows, all in the phase 1 set.

- Kobold Warrior, Pack Tactics. Open5e matches the stored sentence, including “the kobold”.
- Kobold Warrior, Sunlight Sensitivity. Open5e matches, including “the kobold”.
- Hell Hound, Pack Tactics. Open5e matches, including “the hound”.

Skeleton, Knight, and Mage have no traits. Their other named blocks are actions. No seeded trait is custom, configurable, or deferred. Species traits in the catalog (Breath Weapon, Fey Ancestry, Keen Senses, and the rest) do not reuse these monster trait names.

## Coverage

326 trait rows on 204 creatures. 127 creatures have none. 106 names after stripping parentheticals.

| Disposition                   | Rows | Share | What the number means                                                |
| ----------------------------- | ---: | ----: | -------------------------------------------------------------------- |
| Phase 1 `fixed-preset`        |  145 |   44% | Shipped as a preset with no author fields                            |
| Phase 2 `configurable-preset` |   66 |   20% | Needs a stored value or a second preset id with a value              |
| `deferred`                    |   20 |    6% | Save, aura, or automatic effect; waits on the shared effect envelope |
| `custom`                      |   95 |   29% | Authored prose, including fixed sentences held back on purpose       |
| Total                         |  326 |  100% |                                                                      |

Phase 1 is 18 preset ids. The Spider Climb row on Swarm of Insects is one of the 95 custom rows, not one of the 145.

A later pass can promote a held-back fixed sentence to a new preset id without adding fields and without changing the ids shipped in phase 1.

## Ownership

Shared creature pieces already live in [creature.ts](../src/rpg/content/creature.ts): size, movement, senses, communication. Monsters compose those pieces. Species does not.

Two trait systems exist, and they stay separate.

- **Descriptive traits.** A monster trait is either custom prose (`id`, `name`, `description`) or a phase 1 preset id. Custom HTML is stored. Preset sentences are generated. Display is [monster-display.ts](../../../apps/dashboard/src/features/content/monsters/lib/monster-display.ts).
- **Grant traits.** [contentTraitSchema](../src/rpg/content/lib/grants/grants.ts) is `custom` or `grant`. A grant trait is one unlocked group with one sense, resistance, movement, or language grant. [resolveTraitDisplay](../src/rpg/content/lib/grants/trait-display.ts) derives “You have …” and allows `nameOverride` and `descriptionOverride`. Species traits and heritage options use this schema. Class features extend the custom trait only.

Preset definitions belong next to the other creature value objects: stable id, label, menu group, and the stat-block sentence template. The formatter that fills the subject belongs in `runtime/creature/`, because [runtime-resolution-boundaries.md](./runtime-resolution-boundaries.md) puts reusable creature presentation there and keeps monster assembly in `runtime/monster/`.

`formatMonsterStatBlockSubject` stays a monster adapter. It returns `the ${name.toLowerCase()}` (`the hell hound`). The shared formatter receives that phrase. It does not know monster records, and it does not grow a species voice. Species sentences are second person and often come from grants. Sharing those templates would need a second voice. This phase does not add one.

Monster authoring and the stat block call the shared formatter. They own the combobox, duplicate checks, HTML wrapping, and provenance. Phase 1 does not add a preset field to species, and it does not change grant overrides.

## Generated sentence policy

Generated prose keeps SRD conditions, terminology, capitalization, and constants. It does not keep the short stat-block noun (`hound`, `kobold`, `wolf`, `devil`).

- The monster adapter supplies the subject: `the hell hound`, `the kobold warrior`, `the pit fiend`.
- A sentence-initial subject is capitalized once: `The hell hound`.
- A subject later in the sentence stays lowercase: `While in sunlight, the kobold warrior has …`.
- Later references to that same creature use `it`, `its`, or `itself` when the referent is unambiguous.
- Do not form a possessive by appending `'s` to the name.
- Do not pluralize the name, and do not store a per-creature noun.
- Do not add a field to absorb grammar.
- Provenance excerpts keep the Open5e wording when the generated sentence differs.

Cosmetic differences use the majority SRD sentence when the rule is the same.

- Pack Tactics: 17 rows say “an attack roll”. Wolf says “attack rolls”. Generated text uses the singular. Both mean advantage on the attack roll.
- Flyby: six rows say “an Opportunity Attack”. Owl says “Opportunity Attacks”. Generated text uses the singular.
- Agile: Deer is singular; Rat is plural. Generated text uses the singular.
- Web Walker: four rows repeat the noun; Giant Spider says “it”. Generated text uses “it”.
- Earth Glide repeats the noun in the second clause. Generated text uses “it”.
- Undead Fortitude repeats “the zombie” at the end, including on the Ogre Zombie. Generated text uses “it” for that second reference, and the full name for the first.

A wording change that adds or removes a condition, a target, a number, or a save is mechanical. Those rows do not share a fixed preset. Swarm of Insects Spider Climb is the example: the climb works only when the swarm has a Climb Speed.

Open5e sometimes leaves a glossary token in list text (`Hitazard` on the Fire Elemental’s Fire Aura, for “burning”). Phase 1 sentences were checked as plain prose. Deferred aura text needs a detail or excerpt check before anyone formats it.

## Phase 1 fixed presets

No author fields. Constants in the sentence are the same on every included row. `{Subject}` is the capitalized subject. `{subject}` is the lowercase subject.

Menu groups: Environment, Movement, Combat, Form, then General for Custom trait. Labels sort alphabetically inside a group.

### Environment

- **Amphibious** (`amphibious`, 31, cosmetic). The {Subject} can breathe air and water. Aboleth, Adult Black Dragon, Adult Bronze Dragon, Adult Gold Dragon, Adult Green Dragon, Ancient Black Dragon, Ancient Bronze Dragon, Ancient Gold Dragon, Ancient Green Dragon, Archelon, Black Dragon Wyrmling, Bronze Dragon Wyrmling, Chuul, Crab, Dragon Turtle, Frog, Giant Crab, Giant Frog, Giant Toad, Gold Dragon Wyrmling, Green Dragon Wyrmling, Green Hag, Kraken, Merfolk Skirmisher, Merrow, Sea Hag, Storm Giant, Young Black Dragon, Young Bronze Dragon, Young Gold Dragon, Young Green Dragon. Limited Amphibiousness is a different trait and stays custom.
- **Ice Walk** (`ice-walk`, 4, identical). The {Subject} can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement. Adult White Dragon, Ancient White Dragon, White Dragon Wyrmling, Young White Dragon. The SRD noun is “the dragon” on every row.
- **Sunlight Sensitivity** (`sunlight-sensitivity`, 5, cosmetic). While in sunlight, the {subject} has Disadvantage on ability checks and attack rolls. Drider, Specter, Wight, Wraith, Kobold Warrior. The kobold row matches once the noun is supplied. Light Sensitivity and Sunlight Weakness are different rules and stay custom.

### Movement

- **Agile** (`agile`, 2, cosmetic). The {Subject} doesn't provoke an Opportunity Attack when it moves out of an enemy's reach. Deer, Rat. This is not Flyby: the trigger is any move, not flying.
- **Amorphous** (`amorphous`, 4, cosmetic). The {Subject} can move through a space as narrow as 1 inch without expending extra movement to do so. Black Pudding, Gray Ooze, Ochre Jelly, Shadow. Compression on the Octopus is the same sentence under another name. It stays custom so this preset’s printed name stays Amorphous. A later `compression` id can reuse the sentence. No name override.
- **Earth Glide** (`earth-glide`, 2, cosmetic). The {Subject} can burrow through nonmagical, unworked earth and stone. While doing so, it doesn't disturb the material it moves through. Earth Elemental, Xorn.
- **Flyby** (`flyby`, 7, cosmetic). The {Subject} doesn't provoke an Opportunity Attack when it flies out of an enemy's reach. Flying Snake, Gargoyle, Giant Owl, Giant Wasp, Hippogriff, Owl, Pteranodon.
- **Incorporeal Movement** (`incorporeal-movement`, 4, cosmetic). The {Subject} can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object. Ghost, Specter, Will-o'-Wisp, Wraith. The damage roll does not vary.
- **Running Leap** (`running-leap`, 2, cosmetic). With a 10-foot running start, the {subject} can Long Jump up to 25 feet. Lion, Saber-Toothed Tiger. Both distances match, so they are not fields.
- **Spider Climb** (`spider-climb`, 13, cosmetic). The {Subject} can climb difficult surfaces, including along ceilings, without needing to make an ability check. Black Pudding, Drider, Ettercap, Giant Lizard, Giant Spider, Giant Wolf Spider, Lizard, Ochre Jelly, Phase Spider, Roper, Spider, Vampire, Vampire Spawn. Swarm of Insects is custom: the trait applies only if the swarm has a Climb Speed.
- **Tunneler** (`tunneler`, 2, cosmetic). The {Subject} can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake. Ankheg, Purple Worm. Half speed and the 10-foot diameter do not vary.
- **Web Walker** (`web-walker`, 5, cosmetic). The {Subject} ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web. Drider, Ettercap, Giant Spider, Phase Spider, Spider.

### Combat

- **Lightning Absorption** (`lightning-absorption`, 2, cosmetic). Whenever the {subject} is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt. Flesh Golem, Shambling Mound. Fire Absorption and Acid Absorption stay custom. Acid also negates the damage, so it is not this sentence. They can become their own fixed ids later. They do not become a damage-type field on this id.
- **Magic Resistance** (`magic-resistance`, 34, cosmetic). The {Subject} has Advantage on saving throws against spells and other magical effects. Archmage, Balor, Barbed Devil, Bearded Devil, Bone Devil, Chain Devil, Clay Golem, Deva, Djinni, Dryad, Efreeti, Erinyes, Flesh Golem, Glabrezu, Hezrou, Horned Devil, Ice Devil, Imp, Iron Golem, Marilith, Mummy Lord, Nalfeshnee, Night Hag, Pit Fiend, Planetar, Pseudodragon, Quasit, Satyr, Solar, Sphinx of Wonder, Stone Golem, Tarrasque, Unicorn, Vrock. Pit Fiend matches; the two-word name is only a subject. Greater Magic Resistance stays custom.
- **Pack Tactics** (`pack-tactics`, 18, cosmetic). The {Subject} has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition. Baboon, Blood Hawk, Dire Wolf, Giant Rat, Giant Vulture, Hell Hound, Hobgoblin Warrior, Hyena, Kobold Warrior, Lion, Reef Shark, Tough, Tough Boss, Vulture, Warrior Infantry, Werewolf, Winter Wolf, Wolf.
- **Siege Monster** (`siege-monster`, 4, cosmetic). The {Subject} deals double damage to objects and structures. Earth Elemental, Kraken, Tarrasque, Treant.
- **Undead Fortitude** (`undead-fortitude`, 2, cosmetic). If damage reduces the {subject} to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, it drops to 1 Hit Point instead. Ogre Zombie, Zombie. The DC formula, the Radiant and critical exceptions, and the 1 hit point result match.

### Form

- **Immutable Form** (`immutable-form`, 4, identical). The {Subject} can't shape-shift. Clay Golem, Flesh Golem, Iron Golem, Stone Golem.

## Phase 2 configurable presets

Not in the first implementation. Each id below is new. None of them overload a phase 1 id.

- **Legendary Resistance** (`legendary-resistance`, 32). Body is one sentence on every row: if it fails a saving throw, it can choose to succeed instead. Nouns differ (`aboleth`, `dragon`, `mummy`, `sphinx`). The parenthetical name is the mechanic. Store `uses` (positive integer; SRD uses 3, 4, and 6) and `lair` (boolean). When `lair` is true, the printed lair uses are `uses + 1`. Every lair row in this set is exactly one higher: 3/4 on fifteen creatures (ten adult dragons, Aboleth, Mummy Lord, Sphinx of Lore, Sphinx of Valor, Vampire) and 4/5 on twelve (ten ancient dragons, Kraken, Lich). No lair row uses another delta. Plain titles: Balor and Unicorn 3/Day, Pit Fiend and Solar 4/Day, Tarrasque 6/Day. Default `uses` 3 and `lair` true, the largest single pattern. The name is derived. A future lair bonus other than +1 needs a new preset, not a third field on this one.
- **Hold Breath** (`hold-breath`, 6). Store a duration: positive integer plus `minute` or `hour`. Sentence: The {Subject} can hold its breath for {duration}. Default 1 hour. Evidence: 1 hour on Crocodile, Giant Crocodile, Hydra, Plesiosaurus; 10 minutes on Hippopotamus; 30 minutes on Killer Whale. Giant Octopus’s extra hour belongs to Water Breathing, not this trait.
- **Illumination** (`illumination`, 5). Store bright radius in feet (positive integer). Dim light is the same distance again and is not stored. All five rows are equal pairs: 10 on Azer Sentinel, Giant Fire Beetle, Nightmare; 20 on Will-o'-Wisp; 30 on Fire Elemental. Default 10. Sentence: The {Subject} sheds Bright Light in a {radius}-foot radius and Dim Light for an additional {radius} feet.
- **Standing Leap** (`standing-leap`, 3). Store Long Jump in feet. High Jump is half and is not stored. Evidence: Frog 10 and 5; Giant Frog and Giant Toad 20 and 10. Default 10. Require an even Long Jump so the High Jump stays a whole number. Sentence keeps “with or without a running start.”
- **Swarm** (`swarm`, 7). Store the Tiny creature noun (short text, required, no default). The rest does not vary: occupy another creature’s space and vice versa, pass through an opening large enough for a Tiny {noun}, and cannot regain Hit Points or gain Temporary Hit Points. Evidence: bat, insect, piranha, rat, raven, snake, and “creature” (Swarm of Crawling Claws). An enum would block homebrew nouns, so the field stays free text.
- **Regeneration** (`regeneration`, 2). Store hit points regained (positive integer). Default 10. Sentence includes “if it has at least 1 Hit Point.” Oni 10, Shield Guardian 10. This is not the troll rule.
- **Regeneration halt** (`regeneration-halt`, 2). Separate preset because the shutdown and the 0-hit-point death clause are a different rule, not a checkbox on `regeneration`. Store hit points only. Default 15. Acid or Fire shutdown, and death only when the turn starts at 0 and regeneration does not happen, stay in the sentence. Troll 15, Troll Limb 5. Printed name is still Regeneration.
- **Water Breathing** (`water-breathing`, 9). The eight ordinary rows are only “can breathe only underwater” (Giant Seahorse, Giant Shark, Hunter Shark, Octopus, Piranha, Reef Shark, Seahorse, Swarm of Piranhas). Giant Octopus adds hold breath for 1 hour outside water. Store an optional duration, same shape as Hold Breath, with no default. Empty duration prints the one sentence. A present duration adds the second. This stays out of phase 1 so `water-breathing` is not born as a field-free id and later grows a field.

Rejected as configuration:

- **Bloodied Fury.** Boar has advantage on attack rolls while Bloodied. Giant Boar has advantage on melee attack rolls while Bloodied. Two future fixed ids if promoted. Not a melee switch.
- **Ethereal Sight.** Ghost sees 60 feet from the Material Plane into the Ethereal. Phase Spider also sees the other way. Range matches. Two future fixed ids if promoted. Not a direction checkbox.
- **Energy absorption as one preset.** Lightning ships in phase 1. Fire Absorption (Iron Golem) and Acid Absorption (Clay Golem, which also negates the damage) can each become a fixed id. Not a damage-type field and not a negate flag.

## Deferred

These rows are saves, emanations, end-of-turn auras, or automatic damage. [action-architecture.md](./action-architecture.md) already reserves `method.kind: 'automatic'` for a later action kind. Trait presets do not grow DC, damage, radius, or save fields.

- **Death Burst** (5). Dust Mephit: Dexterity DC 10, 5-foot, 5 (2d4) Bludgeoning. Ice Mephit: Constitution DC 10, 5-foot, 5 (2d4) Cold. Magma Mephit: Dexterity DC 11, 5-foot, 7 (2d6) Fire. Steam Mephit: Dexterity DC 10, 5-foot, 5 (2d4) Fire. Magmin: Dexterity DC 11, 10-foot, 7 (2d6) Fire. Success is half damage on each.
- **Death Throes** (1, Balor). Death explosion, two damage rolls, 30-foot Emanation.
- **Fire Aura** (4). Azer Sentinel: chosen creatures, 5-foot, 5 (1d10) Fire, skipped while Incapacitated. Salamander: chosen creatures, 5-foot, 7 (2d6) Fire. Balor: each creature, 5-foot, 13 (3d8) Fire. Fire Elemental: each creature, 10-foot, 5 (1d10) Fire, plus ignition. The list payload’s “Hitazard” is a glossary token for burning.
- **Heat Aura** (1, Remorhaz). 5-foot, 16 (3d10) Fire at the end of each turn.
- **Stench** (2). Ghast: Constitution DC 10, 5-foot, Poisoned, 24-hour immunity on a success. Hezrou: Constitution DC 16, 10-foot, Poisoned, no immunity clause.
- **Fear Aura** (1, Pit Fiend). Wisdom save, Frightened, 20-foot Emanation.
- **Gibbering** (1, Gibbering Mouther). Wisdom DC 10, 20 feet, random behavior on a failure.
- **Vile Appearance** (1, Sea Hag). Wisdom DC 11, 30 feet, Frightened, 24-hour immunity.
- **Mucus Cloud** (1, Aboleth). Constitution DC 14, underwater curse and later Acid damage.
- **Aberrant Ground** (1, Gibbering Mouther). 10-foot Emanation of Difficult Terrain.
- **Aura of Authority** (1, Hobgoblin Captain). 10-foot ally aura for attack and save advantage.
- **Barbed Hide** (1, Barbed Devil). 5 (1d10) Piercing to a grappling creature at the start of each turn.

## Custom

95 rows. “Promote” means a later fixed preset id with no fields. It does not mean a phase 1 id gains a parameter.

### Fixed sentences held back

Useful later, and too narrow or too procedural for the first menu.

- **Abduct** (2, Bugbear Stalker, Bugbear Warrior). Identical aside from the noun. Grappled movement costs nothing extra. Promote as `abduct`.
- **Divine Awareness** (2, Planetar, Solar). Identical aside from the noun. Knows when it hears a lie. Promote as `divine-awareness`.
- **Inscrutable** (2, Sphinx of Lore, Sphinx of Valor). Identical two-sentence block. Promote as `inscrutable` if sphinx authoring needs it.
- **Demonic Restoration** (5, Glabrezu, Hezrou, Marilith, Nalfeshnee, Vrock). Identical aside from the noun. Instant return in the Abyss. Procedural. Promote as its own id, not as a plane picker.
- **Diabolical Restoration** (7, Barbed Devil, Bone Devil, Chain Devil, Erinyes, Horned Devil, Ice Devil, Pit Fiend). Same Nine Hells sentence. “The devil” versus “the erinyes” / “the pit fiend” is the subject policy. Promote as its own id.
- **Exalted Restoration** (3, Deva, Planetar, Solar). Identical Mount Celestia sentence aside from the noun. Promote as its own id.
- **Wishes** (2, Djinni, Efreeti). Identical long paragraph (30 percent, three casts, 365 days). Promote only as a whole fixed id.
- **Compression** (1, Octopus). Same 1-inch sentence as Amorphous. Promote as `compression` reusing that sentence. Do not rename Amorphous.
- **Blood Frenzy** (1, Sahuagin Warrior). Advantage against creatures missing Hit Points. Promote as `blood-frenzy`.
- **Bloodied Frenzy** (1, Berserker). While Bloodied, advantage on attacks and saves. Not Bloodied Fury. Promote as `bloodied-frenzy`.
- **Beast of Burden** (1, Mule). Counts as one size larger for carrying capacity. Promote as `beast-of-burden`.
- **Jumper** (1, Cat). Jump distance uses Dexterity. Promote as `jumper`.
- **Ephemeral** (1, Will-o'-Wisp). Cannot wear or carry anything. Promote as `ephemeral`.
- **Invisibility** (1, Invisible Stalker). Has the Invisible condition. Sentence only, not a grant. Promote as `invisibility`.
- **Light Sensitivity** (1, Cloaker). Bright Light, disadvantage on attack rolls. Not Sunlight Sensitivity. Promote as `light-sensitivity`.
- **Sunlight Weakness** (1, Shadow). Sunlight, disadvantage on D20 Tests. Promote as `sunlight-weakness`.
- **Limited Amphibiousness** (1, Sahuagin Warrior). Air and water, plus a 4-hour submersion limit. The 4 hours do not vary. Promote as `limited-amphibiousness`.
- **Blurred Form** (1, Steam Mephit). Attacks against it have disadvantage unless it is Incapacitated. Promote as `blurred-form`.
- **Reactive** (1, Marilith). One Reaction on every turn. Promote as `reactive`.
- **Evasion** (1, Assassin). Dexterity save for half: no damage on a success, half on a failure, unusable while Incapacitated. Promote as `evasion`.
- **Speak with Beasts and Plants** (1, Dryad). Fixed type pair. Promote as that named id, not as a creature-type picker.
- **Freeze** (1, Water Elemental). Cold damage reduces Speed by 20 feet until the end of its next turn. Promote as `freeze`.
- **Fire Absorption** (1, Iron Golem). Fire damage heals, and is not negated. Promote as `fire-absorption`.
- **Acid Absorption** (1, Clay Golem). Acid damage is negated and heals. Promote as `acid-absorption`.
- **Bloodied Fury** (2). Mechanical split. Boar: advantage on attack rolls while Bloodied. Giant Boar: advantage on melee attack rolls while Bloodied. Promote as two ids.
- **Ethereal Sight** (2). Mechanical split. Ghost: 60 feet, Material into Ethereal. Phase Spider: 60 feet, both ways. Promote as two ids.
- **Spider Climb on Swarm of Insects** (1). Climb works only when the swarm has a Climb Speed. Not the `spider-climb` preset.

### Same name, different rule

Do not merge these into one preset.

- **Air Form** (2). Air Elemental enters a creature’s space. Invisible Stalker enters an enemy’s space. Both then share the 1-inch clause.
- **Berserk** (2). Clay Golem and Flesh Golem share the 1d6 berserk roll. Flesh Golem adds the creator’s DC 15 Persuasion calm.
- **Corrosive Form** (2). Black Pudding adds 4 (1d8) Acid to a melee hit and eats 2 feet in 1 minute. Gray Ooze has no splash damage and eats 2 inches in 1 round.
- **Elemental Restoration** (2). Djinni: mist, Plane of Air, 1d4 days. Efreeti: ash, Plane of Fire, 1d4 days. A plane-and-residue form is more fields than these two rows justify.
- **Fiendish Restoration** (2). Rakshasa: instant new body in the Nine Hells. Spirit Naga: returns in 1d6 days unless Wish is used. Different rules under one title.
- **Mimicry** (2). Green Hag: animal sounds and humanoid voices, Insight DC 14. Raven: simple sounds, Insight DC 10.
- **Vampire Weakness** (2). Forbiddance, 20 Acid from running water, and 20 Radiant from sunlight match. The stake clause does not: the vampire is Paralyzed in its resting place; the spawn is destroyed.

### Signature prose

One creature, or a procedure that is not a reusable sentence. Eldritch Restoration is the pattern: 5d10 days, Far Realm or a place the DM chooses.

- **Adhesive (Object Form Only)** (1, Mimic). Grapple, escape DC 13, size limit.
- **Aversion to Fire** (1, Flesh Golem). One sentence, but only one damage type is attested. A damage-type field can wait.
- **Bound** (1, Shield Guardian). Amulet binding.
- **Celestial Restoration** (1, Guardian Naga). 1d6 days unless Dispel Evil and Good.
- **Confer Fire Resistance** (1, Nightmare). Resistance for a rider.
- **Draconic Origin** (1, Half-Dragon). DM choice that changes the rest of the block.
- **Eldritch Restoration** (1, Aboleth).
- **Fire Form** (1, Fire Elemental). 1-inch passage plus 5 (1d10) Fire on entry.
- **Greater Magic Resistance** (1, Rakshasa). Automatic success, spells miss, and detection limits.
- **Hellish Restoration** (1, Lemure). 1d10 days in the Nine Hells, with Bless and Holy Water exceptions.
- **Incubus Form** (1, Succubus) and **Succubus Form** (1, Incubus). Shape-shift into the other stat block. The incubus row also keeps equipment untransformed.
- **Iron Scent** (1, Rust Monster). Ferrous metal within 30 feet.
- **Loathsome Limbs (4/Day)** (1, Troll).
- **Magic Rope** (1, Erinyes).
- **Misty Escape** (1, Vampire).
- **Multiple Heads** (1, Hydra) and **Reactive Heads** (1, Hydra).
- **Ooze Cube** (1, Gelatinous Cube) and **Transparent** (1, Gelatinous Cube).
- **Probing Telepathy** (1, Aboleth).
- **Reflective Carapace** (1, Tarrasque).
- **Sense Magic** (1, Chuul). 120 feet, works like Detect Magic, not itself magical.
- **Shark Telepathy** (1, Sahuagin Warrior).
- **Shielded Mind** (1, Couatl).
- **Soul Bag** (1, Night Hag).
- **Spell Storing** (1, Shield Guardian).
- **Spirit Jar** (1, Lich).
- **Telepathic Bond** (1, Homunculus).
- **Training** (1, Commoner). One skill of the DM’s choice.
- **Treasure Sense** (1, Xorn). Precious metals and stones within 60 feet.
- **Troll Spawn** (1, Troll Limb).
- **Undead Restoration** (1, Mummy Lord). Heart object and 24-hour return.
- **Vampiric Connection** (1, Vampire Familiar).
- **Water Form** (1, Water Elemental). Enter an enemy’s space, then the 1-inch clause.
- **Water Susceptibility** (1, Fire Elemental). 3 (1d6) Cold per 5 feet moved in water or per gallon.

## Phase 1 capability audit

This audit covers the 18 shipped presets. It does not add preset ids or author fields. Movement facts below are from Open5e `srd-2024` creature detail (`document.key` is `srd-2024`). A speed that shows up on those stat blocks is an association until the trait sentence itself names that statistic.

`resolveCreatureMovement` in [movement-mode.ts](../src/rpg/vocab/movement-mode.ts) is the movement read. Form rows reach it through `movementRowsToRecordForPreview`. The advisory result is derived while authoring. It is not stored on the trait.

Four labels:

- **Supporting.** Another creature statistic enables the trait. The only phase 1 case is a movement speed the sentence uses.
- **Granted.** The trait itself is the ability.
- **Activation.** A condition that happens in play. It is not an authoring field.
- **Thematic.** A combination that is common on these stat blocks and is not a rule requirement.

### Movement traits called out for review

**Flyby** (7). Granted: no Opportunity Attack when the creature flies out of reach. Activation: that fly-out. Every current row also has a Fly Speed (Flying Snake 60, Gargoyle 60, Giant Owl 60, Giant Wasp 50, Hippogriff 60, Owl 60, Pteranodon 60). Those speeds are not a rule in the sentence, and flight can come from another effect. A missing Fly Speed can still leave the trait ineffective, so it gets a nonblocking advisory. The sentence does not change.

**Tunneler** (2). Supporting: Burrow Speed. The sentence says “half its Burrow Speed,” so the speed is the number the trait uses. Ankheg’s Burrow Speed is 10. Purple Worm’s is 50. Granted on top of that speed: burrow through solid rock and leave a 10-foot tunnel. This is the one phase 1 relationship that produces a build advisory. The printed sentence still says “half its Burrow Speed.”

**Earth Glide** (2). Granted: burrow through nonmagical unworked earth and stone without disturbing it. Earth Elemental (Burrow 30) and Xorn (Burrow 20) also have Burrow Speeds. The sentence does not mention Burrow Speed, so that speed is thematic. No hint.

**Running Leap** (2). Granted: a 25-foot Long Jump. Activation: a 10-foot running start. Lion walks 50. Saber-Toothed Tiger walks 40. The 10 feet are what the creature must move before the jump during play. They do not require a base Walk Speed of at least 10. No build advisory.

**Spider Climb** (13 on the preset). Granted: climb difficult surfaces, including ceilings, without a check. Twelve of those creatures have a Climb Speed. Vampire Spawn has the trait and Walk 30 only, so Climb Speed is not required. The Swarm of Insects sentence is the explicit exception (“If the swarm has a Climb Speed”) and stays custom. No hint on the preset.

**Ice Walk** (4). Granted: cross and climb ice without a check, and ice or snow is not difficult terrain. The four white dragons also have walk, fly, burrow, and swim. Those modes are the dragon’s stat block, not this trait. No hint.

**Web Walker** (5). Granted: ignore movement restrictions from webs, and know who else touches the same web. Drider, Ettercap, Giant Spider, Phase Spider, and Spider all have a Climb Speed. That pairing is thematic. The sentence does not mention climbing. No hint. A link to a Web action would be a different dependency and is not part of this pass.

### The other eleven presets

| Preset               | Granted                                                                                                           | Activation                                                                                       | Build advisory                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Agile                | No Opportunity Attack when it moves out of reach                                                                  | That move                                                                                        | None. “Moves” is any movement. Deer walks 50. Rat walks 20 and climbs 20.          |
| Amorphous            | Squeeze through a 1-inch space without extra movement                                                             | None                                                                                             | None                                                                               |
| Amphibious           | Breathe air and water                                                                                             | None                                                                                             | None. A Swim Speed on many of these creatures is thematic.                         |
| Immutable Form       | Cannot shape-shift                                                                                                | None                                                                                             | None                                                                               |
| Incorporeal Movement | Move through creatures and objects as difficult terrain, then 5 (1d10) Force if it ends the turn inside an object | Ending the turn inside an object                                                                 | None. A fly or walk speed is not named.                                            |
| Lightning Absorption | Regain hit points equal to the lightning damage taken                                                             | Being subjected to Lightning damage                                                              | None. Immunity or resistance changing “subjected to” stays a later rules question. |
| Magic Resistance     | Advantage on saves against spells and other magical effects                                                       | The save                                                                                         | None                                                                               |
| Pack Tactics         | Advantage on an attack roll                                                                                       | An ally within 5 feet who is not Incapacitated                                                   | None                                                                               |
| Siege Monster        | Double damage to objects and structures                                                                           | The damage roll                                                                                  | None                                                                               |
| Sunlight Sensitivity | Disadvantage on ability checks and attack rolls                                                                   | While in sunlight                                                                                | None                                                                               |
| Undead Fortitude     | Drop to 1 hit point instead of 0                                                                                  | Damage to 0 hit points, then a Constitution save, unless the damage is Radiant or a critical hit | None. Constitution is already an ability score.                                    |

### What produces a build advisory

Documented relationships are not all checks. A build advisory is nonblocking feedback for a configuration that looks unintended, incomplete, or ineffective. Two of those situations can raise one:

- **Missing referenced statistic.** The trait sentence uses a creature statistic that is not configured. Tunneler uses half the Burrow Speed.
- **Potentially ineffective feature.** The trait’s benefit needs a capability the creature does not currently have. Flyby applies while flying, and nothing else on the form supplies flight.

A normal activation condition, such as Running Leap’s 10-foot running start, does not raise an advisory. A thematic pairing, such as Spider Climb with a Climb Speed, does not either. Vampire Spawn has Spider Climb and Walk 30 only.

Monster authoring advisories are `collectMonsterFormAdvisories` in [monster-form-advisories.ts](../../../apps/dashboard/src/features/content/monsters/lib/monster-form-advisories.ts). Each one is `{ code, message, path }`. There is no severity. They do not block save or publish. The open editor shows the messages whose path matches the selected row. The add menu, the generated sentence, the stat block, and the vocabulary description do not repeat them.

| Preset   | Code                            | When                                                                                                                                           |
| -------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tunneler | `tunneler-missing-burrow-speed` | No usable Burrow Speed. Message: “Tunneler uses half the creature's Burrow Speed, but no Burrow Speed is configured.” Path: `traits.${index}`. |
| Flyby    | `flyby-missing-fly-speed`       | No usable Fly Speed. Message: “Flyby only applies while flying, but this creature has no Fly Speed.” Path: `traits.${index}`.                  |

Movement is `movementRowsToRecordForPreview`, then `resolveCreatureMovement`. A positive speed is usable. An explicit 0 is not usable, because the creature cannot move in that mode. A row with the mode chosen and feet still blank is unfinished input and stays quiet. A missing mode is absent.

No other fixed preset gets a check. Running Leap, Pack Tactics, Web Walker, Spider Climb, and Earth Glide stay exclusions. There is no `capabilityHints` metadata.

### Later, not this follow-up

### Later, not this follow-up

- A severity level that would separate “cannot work yet” from “might be supplied another way.” Flyby uses the same nonblocking advisory as Tunneler until that exists.
- Earth Glide plus a Burrow Speed, when an author wants a distance for the glide.
- Spider Climb plus a Climb Speed. Vampire Spawn is the counterexample that keeps this optional.
- Web Walker plus a web-producing action.
- Amphibious plus a Swim Speed.
- Ice Walk plus any of the white dragon’s other speeds.
- Lightning Absorption when the creature is immune or resistant to lightning.
- Incorporeal Movement when the creature has no speed with which to leave an object.
- Flyby when flight comes from a spell or another trait rather than Fly Speed.

## Row check

Phase 1 145 + phase 2 66 + deferred 20 + custom 95 = 326. The Spider Climb exception is inside the custom 95. Every other name in the Open5e extract is in exactly one section above.
