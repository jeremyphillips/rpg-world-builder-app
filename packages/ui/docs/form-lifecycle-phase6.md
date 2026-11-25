# Form validation lifecycle — Phase 6 (family adoption)

Adopt registered content hub forms onto the Phase 4 pilot pipeline one slice at a time. Deferred workflows stay on `FORM_VALIDATION_ADOPTION_ALLOWLIST` until their milestone.

## Content hub — edit publish (first slice)

- `validateContentPublishValues` / `applyContentPublishValidation` evaluate with `tryEvaluateContentPublishFormIssues` and paint via `applyCanonicalFormIssuesToRhf`.
- `ContentEditPublishBridge` uses the same canonical RHF paint for API validation failures.
- Shared RHF helper: `content-form-validation-rhf.lib.ts` (breaks ingest ↔ publish import cycle).

## Still deferred

See `apps/dashboard/.../form-validation-adoption-allowlist.ts` (character builder/import, Quick NPC, monster statistics presentation hook, master-detail `useFormValidationPresentation`).
