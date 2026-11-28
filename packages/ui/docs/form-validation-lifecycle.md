# Form validation lifecycle

One pipeline: evaluate at the boundary, route issues once, present on compiled owners, persist a single prepared payload. Zod and message catalogs live in `@rpg/contracts`. Evaluator, action runner, and RHF resolver wiring live in `@rpg/ui/form`. Content prepare, publish boundaries, and API issue paint live in dashboard `content/lib/forms`.

Field-level routing (`prepareFormIssues`, claims, tab badges) remains documented in [forms.md](./forms.md#validation--contracts-first). This doc covers **actions**, **content commit**, and **cross-app adoption**.

## `@rpg/ui/form` evaluator and RHF

**Strategy:** `passive-projection` (`FORM_RHF_INTEGRATION_STRATEGY`). Canonical issues come only from explicit evaluator results (`evaluateFormSchema`, `runFormAction`). The RHF resolver is a side-effect-free projection for controller chrome, modes, and parsed `handleSubmit` output; it never publishes and is not an issue store. The rejected approach is a resolver that doubles as the canonical store: the RHF error tree cannot hold pathless issues or simultaneous parent and child issues. Mounted proof: `form-rhf-strategy.form.test.tsx`.

**Action identity:** a snapshot `stamp` and a per-action `attemptId` are distinct. `runFormAction` re-checks both before each stage and after every await; a superseded attempt returns `blocked` with stage `superseded` and cannot authorize a write. Form and write stages return evaluator `data`, so `persist` receives the write-schema parse.

**Equivalent evaluations:** the resolver and silent validity share a memoized evaluator, so RHF's `isValid` bookkeeping reuses the submit parse for a structurally equal snapshot. An RHF-blocked submit with no canonical issue shows safe retry copy and a console diagnostic (`FORM_BRIDGE_MISMATCH_MESSAGE`).

- `evaluateFormSchema` — pure schema evaluation.
- `evaluateRoutedFormSchema` — evaluation plus `routeFormIssues` (`valid` | `invalid` | `operation-failure`).
- `makeResolver` — passive projection of the memoized evaluator; invalid results project to RHF via `projectIssuesToFieldErrors`. Parsed values are returned as `values`. `formState.errors` is compatibility chrome.
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
3. `persist` receives **only** the write-schema parsed payload (not raw handler values). Arbitrary `Error.message` is never shown in the footer; only `ApiError` copy or the safe fallback.

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

**Outside ContentFormDef:** `useRunnerFormSubmit` (`apps/dashboard/src/lib/runner-form-submit.lib.ts`) for tabbed/flat dashboard saves on `runContentFormCommitPipeline` + producer sessions. **`useAdoptedFormSubmit`** remains only on deferred quick NPC until that workflow is adopted.

Dashboard authoring detail: [form-lib-conventions.md](../../../apps/dashboard/docs/form-lib-conventions.md#validation-ownership-guards).

## Pilot budgets

| Constant                                 | Value | Guarded in                                               |
| ---------------------------------------- | ----- | -------------------------------------------------------- |
| `FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS` | 500   | `waitForInvalidSubmitTarget` / invalid-submit navigation |
| `FORM_OWNERSHIP_COMPILE_BUDGET_MS`       | 50    | `content-form-ownership-compile-budget.test.ts`          |

## Repository enforcement scanner (dashboard + public auth)

Production `*.ts` / `*.tsx` under these roots are scanned for legacy validation bypasses (tests and `*.stories.*` excluded):

| Root                                        | Scope                                    |
| ------------------------------------------- | ---------------------------------------- |
| `apps/dashboard/src/features/content`       | Content hub create/edit/commit surfaces  |
| `apps/dashboard/src/features/campaign`      | Campaign create, settings, invite        |
| `apps/dashboard/src/features/character/npc` | NPC authoring (incl. deferred quick NPC) |
| `apps/public/src/features/auth`             | Login and signup                         |

Implementation: `form-validation-enforcement.lib.ts` + `form-validation-enforcement.test.ts`. Representative bypass fixtures must match every `FORM_VALIDATION_LEGACY_RULES` entry so new drift cannot slip past a single-pattern check.

**Allowlist policy:** only named deferrals with a removal milestone appear on `FORM_VALIDATION_ADOPTION_ALLOWLIST` (today: **quick NPC**). Do not add empty placeholders or silent “family” bundles—either the surface is adopted under the scanner, or it is explicitly allowlisted until cutover. All other production files in the roots above must stay clean.

**Exempt legacy islands** (intentional bridges until last caller migrates): listed in `FORM_VALIDATION_RULE_EXEMPT_FILES` and in [form-lib-conventions.md](../../../apps/dashboard/docs/form-lib-conventions.md#validation-ownership-guards).

**`useFormValidationPresentation` (dashboard vs `@rpg/ui`):** adopted dashboard production trees must not import this hook; content commit uses producer sessions and `applyCanonicalFormIssuesToRhf`. Inside `@rpg/ui/form`, `useFormValidationPresentation` remains the **session-projection façade** for field chrome, array rows, slots, and optional disclosures—it composes `useFormValidationSessionProjection` with touch/submit gates. That is unmigrated **internal** presentation wiring, not a dashboard adoption bypass. The optional export rename / narrowing called out in Phase 6 is non-blocking while this doc and the scanner scope stay aligned.

**`prepareFormIssues` / `flattenFormIssues` on adopted paths:** blocked in enforcement roots on production sources; `@rpg/ui/form` still exports them for invalid-submit navigation, tab badges, and grant **characterization** tests outside adopted submit shells. Grant coverage (`grant-field-validation.form.test.tsx`, `nested-grant-validation.integration.test.tsx`, and UI `nested-grant-field-validation.form.test.tsx`) uses `prepareFormIssues` only to assert routing shapes—no adopted content/campaign submit shell imports it on those paths (Phase 6 audit, 2026-11-28).

## Retired dashboard helpers

Do not reintroduce on adopted surfaces:

- `applyValidationIssuesToForm`
- `paintValidationIssuesOnForm` (use `applyCanonicalFormIssuesToRhf`)
- `surfaceContentDraftPublishValidation`
- `focusFormPath` (removed; invalid-submit navigation uses shared `@rpg/ui/form` helpers)

## Related tests

| Test / lib                                                                | Role                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `content-form-validation.test.ts`                                         | Catalog sweep / registration coverage                         |
| `form-validation-pilot-regression.test.ts`                                | Publish slots, operation failures, provenance                 |
| `content-form-submit-drift.test.ts`                                       | Content shell bypass drift                                    |
| `class-edit-features-pipeline.integration.test.tsx`                       | Class `classFormDef` + features master-detail at commit entry |
| `content-edit-shell-monster-failed-persist.integration.test.tsx`          | Monster edit shell + structured API paint                     |
| `form-validation-enforcement.test.ts`                                     | Repository filesystem guard                                   |
| `campaign-form-validation-adoption.test.ts`, `auth-form-adoption.test.ts` | Family drift                                                  |
| `content-publish-validation.lib.test.ts`                                  | Publish lib behavior + retired surface guard                  |

Historical plan narrative: `.cursor/plans/form_validation_ownership_architecture.plan.md` (archive only; this doc is authoritative for day-to-day work).
