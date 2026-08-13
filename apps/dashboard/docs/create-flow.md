# Create-flow composition

Dashboard create workflows compose under `apps/dashboard/src/lib/create-flow`.
`@rpg/ui` owns Modal and Tabs primitives. This library owns application chrome
and optional relationship-draft presentation — not domain forms, persistence, or
relationship vocabulary.

## CreateModalShell

`CreateModalShell` places header, optional Setup summary, optional tabs, one
body scroll region, and one footer. It always selects `Modal.Content
layout="stable"`. Stable height remains owned by the UI Modal primitive.

The shell consumes normalized panel status (`invalid`, optional `issueCount`,
`dirty`). It never inspects RHF, relationship drafts, or domain validation.
Controlled `activeTabId` lets a domain coordinator activate the first invalid
panel after submit.

## Add / Pending disclosure workflow

Optional create-tab relationship composition uses a shared **Add / Pending**
root. Building Organizations is the first consumer. The root is presentation
and mode composition only.

```text
ADD MODE     → discover → expand entity → configure relationship → confirm draft
PENDING MODE → review drafts → edit/remove → add another
```

```text
AddPendingWorkflow
  → AddPendingDisclosureCard
    → ContentEntityCard (collapsed) or DisclosureEntityCard (expanded)
      → DisclosureChoiceComposer (domain-supplied choices + confirm)
```

### Phase 6b architecture checkpoint

Recorded before implementation. Findings:

1. **Add Member owner today.** `OrganizationMemberPickerDrawer` composes
   `CatalogEntityPickerSheet` + `CatalogEntityRow`. Trailing **Add** comes from
   `CatalogPickerSelectionActions`. Expansion is one-open via
   `expandedItemId` / `onExpandedItemChange`. The expanded body is
   `OrganizationMembershipTitleField` plus a confirm **Add member** button.
2. **Disclosure/card anatomy is not directly reusable in a create modal.**
   `CatalogEntityRow` is picker-sheet specific. Nesting `CatalogEntityPickerSheet`
   inside `CreateModalShell` would add a second overlay/scroll owner. The
   reusable bordered surfaces are `ContentEntityCard` (static) and
   `DisclosureEntityCard` (expandable).
3. **Radio selection is domain-specific.** Add Member radios are membership
   titles from `OrganizationMembershipTitleField`. The generic primitive is
   `@rpg/ui` `RadioGroupField`. Do not lift title vocabulary into shared UI.
4. **Lifted pieces.** Add/Pending mode root and one-open disclosure context
   (`AddPendingWorkflow`); generic choice/confirm composer
   (`DisclosureChoiceComposer`); CEC/DEC switch with trailing **Add**
   (`AddPendingDisclosureCard`). Do not lift the picker Sheet, membership title
   field, or immediate-persist controller.
5. **Reusable root.** `AddPendingWorkflow` in `src/lib/create-flow`. Add Member
   has no pending-review mode and persists immediately, so it is not generalized
   into this root. It remains a follow-on candidate for the choice composer and
   disclosure-card composition only.
6. **`ContentEntityCard` stays pure.** Collapsed identity uses CEC with a
   trailing action only. Expanded identity uses DEC with domain `children`.
   CEC is never nested inside DEC (that would double card chrome) and never
   receives expand, composer, or relationship props.
7. **Pending edit stays in Pending mode.** The edited row swaps to DEC + the
   same `DisclosureChoiceComposer`. Sibling pending cards remain visible. This
   is not a return to Add/discovery.
8. **Parallel patterns left in place.** `CatalogEntityRow` in picker sheets,
   equipment picker disclosure (commerce), and mutation-oriented relationship
   drawers. Do not migrate them in this phase.

### Root contract

`AddPendingWorkflow` may own Add vs Pending mode, one-open disclosure
coordination, add-another transition, and pending-collection placement/chrome.

It must not own Organization APIs, Location semantics, relationship vocabulary,
domain validation, persistence, composite submit, or pending-row record
interpretation. Consumers supply discovery content, composer content,
pending-row content, and domain actions.

The root API uses `addAnotherLabel` / action slots — never domain nouns such as
“organization.”

`DisclosureChoiceComposer` understands choices, selected value, disabled
reasons, and a confirm action. It omits radios when exactly one choice is
eligible. It never names Owner, Tenant, or other relationship kinds.

### `ContentEntityCard` consumption

See [content-entity-card.md](./content-entity-card.md#add--pending-disclosure).
Collapsed discovery and pending rows use CEC. Expansion belongs to
`DisclosureEntityCard` via `AddPendingDisclosureCard`.
