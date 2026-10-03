# Automatic build resolution

Deterministic completion of a character build draft from a compact seed —
the domain service behind **Quick NPC** and the intended entry point for
future presets, templates, and randomized generation. There is exactly one
character-generation architecture: automatic resolution produces a normal
`CharacterBuilderDraft` that flows through the same validation and finalize
path as a manually built character.

## Modules

| Export                               | Module                                             | Purpose                                                                      |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `automaticNpcBuildSeedSchema`        | `automatic/automatic-npc-build-seed.ts`            | Zod schema for the compact seed (name, species, class, level, alignment)     |
| `validateAutomaticNpcBuildSeed`      | `automatic/automatic-npc-build-seed.ts`            | Seed content validation against the build context (UI-independent)           |
| `automaticNpcBuildConstraintsSchema` | `automatic/automatic-npc-build-constraints.ts`     | Optional hard requirements (`requiredSpellIds`; legacy weapon ids when used) |
| `startingEquipmentGrants`            | `automatic/resolve-automatic-npc-build.ts`         | Quantity-based manual equipment applied after package resolution             |
| `pinnedChoiceSetIds`                 | `automatic/resolve-automatic-npc-build.ts`         | Explicit starting-choice overrides that must not be topped up                |
| `resolveNpcStartingChoiceIssues`     | `npc/resolve-npc-starting-choices.ts`              | Incomplete pinned allowances / package picks → validation issues             |
| `listReachableStartingWeapons`       | `automatic/list-reachable-starting-weapons.ts`     | Advisory weapon options from starting-equipment packages                     |
| `listReachableSpellOptions`          | `automatic/list-reachable-spell-options.ts`        | Advisory spell ChoiceSet options at seed class/level                         |
| `resolveAutomaticChoiceSelections`   | `automatic/resolve-automatic-choice-selections.ts` | Required ChoiceSet fill loop, with per-value `suggestedBy`                   |
| `resolveAutomaticNpcBuild`           | `automatic/resolve-automatic-npc-build.ts`         | Seed, choice loop, magic items, weapon grants, constraint checks             |

The resolver is pure: it operates only over the supplied
`CharacterBuildContext` (no HTTP, no persistence). Callers assemble the
context the same way the builder UI does.

## Pipeline position

```text
seed → resolveAutomaticNpcBuild → completed draft
     → contextual patches (e.g. connections.organizations)
     → finalizeNpcCharacterBuild (ONE authoritative finalSubmit validation)
     → POST /api/campaigns/:id/npcs
```

The resolver does **not** run `finalSubmit` validation itself — final
character validity is checked once, by finalize, after the caller applies
contextual patches. On success it returns `resolvedChoiceSets` which must be
passed to finalize as engine options.

## Resolution algorithm

1. **Seed validation** — species/class must be playable per
   `resolvePlayableBuilderContent`; level must satisfy `validateBuilderCharacterLevel`.
   Rejections reuse existing builder issue codes (`species_not_in_catalog`,
   `class_not_in_catalog`, level issues).
2. **Draft seeding** — identity, species, class/level, ability scores
   (standard array assigned deterministically by class primary-ability
   priority via `deriveDeterministicAbilityAssignment`), and an initialized
   equipment channel.
3. **Progress-based fixpoint loop** — repeatedly:
   - `resolveAvailableChoices(draft, context)` (the same ChoiceSet registry
     the builder UI consumes);
   - find the first unsatisfied **required** ChoiceSet;
   - fill it with the first eligible options in the resolver-owned canonical
     order until `min` is reached (heritage selections dual-write
     `species.heritageId`, mirroring the species step);
   - re-resolve, so dependent ChoiceSets (heritage → traits, equipment
     package → pool picks) follow the normal dependency graph.

   Termination is progress-based: an iteration must add selections, mark
   equipment skipped, or fail. A hard iteration ceiling
   (`AUTOMATIC_BUILD_ITERATION_CEILING`) guards against resolver bugs only.

4. **Special cases**
   - An empty top-level starting-equipment ChoiceSet marks
     `equipment.skipped` (the builder's escape hatch) instead of failing.
   - Required (`exact`) magic-item grant allowances are filled with the first
     eligible catalog equipment; `up_to` allowances stay empty.
   - Optional ChoiceSets are never selected.
5. **Failure** — when no eligible option can make progress, the resolver
   returns `ok: false` with the existing `choice_set_unsatisfied` issue for
   the stuck ChoiceSet. No partial character is ever produced.

## Soft preferences

`resolveNpcTemplateRecommendations` turns a user role, title recommendation, organization
default, and species language affinities into ordered `SourcedRecommendation` lists.
Species language order lives there, not in a second pass inside the filler.
Commoner is the resolver-only fallback and is not written onto the draft.
`toAutomaticNpcBuildPreferences` passes those lists through to `resolveAutomaticNpcBuild`.

The required-ChoiceSet loop is `resolveAutomaticChoiceSelections`. It returns the draft,
the resolved graph, and `suggestedBy` for each id the fill added (`[]` when the id came
from canonical order). Each value is a `RecommendationSourceRef` list. Package bias keeps
every source that owns the winning tuple. Seeded allowance ids are not attributed. `resolveAutomaticNpcBuild`
runs that loop, then magic-item grants, required-weapon grants, and constraint checks.

Fill order for each required ChoiceSet is:

1. Legal candidates from the current character. A class starting-equipment package and its
   nested pools come only from the selected class. Selections outside that set do not count
   toward `min` and are removed.
2. Hard constraints, then class spell recommendations.
3. Soft preferences. User, title, and role equipment preferences are global: they stay active
   when the selected class is not the role's suggested class, and they only reorder options
   that are already legal. A preference that matches nothing is ignored and does not fail the
   build.
4. The canonical first-eligible option.

Class-authored equipment signals use `{ kind: 'class', classId }` and apply only for that
class. `suggestedBy` is recorded only for a winner that is already a legal option of the
selected class. Changing class drops the previous class's package selection, nested pools, and
class-owned equipment channel, then the next fill resolves the new class from scratch.
The previous package's gear is never copied into purchases.
`reconcileEquipmentForClassChange` is the only place that decides which purchases survive:
`manual` rows and `startingGold` rows with `origin: 'picker'` stay unchanged (same `id`,
quantity, and `unitCostCp`) while their equipment is still playable picker content;
`origin: 'packageConversion'` rows belong to the previous class and drop.
`pruneInvalidBuilderSelections` never rewrites purchases. Proficiency does not prune a
retained row. Assembled inventory still waits for a resolved starting option; when the next
option is selected, `evaluateEquipmentPackageSwitch` fits the retained cart to its funding.

`origin` is structural: the purchase schema is a discriminated union on `sourceMode`, and
every `startingGold` row must carry `origin` (`picker` or `packageConversion`). `manual`
rows have no `origin`. Normalization only assigns missing ids and never invents an origin.

Class spell recommendations are recorded as `suggestedBy` refs `{ kind: 'class', id }`.
Already-held skills, tools, and
languages are skipped and do not count toward the required pick. Held ids come from finalize-equivalent
proficiency assembly (`resolveHeldProficiencyKeys`), excluding the ChoiceSet being filled,
so class-fixed items, ruleset languages, and earlier ChoiceSet selections are all visible
to later fills.
A preference that does not appear in the ChoiceSet is ignored. Soft preferences never fail
a build.

Classed automatic builds keep class primary abilities in the top standard-array slots and
use the role ability order for the rest. A complete level-0 role ability order assigns the
standard array directly.

Role detail → [npc-templates.md](npc-templates.md).

## Manual equipment grants (Quick NPC)

`startingEquipmentGrants` is an optional array of `{ equipmentId, quantity }` inputs to
`resolveAutomaticNpcBuild`. Duplicate ids are merged by summing quantities. Each grant is applied
with additive contribution semantics after automatic and package equipment; invalid ids fail the
build with a validation issue — grants are never silently dropped.

`pinnedChoiceSetIds` lists explicit starting-choice override keys. The automatic filler skips
topping up those choice sets. Dashboard Quick NPC passes pinned ids from
`npcStartingChoicePinnedChoiceSetIds`.

`resolveNpcStartingChoiceIssues(choices)` returns `starting_choice_incomplete` when a pinned
allowance or nested package pick is below its minimum. Create and Preview both consume these
issues through the shared prepared-draft path.

## Constraints (Quick NPC spell requirements)

Hard constraints are optional inputs to `resolveAutomaticNpcBuild`:

```ts
resolveAutomaticNpcBuild({
  seed,
  constraints?: { requiredSpellIds: string[] },
  context,
  startingEquipmentGrants?: { equipmentId: string; quantity: number }[],
  pinnedChoiceSetIds?: string[],
})
```

Constraint id arrays are **unordered sets** — canonicalize (sort + dedupe) before resolve.
The resolver verifies every required id is satisfied in the resolved draft; individually
reachable options that cannot be combined still fail with `automatic_constraint_unsatisfiable`.

| Layer                                                        | Role                                                                                                                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listReachableStartingWeapons` / `listReachableSpellOptions` | **Advisory** — `listReachableSpellOptions` for spell requirement pickers; weapon pickers use playable equipment via `resolvePlayableBuilderContent` |
| `resolveAutomaticNpcBuild`                                   | **Authority** — whether the full constraint set is satisfiable amid choice dependencies                                                             |

Picker eligibility does **not** imply build validity. When constraints cannot be
satisfied (e.g. required spells exceed capacity, or a required weapon is not
campaign-available), the resolver returns `ok: false` with
`automatic_constraint_unsatisfiable` — it does not drop requirements to force
success.

Selection policy with constraints:

- Required weapon/spell selections are applied **before** remaining first-eligible defaults.
- Starting-equipment package ChoiceSets bias toward the first authored package that can produce **all** required weapons together when possible; gold-only packages never satisfy package bias alone.
- Nested equipment pool picks prefer required weapons when they appear in the pool.
- Required weapons still missing from assembled inventory after package/pool resolution receive domain `ensureEquipmentGrant` rows (not purchases) when campaign-available — including at zero starting funds.
- Post-resolution validation ensures every `requiredWeaponIds` / `requiredSpellIds` entry is present in assembled inventory / choice selections respectively.

## Determinism (V1)

Same seed + same constraints + same catalog ⇒ deep-equal draft. Ordering is owned by the
registered resolvers (e.g. spells are name-sorted; class skills follow
authored order) — never incidental object-key, Mongo, or API response order.
Regression coverage includes a catalog-insertion-order inversion test.

**Name generation is independent:** explicit Quick NPC name Generate may be random;
do not treat name-generator non-determinism as a build-resolver failure in tests.

Randomized or preset-driven generation later supplies richer seeds (or a
pluggable selection policy) to this same entry point — do not introduce a
second assembly path.

## Consumers

- **Quick NPC** (dashboard): `apps/dashboard/src/features/character/npc/lib/quick-npc/quick-npc-create.ts`
  wraps the resolver, injects the organization membership connection, and
  finalizes — one atomic `POST /api/campaigns/:id/npcs` carries the
  membership in `connections.organizations`. Entry surface: organization detail
  → **Add member** drawer (`OrganizationMemberPickerDrawer`) → character-owned
  `QuickNpcCreateModal` (Setup then TabbedForm authoring). The organizations hook
  coordinates overlay modes only; it does not embed creation inside the drawer.
  Dashboard policy: [character-acquisition.md](../../../../apps/dashboard/docs/character-acquisition.md#quick-npc-organization-member).
