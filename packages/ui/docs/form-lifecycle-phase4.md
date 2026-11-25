# Form validation lifecycle — Phase 4 (pilot cutover — complete)

Pilot budgets (Pre-implementation decisions):

- `FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS` (500) — `waitForInvalidSubmitTarget`
- `FORM_OWNERSHIP_COMPILE_BUDGET_MS` (50) — `content-form-ownership-compile-budget.test.ts` on class/monster tabs

## Create shell

- **Create shell:** publish and draft saves both use `prepareSerializedContentFormWrite` + `useContentFormSubmit`.
- **Edit shell:** save uses the same commit pipeline and `persistContentEditUpdate` (overlay + media stale handling unchanged).
- **Invalid submit:** tab/view activation uses `usePilotRevealBudget` on `navigateInvalidSubmit` (500ms poll via `waitForInvalidSubmitTarget`).
- **Publish preview bridges:** `useContentPublishValidation`, `ContentFormPublishValidationBridge`, and create publish bridge all call `evaluateContentPublishFormIssues` (no parallel `prepareFormIssues` / `safeParseWithFieldErrors` on those surfaces).
- **Regression:** `form-validation-pilot-regression.test.ts`, `content-form-submit-drift.test.ts`, and API rejection coverage in `content-form-submit.test.tsx`.
