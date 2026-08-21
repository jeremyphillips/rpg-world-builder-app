# Character builder (dashboard)

Dashboard integration for the concentration-mode character builder at
`/characters/new`. Contracts engine, resolvers, and validation live in
`@rpg/contracts`; this doc covers dashboard-specific wiring.

Resolver catalog: [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).

Picker chrome audit (equipment / spells / proficiencies):
[character-builder-picker-chrome.md](./character-builder-picker-chrome.md).

## Feature layout

Implementation lives in `src/features/character/` — see
[feature README](../src/features/character/README.md) for routes and key files.

## Step readiness (BENCH-120)

Advanced steps (Equipment, Spells, Proficiencies) use a **derived readiness**
layer from contracts instead of ad-hoc empty/blocked branches in each step view.

| Layer         | Module                                                                    | Role                                                                  |
| ------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Contracts     | `resolveBuilderStepReadiness`                                             | Single source of truth for blocked / N/A / empty / choices / complete |
| Dashboard lib | `lib/builder/builder-step-readiness.lib.ts`                               | Message-only vs interactive UI; proficiencies section filtering       |
| UI            | `components/builder/steps/shared/builder-step-readiness-panel.client.tsx` | Renders readiness `message` + `helperText`                            |
| Rail          | `lib/builder/builder-step-visual-status.ts`                               | Maps readiness → `StepStatus` (`locked` = not applicable)             |

### Proficiencies partial block

When no class is selected, readiness is `blocked` with `classDependentBlocked: true`.
The step shows the class dependency notice while preserving origin language choices;
class-dependent choice sections (saving throws, skills, tools, weapons, armor) remain
hidden until a class is chosen.

### Dependency presentation

| State                           | Presentation                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Equipment / Spells `blocked`    | Muted message (`BuilderStepReadinessPanel`)                                   |
| Proficiencies partial `blocked` | Info `Alert` above available content                                          |
| Preview sidebar (no class)      | Same contracts readiness strings via `character-builder-preview-panel.lib.ts` |

### Copy hierarchy

1. `BUILDER_STEPS` title + description (`BuilderStepFrame`)
2. Readiness `message` / `helperText` (`BuilderStepReadinessPanel`)
3. Validation issues (`CharacterBuilderValidationAlert`)

Readiness does not replace `validateCharacterBuild` on Continue / Create.

### Builder level (phase 1)

- `draft.class.level` is the selected class level (schema: `absoluteLevelSchema`, default `1`).
- `getCharacterBuilderTotalLevel(draft)` — proficiency bonus and preview derivation.
- `getBuilderSelectedStartingLevel(draft)` — starting wealth tier lookup (single-class today).
- `validateBuilderCharacterLevel` / `resolveBuilderLevelConstraints` — context-specific caps; campaign PC requires `level === startingLevel` when that flow is active.
- Preview and finalize share `resolveBuilderMaxHitPoints`; builder finalize sets `xp: null` until experience tracking is modeled.

### Builder level UI (phase 2)

- Shell chrome hosts `CharacterBuilderLevelControl` inline with the page heading at every step.
- Standalone PC and campaign NPC use a selectable level field; campaign PC uses a read-only badge seeded to `startingLevel`.
- Level changes run `pruneInvalidBuilderSelections` on a candidate draft; removals open a confirmation modal before patching.
- Copy lives in `characterBuilderLevelMessages` (`@rpg/contracts`).

### Copy layers

Dependent-choice workflow strings (heritage, future subclass) use a three-layer model:
rules vocabulary, content/ChoiceSet labels, and builder UI messages. Heritage is the
reference implementation.

See [character-builder-copy.md](character-builder-copy.md).

## Related docs

- [character-builder-copy.md](character-builder-copy.md)
- [equipment-inventory.md](equipment-inventory.md)

- [feature-structure.md](feature-structure.md)
- [feature-conventions.md](feature-conventions.md)
- [validation-messages.md](../../../packages/contracts/docs/validation-messages.md)
