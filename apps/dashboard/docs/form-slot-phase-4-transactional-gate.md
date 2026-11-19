# Phase 4 — transactional interaction decision gate

**Status:** approved and closed. **Option A** — domain-owned controllers retained. No shared host shipped.  
**Prerequisite:** Phase 3b complete ([form-slot-register.md](./form-slot-register.md)).  
**Related plan:** [form_slot_migration_audit_d33aba67.plan.md](../../.cursor/plans/form_slot_migration_audit_d33aba67.plan.md) (Phase 4 / P5 change-interaction).

Phases 0–3 removed or reframed **read-only** and **declarative** slot uses (`display`, `valueSyncs`, `hint.resolve`, etc.). **Transactional** slots remain because they **intercept** a control’s normal write, run a **domain planner**, show **consequence copy**, and apply a **multi-path patch** only after confirmation. That behavior is outside `DisplayConfig`, `valueSyncs`, and standard leaf fields.

This document decides whether that confirmation needs **new** shared infrastructure. Two workflows that both open a dialog are not enough. Retaining a genuinely custom transactional slot is an acceptable outcome, and choosing Option A is not a failed migration.

---

## 1. What “transactional” means here

A slot is **transactional** when it does most of the following:

| Behavior                                                                                | Why `display` / `valueSyncs` are insufficient                           |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Intercepts a pending value change before RHF commits it                                 | Requires custom control wiring or slot `render()` with domain hooks     |
| Calls a **planner** in `@rpg/contracts` (or feature lib) with current + requested shape | Planners are not `contentWhen` resolvers                                |
| Shows **confirm / cancel** with **runtime consequence** copy                            | Copy depends on plan summary, not static data                           |
| Applies **multiple** `setValue` / field-array mutations as one author action            | `valueSyncs` are single-dependency reactions, not confirm-gated batches |
| May keep **pending state** across re-renders or nested editor chrome                    | Form-level chrome, not a stack field                                    |

**Non-goals for Phase 4:** replacing tab editors, master-detail shells, previews that failed the display PoC, hidden-registration slots, or partial display/configuration migrations still on the register. Those stay custom with their existing reasons. Phase 5 cleanup can proceed if Option A is chosen; the transactional count does not have to fall.

---

## 2. Inventory (Phase 4 gate consumers)

From the slot register and plan §A. These are **candidates for a shared pattern** only if the gate approves; today each is domain-owned.

### 2.1 Primary pilots (the only evidence for sharing)

| Identity                                                                                   | Feature                 | Role today                                                                                                       |
| ------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `formsShapeShifting` / true-form designation                                               | Monster `forms` section | `MonsterTrueFormDesignation` calls `requestDesignation`; `useMonsterFormsLifecycle` plans, confirms, and applies |
| `_resolutionChangeConfirm` + `_resolutionChangeNotice`                                     | Spell resolution        | Dialog plus post-commit notice over `useResolutionChangeConfirm`                                                 |
| `_resolutionSelectionModeSelect`, `_resolutionProximitySelect`, `_resolutionHowItResolves` | Spell resolution        | Controls call `requestResolutionChange` instead of writing directly when confirm is required                     |

Supporting references:

- Monster lifecycle: [`use-monster-forms-lifecycle.tsx`](../src/features/content/monsters/hooks/use-monster-forms-lifecycle.tsx), [`monster-forms-lifecycle-provider.tsx`](../src/features/content/monsters/hooks/monster-forms-lifecycle-provider.tsx), [`monster-true-form-designation.tsx`](../src/features/content/monsters/components/form/monster-true-form-designation.tsx).
- Resolution confirm: [`use-resolution-change-confirm.tsx`](../src/features/content/spells/resolution/hooks/use-resolution-change-confirm.tsx), [`resolution-change-confirm-dialog.tsx`](../src/features/content/spells/resolution/components/notices/resolution-change-confirm-dialog.tsx), slots in [`resolution-form-slots.ts`](../src/features/content/spells/resolution/lib/form/resolution-form-slots.ts).

Designation is the monster pilot. The same hook also serves defined-form removal and remove-all. Those stay out of any pilot unless the designation path cannot be touched without them.

### 2.2 Secondary transactional set (not evidence for Option B)

| Identity                                                        | Notes                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| Organization `startingPointId`, `_organizationEditFamiliarType` | Confirm before destructive org edits                    |
| Class `spellcastingFeatureAvailability`                         | Availability toggles with grant consequences            |
| Monster `castingAbility` (row variants)                         | Shared vs per-row casting; may touch nested action rows |
| Armor `armorClass.bodyArmor` / `armorClass.shield`              | Slot actions + replacement transactions, catalog-bound  |

Do not broaden to this set to justify a host the two pilots do not need. `ConfirmDialog` is already used widely outside these slots (master-detail delete, class features, equipment, and others). That reuse is the dialog primitive, not a transaction API.

### 2.3 Explicitly out of Phase 4 scope

- **Partial splits** still on the register (`formAvailability` mode radio, `forms.differencesPresentation`, armor preview, etc.) — product or display spikes, not transactional unify.
- **Defect D1** (`challengeRating` registry collision) — defect track; rename/fix independent of Phase 4.
- **Defect D2** (true-form stale write) — theoretical under the current modal; no speculative fix in this gate (see §7).

---

## 3. Side-by-side: monster true form vs spell resolution

### 3.1 Request shape

|                     | Monster true form / removal                                                     | Spell resolution                                                                               |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Trigger**         | `requestDesignation(trueForm)`, `requestDefinedFormRemoval`, `requestRemoveAll` | `requestResolutionChange(change: ResolutionChangeRequest)`                                     |
| **Request payload** | Designation object, form id, or implicit “remove all”                           | Discriminated requests: field changes, `removeEffect`, selection mode, proximity, method, etc. |
| **Intercept point** | Custom designation UI (not the raw radio value)                                 | Selects and effect remove call the controller before `setValue`                                |
| **Skip confirm**    | Designation with an empty consequence list writes immediately                   | `resolutionChangeRequiresConfirm(plan)` false writes immediately                               |

### 3.2 Planner and patch

|                    | Monster                                                                                                                                            | Resolution                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Planner**        | `planMonsterTrueFormDesignation`, `planMonsterDefinedFormRemoval`, `planMonsterFormsRemoval` (`@rpg/contracts`)                                    | `planResolutionChange`, `resolutionChangeRequiresConfirm`                                                           |
| **Plan output**    | `plan.next` object slice + human `summary` strings                                                                                                 | `requested`, `cleanup`, outcome patches, `effectsToRemove`, `incompatibleSelections`                                |
| **Apply**          | Six top-level `setValue`s (`forms`, `traits`, `actions`, `bonusActions`, `reactions`, `legendaryActions`) with `shouldDirty: true`, then `trigger` | Array mutator removals and `setValue` with `shouldDirty` and `shouldValidate: true`, plus selection-mode enrichment |
| **Post-commit UX** | Close dialog only                                                                                                                                  | `SpellResolutionChangeNotice` when incompatible selections or effects were removed                                  |

### 3.3 Pending / lifecycle state

|                     | Monster                                                                           | Resolution                                                                   |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **What is stored**  | Precomputed `next`, headline, description, confirm label, optional `afterConfirm` | The `ResolutionChangeRequest` only                                           |
| **Store**           | `useState` in `useMonsterFormsLifecycle`                                          | Module `WeakMap<Control, ResolutionChangeController>` plus an external store |
| **Cleanup**         | State drops when the provider unmounts                                            | No `controllers.delete`. The entry lives as long as that RHF `control` does  |
| **On confirm**      | Applies the stored `plan.next`                                                    | Re-reads values and runs `planResolutionChange(before, pending.change)`      |
| **Copy while open** | Frozen at request time                                                            | Recomputed every render from current `getValues()`                           |

**Conclusion:** both patterns share **confirm-gated multi-patch** author actions. They differ in **request algebra**, **what pending means**, **how long it lives**, and **how the patch is applied**. A generic `plan(before, request) → { description, apply() }` contract would either capture a stale `apply` or pull planners and patches into the shared layer. That shape is rejected (see §5).

---

## 4. Duplication inventory

`ConfirmDialog` ([`confirm-dialog.client.tsx`](../../../packages/ui/src/components/ui/confirm-dialog.client.tsx)) is a controlled Radix `AlertDialog`: `role="alertdialog"`, required title, optional description, focus handling, Escape cancels, outside click does not dismiss. Both pilots already render it. A new host that only forwards `open`, `headline`, `onConfirm`, and `onCancel` would wrap a primitive that already owns the shared accessibility and modal behavior.

| Responsibility                 | Monster owner                                                                      | Resolution owner                                                                  | Already shared?                          | Reuse justified?                                 |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Dialog rendering               | `ConfirmDialog` inside `useMonsterFormsLifecycle`                                  | `ResolutionChangeConfirmDialog` renders `ConfirmDialog`                           | Yes — the primitive                      | No new wrapper                                   |
| Dialog accessibility and focus | `ConfirmDialog` (`AlertDialog.Title` / `Description`, `handleDialogOpenAutoFocus`) | Same primitive. Body list is extra `children`, which the primitive already allows | Yes                                      | No                                               |
| Open / cancel wiring           | `open={pending !== null}`; `onOpenChange(false)` and `onCancel` clear state        | Same four props against the controller                                            | Pattern only (~10 lines each)            | No. The clear step is domain state               |
| Duplicate confirm prevention   | `if (!pending) return` at the start of apply                                       | Same guard                                                                        | Not a separate mechanism                 | No. The modal plus one pending slot is the guard |
| Consequence copy               | Built in `requestDesignation` and removal formatters                               | `formatChangePlanForDialog`                                                       | No                                       | Retain domain. Copy stays verbatim               |
| Pending intent                 | Provider `useState` of the planned snapshot and copy                               | Controller field `{ change }`                                                     | No                                       | Retain domain. Shapes differ                     |
| Confirmation visibility        | Derived from that state                                                            | `useSyncExternalStore` snapshot                                                   | Derived the same way, stored differently | No shared pending object                         |
| Fresh-value evaluation         | None. Confirm uses stored `next`                                                   | Dialog render and confirm both re-plan                                            | No                                       | Retain domain                                    |
| Re-planning policy             | Apply the open-time plan                                                           | Re-plan on accept                                                                 | No                                       | Retain domain (§8)                               |
| RHF writes                     | Six `setValue`s then `trigger`                                                     | `setValue` with `shouldValidate: true`                                            | No                                       | Retain domain                                    |
| Array mutations                | Whole-section replacement                                                          | `getArrayFieldMutators` index removals                                            | No                                       | Retain domain                                    |
| Post-commit notice             | None                                                                               | Notice on the same controller                                                     | No                                       | Retain domain                                    |
| Error handling                 | `trigger` on the six paths after writes                                            | `shouldValidate: true` on each write; incompatible clears feed the notice         | No                                       | Retain domain                                    |

What looks similar is the dialog chrome and the “set pending, clear on cancel” rhythm. What is actually duplicated in product code is the call into `ConfirmDialog`. That duplication is the intended use of the primitive.

Option B is justified only if it removes repeated **lifecycle** code, custom confirmation wiring, integration complexity, testing burden, or future authoring decisions. Those benefits are small here. Another abstraction would add a coordination layer beside two controllers that must keep their own planners, patches, and pending lifetimes.

---

## 5. Options

### Option A — Retain domain-owned controllers (recommended)

- Leave `useMonsterFormsLifecycle` and `useResolutionChangeConfirm` as they are.
- Transactional slots stay `kind: 'slot'` with documented reasons in [form-slot-register.md](./form-slot-register.md).
- Shared confirmation presentation stays `ConfirmDialog`. No new hook, provider, host, or controller.
- **Removes:** nothing further. The shared part already exists.
- **New API:** none.
- **Lifecycle risk:** none.
- **Why:** the two pending models and apply paths are not one responsibility. Keeping them local is the smaller mental model.

### Option B — Shared confirmation infrastructure, narrowed

Option B is **not** `plan(before, request) → { description, apply() }`. A returned `apply()` closes over form values, planner output, or field-array mutators from open time. Monster does that on purpose inside its own hook. Resolution deliberately does not. A shared closure would blur generic confirmation and feature transactions, and it can apply a stale plan.

**Domain controller keeps:**

- Pending request semantics
- Domain planners
- Current form-value access
- Re-planning policy
- Consequence generation
- Patch application
- Validation triggering
- Error handling
- Post-commit notices

**A shared layer, if one is ever approved, keeps only:**

- Dialog visibility
- Confirm and cancel interaction
- Accessible modal presentation
- Focus management
- Prevention of a second confirm
- Minimal pending UI state where that state is genuinely the same

It does not understand `MonsterFormValues`, `ResolutionChangeRequest`, `plan.next`, `effectsToRemove`, RHF array mutators, or domain patch structures. If meaningful reuse needs a generic patch DSL, that is evidence against Option B.

#### B1 — Shared presentation composition (not a new phase)

Reuse `ConfirmDialog` and, only if a real gap appears, a tiny wrapper for presentation that the primitive does not already cover.

There is no gap in the two pilots. Both pass headline, description, labels, and confirm/cancel through the existing props. Resolution uses `children` for the consequence list; monster puts the consequence in `description`. That is copy composition, not missing dialog behavior.

- **Removes:** nothing beyond today’s primitive.
- **New API:** none, unless a later gap is named.
- **Lifecycle risk:** low only while the wrapper stays presentational. Any wrapper that also stores `open` splits visibility from domain pending.
- **Decision:** treat B1 as **already satisfied**. Do not add a wrapper in Phase 4.

#### B2 — Shared confirmation coordinator (not approved)

A small reusable mechanism would own confirmation lifecycle and call feature callbacks for domain decisions. Pursue it only if B1 leaves meaningful duplication. B1 does not; the primitive already covers presentation.

A coordinator that does not own the transaction becomes a pass-through: `open`, `onConfirm`, `onCancel` already exist on `ConfirmDialog`. A coordinator that owns pending must pick a lifetime. The two domains do not share one (see §6). Either choice changes one of them or grows special-case branches.

- **Removes:** the short open/cancel wiring, at the cost of a new owner.
- **New API:** a coordinator plus feature callbacks. That is a second layer next to each controller.
- **Lifecycle risk:** high if pending moves; low only if the coordinator is a pass-through, which fails the “simpler than two implementations” test.
- **Decision:** **reject** with current evidence.

### Option C — Generic `FieldChangeGuard` / patch DSL (not recommended)

Retain as a documented alternative. Do not advance it.

The current request shapes and patch semantics do not support one clean mutation contract. Resolution needs array-index removal, outcome hydration, and incompatible-selection clears. Monster replaces several top-level sections from `plan.next`. Forcing one patch format puts domain planners at risk and tends toward a second form runtime.

- **Removes:** potentially some slots, by making Form responsible for monster and spell mutations.
- **New API:** large.
- **Lifecycle risk:** high. Re-plan vs frozen `next`, and the two pending stores, would be normalized.
- **Decision:** **defer**.

### Decision matrix

| Criterion                          | Option A                | Option B                                                               | Option C                       |
| ---------------------------------- | ----------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| New shared API                     | None                    | Small, and only if B2 were justified. B1 needs none                    | Large                          |
| Domain planners remain independent | Yes                     | Required. The rejected `apply()` contract violates this                | At risk                        |
| Domain patch logic stays local     | Yes                     | Required                                                               | At risk                        |
| Existing lifecycle preserved       | Yes                     | Must be demonstrated. Not demonstrated for a shared pending store      | High risk                      |
| Slots removed                      | Not required            | Not required                                                           | Potentially, by expanding Form |
| Reuse benefit                      | `ConfirmDialog` already | Must be demonstrated. Not demonstrated past the primitive              | Unproven                       |
| Implementation risk                | Lowest                  | Low only if narrowly scoped. Current scope has nothing left to extract | High                           |

### Approval threshold for Option B

Recommend B2 only if all of the following are true:

1. A specific repeated responsibility is identified, not merely two confirmations.
2. `ConfirmDialog` does not already provide it.
3. The abstraction has a small, stable contract that never applies a domain transaction.
4. Neither domain adapts its transaction model to use it.
5. Existing pending-state semantics stay intact, including the differences in §6.
6. At least two substantially different consumers use it with no special-case branches.
7. The result is simpler in ownership and lifecycle, not only shorter.

Lines of code are not the deciding metric. The current pilots fail 1, 2, 5, and 7. Failure of any one is enough to keep Option A.

---

## 6. Pending-state ownership and lifetime

The lifetimes differ on purpose. Do not normalize them. Unmount cancellation is not a universal invariant. It depends on which owner unmounts and whether the form instance is still active.

### Where state actually lives

**Monster.** `MonsterFormsLifecycleProvider` calls the hook and renders `{dialog}` next to its children. The provider is the `formsShapeShifting` slot body ([`monster-forms-shape-shifting-section.tsx`](../src/features/content/monsters/components/form/monster-forms-shape-shifting-section.tsx)). That slot has no `visibility` predicate. It sits in the shape-shifting group, which uses inline disclosure. Inactive tab panels stay mounted and are CSS-hidden ([`tabbed-form-panels.client.tsx`](../../../packages/ui/src/form/shells/tabbed-form-panels.client.tsx)). Collapsed inline disclosure keeps children mounted (`forceMount`, `hidden={!open}`). Pending therefore survives a tab change and a collapsed section **if it were still set**. The modal blocks those interactions while the dialog is open, so the practical clear points are confirm, cancel, and unmount of the provider (leaving the editor, or replacing the form tree).

**Resolution.** `useResolutionChangeController` stores one controller per `form.control` in a module `WeakMap`. The dialog slot `_resolutionChangeConfirm` unmounts when `visibleWhenResolutionConfigured()` is false (`ConditionalSlotFormItemSection` returns null). Pending is not in that component, so a dialog remount reads the same snapshot and can show the dialog again. `getForm()` is invoked at request and confirm time; pending does not store a plan. There is no dispose function. Collection follows the RHF `control`.

Resolution’s remount persistence matches the editor: several controls share one controller, and the dialog is a visibility-gated slot that would otherwise drop the request when it unmounts. Monster’s provider-local state matches a section-scoped transaction whose dialog is not visibility-gated. Both are intentional. Moving either into the other’s store would change observable behavior:

- A form-scoped store for monster would keep a designation pending after the provider unmounted, if the form remained.
- Component state for resolution would cancel a pending request when the configured-field slot unmounted, including a visibility flicker, and would not share one pending slot across the selection controls.

A shared host cannot retain pending without choosing one of those lifetimes. It also cannot retain a form reference “for later apply” without the stale-closure problem Option B rejects. Resolution avoids that by storing the request and reading the live form on confirm. Monster avoids a live read by storing `next` and accepting the modal constraint (D2).

### Lifetime matrix

| Event                                                                       | Monster pending                                                                                    | Resolution pending                                                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Individual control unmount (the select or designation widget)               | **Remains** while the provider is mounted. The dialog is not owned by the control                  | **Remains.** The request is not stored on the control component                                 |
| Form section unmount (shape-shifting slot, or resolution configured fields) | **Cancelled.** The provider is that slot                                                           | **Remains** for the same `control`. The dialog unmounts; the snapshot does not                  |
| Dialog host unmount alone                                                   | Same as the provider. Dialog and state are one hook                                                | **Remains**, then the dialog can reopen from the snapshot                                       |
| Form `reset` (save baseline in the edit shell)                              | **Not cleared.** A confirm would still apply the stored `next`. Footer reset is modal-blocked (D2) | **Not cleared.** Confirm re-plans from current values, so the reset values are what get planned |
| Form instance replacement (new `useForm` / new `control`)                   | **Cancelled** with the old tree                                                                    | **Cancelled.** New `control`, new map entry. The old entry is collectable                       |
| Route navigation / whole editor unmount                                     | **Cancelled**                                                                                      | **Cancelled** when `control` is collected                                                       |
| Confirm                                                                     | Apply stored `next`, then clear                                                                    | Re-plan, apply, maybe set a notice, then clear                                                  |
| Cancel or `onOpenChange(false)`                                             | Clear. No writes                                                                                   | Clear. No writes                                                                                |

**Should pending remain, cancel, recompute, or be rejected as stale?**

- Monster: remain for the provider’s life; cancel on provider unmount; do not recompute; do not add a stale-token check in this gate.
- Resolution: remain for the form control’s life, including dialog remount; cancel when that control is gone; recompute the plan at confirm; if current values cannot be read, drop pending and do not write.

Because those policies are incompatible, pending stays in the domain controllers. A shared presentation component can still be appropriate, and it already is: `ConfirmDialog` does not store the request.

---

## 7. Re-planning stays domain-owned

- Monster confirm applies the precomputed `plan.next`.
- Resolution confirm plans again from current values. The open dialog also rebuilds its copy from a fresh plan on each render.

The shared confirmation layer must not decide whether to re-plan, whether to reject a stale result, whether to show another confirmation, whether the original request is still valid, or which values to apply.

**True-form staleness (D2).** Stale writes are theoretical under the current modal: `ConfirmDialog` blocks outside pointer and keyboard input, and save/discard live in the edit footer. No repro. Pending drops if the provider unmounts. Leave the code unchanged.

Modal blocking does not, by itself, prove that form values can never change. `form.reset` after save, `resetField`, value syncs, or any programmatic write could still change `forms` or the action sections while `next` is stored. Those paths are not available through the blocked footer today. Do not add a speculative re-plan or token check to make a shared host feel safe. If a later proposal changes pending lifetime, reassess staleness before approving it. A confirmed correctness defect is a separate change in the monster hook, with a failing test first, not part of this abstraction.

---

## 8. Atomicity

“Mostly yes” is too coarse. One confirmation handler is not a formal transaction.

**User-perceived atomicity.** The author confirms once and sees the dialog close onto the planned result. Cancel writes nothing. That holds for both pilots.

**Internal atomicity.** Subscribers, validation, and field-array controllers can observe intermediate states. The implementations do not claim otherwise.

Monster confirm (`confirmRemoveAll`, and the no-dialog designation path) issues six sequential `setValue` calls, then `pending.afterConfirm?.()`, then `trigger` on the six paths. `shouldValidate` is left default (not validated per write). Validation is deferred to the final `trigger`. React batches the React state update that clears `pending`. RHF `setValue` still notifies its own subscribers per call. Nothing wraps the six writes in a single form transaction.

Resolution `applyPatch` / `applyEffectsPatch` may `remove` field-array indexes from the end, then `setValue` outcomes, then `setValue` the whole `resolution` object. Each of those uses `shouldValidate: true`, so validation can run before the handler finishes. Effect removal and the whole-object write are separate publishes. The post-commit notice is set after `applyPatch` returns, in the same synchronous confirm function.

Option B must preserve this behavior and must not describe it as a stronger guarantee. Do not build a transaction manager as part of a confirmation pilot. If internal atomicity becomes its own concern, track it separately from Phase 4.

---

## 9. Pilots (only if a later approval reverses this recommendation)

Do not start these while the recommendation is Option A. If Option B is explicitly approved later, the work is two reversible steps. Stop and revert to Option A when an extraction adds more coordination than it removes.

Record the current behavior **before** editing, and do not refactor planners, array mutations, or unrelated field configuration.

### Pilot 1 — Spell resolution selection-mode confirmation

Record, then extract only the approved shared responsibility:

- Request lifecycle (`requestResolutionChange` → confirm or immediate apply)
- Dialog copy from `formatChangePlanForDialog` (verbatim)
- Pending ownership on the `WeakMap` controller
- Re-plan on confirm and on dialog render
- Patch application, including array removals and `shouldValidate`
- Post-commit notice
- Cancel with no writes

**Checkpoint.** What was actually extracted? What feature wiring remains? Did readability improve? Were adapters required? Did lifetime change? Does monster designation still fit the same contract with no resolution-specific branch? If the answers are “a pass-through” or “lifetime changed,” revert.

### Pilot 2 — Monster true-form designation only

Same infrastructure, designation confirmation only. Do not migrate defined-form removal, remove-all, the shape-shifting editor, or other monster transactional controls unless the designation path cannot compile without a mechanical move. Those flows may keep using the existing hook.

**Checkpoint.** No monster-specific branch inside the shared host. Consequence copy unchanged. If the host needs a branch, the abstraction is at the wrong level; revert.

### Package ownership (decide only after the contract exists)

Do not pick a package until the extracted responsibility is real.

- Generic confirmation presentation: extend `ConfirmDialog` in `@rpg/ui` if the primitive is missing something. It is not, for these pilots.
- Coordination of RHF form state or authoring requests: evaluate the Form package boundary only if the contract is actually about form state. Do not add a `@rpg/ui/form` API because the callers happen to sit in slots.
- Dashboard-only authoring context: keep it in the dashboard at first.
- Do not introduce a hook, a provider, a host, and a controller as separate layers unless each has a demonstrated job. The resolution stack (controller, external store, dialog slot, notice slot) is already as many layers as that feature needs.

---

## 10. Verification, if a pilot is later approved

Do not require the same scenarios on both transactions. There is no monster “incompatible selection” path, and resolution has no designation snapshot.

**Shared behavior** (already covered by `ConfirmDialog` plus each feature’s cancel/confirm tests; extend only where the pilot changes code):

- Open confirmation
- Cancel without writes
- Confirm once
- A second confirm does not double-apply
- Focus and keyboard behavior, including Escape
- Accessible name and description
- Error or validation behavior the feature already has
- Pending cleared on the lifecycle that feature already uses (§6), not a new universal unmount rule

**Resolution-specific:**

- Fresh-value re-plan
- Array-aware removals
- Incompatible-selection handling and the post-commit notice
- `shouldValidate` behavior
- Dialog remount while the same `control` still holds pending

**Monster-specific:**

- Designation request, including the immediate write when there is no consequence
- Consequence list verbatim
- Stored `next` applied as the six section writes
- Validation via `trigger`
- Cancel
- Provider unmount drops pending and does not write

---

## 11. What Phase 4 will not do without a new decision

- Fold transactional flows into `kind: 'display'` or `valueSyncs`.
- Add a shared host, transaction API, or Form field capability under this gate.
- Migrate previews or whole-form watchers under a “declarative dependency” fiction.
- Replace master-detail or tab slots.
- Treat Option A as a failed migration, or block Phase 5 cleanup on a shared host.
- Fix D1 or D2 inside an abstraction PR.
- Run `gate:pre-push` or a broad refactor as part of the investigation.

---

## 12. Decision

| Choice                                | Duplication removed                                                                       | New API                                                                                | Lifecycle risk                                                       | Verdict                                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **A. Retain domain controllers**      | None further. `ConfirmDialog` already shares presentation, focus, and modal behavior      | None                                                                                   | None                                                                 | **Choose.** Pending, re-plan, and patches are different responsibilities that only look alike at the dialog |
| **B1. Presentation only**             | None beyond the primitive. A wrapper would restate `ConfirmDialog` props                  | None if we stop at the primitive. A wrapper is a new component with no second behavior | Low only while it stores nothing                                     | **Already true.** Do not implement a wrapper                                                                |
| **B2. Confirmation coordinator**      | The short open/cancel wiring, if pending stayed put. That wiring is not worth a new owner | Coordinator plus callbacks                                                             | High if pending is unified. A pass-through fails the simplicity test | **Reject** until the approval threshold in §5 is met                                                        |
| **C. Field-change guard / patch DSL** | Possibly some slots, by teaching Form each mutation                                       | Large patch contract                                                                   | High. Would normalize re-plan vs frozen `next`                       | **Defer**                                                                                                   |

**Approve Option A.** Do not implement a shared host, a transaction API, or new Form field capabilities unless a later review shows a repeated responsibility that `ConfirmDialog` does not already cover and that both domains can use without changing pending lifetime or patch application.

---

## 13. Approval checklist

- [x] Recommendation recorded: **A**. B1 is the existing `ConfirmDialog`. B2 and C are not approved.
- [x] Human sign-off on A. B2 was not requested.
- [x] B2 pilots were not started.
- [x] True-form and resolution consequence copy unchanged.
- [x] Register records these slots as retained under Option A.
- [x] D1 and D2 remain on the defect track. No code change in either hook.

---

## 14. After Phase 4

**Phase 5** (cleanup) can proceed with Option A: dead slot components, identity-based ratchet, final register metrics, unsupported patterns. Transactional count unchanged. Document that a custom transactional slot is a supported outcome, not an exception waiting for a host.

If a future decision ships B2, record the actual contract and its package in dashboard or `@rpg/ui` docs, and add a pr-review item for new confirm-gated flows. Do not add that item for Option A; `ConfirmDialog` plus a domain controller is the pattern.
