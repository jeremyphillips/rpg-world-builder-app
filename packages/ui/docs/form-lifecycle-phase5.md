# Form validation lifecycle — Phase 5 (shared primitives)

Closed refinement after the Phase 4 pilot. No ownership, reconciliation, or RHF strategy changes.

## Promoted `@rpg/ui/form` export

- **`evaluateRoutedFormSchema`** — `evaluateFormSchema` plus `routeFormIssues` in one pure result (`valid` | `invalid` | `operation-failure`).

Dashboard `normalizeContentFormIssues` maps `operation-failure` to `ContentFormValidationOperationFailure`; routed invalid lists stay on the shared primitive.

## Pilot deduplication (dashboard)

| Helper                                    | Role                                                   |
| ----------------------------------------- | ------------------------------------------------------ |
| `formIssuesToPathMessages`                | Canonical `FormIssue[]` → RHF paint payload            |
| `createContentPublishRoutingFailedIssues` | Single cross-row routing-failure issue                 |
| `tryEvaluateContentPublishFormIssues`     | Shared try/catch for publish bridges and draft surface |

## Budgets

Unchanged: `FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS` (500), `FORM_OWNERSHIP_COMPILE_BUDGET_MS` (50).
