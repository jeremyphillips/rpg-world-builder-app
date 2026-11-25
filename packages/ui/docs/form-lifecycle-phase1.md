# Form validation lifecycle — Phase 1

Phase 1 introduces a pure schema evaluator, a generic `runFormAction` stage runner, and an RHF resolver backed by the evaluator instead of `@hookform/resolvers/zod` directly.

## RHF integration decision

**Chosen strategy:** `evaluator-bridge` (`FORM_RHF_INTEGRATION_STRATEGY`).

Public RHF APIs only. `makeResolver` calls `evaluateFormSchema` and projects invalid results with `projectIssuesToFieldErrors`. Parsed values (coercion, omitted hidden keys) are returned as `values`. Canonical issue lists remain on the evaluator result for future session wiring; RHF errors are compatibility chrome only.

`createValidateSilently(schema, items)` calls the evaluator directly and does not invoke the resolver, so quiet checks do not populate `formState.errors`.

**Fallback (not selected):** `passive-projection` via `projectInvalidEvaluationToForm` if the bridge fails mounted criteria. Remove `makeResolver` zod bridge usage and validate only through explicit action stages.

## Ownership

| Module                                            | Package                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `evaluateFormSchema`, `runFormAction`, RHF bridge | `@rpg/ui/form`                                                       |
| Message catalogs, Zod schemas                     | `@rpg/contracts`                                                     |
| Content prepare/persist stages                    | Dashboard content submit (Phase 3 wires stages into `runFormAction`) |

## Prepare-once persist

`useContentFormSubmit` validates `prepareCommitValues` output and calls `persist` with the same prepared payload, not raw handler values.
