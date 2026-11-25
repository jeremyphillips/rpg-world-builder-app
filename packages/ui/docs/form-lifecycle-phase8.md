# Form validation lifecycle — Phase 8 (legacy cleanup)

Phase 8 retires duplicate dashboard paint helpers and clears the adoption allowlist.

## Removed from `content-publish-validation.lib.ts`

- `applyValidationIssuesToForm`
- `paintValidationIssuesOnForm` (moved behind `applyCanonicalFormIssuesToRhf` in `content-form-validation-rhf.lib.ts`)
- `surfaceContentDraftPublishValidation` (unused; draft surfaces use `ContentDraftPublishValidationSurfaceBridge`)

## Allowlist

`FORM_VALIDATION_ADOPTION_ALLOWLIST` is empty. Quick NPC authoring uses `useAdoptedFormSubmit`.

## Remaining intentional islands (until content commit adapter migrates)

- `content-form-submit.ts` — wraps `useSubmitHandler` for the content commit pipeline
- `content-form-presentation-issues.client.ts` — thin wrapper over `useFormValidationPresentation`

Enforcement exempt list: `form-validation-enforcement.lib.ts`. Exit inventory: `form-validation-phase8-exit.test.ts`.

Regression baseline inventory: `form-validation-phase0-exit.test.ts`.
