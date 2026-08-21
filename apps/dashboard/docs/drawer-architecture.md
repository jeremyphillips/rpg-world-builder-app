# Drawer architecture

Orientation index for dashboard overlay workflows. Six **drawer grammars** over rigid
shared chrome — not a framework. Each entry is `rule → grammar → canonical file → deep doc`.

**Do not duplicate** policy owned elsewhere:

| Topic                                        | Deep doc                                                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| DrawerShell API, body modes, pending dismiss | [drawer-shell.md](./drawer-shell.md)                                                                                                                 |
| Dialog panel primitives, size/surface tokens | [packages/ui/docs/dialog-panel.md](../../../packages/ui/docs/dialog-panel.md)                                                                        |
| Character builder pickers (G1 variants)      | [character-builder-picker-chrome.md](./character-builder-picker-chrome.md)                                                                           |
| Cross-content relationship drawers           | [cross-content-relationship-ui.md](./cross-content-relationship-ui.md), [relationship/README.md](../src/features/content/lib/relationship/README.md) |

---

## Layer model

Modules are placed by **what they own**, not folder depth.

```text
SHARED PRESENTATION/MECHANICS  reusable across domains
  @rpg/ui: Sheet, Modal, ConfirmDialog, CatalogPickerSheet, SelectionSummaryCard,
           CatalogPickerSelectionActions, usePendingAwareOpenChange
  dashboard shells: DrawerShell, CatalogEntityPickerSheet, ContentFormDrawer/Host
  shared kits: CatalogEntityRow, EntityReplacementSection, DrawerContext, SubjectField,
               nested-create lifecycle

DOMAIN POLICY                  eligibility, vocabulary, cardinality, projections
  @rpg/contracts; relationship/location-connection adapter; feature lib/

DRAWER INTERACTION STATE       selection, filters-in-effect, sequencing, readiness
  feature drawer + optional use-*-picker-controller

FEATURE WORKFLOW               which overlay is open, which operation is running
  composers (exclusive overlay unions) + workflow hooks

PERSISTENCE                    POST/PATCH/DELETE, invalidation, draft writes
  mutation hooks — invoked via commit callback, never inside the drawer
```

---

## Rule classes

Requirements first; mechanisms may evolve if the requirement still holds.

| Class                       | Meaning                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **ARCHITECTURAL INVARIANT** | Must hold everywhere (focus trap, commit callback boundary, nested-create sibling overlay)     |
| **G6 WORKFLOW INVARIANT**   | Orchestrated workflows maintain an exclusive overlay-mode union                                |
| **GRAMMAR BEHAVIOR**        | Lifecycle/anatomy rule for G1–G5 (fresh transactional state, browse persistence, form session) |
| **CURRENT DEFAULT**         | Named token today (`SheetSize` `lg` = 550px application width)                                 |
| **CURRENT MECHANISM**       | How a grammar rule is achieved today (remount key, sheet-owned search, `mounted={open}`)       |

---

## Mutation contract

Drawers **may**: gather/validate a domain payload; own submit/pending/error **interaction**
state; invoke and await a commit callback; interpret success/failure for UI lifecycle;
block dismissal while pending.

Drawers **must not own**: API implementation; draft mutation; query invalidation; parent
workflow routing (which overlay opens next).

Async inside a drawer is fine — the boundary is **implementation ownership**, not asynchrony.

Canonical control case: [`OrganizationPickerDrawer`](../src/features/character/components/connections/picker/organization-picker-drawer.client.tsx)
(`onAdd` → await → close on success).

---

## Grammars

| Grammar                      | Lifecycle summary                                                                           | Anatomy                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **G1** Browse/apply          | Browse state persists across close/reopen within a session; row apply continues the session | Catalog picker + optional controller                         |
| **G2** Transactional add     | Fresh state each opening; pending blocks dismiss; close+reset on success                    | Commit callback (footer or row-confirm extension point)      |
| **G3** Change-kind           | Same transactional lifecycle as G2                                                          | Fixed endpoints; always-expanded kind; picker disabled       |
| **G4** Replacement           | Same transactional lifecycle as G2                                                          | Current→New; catalog restricted to New set; no nested create |
| **G5** Form drawer           | Fresh form per session; dirty-leave + pending protection                                    | ContentFormDrawer or conforming DrawerShell form             |
| **G6** Overlay orchestration | Workflow hook owns exclusive `drawerState` union                                            | Composer renders one shell at a time; context handoff        |

Multi-mode link drawers host **one grammar per mode** inside a single surface — by design.

### Lifecycle matrix

| Event             | G1 browse/apply                      | G2–G4 transactional          | G5 form                                 |
| ----------------- | ------------------------------------ | ---------------------------- | --------------------------------------- |
| Close + reopen    | Browse preserved                     | Fresh transactional state    | Fresh form                              |
| Successful commit | Row success phase; session continues | Close + reset                | Intentional close despite dirty/pending |
| Failed commit     | Row returns to actionable phase      | Stay open; error near commit | Inline form error; stay open            |
| Pending           | Blocks user dismiss                  | Blocks user dismiss          | Blocks user dismiss                     |

Mechanisms (`toolbarStateKey`, remount keys, `mounted={open}`) are interchangeable if they
provably satisfy the grammar.

---

## Where do I start?

| I need…                                          | Grammar | Start here                                                                                                                                                                                                                        |
| ------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse picker (multi-apply, filters, sort)       | G1      | [`SpellPickerDrawer`](../src/features/character/components/spells/picker/spell-picker-drawer.client.tsx) + [`useSpellPickerController`](../src/features/character/components/spells/picker/use-spell-picker-controller.client.ts) |
| Simple commit picker (one add per open)          | G2      | [`OrganizationPickerDrawer`](../src/features/character/components/connections/picker/organization-picker-drawer.client.tsx)                                                                                                       |
| Sequenced commit picker (kind → entity → footer) | G2      | [`OrganizationLocationConnectionLinkDrawer`](../src/features/content/organizations/components/location-connections/organization-location-connection-link-drawer.client.tsx)                                                       |
| Change kind only                                 | G3      | [`LocationInverseCharacterConnLinkDrawer`](../src/features/content/locations/components/connected-parties/location-inverse-character-connection-link-drawer.client.tsx)                                                           |
| Replace subject/target                           | G4      | [`LocationParentReplacementDrawer`](../src/features/content/locations/components/hierarchy/location-parent-replacement-drawer.client.tsx)                                                                                         |
| Edit form in a drawer                            | G5      | [`VocabularyEntrySheet`](../src/features/game-terms/components/vocabulary-entry-sheet.client.tsx)                                                                                                                                 |
| Multi-overlay workflow                           | G6      | [`OrganizationMembersDetailDrawers`](../src/features/content/organizations/components/members/organization-members-detail-drawers.client.tsx)                                                                                     |

Folder composition trees: [connected-parties/README.md](../src/features/content/locations/components/connected-parties/README.md), [location-connections/README.md](../src/features/content/organizations/components/location-connections/README.md).

---

## Do not build another…

| Anti-pattern                                             | Why                                                                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `RelationshipDrawer` / `useRelationshipDrawerController` | Four different machines share primitives — see [relationship/README.md](../src/features/content/lib/relationship/README.md) |
| `EntityDrawerShell`                                      | `DrawerShell` + `CatalogEntityPickerSheet` already partition the space                                                      |
| Generic `useDrawerController`                            | No shared browse/commit machine exists across grammars                                                                      |
| Second wrapper over `CatalogEntityPickerSheet`           | It is the last wrapper — compose inside feature drawers                                                                     |
| Per-folder barrels for drawer families                   | Import supported files directly (relationship precedent)                                                                    |

---

## Production surface inventory

Every audited production surface, exactly once. **Canonical** = copy-this reference.

| Surface                                                    | Owner         | Grammar          | Shell                    | Controller / hook                        | Mutation owner             | Canonical?               |
| ---------------------------------------------------------- | ------------- | ---------------- | ------------------------ | ---------------------------------------- | -------------------------- | ------------------------ |
| EquipmentPickerDrawer                                      | character     | G1               | CatalogEntityPickerSheet | useEquipmentPickerController             | parent (draft/acquisition) |                          |
| SpellPickerDrawer                                          | character     | G1               | CatalogEntityPickerSheet | useSpellPickerController                 | parent (draft)             | **yes**                  |
| ProficiencyPickerDrawer                                    | character     | G1               | CatalogEntityPickerSheet | inline                                   | parent (draft)             |                          |
| OrganizationPickerDrawer                                   | character     | G2               | CatalogEntityPickerSheet | inline                                   | parent onAdd               | **yes**                  |
| OrganizationMemberPickerDrawer                             | organizations | G2               | CatalogEntityPickerSheet | parent workflow hook                     | parent onAdd               |                          |
| OrgLocationConnectionLinkDrawer                            | organizations | G2/G3/G4 by mode | CatalogEntityPickerSheet | conditional                              | parent onSubmit            | **yes** (sequenced G2)   |
| LocationInversePeopleConnLinkDrawer                        | locations     | G2               | CatalogEntityPickerSheet | conditional                              | parent onOrg/onCharSubmit  |                          |
| LocationInverseOrgConnLinkDrawer                           | locations     | G2/G3/G4 by mode | CatalogEntityPickerSheet | conditional                              | parent onSubmit            |                          |
| LocationInverseCharacterConnLinkDrawer                     | locations     | G2/G3 by mode    | CatalogEntityPickerSheet | conditional                              | parent onSubmit            | **yes** (G3)             |
| LocationParentReplacementDrawer                            | locations     | G4               | CatalogEntityPickerSheet | inline                                   | parent onSubmit            | **yes**                  |
| VocabularyEntrySheet                                       | game-terms    | G5               | ContentFormDrawer        | useVocabularyEntrySheet                  | parent route onSubmit      | **yes**                  |
| EditOrganizationMembershipDrawer                           | character     | G5               | DrawerShell              | inline                                   | parent onSave/onRemove     |                          |
| OrganizationMembersDetailDrawers                           | organizations | G6               | n/a (composer)           | useOrganizationMembersDetail             | n/a                        | **yes**                  |
| LocationConnectedPartiesDrawers                            | locations     | G6               | n/a (composer)           | useLocationConnectedPartiesDetail        | n/a                        |                          |
| CharacterOrganizationMembershipDrawers                     | character     | G6               | n/a (composer)           | useCharacterOrganizationMembershipsSheet | n/a                        |                          |
| DrawerShell / CatalogEntityPickerSheet / ContentFormDrawer | shells        | infrastructure   | —                        | —                                        | —                          |                          |
| BuilderOptionDetailsSheet                                  | character     | allowlisted L0   | @rpg/ui direct           | none                                     | none (read-only)           | exception                |
| TicketDetailDrawer (bench)                                 | bench         | out of scope     | raw Sheet                | URL-sync hook                            | none                       | outside dashboard ESLint |

Stretch fits handled by grammar definitions (equipment async per-row commit in G1;
edit-membership hand-rolled G5 on DrawerShell).

Update this table when adding production drawer surfaces.

---

## Outlier verdicts

### Resolved: character picker option vs connected-party slotting

Split along natural ownership (Phase 4):

| Slice                                               | Owner     | Module                                                                                                                                                           |
| --------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic character picker transport + summary/search | character | [`character-picker-option.lib.ts`](../src/features/character/lib/picker/character-picker-option.lib.ts)                                                          |
| Connected-party slotting (merge PCs + NPCs)         | locations | [`location-connected-party-character-options.lib.ts`](../src/features/content/locations/lib/connected-parties/location-connected-party-character-options.lib.ts) |

Org member picker imports the character slice directly.

### Deferred

| Topic                        | Revisit when                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nested-create modal registry | Hard-coded create intents create an ownership problem (feature the content lib cannot import, or host outside relationship family). A third arbitrary intent is **not** a trigger. |
| Mobile bottom sheet          | Product requires primitive-layer bottom sheet — outside current grammar contract. Not scheduled.                                                                                   |
| `Sheet.FooterActions` parity | Repeated footer implementations share the same semantics **and** layout. Call-site count is evidence only. Not scheduled.                                                          |

---

## Shell map

```text
@rpg/ui CatalogPickerSheet + CatalogPickerSelectionActions
        ↓
CatalogEntityPickerSheet (content) — entity row contract
        ↓
feature drawer (grammar composition)

DrawerShell → ContentFormDrawer (G5)
DrawerShell → EditOrganizationMembershipDrawer (G5 alternative)

composers (G6) — no single shell; workflow hook picks overlay
```

Geometry: application drawers use `size="lg"` (550px) via shells — a **named default**, not a
feature-level width override. See [drawer-shell.md](./drawer-shell.md).
