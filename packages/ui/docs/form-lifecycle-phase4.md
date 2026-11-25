# Form validation lifecycle — Phase 4 (pilot cutover — in progress)

Pilot budgets (Pre-implementation decisions):

- `FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS` (500) — `waitForInvalidSubmitTarget`
- `FORM_OWNERSHIP_COMPILE_BUDGET_MS` (50) — `content-form-ownership-compile-budget.test.ts` on class/monster tabs

## Create shell

`ContentCreateShell` publish uses `prepareSerializedContentFormWrite` in the commit pipeline so `persist` receives the wire payload without a second `serializeContentFormInput` pass. Draft save still serializes on the legacy `useSubmitHandler` path until the remaining pilot surfaces adopt the same pipeline.
