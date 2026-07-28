# Character builder contracts

Boundary-neutral serializable contracts for the character builder domain.
Orchestration, validation functions, and draft mutation live in
[`rpg/runtime/character-builder/`](../src/rpg/runtime/character-builder/).

Import via `@rpg/contracts` or `@rpg/contracts/rpg/character-builder`.

## Ownership rule

If it can cross the API boundary or be persisted without executing builder
behavior, it belongs in `rpg/character-builder/`. If it calculates, resolves
catalog data, or orchestrates step progression, it belongs in
`rpg/runtime/character-builder/`.

## Current modules

| Module                | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `step-ids.ts`         | Canonical builder wizard step identifiers |
| `validation-issue.ts` | Serializable validation issue wire shape  |

`rpg/runtime/character-builder/step-ids.ts` re-exports step ids for backward
compatibility during migration.

## Future migration candidates

Evaluate each item against the ownership rule before moving. Do not bulk-move
runtime modules.

| Candidate                                   | Current home                                  | Why it might move                                                               | Why it might stay                                                                     |
| ------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `characterBuildAcquisitionSchema`           | `runtime/character-builder/acquisition.ts`    | Serializable discriminated union; referenced by dashboard chrome and onboarding | `resolveDefaultCharacterBuildAcquisition()` is behavioral — split schema vs helper    |
| `CHARACTER_BUILDER_CHROME_VARIANTS`         | `character-builder-chrome-variant.ts`         | Stable UI copy variant ids                                                      | `resolveCharacterBuilderChromeVariant()` depends on `CharacterBuildContext`           |
| `CHARACTER_BUILD_VALIDATION_PHASES`         | `runtime/character-builder/validate/types.ts` | Could appear on API telemetry                                                   | Not currently on wire                                                                 |
| `characterBuildScopeSchema` / mode enums    | `mode-scope.ts`                               | Legacy but serializable scope shapes                                            | Marked legacy; prefer `character-acquisition` axes long-term                          |
| Choice-set / choice-type identifiers        | `choice-set.ts`, `steps.ts`                   | If error payloads or APIs expose them                                           | Today only used inside builder orchestration                                          |
| `characterBuilderDraftScope` / storage keys | `draft-scope.ts`, `storage-key.ts`            | sessionStorage contract                                                         | Composes runtime/campaign/content deps                                                |
| Full `CharacterBuilderDraft` schema         | `draft.ts`                                    | Persisted client-side                                                           | Heavy `content/` / `vocab` imports                                                    |
| `CharacterBuildContext`                     | `context.ts`                                  | Central builder type                                                            | Assembles catalog + campaign rules                                                    |
| `createCharacterInputSchema`                | `runtime/character/create-input.ts`           | Used by onboarding completion                                                   | Correctly in runtime; completion wrapper in `campaign-onboarding-completion-input.ts` |
