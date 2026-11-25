# Form validation lifecycle — Phase 6 (family adoption)

Adopt registered content hub forms onto the Phase 4 pilot pipeline one slice at a time. Deferred workflows stay on `FORM_VALIDATION_ADOPTION_ALLOWLIST` until their milestone.

## Content hub — edit publish (first slice)

- `validateContentPublishValues` / `applyContentPublishValidation` evaluate with `tryEvaluateContentPublishFormIssues` and paint via `applyCanonicalFormIssuesToRhf`.
- `ContentEditPublishBridge` uses the same canonical RHF paint for API validation failures.
- Shared RHF helper: `content-form-validation-rhf.lib.ts` (breaks ingest ↔ publish import cycle).

## Monster statistics tab

`MonsterStatisticsPanel` consumes `useContentFormPresentationIssues` — one presentation snapshot, no parallel `flattenFormIssues` merge.

## Content master–detail

- Row badges: `useMasterDetailRowValidation` → `useContentFormPresentationIssues(resolverFields)`.
- Inline title editor: `useFieldIssue(path)` (presentation-gated copy; no parallel RHF error merge).

## Campaign

- **Create wizard** — `WizardStepForm` steps with Zod schemas (evaluator-backed resolver); adoption drift in `campaign-form-validation-adoption.test.ts`.
- **Settings** — tabbed save still on `useSubmitHandler` (allowlist entry `campaign-settings-submit`).

## Public auth

Login and signup use schema-driven `Form` from `@rpg/ui/form`; drift in `apps/public/.../auth-form-adoption.test.ts`.

## Still deferred

See `form-validation-adoption-allowlist.ts` (character builder, import, Quick NPC, campaign settings submit).
