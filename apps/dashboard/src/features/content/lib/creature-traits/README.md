# Creature trait authoring

Shared catalog UI for creature trait templates. Grant editors stay in
[`forms/grants/`](../forms/grants/). Monster preset catalogs stay in
[`monsters/lib/traits/`](../../monsters/lib/traits/).

This folder does not own trait semantics, grant payloads, or a capability
model. Those live in `@rpg/contracts` and `runtime/creature`. Layering:
[runtime-resolution-boundaries.md](../../../../../../../packages/contracts/docs/runtime-resolution-boundaries.md).
Trait inventory, movement-alternative behavior, and blocked exposure/roll work:
[creature-trait-inventory.md](../../../../../../../packages/contracts/docs/creature-trait-inventory.md).
Do not add exposure predicates or roll evaluation here — grants stay in contracts;
execution is blocked until a shared consumer exists.
Species, class, and feat traits: [content-types.md](../../../../../../../docs/content-types.md#content-traits-custom-vs-grant).

## What is here

| Module                                                                                       | Role                                                             |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`creature-trait-template-field-assembler.ts`](./creature-trait-template-field-assembler.ts) | Registry contributions + host-specific config fields + `details` |
| [`creature-trait-template-fields.ts`](./creature-trait-template-fields.ts)                   | Species template field groups wired through the assembler        |
| [`creature-trait-add-menu.tsx`](./creature-trait-add-menu.tsx)                               | Add menu for template and custom trait rows                      |
| [`outside-water-breath-toggle.tsx`](./outside-water-breath-toggle.tsx)                       | Controlled hold-breath-outside-water checkbox (preset parameter) |
| [`outside-water-breath.lib.ts`](./outside-water-breath.lib.ts)                               | Duration-present predicate for those optional fields             |

Monster and species template rows both use the assembler. Form modules must not
import `resolveTraitFacingParts` or `formatLegendaryResistanceStatBlockTitle` (ESLint
guards + `src/test/trait-eslint-guard.test.ts`). A module outside the form-field glob
can still hand-build `FormItem[]` literals — that bypass is residual.

Each host’s add menu calls `listCreatureTraitTemplatesForRuleset(rulesetId, host)`.
Registry entries declare eligible hosts. The dashboard field matrix requires a
configurable, fieldless, or unsupported policy for every registered template
and host. Configurable entries supply at least one field. The assembler checks
bound control paths against the registered config schema and appends Details
once for eligible hosts.

Species sense templates use a fixed feet label and store the range in
`config.range`. Monsters author their senses under Creature Details. Legendary
Resistance exposes normal uses on both hosts and adds in-lair uses when the
monster’s lair is enabled.

## What is not here

Monster stat-block presets, including `water-breathing`, are a different
schema (`trait-preset-schema`) and a different editor. The preset sentence
and duration bounds stay in contracts. `formatWaterBreathing` stays in
`runtime/creature`.

`amphibious`, `limited-amphibiousness`, `hold-breath`, and `water-breathing`
are separate presets. The monster “Hold breath outside water” control writes
optional `outsideWaterBreathAmount` / `outsideWaterBreathUnit` on the
`water-breathing` row. It does not define the breathing behavior.
`outside-water-breath-toggle.tsx` and `outside-water-breath.lib.ts` are
preset-parameter authoring. They are not a `water-breathing` capability API.
The monster form slot that wires react-hook-form stays under
`monsters/components/form/slots/`.

Follow-up program: **Source-independent creature capabilities** (plan § L).
That work belongs in `@rpg/contracts` and `runtime/creature`, not here.

Registered monster slots are per authoring surface. This folder does not
export slot entries.

## Reuse map (authoring mode × source application × support today)

**Authoring mode** is how a dashboard surface edits a row. **Source application**
is how a benefit is stored (direct property, grant, applied effect, …). **Support
today** is what contracts and runtime actually implement—not the conceptual model.

### Water Breathing (monster preset `water-breathing`)

| Dimension          | Today                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Authoring mode     | Monster direct definition only (`monsters/lib/traits`, slot adapter under `monsters/.../slots/`) |
| Source application | Direct preset row on the monster (`trait-preset-schema`), not a grant                            |
| Shared UI          | `outside-water-breath-toggle.tsx` + `outside-water-breath.lib.ts` (parameter only)               |
| Runtime            | `formatWaterBreathing` prose only; no resolved “has water breathing” flag                        |
| Other surfaces     | Species, class, feat, spell, item, character sheet: **unsupported**                              |

### Damage resistance

| Dimension      | Today                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Semantic shape | `creatureDefenses.resistances` (direct) and grant `kind: 'resistances'` (catalog grants) |
| Authoring      | Monster defenses editors vs `forms/grants` rows—different field paths                    |
| Shared UI      | Grant rows under `forms/grants/`; do not fold into `creature-traits/`                    |
| Runtime merge  | **None** across sources; within one defenses object, exclusivity only                    |
| Decision       | **Defer** capability normalization until stacking rules are designed                     |

### Trait templates vs monster presets vs grant traits

| Shape                    | Authoring mode            | Source application                                                   | Shared UI                                                          |
| ------------------------ | ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `kind: 'template'`       | Monster + species catalog | Template resolves to `rollAdjustment` / `saveOutcomeOverride` grants | `creature-trait-template-fields.ts`, add menu                      |
| Monster `preset`         | Monster direct only       | Direct preset row (`trait-preset-schema`)                            | `monsters/lib/traits`; preset parameters may promote controls here |
| Species `kind: 'grant'`  | Source-granted            | `GrantGroup` + `contentGrantSchema`                                  | `forms/grants/`                                                    |
| Species / class `custom` | Direct or grant-backed    | Trait body + optional `grantGroups`                                  | Per-type `lib/*-form-fields`                                       |

### Actions

| Surface                   | Authoring mode                      | Support today                                                    |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Monster stat block        | Direct `actions[]` / sections       | Full editor (`actions/action-sections.tsx`, slots for mechanics) |
| Class / subclass features | Source-granted spells, feat choices | **Not** monster action rows                                      |
| Character sheet instances | Runtime assembly                    | Deferred; not catalog action schema                              |

Spell roadmap `action-grant` is unimplemented—actions are not one shared capability.

### Proficiencies, senses, languages

| Concern                | Shared field builders          | Registration                       | Runtime note                                             |
| ---------------------- | ------------------------------ | ---------------------------------- | -------------------------------------------------------- |
| Saving throws / skills | `content/lib/forms` mechanics  | Per-type form fields               | —                                                        |
| Senses                 | Sense range helpers            | Monster creature-details slots     | **Merge exists**: max range per type; provenance dropped |
| Languages              | Catalog helpers                | Monster creature-details slots     | —                                                        |
| Damage defenses        | Separate grant vs direct paths | Monster defenses vs `forms/grants` | Resistance **merge does not exist**                      |

### Spellcasting

| Surface                       | Model                                | Authoring                               |
| ----------------------------- | ------------------------------------ | --------------------------------------- |
| Monster innate spells         | Frequency + spell rows on the action | `spells/` UI + action spell slots       |
| Class spellbook / progression | Feature grants + spell choices       | Class lib—not monster presets           |
| Character prepared spells     | Builder / sheet                      | `runtime/character`—different lifecycle |

Spell `spellAtomicEffectSchema` (damage, healing, temp HP, projectile count) is an
**applied effect** lifecycle, not a permanent grant.

### Cross-feature import recipe

- **Character → shared control:** import named symbols from `@/features/content`
  (for example `OutsideWaterBreathToggle`, `outsideWaterBreathDurationEnabled`).
- **Never** import `monsters/**/slots/**` from another feature.
- **Grants** stay in `content/lib/forms/grants/**`.
- **Slots** stay per authoring surface (`monsters/components/form/slots/` only for
  monster form registration).
