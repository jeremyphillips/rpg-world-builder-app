# Character builder (dashboard)

Dashboard integration for the concentration-mode character builder at
`/characters/new`. Contracts engine, resolvers, and validation live in
`@rpg/contracts`; this doc covers dashboard-specific wiring.

Resolver catalog: [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).

## Feature layout

Implementation lives in `src/features/character/` — see
[feature README](../src/features/character/README.md) for routes and key files.

## Step readiness (BENCH-120)

Advanced steps (Equipment, Spells, Proficiencies) use a **derived readiness**
layer from contracts instead of ad-hoc empty/blocked branches in each step view.

| Layer         | Module                                                     | Role                                                                  |
| ------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Contracts     | `resolveBuilderStepReadiness`                              | Single source of truth for blocked / N/A / empty / choices / complete |
| Dashboard lib | `lib/builder-step-readiness.lib.ts`                        | Message-only vs interactive UI; proficiencies section filtering       |
| UI            | `components/steps/builder-step-readiness-panel.client.tsx` | Renders readiness `message` + `helperText`                            |
| Rail          | `lib/builder-step-visual-status.ts`                        | Maps readiness → `StepStatus` (`locked` = not applicable)             |

### Proficiencies partial block

When no class is selected, readiness is `blocked` with `classDependentBlocked: true`.
The step still renders **origin-language** choice sections; class-dependent sections
(saving throws, skills, tools, weapons, armor) are hidden until a class is chosen.

### Copy hierarchy

1. `BUILDER_STEPS` title + description (`BuilderStepFrame`)
2. Readiness `message` / `helperText` (`BuilderStepReadinessPanel`)
3. Validation issues (`CharacterBuilderValidationAlert`)

Readiness does not replace `validateCharacterBuild` on Continue / Create.

## Related docs

- [feature-structure.md](feature-structure.md)
- [feature-conventions.md](feature-conventions.md)
- [validation-messages.md](../../../packages/contracts/docs/validation-messages.md)
