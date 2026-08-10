# Automatic build resolution

Deterministic completion of a character build draft from a compact seed —
the domain service behind **Quick NPC** and the intended entry point for
future presets, templates, and randomized generation. There is exactly one
character-generation architecture: automatic resolution produces a normal
`CharacterBuilderDraft` that flows through the same validation and finalize
path as a manually built character.

## Modules

| Export                          | Module                                     | Purpose                                                                  |
| ------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `automaticNpcBuildSeedSchema`   | `automatic/automatic-npc-build-seed.ts`    | Zod schema for the compact seed (name, species, class, level, alignment) |
| `validateAutomaticNpcBuildSeed` | `automatic/automatic-npc-build-seed.ts`    | Seed content validation against the build context (UI-independent)       |
| `resolveAutomaticNpcBuild`      | `automatic/resolve-automatic-npc-build.ts` | Seed + context → completed draft or structured failure                   |

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

1. **Seed validation** — species/class must be campaign-available per
   `resolveAvailableContent`; level must satisfy `validateBuilderCharacterLevel`.
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

## Determinism (V1)

Same seed + same catalog ⇒ deep-equal draft. Ordering is owned by the
registered resolvers (e.g. spells are name-sorted; class skills follow
authored order) — never incidental object-key, Mongo, or API response order.
Regression coverage includes a catalog-insertion-order inversion test.

Randomized or preset-driven generation later supplies richer seeds (or a
pluggable selection policy) to this same entry point — do not introduce a
second assembly path.

## Consumers

- **Quick NPC** (dashboard): `apps/dashboard/src/features/character/npc/lib/quick-npc-create.ts`
  wraps the resolver, injects the organization membership connection, and
  finalizes — one atomic `POST /api/campaigns/:id/npcs` carries the
  membership in `connections.organizations`. Entry surface: the organization
  Members "Add member" drawer (`OrganizationMemberPickerDrawer`), which swaps
  its body for `QuickNpcCreateForm` while preserving both views' state for
  the drawer session.
