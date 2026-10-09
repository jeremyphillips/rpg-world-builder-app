# Character builder picker chrome

Audit of equipment, spell, proficiency, and organization catalog pickers in the
character builder. Domain item resolution lives in `@rpg/contracts`; this doc
covers dashboard presentation chrome, ownership boundaries, and what is shared
vs domain-specific.

Drawer grammars and full surface inventory: [drawer-architecture.md](./drawer-architecture.md).

Resolver catalog: [character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).

## Equipment row semantics

Catalog facts, recommendations, and requirements stay on `ResolvedEquipmentOption`.
Live quantity and supply are projected with `projectEquipmentSelection`.
`resolveEquipmentOptionRowPresentation` turns that pair, plus a compact metadata
profile, into ordered clauses (`requirement`, compatibility caution, `recommendation`,
`supply`). It does not merge those models into one fact bag.

- **Builder** picker rows do not use the clauses. They render one status line through
  the selection-row pipeline below.
- **Quick NPC** renders the same clauses inside `EquipmentOptionRow` (`IdentityRow` in
  the combobox option). Inline copy shows two clauses. The row title keeps the rest.
  The row shows the resolved owned quantity as `×N` on the heading line. That
  figure is the authoritative total, not the persisted manual grant and not the
  package's retained quantity. Package customization edits how many of an
  authored package entry the NPC keeps (`0` through the authored quantity).
  Additional Equipment shows `+N` for the manual add on top of that retained
  quantity. With a package javelin reduced to 6 and a manual `+2`, the picker
  total is `×8`. With the package entry removed and the same manual add, the
  picker total is `×2`. Quick NPC
  passes atomic `EquipmentOptionSupplyClause` values into the row resolver and
  leaves manual contributions out of that list. `formatEquipmentSupplySourceLabel`
  still describes a manual source as “Added manually”; the picker simply does not
  pass that source. A role supply clause is dropped when the recommendation
  already names that role. Additional Equipment shows `+N` for the persisted
  manual contribution. Its context line is omitted when that contribution is at
  least the resolved total, and otherwise names the total plus one automatic
  source, collapsing any further origins. Inventory breakdown remains the
  exhaustive provenance surface. A manual Add equipment action stores only its
  own additive quantity and does not steer the class package. The row is
  disabled only when another copy cannot be added.

Recommendation copy cites `RecommendationSourceRef`. Supply copy cites
`EquipmentSupplySource`. A role grant is not a recommendation.

## Picker row vocabulary and selection state

The trailing control and the selection-state line are related outputs, not one model.

The mutation family owns words only. It is not a state machine, not a `GameTermEntry`, and not a `defineMessage` catalog. Generic Add / Remove stay in `@rpg/ui` (`CATALOG_PICKER_ADD_LABEL`, `CATALOG_PICKER_REMOVE_LABEL`). Domain triplets live in `features/character/lib/picker/picker-mutation-family.ts`. Progressive forms are stored lowercase; they are not an `-ing` transform.

| Family             | Acquire | Acquiring | State    | Release   | Releasing   |
| ------------------ | ------- | --------- | -------- | --------- | ----------- |
| `genericSelection` | Add     | adding    | Selected | Remove    | removing    |
| `learnedSpell`     | Learn   | learning  | Learned  | Unlearn   | unlearning  |
| `preparedSpell`    | Prepare | preparing | Prepared | Unprepare | unpreparing |

`resolvePickerPendingLabel` capitalizes the progressive and appends `…` (`Learning…`, `Adding…`). `resolvePickerCapacityTooltip` uses the release imperative and the acquiring form (`Unlearn a spell before learning another.`). Spell nouns come from `getContentTypeSentenceForm('spells', 1)`. Generic selection, including cantrips, uses the family noun `selection`.

### Mutation states

| State               | UI                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------- |
| Expected inability  | Disabled action plus an explanatory tooltip. Selection full is this tooltip.           |
| In-flight mutation  | Pending action from `resolvePickerPendingLabel` only.                                  |
| Failed mutation     | The original action returns, with a compact failure under it (`Add failed`). No toast. |
| Successful mutation | The next valid action, plus the persistent selection-state line.                       |

The shared row action owns the tooltip wrapper and the failure line. It clears that line when the user retries, the mutation succeeds, the entity changes, or the available action changes. Callers report `failed`. They do not each reset the line. Person and location confirm steps may call `resolvePickerActionFailureStatus`. They do not use the row-action cluster.

The caller chooses `acquire` or `release` from its own domain flag (`isAlreadySelected`, owned quantity, and so on). `resolveSpellPickerSelectionMode` maps prepared rows to `preparedSpell`, known and spellbook rows to `learnedSpell`, and cantrips to `genericSelection`. Cantrips stay generic because their acquisition lead is Choose; “to learn” is the purpose clause, and cantrips are not a learned-spell collection. Known repertoire rows use Learn / Learned / Unlearn with spellbook. Section copy for `limitedRepertoire` can still say Prepare, and the repertoire counter verb can still be `prepared`. That seam is section copy, not a second row verb. Forget is not a row verb.

`owned` is a selection-state label in the same picker module, not a family member. Equipment reads generic Add and does not read that family’s state word. Package, grant, choice, converted, or purchased quantity resolves to `✓ Owned · …`. A purchase stepper keeps `Purchased` (and wealth when spend is non-zero) and omits `×N`, because the stepper already shows the count. Zero ownership renders no line, even while Add is showing. The row does not flash Added. The acquisition panel’s “Added N to inventory” announcement is a different surface.

Connection pickers (character, organization, residence) show `✓ Selected` from the line resolver’s `selected` kind. That is a surface word. Those rows do not join `genericSelection` to choose actions: Add stays the local control and disappears once the entity is linked. There is no Remove on that surface.

`PickerSelectionStateLine` renders the resolved line model above status. Provenance actions (`Release one`, `Remove one`) stay on `entity.provenance`. Warnings stay on the status line.

## Selection row status, guidance, and context policy

Builder selection rows show one metadata line (`EntitySummaryModel.statusComposition: 'metadata'`):
blocker and warning badges first, then quieter guidance text, joined with `InlineMetadata`.

```text
Picker:  [Cannot afford] · Required by class · Included in package option
Picker:  [Cannot afford] · [Not proficient] · [Requires STR 15]
Review:  [Not proficient] · [Requires STR 15]
```

Module: `features/character/lib/selection-row-status/`. Equipment resolver:
`lib/equipment/equipment-selection-row-presentation.lib.ts`.

### Pipeline

1. **Contracts facts.** `resolveEquipmentPresentationFacts` emits typed facts with a `discriminator`,
   `sourceKind`, `requirementRole`, `owned`, and `ability`. Contracts own guidance and warning copy.
2. **Domain resolver (semantics).** For example, `resolveEquipmentSelectionRowPresentation`
   merges the facts (via `selectionPresentationFromFacts`) with domain blockers (affordability,
   purchase, grant, conversion) into one `SelectionRowPresentation` per item. It knows nothing
   about surfaces.
3. **Policy table (visibility).** `SELECTION_ROW_CONTEXT_POLICIES` is a closed table of category
   allow-lists, with no booleans and no per-surface conditionals.
4. **Renderer (presentation).** `resolveSelectionRowStatusItems(presentation, { context, statusTooltip? })`
   is the **only** exported way to turn a presentation into `EntitySummaryStatusItem[]`. `context`
   is required. The renderer applies the policy, ranks, dedupes, and maps tone. There is no
   policy-free export.

Advisories (`CharacterBuildAdvisory`) run beside this pipeline, not through it. They come from the
final owned loadout with no context input.

### Visibility principle

- **Compatibility warnings** describe the relationship between the character and the item, so they follow the item across owned, review, and edit contexts.
- **Acquisition blockers** belong only to acquisition surfaces. A blocker on the edit action itself (for example, "cannot convert this item") belongs where that action is offered.
- **Requirement and recommendation guidance** appears only where it helps the user make a choice.
- **Source guidance** appears only where alternate acquisition information is useful and not already obvious from the containing surface.
- **Row visibility never feeds advisories.** Advisories are derived from the final owned loadout with no context input, so hiding a warning on a surface cannot remove a build advisory.

`title` and tooltips are supplemental only. The visible label must be enough to act on
(`Recommended by class`, `Requires STR 15`). The named source and the actual score go in the
`title`. No entry ever hides another entry; the context policy is the only filter.

### Categories

Constructors (`selectionBlocker`, `selectionWarning`, `selectionNotice`, `selectionRequirement`,
`selectionRecommendation`, `selectionSource`) assign every entry's `category` from total lookup
tables. Domain resolvers never pick a category or a context.

| Category              | Entries                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| `availability`        | blocker: `unavailable`, `not_purchasable`, `acquisition_blocked`, `conversion_blocked` |
| `affordability`       | blocker: `unaffordable`                                                                |
| `compatibility`       | warning: `not_proficient`, `ability_score_requirement`                                 |
| `capacity`            | notice: `selection_full`, `already_granted`                                            |
| `requirement_open`    | requirement / requirement match, role `candidate`                                      |
| `requirement_held`    | requirement / requirement match, role `satisfier`                                      |
| `recommendation`      | recommendation, not owned                                                              |
| `recommendation_held` | recommendation, owned                                                                  |
| `source`              | `in_package`, `open_pool`, `alternative_package`                                       |

### Context matrix

| Context          | Surfaces                                                             | Availability | Affordability | Compatibility | Req. (open) | Req. (held) | Recommendation | Rec. (owned) | Source |
| ---------------- | -------------------------------------------------------------------- | ------------ | ------------- | ------------- | ----------- | ----------- | -------------- | ------------ | ------ |
| `picker`         | Equipment, spell, and proficiency picker drawers                     | yes          | yes           | yes           | yes         | no          | yes            | no           | yes    |
| `owned`          | Added Equipment cart; Quick NPC selected additional equipment        | no           | no            | yes           | no          | no          | no             | no           | no     |
| `review`         | Starting Package expanded view; Quick NPC weapon requirement preview | no           | no            | yes           | no          | no          | no             | no           | no     |
| `edit_choice`    | Package conversion editor; Quick NPC package customization           | yes          | no            | yes           | yes         | yes         | yes            | yes          | no     |
| `reconciliation` | Package-switch trim modal                                            | no           | no            | yes           | yes         | no          | yes            | no           | no     |

`picker` hides held requirements and owned recommendations, because that guidance has already
done its job. `edit_choice` shows them, because they explain why to keep a package item.

`reconciliation` evaluates facts against the **target (post-switch) draft without the trimmable
purchases**: what the character keeps no matter how the trim goes. Against that basis an open
requirement or unowned recommendation on a purchase is a reason to keep it, while "held" means the
target package already covers the item, so the policy hides held guidance there. A purchased
Spellbook reads `Required by class` only when the target package lacks one. Every other context
uses the current step draft. The draft is a domain-resolver input, and the policy never sees it.

`selection-row-context-policy.test.ts` asserts this matrix cell by cell.

### Rank and dedupe

The comparator never falls back to input order:

1. **Group:** status before guidance.
2. **Kind:** `blocker`, `warning`, `notice`; then `requirement`, `requirement_match`, `recommendation`, `source`.
3. **Reason:**
   - Blockers: `unavailable`, `not_purchasable`, `acquisition_blocked`, `conversion_blocked`, `unaffordable` (structural first, budget last).
   - Warnings: `not_proficient`, then `ability_score_requirement` in `ABILITY_IDS` order.
   - Notices: `selection_full`, then `already_granted`.
   - Requirement and recommendation: `sourceKind` in `compareSourcePriority` order.
   - Source: `in_package`, `open_pool`, `alternative_package`.
4. **Tie-break:** the semantic `key`, compared lexically.

Entries are deduped by `key` (`warning:ability_score_requirement:str`,
`guidance:recommendation:species`), never by label. The renderer owns tone: blockers are soft
`destructive` badges and warnings soft `warning` badges, with no leading icon. Notices are muted
text, and guidance uses the `guidance` text variant with `sourceLabels` as its `title`. Equipment
blocker copy keeps its constants (`EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL`, …); the affordability
amounts tooltip is passed in through the `statusTooltip` hook.

### Registering a surface or context

- **New surface:** pick an existing context and pass it to `resolveSelectionRowStatusItems`.
- **New context:** add it to `SELECTION_ROW_CONTEXTS`. The `satisfies Record` constraint forces a
  policy entry, and the matrix test forces an expectation row.
- **Legitimate exception:** model it as a new context with a documented policy, never as label or
  discriminator checks in a component.

**PR checklist:** flag any `.status.filter` / `.guidance.filter` on a `SelectionRowPresentation`
outside `selection-row-status/`, and any hand-built selection status items.

**Stays local (not this lane):** ability eyebrows, class and species RadioCards, Quick NPC
role/class/species group eyebrows, choice-row `Stale`, and Quick NPC equipment option-row clauses.

### Builder equipment surfaces

One recommendation derivation per draft feeds the picker and every owned surface.
`resolveEquipmentStepPickerItems` returns it as `resolvedById`, and `useEquipmentStep` exposes it as
`selectionFacts` (`EquipmentSelectionFacts`, `lib/equipment/equipment-selection-facts.lib.ts`).
The equipment step mounts `EquipmentSelectionFactsProvider`; **sections** read
`useEquipmentSelectionFacts()`, rows never do.

- Inventory rows carry `selectionPresentation` (facts only, no acquisition input) from
  `withEquipmentSelectionPresentation`. `lookupResolvedEquipment` tolerates slug ids.
- Rows (`EquipmentInventoryRowItem`, every `EquipmentAddedInventoryRowItem` path, and
  `EquipmentInventoryManageDisclosureCard`) take a ready `status` prop. The parent resolves it:
  - `EquipmentAddedInventorySection`: `owned`.
  - `EquipmentStartingPackageInventory`: `review`.
  - `EquipmentPackageConversionEditor`: `edit_choice`, via
    `resolveEquipmentConversionItemPresentation` (`blockingIssue` → `conversion_blocked` blocker).
  - Package-switch trim modal: `reconciliation`. The modal derives facts once per target option
    with `resolvePackageSwitchSelectionFacts`, and `buildPackageSwitchDraftPurchasedGroups` hands
    each item to `EquipmentPurchasedInventorySection` with its status resolved.
- `equipment-selection-row-presentation.parity.test.ts` guards drift: owned weapons and armor show
  a compatibility entry if and only if a matching build advisory exists.
- Spell and proficiency drawers use `picker`. Recommendation guidance is a domain input
  (`recommendationsEnabled` on spells; always on for proficiencies). Ability-fit skill ranking
  (`reason: 'abilityFit'`) is ordering evidence only. It must not render recommendation guidance,
  including the generic Recommended line. `already_granted` still
  comes from the shared disabled-note string. `selection_full` is not a row-status notice;
  the disabled action tooltip carries it. Ritual and concentration stay on the spell metadata line.
- Quick NPC package customization rows use `edit_choice`, and selected additional equipment
  rows use `owned`. Both read `deriveQuickNpcEquipmentSelectionFacts` from the prepared draft
  (package selections, retained items, generated scores). The summary card stays on advisories
  via `formatBuildAdvisoryLabel`.

## Architectural rule

Evaluate every new picker against this stack:

```text
consumer / workflow hook     → persistence and application mutation
domain controller (optional) → browse / filter / quantity / derived presentation state
domain drawer                → sheet composition + domain interaction model
shared picker chrome         → stateless or same-lifecycle UI used by ≥2 character domains
CatalogEntityPickerSheet     → catalog row host (content)
```

Three commit layers — do not collapse them:

- **UI commit mechanics** — quantity field value, reset-after-add, pending button. Picker rows do not flash Added; the Owned or Selected line is the persistent result. The acquisition panel may still announce “Added N to inventory.”
- **Domain rules** — affordability, stackable max, eligibility (contracts / domain libs)
- **Application mutation** — purchase intent vs magic-item grant, draft patches, REST membership create

Domain drawers **may** understand their domain interaction model. They **must not**
understand the persistence mechanism of the consuming surface (builder draft patch vs
sheet API).

Use the catalog entity picker sheet (or its successor) — do not fork a parallel shell.
There is no import-string guard; the contract is documented here.

## Drawer entry points

| Domain        | Drawer                                                           | Controller / lib                                           |
| ------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Equipment     | `components/equipment/picker/drawer/equipment-picker-drawer.tsx` | `useEquipmentPickerController` + drawer lib                |
| Spells        | `components/spells/picker/spell-picker-drawer.tsx`               | `useSpellPickerController` + drawer lib + browse-mode lib  |
| Proficiencies | `components/proficiencies/picker/proficiency-picker-drawer.tsx`  | drawer lib only (no controller)                            |
| Organizations | `components/connections/picker/organization-picker-drawer.tsx`   | drawer lib only — builder **and** sheet reuse control case |

All four are domain composition shells over `@rpg/content` **`CatalogEntityPickerSheet`**
(`surface="background"`, `size="lg"`). Equipment and spell browse state live in domain
controllers; mutation stays in step/acquisition hooks.

## Layering

```text
consumer / acquisition hook       → persistence (onCommitAdd, manage callbacks, onSelect)
useEquipmentPickerController      → equipment browse / filter / quantity / derived presentation
useSpellPickerController          → spell mode buckets / filter persist / derived lists
domain drawer                       → sheet composition + domain presentation
shared picker chrome (components/picker/) → sort, selection actions, reset, empty states
CatalogEntityPickerSheet            → catalog row host
CatalogMetadataRenderer (content)   → metadata line rendering (canonical)
```

## Per-drawer contracts

### EquipmentPickerDrawer

**May know:** equipment domain; browse workflow mode for **presentation** (filters/sorts/budget/status line); row/detail composition; quantity UI; grant manage **callbacks**; documented pass-through of grant/acquisition context to details until acquisition VM is weaned off draft.

**Must not know:** how a purchase is persisted; how a magic-item grant is applied; character-step mutation implementation; purchase-vs-grant routing on the add path (consumer maps `onCommitAdd`).

### SpellPickerDrawer

**May know:** cantrip vs prepared as a **choice-set browse mode**; per-mode filter/sort buckets; curated spell metadata; selection-full empty states; spell-only selection summary chrome. Row verbs come from the mutation family for the active choice-set suffix: Prepare / Prepared / Unprepare, Learn / Learned / Unlearn, or Add / Selected / Remove for cantrips.

**Must not know:** `draft.choiceSelections` shape; how the builder patches draft; campaign/sheet persistence.

### ProficiencyPickerDrawer

**May know:** one active `ChoiceSet`; skill vs other choice types for details; sort/search; `catalogIndex` for **skill catalog presentation**.

**Must not know:** how selections are stored on the draft; step-hook internals.

### OrganizationPickerDrawer

**May know:** organization domain filter (shared relationship schema, utility band); membership title field; selected vs available; pending/error/close-on-success as add-flow interaction.

**Must not know:** builder `draft.connections` vs sheet API vs org-roster consumers; character record shape.

## Commonality matrix

| Dimension                   | Equipment                                                              | Spells                    | Proficiencies                  | Shared chrome                                                                  |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Sheet shell                 | ✓                                                                      | ✓                         | ✓                              | `CatalogEntityPickerSheet` (`surface="background"`, `size="lg"`)               |
| Search                      | Built-in sheet search                                                  | Same                      | Same                           | `@rpg/ui`                                                                      |
| Structured filters          | Kind + affordable toggles                                              | School, level, mechanics  | —                              | Equipment ↔ Spells pattern only                                                |
| Sort                        | `CatalogSortControl`                                                   | Wrapped sort control      | `CatalogSortControl`           | `CatalogSortControl` + sort mode constants                                     |
| Reset                       | Reset slot reserved under Sort                                         | Reset slot on the tab row | Reset slot reserved under Sort | `hasCatalogPickerResetViewCriteria` (sort optional), `CatalogToolbarResetSlot` |
| Empty state panel           | Sheet defaults                                                         | Custom message            | Custom message                 | **`CatalogPickerResultsState`** (spells/proficiencies only)                    |
| Row add/remove              | Commerce / acquisition rail                                            | Selection actions         | Selection actions              | Spells ↔ Proficiencies: **`CatalogPickerSelectionActions`** (`@rpg/ui`)        |
| Row dimming / disabled note | Domain-specific (affordability)                                        | Shared resolver state     | Shared resolver state          | **`picker/row/catalog-picker-row-state.lib.ts`**                               |
| Empty-state kind/message    | —                                                                      | Choice-set driven         | Choice-set driven              | **`picker/results/catalog-picker-empty-state.lib.ts`**                         |
| Recommendation tabs         | No                                                                     | Yes                       | No                             | Spells only                                                                    |
| Workflow mode tabs          | Purchase / magic items                                                 | Cantrips / prepared       | No                             | Equipment only                                                                 |
| Budget / price UI           | Yes                                                                    | No                        | No                             | Equipment only                                                                 |
| Metadata renderer           | Content `CatalogMetadataRenderer`                                      | Same                      | Same                           | Domain mappers under each `*/picker/`                                          |
| Status / guidance           | `picker`, plus owned, review, edit, and reconciliation on builder rows | `picker`                  | `picker`                       | `resolveSelectionRowStatusItems` and the context policy                        |

When search, a structured filter, or a non-default tab narrows the list, the reset row shows `visible of total` beside Reset. `total` is the eligible list for the current mode. Sort alone shows Reset with no count.

Visible reset copy is `Reset`, with the reset icon. Chrome (text variant, `sm` size, compact density, glyph step) is fixed on `CatalogToolbarResetAction`. An optional `label` replaces the visible text and the accessible name. The default accessible name and `title` are `Reset search, filters, and sorting` when Sort is on the toolbar, and `Reset search and filters` when it is not. The reset row stays reserved (invisible, not focusable) whenever a utility band renders. Sort implies that reservation. Drawers without a utility band mount Reset only while it is visible. Spell recommendation tabs still park `actions` on the tab row.

## Picker metadata budget

Picker metadata is intentionally curated for decision value. It has a fixed semantic budget and must not become an exhaustive dump of entity attributes.

That rule is for compact picker and list rows that share a domain grammar: spell picker rows, Quick NPC spell previews, and global-search spell secondary text. Spell detail views and character-sheet spell details keep the full facts.

Spell rows call `resolveSpellPickerMetadata` and keep at most four groups. Classification and casting time are required. Remaining slots go to the highest-value optional facts — concentration, ritual, non-default range, timed duration, then self range — and then render in a stable order: classification, ritual, casting time, range, concentration, duration. The dashboard mapper turns that result into one `CatalogMetadataLine`. Level is a strong part inside the classification item; school stays in the same item so they share one budget slot. Ritual and concentration stay inline metadata, not status markers.

Equipment already curates through `comparisonGroups`. Do not measure rendered width or add groups because a row looks like it has room.

## Contracts vs dashboard ownership

### `@rpg/contracts` (domain affordances)

| Domain        | Resolver                                                               | Provides                                                                                                                |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Equipment     | `resolveEquipmentPickerItems` + dashboard search assembly              | Rows, affordability, recommendations, `searchDocument`; purchase action via `resolveEquipmentPickerPurchaseActionState` |
| Spells        | `resolveSpellPickerItems` + dashboard `SpellPickerRow` search assembly | Rows, selection state, `compactSummary`, `searchText`; `searchDocument` from `enrichSpellPickerItems`                   |
| Proficiencies | `resolveProficiencyPickerItems`                                        | Rows, grants overlap, selection state, optional `compactSummary`                                                        |

Row state for spells and proficiencies extends `PickerItemStateBase`
(`resolvers/picker/picker-item-state.ts`): `canSelect`, `isAlreadySelected`,
`disabledReasons`.

### Dashboard (presentation + browse UX)

- Filter schemas and filter control wiring (`*-picker-filter-schema.ts`, toolbar clients)
- Client-side search scoring and sort orchestration (`*-picker-drawer.lib.ts`, `picker/sort/catalog-picker-sort.lib.ts`)
- Domain controllers for equipment and spell browse lifecycle
- Row chrome beyond selection actions (equipment acquisition panels, recommendation and disabled-note status)
- Metadata line mapping (domain `*/picker/map-*-to-metadata-lines.ts` → `CatalogMetadataLine`)
- Draft mutations (step hooks)

**Rule:** Do not re-implement domain eligibility, blockers, or affordability in
dashboard libs. When browse logic encodes domain policy, promote it to contracts
only if a non-dashboard consumer appears.

Browse order ignores selection, remaining budget, and grant consumption. Those
facts stay on the row as chrome and disabled actions. Rank semantics live in
[`content-ranking.md`](../../../packages/contracts/docs/character-builder/content-ranking.md).

## Shared picker modules (`components/picker/`)

`components/picker/` is a **shared character picker chrome/composition layer**, not a
bucket for anything two files import. A module belongs here only when **all** of:

1. at least two character domains use it
2. semantics are the same
3. lifecycle is the same or the module is stateless
4. it has no equipment / spell / proficiency vocabulary or assumptions

Subfolders: `sort/`, `selection/`, `row/`, `results/`. Filter toolbar seams stay at
picker root.

| Module                                      | Role                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `results/catalog-picker-results-state.tsx`  | Dashed empty-state `InsetPanel` (spells + proficiencies)                                                                             |
| `results/catalog-picker-empty-state.lib.ts` | `no-options` / `selection-full` kind + message mapping                                                                               |
| `row/catalog-picker-row-state.lib.ts`       | Dimmed row + first disabled-reason note                                                                                              |
| `catalog-picker-filter-state.lib.ts` (root) | Clearable / reset-view criteria (equipment delegates here)                                                                           |
| `catalog-toolbar-reset-action.tsx` (root)   | `Reset` button. Accessible name includes search, and sorting when Sort is present. The row is reserved only while Sort is persistent |
| `sort/catalog-sort-control.tsx`             | Sort `<Select>`                                                                                                                      |

**Promoted to `@rpg/ui`** (import from `@rpg/ui`, not `character/components/picker/`):

| Module                                    | Role                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `catalog-picker-action-button.client.tsx` | Row verb button. `CATALOG_PICKER_ROW_ACTION_ICONS` toggles the plus/minus glyph |
| `catalog-picker-selection-actions.tsx`    | Add / Remove row action phases                                                  |
| `catalog-picker-row-action.lib.ts`        | Phase resolver (`resolveCatalogPickerRowActionPhase`)                           |

**Not in `picker/` (domain-owned):**

| Module                                                   | Owner                          |
| -------------------------------------------------------- | ------------------------------ |
| `spell-picker-browse-mode.lib.ts`                        | `spells/picker/`               |
| `useSpellPickerController`                               | `spells/picker/`               |
| `spell-picker-selection-summary.tsx`                     | `spells/picker/` (spells only) |
| `useEquipmentAcquisitionCommitConfirmation`              | `equipment/acquisition/`       |
| `map-*-compact-summary-to-metadata-lines.ts`             | respective domain `*/picker/`  |
| `CatalogMetadataRenderer` / `formatCatalogMetadataLines` | `@/features/content`           |

Domain drawer libs keep thin wrappers (e.g. `resolveSpellPickerEmptyStateMessage`)
so step-specific copy stays co-located with types.

## Browse state lifecycle

Search for equipment/proficiency/org is **sheet-owned** (`CatalogPickerSheet` `useState`).
Equipment does not pass `initialSearchQuery`. Spells copy search into the active mode
bucket and restore via `initialSearchQuery` + `toolbarStateKey`.

| State       | Equipment                            | Spells                                          | Proficiencies          |
| ----------- | ------------------------------------ | ----------------------------------------------- | ---------------------- |
| search      | sheet-owned; not persisted by drawer | per-mode bucket; restored on reopen/mode switch | sheet-owned            |
| sort        | persists across close/reopen         | per-mode bucket                                 | persists while mounted |
| filters     | persist across close/reopen          | per-mode bucket                                 | none                   |
| quantity    | reset on close                       | n/a                                             | n/a                    |
| mode bucket | n/a                                  | persist across close                            | n/a                    |

Controller tests encode these rules directly.

## Explicit non-goals

- One generalized browse/sort/filter controller across all pickers
- Merging domain drawer libs into a shared module
- Extracting equipment acquisition / commerce row chrome (single consumer)
- Import-string guards requiring `CatalogEntityPickerSheet` in every drawer file

## Follow-up

- Equipment intentionally keeps `CatalogPickerSheet` default empty states — its loading/filtered-result lifecycle differs from spell/proficiency choice-set empty kinds (`no-options` / `selection-full`); do not adopt `CatalogPickerResultsState` for visual parity alone
- Wean equipment acquisition panel VM off `CharacterBuilderDraft` (shared with inventory manage)
- Wire spell `recommendationsEnabled` when resolver/product work lands
