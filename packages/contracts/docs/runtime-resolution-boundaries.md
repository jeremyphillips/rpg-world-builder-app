# Runtime resolution boundaries and naming

Guidance for splitting and naming resolution logic under `packages/contracts/src/rpg/runtime/`.
Use this when refactoring existing resolvers (equipment, spellcasting, proficiencies, …)
or adding new creature-like behavior.

**Reference implementations:** language proficiencies (original) and the
character-builder `resolvers/` directory refactor — each domain follows creature →
character → builder ChoiceSets → `assemble-*.ts` orchestration.

| Layer                 | Module                                                                        | Question it answers                                                              |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Creature              | `runtime/creature/{domain}.ts`                                                | Given catalog data, what ids/options does this grant or choice source represent? |
| Character             | `runtime/character/{domain}.ts`                                               | What stored-sheet payload should rows have (merged, deduped)?                    |
| Builder orchestration | `runtime/character-builder/assemble-{domain}.ts`                              | How do grants + draft selections + sources become finalize rows?                 |
| Builder ChoiceSets    | `runtime/character-builder/resolvers/resolve-{scope}-{domain}-choice-sets.ts` | What must the player pick during creation?                                       |

See also [character-builder-resolvers.md](character-builder-resolvers.md) for the
choice-source registry catalog and [structure.md](structure.md) for package-layer
import rules.

---

## Mental model

Resolution is split by **who consumes the output**, not by where the rules live in
content JSON.

```text
catalog / vocab / content grants
        ↓
creature primitives     ← reusable across PC, NPC, monster
        ↓
character assembly      ← stored sheet shapes (PC + NPC today)
        ↓
character-builder       ← draft, ChoiceSets, validation, finalize orchestration

monster assembly        ← future; also consumes creature primitives, not builder
```

Each layer answers a different question. If a function needs types or concepts
from a layer below it in this diagram, it is in the wrong module.

---

## Layer definitions

### `runtime/creature/`

**Audience:** Any creature-like runtime surface — PC, NPC, monster, summon, …

**Responsibilities:**

- Expand grants and choice-source shapes against catalog/vocabulary rows
- Dedupe, filter, and normalize ids or catalog items
- Domain primitives with no creation-flow or sheet-provenance opinions

**Must not import or reference:**

- `CharacterBuilderDraft`, `CharacterBuildContext`, `ChoiceSet`, `choiceSelections`
- `CharacterSelectionSource` / provenance assembly (unless a future creature layer
  defines its own neutral provenance — not today)
- Dashboard or API modules
- `runtime/character-builder/`

**Suggested modules:** one noun per file — `languages.ts`, `senses.ts`, `damage-resistances.ts`.

**Exists today:** `creature/languages.ts`, `creature/equipment.ts`, `creature/spellcasting.ts`

---

### `runtime/character/`

**Audience:** Stored character documents (`pc`, `npc` — same sheet shape).

**Responsibilities:**

- Assemble final character-facing payloads (`proficiencies`, `equipment`, …)
- Merge duplicate entries on the same key (e.g. language id with combined sources)
- Pure helpers that operate on character DTO shapes

**May import:** `runtime/creature/`, `rpg/content/`, `rpg/vocab/`, `rpg/campaign/`

**Must not import:** `runtime/character-builder/`

**Subfolder `runtime/character/derive/`:** Read-model math from an **already built**
character (modifiers, AC, profile). Use `derive*` / `resolve*` for formulas only —
not grant expansion or builder draft logic.

**Exists today:** `character/languages.ts`, `character/proficiencies.ts` (schemas),
`character/derive/*`

---

### `runtime/monster/` (future)

**Audience:** Monster / stat-block documents (not yet modeled).

**Responsibilities:** Same _class_ of work as `runtime/character/` but for monster
sheet shapes — e.g. `speaks`, `understands but cannot speak`, telepathy range.

**May import:** `runtime/creature/`

**Must not import:** `runtime/character-builder/`, and generally not `runtime/character/`
unless a shared neutral type is intentionally extracted upward.

Do not fold monster-only behavior into `creature/` or `character/` preemptively.

---

### `runtime/character-builder/`

**Audience:** Interactive character creation only (standalone, campaign, future NPC
builder modes).

**Responsibilities:**

- Emit `ChoiceSet[]` for pending player decisions
- Read `draft.choiceSelections`
- Validate steps and orchestrate finalize / preview
- Attach `CharacterSelectionSource` provenance when writing character rows

**May import:** `runtime/creature/`, `runtime/character/`, builder-local types

**Must not own:** Reusable catalog/grant expansion that monsters will need — promote
to `creature/` first.

#### Builder sub-areas

| Area                   | Path pattern                                     | Role                                                                              |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| ChoiceSet resolvers    | `resolvers/resolve-*-choice-sets.ts`             | Registry-facing; returns `ChoiceSet[]`                                            |
| Choice-source adapters | `resolvers/resolve-{source}-{domain}-choices.ts` | Thin `ChoiceSourceResolver` wrapper (may delegate to `*-choice-sets.ts`)          |
| Finalize orchestration | `assemble-{domain}.ts` (builder root)            | Draft + context + resolved ChoiceSets → character rows with sources               |
| Aggregate assembly     | `assemble-{aggregate}.ts`                        | Composes multiple domains for preview/finalize (e.g. `assemble-proficiencies.ts`) |
| Registry               | `resolvers/choice-sources.ts`                    | Ordered `CHOICE_SOURCE_RESOLVERS` list                                            |

---

## Dependency direction (strict)

```text
runtime/creature/*
  → content, vocab, primitives, campaign (as needed)
  → never character-builder, never character (unless later shared types move up)

runtime/character/*
  → may import creature
  → never character-builder

runtime/monster/*   (future)
  → may import creature
  → never character-builder

runtime/character-builder/*
  → may import creature + character
  → orchestrates both; does not duplicate creature primitives
```

If `runtime/character/` needs a builder type, stop — extract the primitive or
assembly step.

---

## Filename conventions

### Rules

1. **Prefer domain nouns in `creature/` and `character/`** — the folder provides
   context; filenames are `{domain}.ts`, not `resolve-{domain}.ts`.
2. **Require verb phrases in `character-builder/resolvers/`** — resolvers are
   actions; filenames start with `resolve-` or `assemble-` (orchestration stays at
   builder root).
3. **Suffix `choice-sets`** when the primary export returns `ChoiceSet[]`.
4. **Suffix `-resolution`** is deprecated for new code — split into `resolve-*-choice-sets.ts`
   - `assemble-*.ts` instead.
5. **No broad names** — `resolve-languages.ts` is ambiguous (creature? character?
   builder? monster?). Use explicit scope: `resolve-language-choice-sets.ts`,
   `creature/languages.ts`, `character/languages.ts`.
6. **Co-locate tests:** `{name}.test.ts` beside the module.
7. **Avoid barrel re-exports** that hide the real module — delete or replace old
   paths during refactors; do not leave `resolve-languages.ts` as a vague facade.

### Filename patterns

| Pattern                                   | Location                       | Example                                                   |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------------- |
| `{domain}.ts`                             | `runtime/creature/`            | `languages.ts`                                            |
| `{domain}.ts`                             | `runtime/character/`           | `languages.ts`, `equipment-inventory.ts`                  |
| `{aspect}.ts`                             | `runtime/character/derive/`    | `armor-class.ts`, `profile.ts`                            |
| `resolve-{scope}-{domain}-choice-sets.ts` | `character-builder/resolvers/` | `resolve-language-choice-sets.ts`                         |
| `resolve-{scope}-{domain}-choices.ts`     | `character-builder/resolvers/` | Thin adapter only; **migrate** impl to `*-choice-sets.ts` |
| `assemble-{domain}.ts`                    | `character-builder/`           | `assemble-language-proficiencies.ts`                      |
| `assemble-{aggregate}.ts`                 | `character-builder/`           | `assemble-proficiencies.ts`                               |
| `{domain}-pool-options.ts`                | `character-builder/resolvers/` | Shared option builders (no `ChoiceSet` id); keep small    |

### `scope` segment (builder ChoiceSet files)

Use the **source** of the choice, matching `ChoiceSet.sourceType` / `buildChoiceSetId`:

| Scope          | When                                        |
| -------------- | ------------------------------------------- |
| `ruleset`      | Campaign / ruleset character-creation rules |
| `class`        | `class.characterCreation`                   |
| `species`      | Species / heritage / trait grants           |
| `feature`      | Class feature grants                        |
| `spellcasting` | Class spell lists                           |

Examples: `resolve-class-skill-choice-sets.ts`, `resolve-ruleset-language-choices.ts`
(adapter) → `resolve-language-choice-sets.ts` (implementation).

---

## Function naming conventions

### Verb prefixes (strict)

| Prefix                      | Meaning                                                                              | Allowed layers                                           | Returns                              |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| `resolve`                   | Expand rules, grants, or catalog into ids, options, profiles, or intermediate shapes | creature, character-builder, character/derive (formulas) | ids, catalog rows, options, numbers  |
| `assemble`                  | Combine multiple contributions into a storage or finalize payload                    | character, character-builder (orchestration)             | character DTO slices, inventory rows |
| `derive`                    | Compute read-model fields from a built character                                     | `character/derive/` only                                 | preview/profile stats                |
| `dedupe`, `merge`, `expand` | Small pure collection helpers                                                        | creature (preferred), character                          | arrays, maps                         |
| `build`                     | Construct builder artifacts with deterministic ids                                   | character-builder                                        | `ChoiceSet.id`, storage keys         |
| `read`, `get`, `is`, `has`  | Accessors and predicates                                                             | any                                                      | scalar / boolean                     |

### Do not

- Use `resolve` for finalize orchestration that writes provenance — use `assemble*Entries`
  or `assembleCharacter*` in the builder layer.
- Use `assemble` in `creature/` — creature outputs ids or catalog rows, not sheet rows.
- Export `deriveCharacterLanguages` from builder — derivation of stored shape belongs in
  `character/`; builder only orchestrates sources.

### Function shape patterns

```ts
// Creature — catalog in, ids or rows out; args object when >1 parameter
resolveLanguageIdsFromGrantSet(args: {
  grantSet?: LanguageProficiencyGrantSet
  languages: readonly CreatureLanguageOption[]
}): string[]

// Character — no builder types
assembleLanguageProficiencyIds(args: {
  grantedIds?: readonly string[]
  selectedIds?: readonly string[]
}): LanguageProficiencyGrantSet

// Builder ChoiceSets — draft + context; may ignore draft when only rules-driven
resolveLanguageChoiceSets(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): ChoiceSet[]

// Builder finalize orchestration — explicit inputs, character slice out
assembleLanguageProficiencyEntries(
  draft: CharacterBuilderDraft,
  context: CharacterLanguageAssemblyContext,
  languages: readonly LanguageSeedOption[],
  choiceSets: readonly ChoiceSet[],
): CharacterProficiencies['languages']
```

### Type naming

| Pattern                            | Example                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Creature{Domain}Option`           | `CreatureLanguageOption`                                                                                 |
| `DerivedCharacter{Domain}`         | `DerivedCharacterLanguages` (summary; optional)                                                          |
| `Character{Domain}AssemblyContext` | `Pick<CharacterBuildContext, 'rulesetId' \| 'characterCreationRules'>` in **builder** orchestration only |
| `Resolved{Domain}{Thing}`          | Intermediate builder shapes when needed                                                                  |

---

## Orchestration flow (finalize)

Finalization must follow this order per domain:

```text
1. Resolve automatic grants        (creature primitives)
2. Read ChoiceSet selections       (builder draft)
3. Assemble character payload      (character assembly — ids / rows)
4. Attach provenance               (builder orchestration — CharacterSelectionSource)
5. Write to character.{domain}     (never parallel deprecated top-level fields)
```

Languages today: steps 1–5 live in `assemble-language-proficiencies.ts`, which calls
`creature/languages` + `character/languages` and is invoked from `assemble-proficiencies.ts`.

---

## ChoiceSet resolver contract

Registered resolvers use `ChoiceSourceResolver`:

```ts
(draft, context, catalogIndex) => ChoiceSet[]
```

Conventions:

- **Registry adapters** stay thin — delegate to `resolve*ChoiceSets` in a `*-choice-sets.ts` file.
- **First-choice-only (MVP):** only `choices[0]` (or first meaningful choice) when
  multi-package UI does not exist. Comment at the call site:

  ```ts
  // MVP authoring/rendering supports only the first choice package.
  // Additional packages are intentionally ignored until multi-package UI exists.
  ```

- **Deterministic ids:** `buildChoiceSetId(sourceType, sourceId, choiceId)` — do not invent a parallel id format.
- **Options from catalog** — never hardcode vocabulary lists (e.g. Standard Languages) in resolvers.

---

## `derive/` vs `assemble/` vs `resolve/`

| Concern                                         | Layer               | Verb                                 | Example           |
| ----------------------------------------------- | ------------------- | ------------------------------------ | ----------------- |
| Hit die + CON → level-1 HP                      | `character/derive`  | `resolveLevelOneMaxHp`               | Formula on scores |
| Ability scores → skill modifiers                | `character/derive`  | `deriveSkillModifiers`               | Read-model        |
| Grant set + catalog → language ids              | `creature`          | `resolveLanguageIdsFromGrantSet`     | Grant expansion   |
| Granted + selected ids → proficiency items      | `character`         | `assembleLanguageProficiencyIds`     | Sheet slice       |
| Rules + catalog → ChoiceSet options             | `character-builder` | `resolveLanguageChoiceSets`          | Player choices    |
| Draft + ChoiceSets → proficiency rows + sources | `character-builder` | `assembleLanguageProficiencyEntries` | Finalize          |

---

## Agent refactor checklist

When cleaning up an existing resolution file:

1. **Name the question** each exported function answers (creature / character / builder).
2. **List forbidden imports** for that layer; move code that violates them.
3. **Split mixed files** — e.g. `spellcasting-resolution.ts` combines choice-set
   builders and finalize assembly; target state:
   - Creature-style pool expansion → `creature/{domain}.ts`
   - Character inventory rows → `character/{domain}.ts`
   - ChoiceSets → `resolve-{scope}-{domain}-choice-sets.ts`
   - Finalize orchestration → `assemble-{domain}.ts` (builder root)
4. **Rename** to filename conventions above; update `choice-sources.ts` and barrels.
5. **Move tests** with the code — one test file per layer module.
6. **Delete** old broad modules; avoid permanent re-export barrels.
7. **Run** `pnpm typecheck:affected` and `pnpm test:affected` in `@rpg/contracts`.

### Promotion criteria (builder → creature)

Move logic from `character-builder/` to `creature/` when **any** of these hold:

- Monsters or NPCs will need the same grant/category expansion
- The function only needs catalog rows + grant/choice shapes
- The function does not mention `draft`, `ChoiceSet`, or `CharacterSelectionSource`

### Promotion criteria (builder → character)

Move logic to `character/` when:

- Output is a stored character sub-shape (`proficiencies`, `equipment`, `spells`, …)
- Merge/dedupe rules are the same at finalize and (future) direct API edit
- No `ChoiceSet` or step validation is required

---

## Known inconsistencies (cleanup backlog)

Track refactors against this doc. Not exhaustive — update as files move.

**Character-builder `resolvers/` refactor:** complete. Domains use `resolve-*-choice-sets.ts`

- thin `resolve-*-choices.ts` adapters; finalize orchestration lives in `assemble-*.ts`;
  creature primitives in `runtime/creature/`.

| Current module              | Issue                          | Disposition                                               |
| --------------------------- | ------------------------------ | --------------------------------------------------------- |
| `character/derive/index.ts` | Mixes `resolve*` and `derive*` | Acceptable within derive; do not add grant expansion here |
| `creature/proficiencies.ts` | Not yet created                | Deferred until grant finalize needs shared pool expansion |

---

## Tests per layer

| Layer                 | Assert                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Creature              | Explicit ids, category expansion, combined `from` + categories, dedupe, unknown category/id handling |
| Character             | Merged ids/rows, dedupe across grant + selection, no builder imports in module                       |
| Builder ChoiceSets    | Empty when no rules / `choose <= 0`, first package only, deterministic ids, catalog-driven options   |
| Builder orchestration | Finalize writes correct character slice with sources; no deprecated top-level fields                 |

---

## Quick decision tree

```text
Does it need CharacterBuilderDraft or ChoiceSet?
  yes → character-builder
  no ↓

Does it produce a stored character document slice?
  yes → character
  no ↓

Will monsters/NPCs need the same logic?
  yes → creature
  no ↓

Is it only used during creation?
  yes → character-builder (orchestration)
  no → creature or character (reconsider the design)
```

---

## Related docs

- [structure.md](structure.md) — package layers and ESLint boundary enforcement
- [character-builder-resolvers.md](character-builder-resolvers.md) — choice-source registry inventory
- Language refactor plan — `.cursor/plans/language_proficiency_refactor_cb5ebbba.plan.md`
