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

## Follow-up integrations

Remaining `TODO(toast)` sites:

1. [`content-create-shell.tsx`](../src/features/content/lib/forms/shells/content-create-shell.tsx) — create success before navigate
2. [`duplicate-content-dialog.client.tsx`](../src/features/content/lib/duplication/duplicate-content-dialog.client.tsx) — draft copy created
3. [`use-bulk-update-campaign-access.ts`](../src/features/content/lib/campaign-access/bulk/use-bulk-update-campaign-access.ts) — bulk result toast
4. [`content-edit-shell.tsx`](../src/features/content/lib/forms/shells/content-edit-shell.tsx) — save toast; remove inline `"Changes saved."` from [`content-form-footer.lib.ts`](../src/features/content/lib/forms/shells/content-form-footer.lib.ts)
5. Destructive retry elsewhere (stable ID + `{ label: 'Retry', onClick }`) — not delete flow; delete errors stay in the dialog

**Deferred infrastructure:** extract `--topbar-height` once dashboard offset classes are
validated; tab-inactive pause only if Radix gap is confirmed.
