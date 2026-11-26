# Form validation lifecycle

One pipeline: evaluate at the boundary, route issues once, present on compiled owners, persist a single prepared payload. Zod and message catalogs live in `@rpg/contracts`. Evaluator, action runner, and RHF resolver wiring live in `@rpg/ui/form`. Content prepare, publish boundaries, and API issue paint live in dashboard `content/lib/forms`.

Field-level routing (`prepareFormIssues`, claims, tab badges) remains documented in [forms.md](./forms.md#validation--contracts-first). This doc covers **actions**, **content commit**, and **cross-app adoption**.

## `@rpg/ui/form` evaluator and RHF

**Strategy:** `evaluator-bridge` (`FORM_RHF_INTEGRATION_STRATEGY`).

- `evaluateFormSchema` — pure schema evaluation.
- `evaluateRoutedFormSchema` — evaluation plus `routeFormIssues` (`valid` | `invalid` | `operation-failure`).
- `makeResolver` — calls the evaluator; invalid results project to RHF via `projectIssuesToFieldErrors`. Parsed values are returned as `values`. Canonical issues stay on the evaluator result; `formState.errors` is compatibility chrome.
- `createValidateSilently` — calls the evaluator directly (no resolver), so quiet checks do not populate `formState.errors`.
- `runFormAction` — ordered typed stages; content commit maps stages in the dashboard submit pipeline.

| Module                         | Package          |
| ------------------------------ | ---------------- |
| Evaluator, runner, RHF bridge  | `@rpg/ui/form`   |
| Schemas, validation messages   | `@rpg/contracts` |
| Content prepare/persist stages | Dashboard submit |

## Dashboard content commit

`useContentFormSubmit` runs `runContentFormCommitPipeline` before `persist`:

1. Commit validation (draft or publish intent).
2. Optional write-schema validation on the prepared wire DTO.
3. `persist` receives **only** the prepared payload (not raw handler values).

**Producer slots:** `interactive`, `draft-action`, `publish-readiness`, `publish-action`, `serialization`, `api`. **Prepared write:** `ContentPreparedWrite` with sparse path and row-index provenance.

**Normalization:** `normalizeContentFormIssues` at the publish/evaluate boundary; operation failures become bounded safe copy (`ContentFormValidationOperationFailure`), not raw transport payloads.

| Helper                                  | Role                                            |
| --------------------------------------- | ----------------------------------------------- |
| `formIssuesToPathMessages`              | `FormIssue[]` → RHF paint payload               |
| `tryEvaluateContentPublishFormIssues`   | Shared try/catch for publish and draft surfaces |
| `applyCanonicalFormIssuesToRhf`         | Canonical RHF paint for `FormIssue[]`           |
| `applyApiErrorValidationToCanonicalRhf` | Structured API issues → RHF on adopted saves    |

Create/edit shells use `prepareSerializedContentFormWrite` + `useContentFormSubmit`. Publish bridges call `evaluateContentPublishFormIssues` (not ad hoc `prepareFormIssues` on those surfaces). Draft publish readiness uses `ContentDraftPublishValidationSurfaceBridge` and `draftPublishValidationSurface`.

**Adoption inventory:** `apps/dashboard/src/features/content/lib/forms/validation/form-validation-adopted-families.ts` (families and surfaces).

**Outside ContentFormDef:** `useAdoptedFormSubmit` (`apps/dashboard/src/lib/form-validation-adoption.lib.ts`) for tabbed/flat saves with the same API → RHF paint policy.

Dashboard authoring detail: [form-lib-conventions.md](../../../apps/dashboard/docs/form-lib-conventions.md#validation-ownership-guards).

## Pilot budgets

| Constant                                 | Value | Guarded in                                               |
| ---------------------------------------- | ----- | -------------------------------------------------------- |
| `FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS` | 500   | `waitForInvalidSubmitTarget` / invalid-submit navigation |
| `FORM_OWNERSHIP_COMPILE_BUDGET_MS`       | 50    | `content-form-ownership-compile-budget.test.ts`          |

## Retired dashboard helpers

Do not reintroduce on adopted surfaces:

- `applyValidationIssuesToForm`
- `paintValidationIssuesOnForm` (use `applyCanonicalFormIssuesToRhf`)
- `surfaceContentDraftPublishValidation`

`FORM_VALIDATION_ADOPTION_ALLOWLIST` is empty; enforcement scans production trees directly.

## Related tests

| Test / lib                                                                | Role                                          |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| `content-form-validation.test.ts`                                         | Catalog sweep / registration coverage         |
| `form-validation-pilot-regression.test.ts`                                | Publish slots, operation failures, provenance |
| `content-form-submit-drift.test.ts`                                       | Content shell bypass drift                    |
| `form-validation-enforcement.test.ts`                                     | Repository filesystem guard                   |
| `campaign-form-validation-adoption.test.ts`, `auth-form-adoption.test.ts` | Family drift                                  |
| `content-publish-validation.lib.test.ts`                                  | Publish lib behavior + retired surface guard  |

Historical plan narrative: `.cursor/plans/form_validation_ownership_architecture.plan.md` (archive only; this doc is authoritative for day-to-day work).
