# Form validation lifecycle — Phase 6 (family adoption — complete)

Initial adoption families are listed in `form-validation-adopted-families.ts`. Exit inventory: `form-validation-phase6-exit.test.ts`.

## Adopted patterns

| Family                         | Submit / resolver                                    | API failure paint                                          |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| Content hub (`ContentFormDef`) | `useContentFormSubmit` + commit pipeline             | `applyApiErrorValidationToCanonicalRhf` via persist bridge |
| Content duplicate dialog       | `useAdoptedFormSubmit`                               | same                                                       |
| Campaign create                | `WizardStepForm` + `makeResolver`                    | wizard `formError` (operation)                             |
| Campaign settings              | `useAdoptedFormSubmit`                               | canonical RHF or footer                                    |
| Public auth                    | `Form` + schema                                      | `formError` (operation)                                    |
| Master–detail / statistics     | `useContentFormPresentationIssues` / `useFieldIssue` | presentation session                                       |

## Shared helpers

- `content-form-validation-rhf.lib.ts` — canonical RHF paint for `FormIssue[]`
- `ingest-content-form-validation.lib.ts` — producer slots + `applyApiErrorValidationToCanonicalRhf`
- `useAdoptedFormSubmit` (`apps/dashboard/src/lib/form-validation-adoption.lib.ts`) — tabbed/flat adopted saves outside the content commit pipeline

## Deferred (until allowlist milestones)

`FORM_VALIDATION_ADOPTION_ALLOWLIST`: character builder, character import, Quick NPC (`removesIn: phase-7-*`). Repository-wide enforcement: [form-lifecycle-phase7.md](./form-lifecycle-phase7.md).
