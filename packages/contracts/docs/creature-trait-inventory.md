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

| Disposition           | Rows | Share | What the number means                                                                  |
| --------------------- | ---: | ----: | -------------------------------------------------------------------------------------- |
| Shipped               |  260 |   80% | Phase 1: 145 rows. Phase 2: 66 rows. Wave 1 fixed presets: 49 rows                     |
| Approved, not shipped |   14 |    4% | Configurable rows. Preset code is not in place                                         |
| Pending               |   15 |    5% | A fidelity or authoring blocker. Not a build task yet                                  |
| Custom                |   37 |   11% | Signature prose, Spirit Naga’s Fiendish Restoration, and Swarm of Insects Spider Climb |
| Total                 |  326 |  100% |                                                                                        |

260 + 14 + 15 + 37 = 326. The remaining build scope is the 14 configurable rows.

Phase 1 is 18 preset ids. `spider-climb` stays field-free. The Swarm of Insects row is one of the 37 custom rows. `lightning-absorption` stays the shipped field-free preset. Fire Absorption and Acid Absorption are separate approved ids.

## Ownership

Shared creature pieces already live in [creature.ts](../src/rpg/content/creature.ts): size, movement, senses, communication. Monsters compose those pieces. Species does not.

Two trait systems exist, and they stay separate.

- **Descriptive traits.** A monster trait is custom prose (`id`, `name`, `description`) or a preset row. Shipped presets are the phase 1 field-free ids, the wave 1 field-free ids, and the 7 configurable ids. The configurable ids below are not shipped. Custom HTML is stored. Preset sentences are generated. Display is [monster-display.ts](../../../apps/dashboard/src/features/content/monsters/lib/monster-display.ts).
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
- Do not form a possessive by appending `'s` to the name. “This creature's Stench” is allowed. “This creature” is the creature that has the trait, not every creature with that trait name.
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

Open5e sometimes leaves a glossary token in list text (`Hitazard` on the Fire Elemental’s Fire Aura, and `D20 Test` on the Shadow’s Sunlight Weakness). Phase 1 sentences were checked as plain prose. Those two tokens stay pending until the glossary expansion is confirmed.

## Phase 1 fixed presets

No author fields. Constants in the sentence are the same on every included row. `{Subject}` is the capitalized subject. `{subject}` is the lowercase subject.

Menu groups: Environment, Movement, Combat, Form, and General. Custom trait stays in General. Approved presets that are not environment, movement, combat, or form use General too. A later implementation adds `general` to the vocabulary and does not render a second General row. Labels sort alphabetically inside a group.

### Environment

- **Amphibious** (`amphibious`, 31, cosmetic). The {Subject} can breathe air and water. Aboleth, Adult Black Dragon, Adult Bronze Dragon, Adult Gold Dragon, Adult Green Dragon, Ancient Black Dragon, Ancient Bronze Dragon, Ancient Gold Dragon, Ancient Green Dragon, Archelon, Black Dragon Wyrmling, Bronze Dragon Wyrmling, Chuul, Crab, Dragon Turtle, Frog, Giant Crab, Giant Frog, Giant Toad, Gold Dragon Wyrmling, Green Dragon Wyrmling, Green Hag, Kraken, Merfolk Skirmisher, Merrow, Sea Hag, Storm Giant, Young Black Dragon, Young Bronze Dragon, Young Gold Dragon, Young Green Dragon. Limited Amphibiousness is a different trait and is approved below as its own fixed id.
- **Ice Walk** (`ice-walk`, 4, identical). The {Subject} can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement. Adult White Dragon, Ancient White Dragon, White Dragon Wyrmling, Young White Dragon. The SRD noun is “the dragon” on every row.
- **Sunlight Sensitivity** (`sunlight-sensitivity`, 5, cosmetic). While in sunlight, the {subject} has Disadvantage on ability checks and attack rolls. Drider, Specter, Wight, Wraith, Kobold Warrior. The kobold row matches once the noun is supplied. Light Sensitivity is a different rule and is approved below. Sunlight Weakness is pending a glossary check.

### Movement

- **Agile** (`agile`, 2, cosmetic). The {Subject} doesn't provoke an Opportunity Attack when it moves out of an enemy's reach. Deer, Rat. This is not Flyby: the trigger is any move, not flying.
- **Amorphous** (`amorphous`, 4, cosmetic). The {Subject} can move through a space as narrow as 1 inch without expending extra movement to do so. Black Pudding, Gray Ooze, Ochre Jelly, Shadow. Compression on the Octopus is the same sentence under another name. It is approved below as `compression`. Do not rename Amorphous. No name override.
- **Earth Glide** (`earth-glide`, 2, cosmetic). The {Subject} can burrow through nonmagical, unworked earth and stone. While doing so, it doesn't disturb the material it moves through. Earth Elemental, Xorn.
- **Flyby** (`flyby`, 7, cosmetic). The {Subject} doesn't provoke an Opportunity Attack when it flies out of an enemy's reach. Flying Snake, Gargoyle, Giant Owl, Giant Wasp, Hippogriff, Owl, Pteranodon.
- **Incorporeal Movement** (`incorporeal-movement`, 4, cosmetic). The {Subject} can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object. Ghost, Specter, Will-o'-Wisp, Wraith. The damage roll does not vary.
- **Running Leap** (`running-leap`, 2, cosmetic). With a 10-foot running start, the {subject} can Long Jump up to 25 feet. Lion, Saber-Toothed Tiger. Both distances match, so they are not fields.
- **Spider Climb** (`spider-climb`, 13, cosmetic). The {Subject} can climb difficult surfaces, including along ceilings, without needing to make an ability check. Black Pudding, Drider, Ettercap, Giant Lizard, Giant Spider, Giant Wolf Spider, Lizard, Ochre Jelly, Phase Spider, Roper, Spider, Vampire, Vampire Spawn. Swarm of Insects is custom: the trait applies only if the swarm has a Climb Speed.
- **Tunneler** (`tunneler`, 2, cosmetic). The {Subject} can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake. Ankheg, Purple Worm. Half speed and the 10-foot diameter do not vary.
- **Web Walker** (`web-walker`, 5, cosmetic). The {Subject} ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web. Drider, Ettercap, Giant Spider, Phase Spider, Spider.

### Combat

- **Lightning Absorption** (`lightning-absorption`, 2, cosmetic). Whenever the {subject} is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt. Flesh Golem, Shambling Mound. Fire Absorption and Acid Absorption are approved fixed ids below. Acid also negates the damage, so it is not this sentence. They do not become a damage-type field on this id.
- **Magic Resistance** (`magic-resistance`, 34, cosmetic). The {Subject} has Advantage on saving throws against spells and other magical effects. Archmage, Balor, Barbed Devil, Bearded Devil, Bone Devil, Chain Devil, Clay Golem, Deva, Djinni, Dryad, Efreeti, Erinyes, Flesh Golem, Glabrezu, Hezrou, Horned Devil, Ice Devil, Imp, Iron Golem, Marilith, Mummy Lord, Nalfeshnee, Night Hag, Pit Fiend, Planetar, Pseudodragon, Quasit, Satyr, Solar, Sphinx of Wonder, Stone Golem, Tarrasque, Unicorn, Vrock. Pit Fiend matches; the two-word name is only a subject. Greater Magic Resistance stays custom.
- **Pack Tactics** (`pack-tactics`, 18, cosmetic). The {Subject} has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition. Baboon, Blood Hawk, Dire Wolf, Giant Rat, Giant Vulture, Hell Hound, Hobgoblin Warrior, Hyena, Kobold Warrior, Lion, Reef Shark, Tough, Tough Boss, Vulture, Warrior Infantry, Werewolf, Winter Wolf, Wolf.
- **Siege Monster** (`siege-monster`, 4, cosmetic). The {Subject} deals double damage to objects and structures. Earth Elemental, Kraken, Tarrasque, Treant.
- **Undead Fortitude** (`undead-fortitude`, 2, cosmetic). If damage reduces the {subject} to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, it drops to 1 Hit Point instead. Ogre Zombie, Zombie. The DC formula, the Radiant and critical exceptions, and the 1 hit point result match.

### Form

- **Immutable Form** (`immutable-form`, 4, identical). The {Subject} can't shape-shift. Clay Golem, Flesh Golem, Iron Golem, Stone Golem.

## Phase 2 configurable presets

Shipped. Each id is new. None of them overload a phase 1 id. Regeneration is one id. There is no `regeneration-halt` id.

- **Legendary Resistance** (`legendary-resistance`, 32). Body is one sentence on every row: if it fails a saving throw, it can choose to succeed instead. Nouns differ (`aboleth`, `dragon`, `mummy`, `sphinx`). The parenthetical name is the mechanic. Store `uses` (positive integer; SRD uses 3, 4, and 6) and `lair` (boolean). When `lair` is true, the printed lair uses are `uses + 1`. Every lair row in this set is exactly one higher: 3/4 on fifteen creatures (ten adult dragons, Aboleth, Mummy Lord, Sphinx of Lore, Sphinx of Valor, Vampire) and 4/5 on twelve (ten ancient dragons, Kraken, Lich). No lair row uses another delta. Plain titles: Balor and Unicorn 3/Day, Pit Fiend and Solar 4/Day, Tarrasque 6/Day. Default `uses` 3 and `lair` false. The editor label is “In lair.” There is no hint. The name is derived. A future lair bonus other than +1 needs a new preset, not a third field on this one.
- **Hold Breath** (`hold-breath`, 6). Store a duration: positive integer plus `minute` or `hour`. Sentence: The {Subject} can hold its breath for {duration}. Default 1 hour. Evidence: 1 hour on Crocodile, Giant Crocodile, Hydra, Plesiosaurus; 10 minutes on Hippopotamus; 30 minutes on Killer Whale. Giant Octopus’s extra hour belongs to Water Breathing, not this trait.
- **Illumination** (`illumination`, 5). Store bright radius in feet (positive integer). Dim light is the same distance again and is not stored. All five rows are equal pairs: 10 on Azer Sentinel, Giant Fire Beetle, Nightmare; 20 on Will-o'-Wisp; 30 on Fire Elemental. Default 10. Sentence: The {Subject} sheds Bright Light in a {radius}-foot radius and Dim Light for an additional {radius} feet.
- **Standing Leap** (`standing-leap`, 3). Store Long Jump in feet. High Jump is half and is not stored. Evidence: Frog 10 and 5; Giant Frog and Giant Toad 20 and 10. Default 10. An odd Long Jump is allowed. High Jump is half and prints a decimal, such as 7.5. Sentence keeps “with or without a running start.”
- **Swarm** (`swarm`, 7). Store the Tiny creature noun (short text, required, no default). The rest does not vary: occupy another creature’s space and vice versa, pass through an opening large enough for a Tiny {noun}, and cannot regain Hit Points or gain Temporary Hit Points. Evidence: bat, insect, piranha, rat, raven, snake, and “creature” (Swarm of Crawling Claws). An enum would block homebrew nouns, so the field stays free text.
- **Regeneration** (`regeneration`, 4). One preset. Store hit points regained (positive integer, default 10), `regeneratesAtZeroHp` (boolean, default false), and `interruptedByDamageTypes` (damage-type ids, default empty). The printed name is Regeneration. Editor labels, with no hints: “Hit Points regained per turn,” “Regenerates at 0 HP,” and “Damage types that interrupt regeneration.” The first sentence is “{Subject} regains {hitPoints} Hit Points at the start of each of its turns”, plus “if it has at least 1 Hit Point” when regeneration at 0 HP is off. Selected damage types add “If {subject} takes {types} damage, this trait doesn't function on {subject}'s next turn.” Regeneration at 0 HP adds “{Subject} dies only if it starts its turn with 0 Hit Points and doesn't regenerate.” Oni and Shield Guardian are 10 with both flags off. Troll is 15 with regeneration at 0 HP and Acid or Fire. Troll Limb is 5 with the same flags. SRD 5.2 Troll (`srd-2024_troll`): “The troll regains 15 Hit Points at the start of each of its turns. If the troll takes Acid or Fire damage, this trait doesn't function on the troll's next turn. The troll dies only if it starts its turn with 0 Hit Points and doesn't regenerate.”
- **Water Breathing** (`water-breathing`, 9). The eight ordinary rows are only “can breathe only underwater” (Giant Seahorse, Giant Shark, Hunter Shark, Octopus, Piranha, Reef Shark, Seahorse, Swarm of Piranhas). Giant Octopus adds hold breath for 1 hour outside water. Store an optional duration, same shape as Hold Breath, with no default. Empty duration prints the one sentence. A present duration adds the second. This stays out of phase 1 so `water-breathing` is not born as a field-free id and later grows a field.

Bloodied Fury, Ethereal Sight, Fire Absorption, and Acid Absorption are approved below. They are not extra ids on these shipped presets.

## Wave 1 fixed presets

Shipped. The description is the add-menu line. These traits store no fields. The generated sentence is the full source rule with the stat-block subject.

- **Abduct** (`abduct`, Movement, 2). Moves grappled creatures at no extra cost. Bugbear Stalker and Bugbear Warrior.
- **Divine Awareness** (`divine-awareness`, General, 2). Knows when it hears a lie. Planetar and Solar.
- **Inscrutable** (`inscrutable`, General, 2). Blocks remote observation; Insight is harder. Sphinx of Lore and Sphinx of Valor. Fixture below.
- **Demonic Restoration** (`demonic-restoration`, Form, 5). Reforms instantly in the Abyss. Glabrezu, Hezrou, Marilith, Nalfeshnee, Vrock. Fixture below.
- **Diabolical Restoration** (`diabolical-restoration`, Form, 7). Reforms instantly in the Nine Hells. Barbed Devil, Bone Devil, Chain Devil, Horned Devil, and Ice Devil say “the devil.” Erinyes and Pit Fiend use their own names. Fixture below.
- **Exalted Restoration** (`exalted-restoration`, Form, 3). Reforms instantly in Mount Celestia. Deva, Planetar, Solar. Fixture below.
- **Fiendish Restoration** (`fiendish-restoration`, Form, 1). Reforms instantly in the Nine Hells. Rakshasa only. The menu line matches Diabolical Restoration. The label carries the name. Spirit Naga stays custom. Fixture below.
- **Wishes** (`wishes`, General, 2). May know Wish and cast it for others. Djinni and Efreeti. Fixture below.
- **Compression** (`compression`, Movement, 1). Moves through 1-inch spaces without slowing. Octopus. Same sentence and menu line as Amorphous. The printed name stays Compression.
- **Blood Frenzy** (`blood-frenzy`, Combat, 1). Advantage against wounded creatures. Sahuagin Warrior.
- **Bloodied Frenzy** (`bloodied-frenzy`, Combat, 1). Advantage on attacks and saves if Bloodied. Berserker. Not Bloodied Fury.
- **Beast of Burden** (`beast-of-burden`, General, 1). Carries as if one size larger. Mule.
- **Jumper** (`jumper`, Movement, 1). Jump distance uses Dexterity. Cat.
- **Ephemeral** (`ephemeral`, Form, 1). Cannot wear or carry anything. Will-o'-Wisp.
- **Invisibility** (`invisibility`, Form, 1). Has the Invisible condition. Invisible Stalker. The sentence does not grant the condition.
- **Light Sensitivity** (`light-sensitivity`, Combat, 1). Disadvantage on attacks in bright light. Cloaker. Not Sunlight Sensitivity.
- **Limited Amphibiousness** (`limited-amphibiousness`, Environment, 1). Breathes air and water; must submerge. Sahuagin Warrior. The 4 hours stay in the sentence. Not a field on Amphibious.
- **Blurred Form** (`blurred-form`, Form, 1). Attacks against it have Disadvantage. Steam Mephit, unless it is Incapacitated.
- **Reactive** (`reactive`, Combat, 1). One Reaction on every turn. Marilith.
- **Evasion** (`evasion`, Combat, 1). Avoids damage when a Dex save halves it. Assassin. Success is no damage, failure stays half, and it cannot be used while Incapacitated.
- **Speak with Beasts and Plants** (`speak-with-beasts-and-plants`, Form, 1). Talks with Beasts and Plants. Dryad. No creature-type picker.
- **Freeze** (`freeze`, Combat, 1). Cold damage temporarily reduces its Speed. Water Elemental. The 20 feet and “until the end of its next turn” stay in the sentence.
- **Fire Absorption** (`fire-absorption`, Combat, 1). Regains HP from Fire damage. Iron Golem. Fire damage heals and is not negated. Does not replace `lightning-absorption`.
- **Acid Absorption** (`acid-absorption`, Combat, 1). Acid damage heals it instead. Clay Golem. Acid damage is negated and heals.
- **Water Form** (`water-form`, Movement, 1). Enters enemy spaces and squeezes through. Water Elemental. Not an Air Form option.
- **Heat Aura** (`heat-aura`, Combat, 1). Nearby creatures take Fire damage. Remorhaz. End of turn, each creature in 5 feet, 16 (3d10) Fire.
- **Death Throes** (`death-throes`, Combat, 1). Explodes on death, then reforms. Balor. Fixture below. Not Death Burst or Demonic Restoration.
- **Mucus Cloud** (`mucus-cloud`, Combat, 1). Underwater cloud curses nearby creatures. Aboleth. Fixture below.
- **Aberrant Ground** (`aberrant-ground`, Environment, 1). Nearby ground is Difficult Terrain. Gibbering Mouther. 10-foot Emanation.
- **Aura of Authority** (`aura-of-authority`, Combat, 1). Gives itself and allies Advantage on attacks and saves. Hobgoblin Captain. The 10-foot Emanation and the Incapacitated exception stay in the sentence.
- **Barbed Hide** (`barbed-hide`, Combat, 1). Damages creatures grappling with it. Barbed Devil. 5 (1d10) Piercing at the start of each of its turns.
- **Fear Aura** (`fear-aura`, Combat, 1). Frightens enemies that start their turn nearby. Pit Fiend. Wisdom DC 21, 20 feet, Frightened until the target’s next turn, unless the fiend is Incapacitated. Success: “The target is immune to this creature's aura for 24 hours.”
- **Vile Appearance** (`vile-appearance`, Combat, 1). Frightens beasts and humanoids that see it. Sea Hag. Wisdom DC 11, 30 feet, the target must see its true form, Frightened until its next turn. Success: “The target is immune to this creature's Vile Appearance for 24 hours.”

## Approved configurable presets

Not shipped. The description is the add-menu line. No field has a hint.

An empty variant does not generate a sentence. Unset selects keep the existing choice placeholder. An empty number keeps the existing empty number field. Publish copy comes from the form error map, using the field label. Schemas stay message-free. Draft may omit a value that has no default.

A distance uses the existing distance joined pair. A literal DC uses the number field, whole numbers from 1 through 30, the same bounds as a tool utilize DC. Do not use a distance joined pair for a DC, and do not add a preset list of DCs. Action save DCs stay derived from `dcSource`.

### Configurable

**Bloodied Fury** (`bloodied-fury`, Combat, 2). Advantage on attacks while Bloodied.

- `attackScope` — label “Attack rolls”. Select. Required. Default `any`. Options: “Any attack roll” (`any`), “Melee attack rolls” (`melee`).

The default preview is the Boar sentence: “While Bloodied, {subject} has Advantage on attack rolls.” Giant Boar uses `melee`: “While Bloodied, {subject} has Advantage on melee attack rolls.” The source puts “while it is Bloodied” at the end. That move is grammar only. Fidelity: grammar-only. No other scopes.

**Ethereal Sight** (`ethereal-sight`, Environment, 2). Sees into the Ethereal Plane.

- `direction` — label “Sight direction”. Select. Required. No default. Options: “Material to Ethereal” (`material-to-ethereal`), “Both directions” (`both`).

No sentence until a direction is chosen. Ghost, `material-to-ethereal`: “{Subject} can see 60 feet into the Ethereal Plane when it is on the Material Plane.” Phase Spider, `both`: “{Subject} can see 60 feet into the Ethereal Plane while on the Material Plane and vice versa.” The 60 feet are not a field. Fidelity: subject-policy.

**Mimicry** (`mimicry`, Form, 2). Copies sounds; Insight reveals imitations. Green Hag and Raven. Not the Sea Hag.

- `sounds` — label “Sounds mimicked”. Select. Required. No default. Options: “Animal sounds and humanoid voices” (`animal-and-humanoid`), “Previously heard simple sounds” (`simple-heard`).
- `insightDc` — label “Insight DC”. Number. Required. No default. Not coupled to the sound option. Minimum 1. Maximum 30. Whole numbers.

No sentence until both are set. Green Hag is `animal-and-humanoid` at DC 14. Source: “The hag can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations only with a successful DC 14 Wisdom (Insight) check.” Generated keeps that check, including “only.” Raven is `simple-heard` at DC 10. Source: “The raven can mimic simple sounds it has heard, such as a whisper or chitter. A hearer can discern the sounds are imitations with a successful DC 10 Wisdom (Insight) check.” The preview keeps the examples. The option does not. Either sound may use another DC from 1 through 30. Fidelity: subject-policy. The check wording is not merged.

**Air Form** (`air-form`, Movement, 2). Enters occupied spaces and squeezes.

- `space` — label “Can enter”. Select. Required. Default `creature`. Options: “Any creature's space” (`creature`), “An enemy's space” (`enemy`).

The default preview is the Air Elemental sentence. Invisible Stalker uses `enemy`. Both keep the 1-inch clause. Fidelity: subject-policy. Water Form and Fire Form are not options. Fire Form also deals 5 (1d10) Fire on the first entry each turn and stays custom.

**Berserk** (`berserk`, Combat, 2). May lose control when Bloodied.

- `canBeCalmed` — label “Creator can calm it”. Checkbox. Default `false`.

Unchecked is the Clay Golem paragraph, and that sentence shows immediately. Source: “Whenever the golem starts its turn Bloodied, roll 1d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object. Once the golem goes berserk, it continues to be berserk until it is destroyed or it is no longer Bloodied.” Checked is the Flesh Golem paragraph, including “it remains so” and the creator’s action within 60 feet, DC 15 Charisma (Persuasion), calm until the start of its next turn. The DC, distance, and action are not fields. Fidelity: each checkbox value is its own source paragraph.

**Elemental Restoration** (`elemental-restoration`, Form, 2). Returns to its home plane days later.

- `element` — label “Element”. Select. Required. No default. Options: “Air” (`air`), “Fire” (`fire`).

No sentence until an element is chosen. Air, Djinni: “If {subject} dies outside the Elemental Plane of Air, its body dissolves into mist, and it gains a new body in 1d4 days, reviving with all its Hit Points somewhere on the Plane of Air.” Fire, Efreeti: the same shape with ash, the Elemental Plane of Fire, and the Plane of Fire. Fidelity: subject-policy. Plane, residue, and timing are not separate fields.

**Stench** (`stench`, Combat, 2). Sickens creatures that start their turn nearby.

- `dc` — label “Save DC”. Number. Required. No default. Minimum 1. Maximum 30. Whole numbers.
- `radius` — label “Emanation radius”. Distance joined pair, unit feet. Required. No default. Presets 5, 10, 15, 20, 30. Minimum 5. Maximum 120.
- `successImmunity` — label “Immunity on success”. Checkbox. Default `false`.

No sentence until DC and radius are set. The save is Constitution. Failure is the Poisoned condition until the start of the target’s next turn. Ghast is DC 10, 5 feet, immunity on. Hezrou is DC 16, 10 feet, immunity off. Immunity on adds: “Success: The target is immune to this creature's Stench for 24 hours.” Fidelity: subject-policy, plus “this creature's” instead of “this ghast's.”

### Complex fixed fixtures

Each fixture keeps every trigger, number, exception, and outcome. Later references use `it` or `its`. No clause is dropped to shorten the menu line. Fidelity is subject-policy unless noted.

**Inscrutable.** Source, both sphinxes: “No magic can observe the sphinx remotely or detect its thoughts without its permission. Wisdom (Insight) checks made to ascertain its intentions or sincerity are made with Disadvantage.” Generated: the same text with the subject. No other change.

**Demonic Restoration.** Source: “If the glabrezu dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss.” Generated: the same sentence with the subject. The other four demons differ only by that name.

**Diabolical Restoration.** Source: “If the devil dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells.” Generated: one sentence with the subject. Smoke, instant revival, all Hit Points, and the Nine Hells remain.

**Exalted Restoration.** Source: “If the deva dies outside Mount Celestia, its body disappears, and it gains a new body instantly, reviving with all its Hit Points somewhere in Mount Celestia.” Generated: the same sentence with the subject. Planetar and Solar differ only by name.

**Fiendish Restoration.** Rakshasa source: “If the rakshasa dies outside the Nine Hells, its body turns to ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells.” Generated: the same sentence with the subject.

**Wishes.** Djinni source: “The djinni has a 30 percent chance of knowing the Wish spell. If the djinni knows it, the djinni can cast it only on behalf of a non-genie creature who communicates a wish in a way the djinni can understand. If the djinni casts the spell for the creature, the djinni suffers none of the spell's stress. Once the djinni has cast it three times, the djinni can't do so again for 365 days.” Generated: “The djinni has a 30 percent chance of knowing the Wish spell. If it knows it, it can cast it only on behalf of a non-genie creature who communicates a wish in a way it can understand. If it casts the spell for the creature, it suffers none of the spell's stress. Once it has cast it three times, it can't do so again for 365 days.” The repeated name becomes `it`. The spell’s `it` stays. Efreeti is the same paragraph.

**Death Throes.** Balor source: “The balor explodes when it dies. Dexterity Saving Throw: DC 20, each creature in a 30-foot Emanation originating from the balor. Failure: 31 (9d6) Fire damage plus 31 (9d6) Force damage. Success: Half damage. Failure or Success: If the balor dies outside the Abyss, it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss.” Generated: the same paragraph with the subject. Both damage rolls, the DC, the 30 feet, half damage, and the Abyss revival remain.

**Mucus Cloud.** Aboleth source: “While underwater, the aboleth is surrounded by mucus. Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation originating from the aboleth at the end of the aboleth's turn. Failure: The target is cursed. Until the curse ends, the target's skin becomes slimy, the target can breathe air and water, and it can't regain Hit Points unless it is underwater. While the cursed creature is outside a body of water, the creature takes 6 (1d12) Acid damage at the end of every 10 minutes unless moisture is applied to its skin before those minutes have passed.” Generated: the same paragraph. “The aboleth's turn” becomes “its turn.” The curse, the breathing change, the healing limit, and the Acid damage remain.

## Pending

15 rows. Do not implement these until the named blocker is resolved.

### Needs fidelity review

- **Sunlight Weakness** (1, Shadow). Open5e returns “Disadvantage on D20 Test.” Do not rewrite that as “D20 Tests” until the glossary expansion is confirmed.

### Needs authoring review

- **Death Burst** (5). Dust Mephit: Dexterity DC 10, 5 feet, 5 (2d4) Bludgeoning. Ice Mephit: Constitution DC 10, 5 feet, 5 (2d4) Cold. Magma Mephit: Dexterity DC 11, 5 feet, 7 (2d6) Fire. Steam Mephit: Dexterity DC 10, 5 feet, 5 (2d4) Fire. Magmin: Dexterity DC 11, 10 feet, 7 (2d6) Fire. Success is half damage on each. A creature-named option is not a useful authoring decision, and a save or damage form is a second mechanics framework.
- **Fire Aura** (4). Azer Sentinel: chosen creatures, 5 feet, 5 (1d10) Fire, skipped while Incapacitated. Salamander: chosen creatures, 5 feet, 7 (2d6) Fire. Balor: each creature, 5 feet, 13 (3d8) Fire. Fire Elemental: each creature, 10 feet, 5 (1d10) Fire, plus ignition. The Open5e token `Hitazard` still needs a glossary check. Same authoring blocker as Death Burst.
- **Corrosive Form** (2). Black Pudding adds 4 (1d8) Acid to a melee hit and eats 2 feet in 1 minute. Gray Ooze has no splash and eats 2 inches in 1 round. Weapon destruction matches. A selector would only choose which full procedure to paste.
- **Vampire Weakness** (2). Forbiddance, 20 Acid, and 20 Radiant match. The stake clause does not: the vampire is Paralyzed in its resting place until the weapon is removed; the spawn is destroyed. The body is a headed list. A preset cannot render that list yet. Splitting a plain string on blank lines is not the contract.
- **Gibbering** (1, Gibbering Mouther). Wisdom DC 10, 20 feet, and a d8 list of outcomes. Pending the same list rendering.

## Custom

37 rows. These stay authored prose.

- **Spirit Naga, Fiendish Restoration** (1). If it dies, it returns to life in 1d6 days and regains all its Hit Points. Only a Wish spell prevents that. Not the Rakshasa preset.
- **Spider Climb on Swarm of Insects** (1). The climb works only when the swarm has a Climb Speed. `spider-climb` stays field-free.
- **Fire Form** (1, Fire Elemental). The 1-inch passage plus 5 (1d10) Fire on the first entry each turn. Not Air Form.

### Signature prose

One creature, or a procedure that is not a reusable sentence.

- **Adhesive (Object Form Only)** (1, Mimic). Grapple, escape DC 13, size limit.
- **Aversion to Fire** (1, Flesh Golem). One sentence, but only one damage type is attested.
- **Bound** (1, Shield Guardian). Amulet binding.
- **Celestial Restoration** (1, Guardian Naga). 1d6 days unless Dispel Evil and Good.
- **Confer Fire Resistance** (1, Nightmare). Resistance for a rider.
- **Draconic Origin** (1, Half-Dragon). DM choice that changes the rest of the block.
- **Eldritch Restoration** (1, Aboleth).
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

260 shipped + 14 approved configurable + 15 pending + 37 custom = 326. The 260 shipped rows are phase 1, phase 2, and the wave 1 fixed presets. Swarm of Insects Spider Climb is inside the custom 37. Every other name in the Open5e extract is in exactly one section above.
