# Form validation lifecycle — Phase 7 (repository guards)

Phase 6 per-family drift checks are promoted to a shared filesystem scanner used by Vitest.

## Scanner

- **Library:** `apps/dashboard/src/features/content/lib/forms/validation/form-validation-enforcement.lib.ts`
- **Guard:** `form-validation-enforcement.test.ts`
- **Exit inventory:** `form-validation-phase7-exit.test.ts`

## Roots

Production sources under:

- `apps/dashboard/src/features/content`
- `apps/dashboard/src/features/campaign`
- `apps/public/src/features/auth`

## Blocked patterns

`useSubmitHandler`, `applyValidationIssuesToForm`, `paintValidationIssuesOnForm`, `applyContentPublishValidation`, `prepareFormIssues`, and direct `useFormValidationPresentation` imports — unless the file is on the Phase 7 exempt list or under `FORM_VALIDATION_ADOPTION_ALLOWLIST`.

## Exempt legacy islands (Phase 8 removal)

- `content-form-submit.ts` — content hub outer adapter
- `content-publish-validation.lib.ts` — publish paint exports
- `content-form-presentation-issues.client.ts` — presentation wrapper
- `content-form-validation-rhf.lib.ts` — canonical RHF paint bridge
- `content-draft-publish-validation-surface.client.tsx` — draft global surface

Per-file drift tests (`content-form-submit-drift.test.ts`, `campaign-form-validation-adoption.test.ts`, `auth-form-adoption.test.ts`) remain as focused documentation alongside the scanner. Phase 8 clears the allowlist — see [form-lifecycle-phase8.md](./form-lifecycle-phase8.md).
