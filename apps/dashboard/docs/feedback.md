# Toast feedback

Ephemeral success and failure acknowledgments use the shared toast stack mounted in
[`AppProviders`](../src/app/providers.tsx). Domain-facing helpers live in
[`lib/notify.ts`](../src/lib/notify.ts); generic imperative calls import `toast` from
`@rpg/ui` directly.

## Layering

Dashboard toasts render in a **body-level portal** at the shared **`z-toast` layer** (`45` —
above sticky page chrome at `20`, below menus/popovers/dialogs at `50`). `fixed` positioning
and `z-toast` apply to the Radix viewport `ol` via `@rpg/ui` `ToastViewport`.

On desktop, the viewport anchors top-right below the topbar (`top: calc(3rem + 1rem)`). The
**portal shell** (not Radix's Branch wrapper) carries `fixed` + `z-toast`. Toasts may overlap
breadcrumbs or page-header actions — that is acceptable overlap, not a layering bug.

## When to use toast vs inline feedback

**Toast:** completed background actions, navigate-away success, copy-to-clipboard,
reversible undo actions.

**Inline:** form validation, blocking load failures, permission failures, dialog-owned
errors (e.g. delete confirmation), and sustained builder warnings.

## Domain helpers

| Helper                                | Use                                                               |
| ------------------------------------- | ----------------------------------------------------------------- |
| `notifyContentDeleted`                | Delete success after navigate to overview                         |
| `notifyContentCreated`                | Create success after navigate to edit                             |
| `notifyDuplicateContentCreated`       | Duplicate dialog success                                          |
| `notifySaveSuccess`                   | Form PATCH success when body surface saved in coordinated session |
| `notifyPublishSuccess`                | Draft publish success from lifecycle actions                      |
| `notifyCoordinatedContentSaveSuccess` | Edit save session — one toast from `onSaved` callback             |
| `notifyCampaignAccessUpdated`         | Overview row availability toggle                                  |
| `notifyCampaignAccessUpdateFailed`    | Row toggle network failure with Retry                             |
| `notifyBulkCampaignAccessResult`      | Bulk availability modal apply result                              |

## Action validation modals

Unified single/bulk actions use [`lib/actions/`](../src/lib/actions/) for lifecycle-owned
feedback. See [actions.md](./actions.md).

| Condition                                                | Ownership                                               |
| -------------------------------------------------------- | ------------------------------------------------------- |
| Expected blockers while action modal open (Resolve)      | Modal only — **no** error toast                         |
| Apply-time 409 races                                     | Modal Resolve — **no** error toast                      |
| Operational failures while modal open                    | Result/local error — **no** duplicate toast             |
| Success / confirmed partial / accepted mixed after close | Toast via domain helpers + `action-messages` formatters |
| Out-of-band failure (origin UI gone)                     | Toast OK                                                |

Use `shouldSuppressActionErrorToast()` and `shouldEmitActionResultToast()` from
[`action-toast-policy.ts`](../src/lib/actions/action-toast-policy.ts) when wiring new actions.

Do not re-export `toast` from `notify.ts`.

## Destructive retry pattern

For mutation failures **outside** dialog-owned recovery (where inline `formError` already
owns the UX), emit a destructive toast with a stable ID and optional Retry action:

```ts
toast({
  id: `campaign-access:${entityId}`,
  title: 'Could not make available.',
  description: getErrorMessage(err, fallback),
  tone: 'destructive',
  action: { label: 'Retry', onClick: retry },
})
```

**Wired:** overview row campaign availability toggle
([`use-content-campaign-availability-toggle.client.ts`](../src/features/content/lib/overview/hooks/use-content-campaign-availability-toggle.client.ts)).

**Not toast:** delete confirm errors (dialog owns recovery), edit-save `formError` (inline header).

## Deferred infrastructure

- Extract `--topbar-height` once dashboard offset classes are validated
- Tab-inactive pause only if Radix gap is confirmed
- Broader catalog (clipboard, invites, undo) — per feature when touched
