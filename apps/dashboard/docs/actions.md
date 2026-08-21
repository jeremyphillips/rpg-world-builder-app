# Unified action validation

Shared lifecycle for single and bulk dashboard actions that need configure → validate →
resolve → submit → result flows. Domain policy stays in feature `lib/` modules; this folder
owns the shell, lifecycle controller, formatters, fan-out validate client, and toast policy.

## Ownership

| Concern                                         | Owner                                      |
| ----------------------------------------------- | ------------------------------------------ |
| Domain-neutral validation / plan / apply shapes | `@rpg/contracts` (`lib/action-validation`) |
| Domain blocker adapters                         | `@rpg/contracts` domain modules            |
| Capability flags                                | `@rpg/contracts` capability maps           |
| Authorization (`canManage`)                     | Existing campaign auth hooks               |
| Lifecycle + shell + formatters                  | `apps/dashboard/src/lib/actions/`          |
| Field builders, apply mutations, labels         | Feature `lib/`                             |

## Directory layout

Physical organization under `apps/dashboard/src/lib/actions/` — **external code imports from
`@/lib/actions` only**; subfolder paths are internal.

```text
actions/
  index.ts                    # sole public entry

  action-messages.*           # cross-cutting policy/copy (root)
  action-count-grammar.*
  action-toast-policy.*
  action-outcome-notify.*
  action-apply-summary.*

  dialog/                     # modal shell + close ordering
  resolution/                 # bulk resolve/result list + row chrome
  blocker/                    # single blocked + reference lists
  validation/                 # validate transport + strategies
  lifecycle/                  # phase machine hook + types
```

Root policy modules stay flat — they are genuinely cross-cutting seams, not a `policy/` bucket.

### Import guidance

```ts
import { useActionLifecycle, ActionDialogShell, postActionBatchValidate } from '@/lib/actions'
import type { ActionLifecycleCloseEvent, BulkActionDescriptor } from '@/lib/actions'
```

Deep imports are allowed only when the barrel causes a concrete problem:

| Reason           | Example                                                 |
| ---------------- | ------------------------------------------------------- |
| `vi.mock` target | `vi.mock('@/lib/actions/action-outcome-notify.lib', …)` |

### Module graph (verified acyclic)

Folder relationships (`dialog → resolution → blocker → dialog`) do not form a JavaScript import
cycle at the module level:

- `dialog/action-dialog-shell` → `resolution/action-target-resolution-list`
- `resolution/action-resolution-row-detail` → `blocker/action-blocker-references`
- `blocker/action-blocked-dialog` → `dialog/action-dialog-shell.lib` (constants only — not `shell.client`)

Resolution does not import dialog; the cycle breaks at `shell.lib`.

## Lifecycle

```text
Configure → Validating → Resolve (when blocked) → Submitting → Result (operational failures)
                ↘ Submitting (all eligible) ↗
```

- **Back** returns Resolve → Configure.
- **Cancel** always abandons/closes.
- Resolve checkboxes mean “apply this operation,” not table selection.

## Validation vs planning

- Validation statuses are `eligible | blocked` only.
- `unchanged` and `wouldChange` belong in plan/apply outcomes — never on validation results.
- Single-item validation is a one-element `ActionValidationResult`.

## Per-target atomicity

Compound campaign availability edits are all-or-nothing per target. If availability-off is
blocked for a row, that row receives none of the bulk mutation — including player-access /
visibility fields.

## Races vs operational failures

| Signal                     | Classification          | UI                                     |
| -------------------------- | ----------------------- | -------------------------------------- |
| PATCH `409` with blockers  | Expected race / blocker | Merge into Resolve — no error toast    |
| Network / unexpected `5xx` | Operational failure     | Result phase with structured `failure` |

Operational failures are never modeled as usage blockers.

## Mixed execution

N× PATCH is not transactional. Updated targets stay updated; failed targets remain retryable.
Closing after mixed outcomes uses toast policy — never imply full atomic success.

## Capability vs authorization

Menus and actions require **both**:

```text
capability && canManage
```

Capability answers whether a kind supports the operation. Authorization answers whether the
current user may manage the campaign. Do not collapse them.

| Domain                       | Capability SSOT                                |
| ---------------------------- | ---------------------------------------------- |
| Content bulk campaign access | `supportsContentBulkCampaignAccess()`          |
| Vocabulary bulk availability | `VOCABULARY_SET_CAPABILITIES.bulkAvailability` |
| NPC bulk roster status       | `supportsCharacterBulkRosterStatus('npc')`     |

## Toast policy

See [feedback.md](./feedback.md). Summary:

- Expected blockers and apply-time races while the modal is open → modal only.
- Operational failures while the modal is open → Result/local error only.
- Success / confirmed partial / accepted mixed → toast after close.
- Blocker-only closes (no updated, no failed) → no toast — already disclosed in Resolve.
- Cancel after partial apply → sync updated targets from selection only; no toast.

## Close ordering and idempotency

Bulk action dialogs use `finalizeActionDialogCloseWithOutcomes`:

1. **Sync** — remove updated target ids from table selection (and any cache hooks), regardless of close reason (including cancel after partial apply).
2. **Close** — `onOpenChange(false)`.
3. **Notify** — toast via `notifyActionOutcomes` when `shouldNotifyActionOutcomes` permits (microtask, same as legacy `finalizeActionDialogClose`).

A per-open `closedRef` guard prevents duplicate sync/toast if cancel or overlay close fires twice in one cycle. Reset the guard when the dialog opens.

Post-close summaries use `deriveActionApplySummary(outcomes)` — single `fullSuccess` interpretation shared by overview hooks and dialogs.

## Components

| Module                                     | Role                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `lifecycle/use-action-lifecycle`           | Phase machine, validate/apply orchestration                              |
| `dialog/action-dialog-shell`               | Layout for configure / resolve / result                                  |
| `resolution/action-target-resolution-list` | Bounded scroll region (`bg-surface-subtle`) for bulk resolve/result rows |
| `blocker/action-blocked-dialog`            | Single blocked projection — header + flat reference list only            |
| `blocker/action-blocker-references`        | Grouped summaries in bulk rows; flat bulleted links in single blocked    |
| `action-messages.ts`                       | Shared blocked/success/result copy                                       |
| `action-apply-summary.lib.ts`              | `deriveActionApplySummary` — shared post-apply ids + `fullSuccess`       |
| `action-outcome-notify.lib.ts`             | Post-close toast policy (`shouldNotifyActionOutcomes`)                   |
| `dialog/action-dialog-close.lib.ts`        | Close ordering + idempotency (`finalizeActionDialogCloseWithOutcomes`)   |
| `validation/action-validate-strategy.ts`   | Fan-out and batch validate strategies + lifecycle result resolution      |
| `validation/action-validate-batch.ts`      | Shared batch POST helper for validate transport                          |
| `validation/fan-out-validate.ts`           | Concurrency-5 fan-out harness (parity / explicit rollback only)          |

## Batch validate transport (Phase 2)

Bulk availability validate uses **one batch POST per validation pass** via
`createBatchValidateStrategy`. Fan-out GET remains available through
`createFanOutValidateStrategy` for parity tests and explicit rollback only — **not** as an
automatic fallback when batch POST fails.

### Wire contract

- **`ActionBatchValidationResult<TBlocker>`** — `{ validation: ActionValidationResult, failures[] }`.
  Blockers land in `validation`; per-target transport/eval failures land in `failures` with
  structured `{ code, message }` entries.
- Request body IDs must be **unique** (duplicate IDs → `400`).
- Response must contain **exactly one entry per requested ID in request order**.
- Correspondence violations are treated as malformed server responses — the whole batch fails
  validation; the dashboard does not partially apply batch results.
- `ACTION_VALIDATE_BATCH_TARGET_LIMIT` is **50** (matches overview selection cap).

### Validate-phase failure diagnostics

When `failures.length > 0`, feature `validateBulk*` helpers throw before returning to
`useActionLifecycle`. The lifecycle catches the error, sets `localError` to a newline-separated
list of **`targetName: message`** lines covering **every** failed target, and returns to
**Configure**. Blockers in `validation` still follow the normal **Resolve** path when no
transport failures are present.

### Performance note

Batch POST removes N HTTP round trips from the dashboard; server-side v1 still evaluates targets
with concurrency 5. Deeper resolver batching is optional follow-up when parity tests and latency
checks justify it.

## Related docs

- [feedback.md](./feedback.md) — toast ownership
- [availability.md](./availability.md) — UI-derived inactive chrome (out of scope here)
- [campaign-access README](../src/features/content/lib/campaign-access/README.md)
