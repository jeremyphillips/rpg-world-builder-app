# Phase 4 — transactional interaction decision gate

**Status:** investigation presented; **no implementation** until explicitly approved.  
**Prerequisite:** Phase 3b complete ([form-slot-register.md](./form-slot-register.md)).  
**Related plan:** [form_slot_migration_audit_d33aba67.plan.md](../../.cursor/plans/form_slot_migration_audit_d33aba67.plan.md) (Phase 4 / P5 change-interaction).

Phases 0–3 removed or reframed **read-only** and **declarative** slot uses (`display`, `valueSyncs`, `hint.resolve`, etc.). **Transactional** slots remain because they **intercept** a control’s normal write, run a **domain planner**, show **consequence copy**, and apply a **multi-path patch** only after confirmation. That behavior is outside `DisplayConfig`, `valueSyncs`, and standard leaf fields.

This document is the **Phase 4 deliverable**: compare the two mature patterns in the repo, list gated consumers, pose the approval questions, and recommend a **minimal pilot** if you choose to build a shared abstraction.

---

## 1. What “transactional” means here

A slot is **transactional** when it does most of the following:

| Behavior                                                                                         | Why `display` / `valueSyncs` are insufficient                           |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Intercepts a pending value change before RHF commits it                                          | Requires custom control wiring or slot `render()` with domain hooks     |
| Calls a **planner** in `@rpg/contracts` (or feature lib) with current + requested shape          | Planners are not `contentWhen` resolvers                                |
| Shows **confirm / cancel** with **runtime consequence** copy                                     | Copy depends on plan summary, not static data                           |
| Applies **multiple** `setValue` / field-array mutations atomically from the author’s perspective | `valueSyncs` are single-dependency reactions, not confirm-gated batches |
| May keep **pending state** across re-renders or nested editor chrome                             | Form-level chrome, not a stack field                                    |

**Non-goals for Phase 4:** replacing tab editors, master-detail shells, previews that failed the display PoC, or hidden-registration slots. Those stay on the register with existing reasons.

---

## 2. Inventory (Phase 4 gate consumers)

From the slot register and plan §A. These are **candidates for a shared pattern** only if the gate approves; today each is domain-owned.

### 2.1 Primary pilots (recommended if anything ships)

| Identity                                                                                   | Feature             | Role today                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `formsShapeShifting` / true-form designation                                               | Monster `forms` tab | `MonsterTrueFormDesignation` + `useMonsterFormsLifecycle` — radio/select propose `trueForm`; planner applies `plan.next` on confirm |
| `_resolutionChangeConfirm` + `_resolutionChangeNotice`                                     | Spell resolution    | `useResolutionChangeConfirm` — `requestResolutionChange`; dialog + post-commit notice                                               |
| `_resolutionSelectionModeSelect`, `_resolutionProximitySelect`, `_resolutionHowItResolves` | Spell resolution    | Controls call `requestResolutionChange` instead of writing directly when confirm is required                                        |

Supporting references:

- Monster lifecycle: [`use-monster-forms-lifecycle.tsx`](../src/features/content/monsters/hooks/use-monster-forms-lifecycle.tsx), [`monster-true-form-designation.tsx`](../src/features/content/monsters/components/form/monster-true-form-designation.tsx).
- Resolution confirm: [`use-resolution-change-confirm.tsx`](../src/features/content/spells/resolution/hooks/use-resolution-change-confirm.tsx), slots in [`resolution-form-slots.ts`](../src/features/content/spells/resolution/lib/form/resolution-form-slots.ts).

### 2.2 Secondary transactional set (broaden only after pilot parity)

| Identity                                                        | Notes                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| Organization `startingPointId`, `_organizationEditFamiliarType` | Confirm before destructive org edits                    |
| Class `spellcastingFeatureAvailability`                         | Availability toggles with grant consequences            |
| Monster `castingAbility` (row variants)                         | Shared vs per-row casting; may touch nested action rows |
| Armor `armorClass.bodyArmor` / `armorClass.shield`              | Slot actions + replacement transactions, catalog-bound  |

### 2.3 Explicitly out of Phase 4 scope

- **Partial splits** still on the register (`formAvailability` mode radio, `forms.differencesPresentation`, armor preview, etc.) — product or display spikes, not transactional unify.
- **Defect D1** (`challengeRating` registry collision) — defect track; rename/fix independent of Phase 4.
- **Defect D2** (true-form stale write) — investigated; **theoretical** under modal `ConfirmDialog` (see §5).

---

## 3. Side-by-side: monster true form vs spell resolution

### 3.1 Request shape

|                     | Monster true form / removal                                                     | Spell resolution                                                                               |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Trigger**         | `requestDesignation(trueForm)`, `requestDefinedFormRemoval`, `requestRemoveAll` | `requestResolutionChange(change: ResolutionChangeRequest)`                                     |
| **Request payload** | Designation object, form id, or implicit “remove all”                           | Discriminated requests: field changes, `removeEffect`, selection mode, proximity, method, etc. |
| **Intercept point** | Custom designation UI (not the raw radio value)                                 | Selects and effect remove call context API before `setValue`                                   |

### 3.2 Planner and patch

|                    | Monster                                                                                                         | Resolution                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Planner**        | `planMonsterTrueFormDesignation`, `planMonsterDefinedFormRemoval`, `planMonsterFormsRemoval` (`@rpg/contracts`) | `planResolutionChange`, `resolutionChangeRequiresConfirm`                            |
| **Plan output**    | `plan.next` object slice + human `summary` strings                                                              | `requested`, `cleanup`, outcome patches, `effectsToRemove`, `incompatibleSelections` |
| **Apply**          | Several top-level `setValue`s on `forms`, traits, action sections; `trigger`                                    | Array mutator removals, whole-object `setValue`, often `shouldValidate: true`        |
| **Post-commit UX** | Close dialog only                                                                                               | `SpellResolutionChangeNotice` (transient status)                                     |

### 3.3 Pending / lifecycle state

|                        | Monster                                                                   | Resolution                                                                     |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Store**              | `useState` in `useMonsterFormsLifecycle` (`pending` + precomputed `next`) | Per-form `WeakMap` controller + external store in `useResolutionChangeConfirm` |
| **Survives remount**   | No — pending cleared when provider unmounts                               | Yes — keyed by form identity                                                   |
| **Re-plan on confirm** | Uses snapshot `plan.next` from open time                                  | Re-runs `planResolutionChange(before, pending.change)` at confirm              |

### 3.4 Form integration

|                 | Monster                                                                              | Resolution                                                                                  |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Mount point** | `MonsterFormsLifecycleProvider` + `formsShapeShifting` slot                          | Hidden slots `_resolutionChangeConfirm`, `_resolutionChangeNotice` in resolution field tree |
| **Copy**        | `formatMonsterDefinedFormRemovalSummary`, assembled consequence list for designation | Plan-driven strings + incompatible selection messaging                                      |

**Conclusion:** both patterns share **confirm-gated multi-patch** semantics but differ in **request algebra**, **state durability**, and **apply mechanics**. A single generic “mutation API” would either be too weak for resolution or too powerful for monsters.

---

## 4. Options at the gate (no code yet)

### Option A — **Keep domain-owned controllers** (default recommendation)

- Leave `useMonsterFormsLifecycle` and `useResolutionChangeConfirm` as-is.
- Transactional slots stay `kind: 'slot'` with documented reasons in [form-slot-register.md](./form-slot-register.md).
- **Pros:** Lowest risk; planners stay in contracts; no new `@rpg/ui/form` surface.
- **Cons:** Duplicated confirm/dialog wiring; two mental models for authors.

### Option B — **Shared confirm host only** (minimal extraction)

- Add a thin **dashboard or `@rpg/ui` hook** that owns: open/close modal, pending token, cancel on unmount, optional re-plan callback — **not** planners or patch format.
- Each feature still supplies: `plan(before, request) → { description, apply() }`.
- Slots shrink to “mount dialog host + wire control deferral.”
- **Pros:** One a11y/dialog pattern; easier testing of cancel/unmount.
- **Cons:** Does not remove slots; still two planner types.

### Option C — **Unified `FieldChangeGuard` / form patch DSL** (only if gate answers are favorable)

- Illustrative only in the plan; **not** designed in Phase 0–3.
- Would need a patch format that covers resolution array removals **and** monster multi-section `next` slices.
- **Risk:** High — tends toward a second form runtime. Prefer **Option B** over Option C unless gate Q9–Q10 are clearly “yes.”

**Plan guidance:** a transactional slot (or Option B host) is preferable to an over-powerful generic mutation API.

---

## 5. Defect D2 (staleness while confirm is open)

Phase 0 finding (unchanged): `ConfirmDialog` blocks outside interaction; save/discard live in the edit footer; no background writer updates `forms` while the dialog is open. **No repro**; pending state drops on unmount.

If Phase 4 ever adds **non-modal** confirm or **inline** consequences, re-open D2 and require confirm-time **re-plan from `getValues()`** (resolution already does this; monster applies frozen `plan.next`).

---

## 6. Gate questions — current evidence

Answer these **before** approving Option B or C implementation.

| #   | Question                                               | Current evidence                                                                                                              |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Is the patch atomic from the user’s perspective?       | **Mostly yes** — single confirm applies full `next` or resolution plan; no partial UI mid-dialog.                             |
| 2   | Array-aware patches vs RHF field arrays?               | Resolution uses `getArrayFieldMutators` and explicit removals; monster patches whole top-level sections. Shared DSL untested. |
| 3   | Values change while confirmation is open?              | Modal blocks edits; **D2 theoretical** for monster frozen `next`.                                                             |
| 4   | Re-evaluation return another confirmation?             | Resolution re-plans on confirm; monster does not re-open. Product rarely needs double confirm.                                |
| 5   | Stale decisions rejected?                              | Cancel clears pending; no explicit “stale token” compare on monster.                                                          |
| 6   | Unmount cancel pending?                                | Yes — React state dropped; resolution controller may persist until form instance GC.                                          |
| 7   | Errors surfaced?                                       | RHF validation after apply; resolution may show notice on incompatible clears.                                                |
| 8   | Form-level pending state needed?                       | Resolution: yes (WeakMap). Monster: per-provider state. Shared host could unify **visibility** only.                          |
| 9   | Can every target control defer its normal write?       | Resolution selects do; monster designation uses dedicated UI. Not all transactional consumers defer the same way.             |
| 10  | Can planners express updates through one patch format? | **No today** without lossy mapping — strongest argument for **Option A or B**.                                                |

---

## 7. Recommended pilot (if approved)

Implement **only after** explicit sign-off on Option B (or C).

1. **Spell resolution — selection mode change**
   - Scope: `_resolutionSelectionModeSelect` path already uses `requestResolutionChange`.
   - Goal: extract shared confirm host; keep `planResolutionChange` in contracts.
   - Parity: existing [`spell-resolution-editor.test.tsx`](../src/features/content/spells/resolution/components/editor/spell-resolution-editor.test.tsx), effect remove tests, confirm dialog a11y.

2. **Monster — true form designation**
   - Scope: designation flow only (not full `formsShapeShifting` editor split).
   - Goal: same confirm host; keep `planMonsterTrueFormDesignation`.
   - Parity: [`use-monster-forms-lifecycle.test.tsx`](../src/features/content/monsters/hooks/use-monster-forms-lifecycle.test.tsx), integration tests on forms editor.

**Do not** pilot armor slots, organization fields, or casting-ability variants until both pilots pass and gate Q1–Q3 are signed.

**Success criteria (pilot):**

- No change to save payload shapes or planner contracts without explicit contract PR.
- Confirm copy remains **verbatim** vs today (presentation-gap: no simplification).
- Slots may remain slots; success is **shared lifecycle**, not slot count reduction.
- Vitest: confirm/cancel, apply, unmount cancel, one incompatible-selection path each.

---

## 8. What we will not do in Phase 4 without a new decision

- Fold transactional flows into `kind: 'display'` or `valueSyncs`.
- Migrate previews or whole-form watchers under a “declarative dependency” fiction.
- Replace master-detail tab slots (`actions`, `traits`, etc.).
- Run `gate:pre-push` or broad refactors as part of the investigation itself.

---

## 9. Approval checklist

Use this in review (human gate, not CI):

- [ ] Chosen option: A (retain) / B (shared host) / C (unified guard) — default **A**.
- [ ] Gate questions 1–10 reviewed; any “no” documented as accept or block.
- [ ] Pilot scope limited to resolution selection + monster designation.
- [ ] Product accepts **no** shortening of true-form or resolution consequence copy.
- [ ] Register updated with decision per transactional identity if Option B/C proceeds.

---

## 10. After Phase 4

**Phase 5** (cleanup): dead slot components, identity-based ratchet, final register metrics, unsupported patterns doc — can proceed in parallel with **Option A**; transactional count unchanged.

If **Option B** ships, Phase 5 should record the shared host in `@rpg/ui` or dashboard docs and add a pr-review item for new confirm-gated flows.
