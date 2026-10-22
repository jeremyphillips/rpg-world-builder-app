# Semantic CSS migration

Temporary tracker for inventory, classification, readiness, and status. Delete or archive this file when the migration ends. Permanent rules live in [ui-architecture.md](./ui-architecture.md). Class naming and the completeness guard live in [semantic-control-css.md](./semantic-control-css.md).

## Two gates

**Architecture readiness** must pass before semantic migration.

- Clear visual ownership: the registry names the owner.
- No unresolved duplicate implementation. Known duplicates are classified, though not necessarily migrated yet.
- A stable public API, or an explicit migration plan for it.
- Known consumer overrides, each with its intended behavior recorded. A legitimate feature-level override is allowed.

A dedicated variants file, pre-existing stories and tests, and the removal of unrelated deprecated aliases are **not** prerequisites for architecture readiness.

**Migration completion** must pass before the work counts as finished.

- Concise semantic DOM classes that pass the inspector acceptance check in [semantic-control-css.md](./semantic-control-css.md).
- Storybook coverage: `.styles.ts` specs, a `ClassReference` story, and captions.
- Tests and visual parity, using the completeness guard and the parity harness.
- Size and appearance modifiers documented in the component doc or [semantic-control-css.md](./semantic-control-css.md).
- No obsolete styling paths for the migrated responsibility, including deprecated aliases for that responsibility.
- **Styling ownership cleanup:** All styling modules and class aliases affected by the migration have been reviewed. Obsolete implementations, static indirection, and duplicate chrome have been removed.
- **Variant-file disposition:** Every affected `*.variants.ts` file is retained, simplified, deleted, or explicitly deferred with a reason. Retention requires meaningful variant resolution, not merely reuse.
- **No replacement indirection:** Do not replace deleted Tailwind aliases with equivalent constants, trivial wrappers, or one-to-one CSS selectors.
- **Inspectable semantic styling:** Reusable appearance and anatomy resolve to meaningful semantic classes visible in DevTools. Feature-specific layout may remain inline.

A migration cannot be marked **Complete** while unnecessary styling indirection remains within its approved scope.

**Styling-indirection audit (per wave):** remove static aliases and empty `cva()` / zero-argument class wrappers; inline fixed classes at the owning element; keep conditional resolvers; do not apply foreign element classes without a recorded contract; update ClassReference; record Deleted / Simplified / Retained / Deferred. Finishing semantic CSS does not close the separate Tailwind static-CVA backlog (`data-table.variants.ts` toolbar layout, `content-card.variants.ts`, form array helpers, W10/W14/W15). Permanent policy: [ui-architecture.md](./ui-architecture.md). Regression guard: `semantic-styling-indirection.test.ts` (scoped roots under `packages/ui/src/components`, `packages/ui/src/form`, dashboard entity surfaces, `apps/dashboard/src/lib/overview`).

## Variant-file disposition

### Principle

`*.variants.ts` files exist to resolve genuine visual variation, not to store named Tailwind class strings.

**Prefer semantic CSS for reusable appearance, inline utilities for simple local geometry, and CVA for meaningful variant resolution.**

| Existing implementation                                    | Preferred disposition                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Genuine tone, size, density, state, or appearance resolver | Retain the variant contract                                                                                   |
| CVA containing only static base classes                    | Remove CVA; move styling to its semantic or local owner                                                       |
| Static component surface/anatomy classes                   | Replace with existing semantic primitive or meaningful BEM-style CSS                                          |
| Static one-off layout constants                            | Move simple geometry to owning JSX                                                                            |
| Shared static layout constants                             | Evaluate existing layout primitives or semantic component CSS; sharing alone does not justify a variants file |
| Mixed file containing real variants and static aliases     | Retain genuine variants; remove unnecessary static exports                                                    |
| Entire file made obsolete                                  | Delete the file and all imports                                                                               |
| Specialized domain composition                             | Keep the composition; separately justify any remaining variants file                                          |

### Evaluation rules

For each affected file:

1. Trace exports and consumers.
2. Determine whether the file resolves actual variations in presentation or state.
3. Identify static class aliases that merely hide Tailwind from the owning component.
4. Reuse established semantic styling where appropriate.
5. Keep simple feature-specific geometry close to JSX.
6. Delete obsolete exports and delete the file when no meaningful contract remains.
7. Avoid new abstraction layers introduced solely to relocate classes.

**Using `cva()` does not itself justify a variants file.** A CVA with no meaningful variants is still a static styling alias.

Do not convert every inline utility into BEM CSS. Semantic classes should represent meaningful component identity, anatomy, or state—not arbitrary utility combinations.

### Terminal dispositions

Record one disposition per affected `*.variants.ts` file when closing a wave:

| Disposition    | Meaning                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| **Deleted**    | No meaningful variant contract remains; file removed                    |
| **Simplified** | Genuine variants retained; static aliases and dead exports removed      |
| **Retained**   | Conditional resolver is justified (tone, size, layout axis, cursor, …)  |
| **Deferred**   | Named follow-up with exact file(s) and remaining styling responsibility |

A domain **ownership exception** does not retain a variants file. Styling disposition is separate and must still be terminal.

### Residual cleanup rules (all waves)

- Adopt a semantic class only when the element joins that **interaction contract**. Visual similarity does not transfer ownership (menu commands vs list/navigation rows vs navigation links).
- Do not add a shared modifier, merge a small resolver into a larger one, or introduce a global selector solely to delete a local string or file.
- TypeScript constants that only rename emitted BEM classes are **indirection**; the class string on the owning component is the contract.
- Before removing utilities replaced by semantic CSS, confirm computed values and focus context (`ui-focus-ring` standalone vs `ui-focus-ring--embedded`) match current behavior.
- **Deferred** must name the file, the unresolved styling work, and the follow-up wave—not an open-ended “later”.

## Scope control

Variant-file cleanup is mandatory for the affected migration group and its direct styling dependencies.

It does not require repository-wide elimination of all `*.variants.ts` files.

Previously completed waves should receive a targeted residual-indirection audit when their files are next touched, or through a separately tracked cleanup pass. Do not silently reclassify unrelated legacy work as part of the current wave.

## Priority rubric

1. **Recurring UI drift eliminated.** Count how many hand-rolled duplicates and parallel implementations the migration absorbs or prevents.
2. **Reuse fan-in.** How many surfaces inherit the change automatically.
3. **Inspector noise.** String length, state selectors, and compound variants.

Effort and risk only break ties.

## Shared components

| #   | Target                                                                          | Architecture readiness | Blockers / notes                                                                                                                                                                                                                                                                                                                                                                                          | Drift eliminated                                                   | Priority | Wave        |
| --- | ------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ----------- |
| 1   | InteractiveRow / InteractiveList                                                | Complete (2026-10-22)  | Shared `--ui-surface-*` ladder on rows; `interactive-row.variants` **simplified**; `notification-preview-item.variants` / `notification-menu-row.variants` **deleted**; footer links → `standaloneTextActionClasses`.                                                                                                                                                                                     | High: combobox, listbox, DataTable body rows, notification preview | 1        | W1          |
| 2   | Card / InsetPanel ownership                                                     | Complete (2026-10-22)  | Residual pass: `empty-panel.variants` **deleted** (specs only); `inset-panel.variants` **simplified**; `card.variants` **simplified** (resolver retained); feature `builder-fact-summary`, `detail-collection-panel`, global-search topbar/preview static files **deleted**. Media-manager / table-builder styling **deferred**.                                                                          | High: most hand-rolled feature surfaces                            | 2        | W2          |
| 3   | CompactLabel / Badge / Chip                                                     | Complete (2026-10-22)  | Residual: `compact-label.variants` **simplified**; `badge.variants` **retained** (`badgeLayoutVariants`); `notification-unread-badge.variants` **deleted**. `ui-notification-unread-badge` exception unchanged.                                                                                                                                                                                           | High: many Badge consumers and domain badge wrappers               | 3        | W3          |
| 4   | Popover / DropdownMenu / Tooltip content                                        | Complete (2026-10-22)  | Residual: `popover-content.variants` **simplified**; `dropdown-menu-choice.variants` **simplified**; `entity-action-choice-menu.variants` **deleted**; `tooltip-trigger.variants` **retained**. Rich choice geometry stays on `dropdownMenuChoiceItemVariants`, not base `ui-menu-item`.                                                                                                                  | High: every overlay host                                           | 4        | W4          |
| 5   | Typography roles (Text, field label/legend/hint/error)                          | Complete (composites)  | `textVariants` **retained**. Follow-up: bare `text-xs` in legacy `*.variants.ts` (not in W2–W6 residual scope).                                                                                                                                                                                                                                                                                           | High in volume, low per site                                       | 5        | W5          |
| 6   | Alert                                                                           | Complete (2026-10-22)  | Residual: `alert.variants` **simplified** (`alertVariants` retained; static title/description CVAs removed).                                                                                                                                                                                                                                                                                              | Med                                                                | 6        | W6          |
| 7   | DialogPanel panel chrome (Modal, Sheet)                                         | Complete (2026-10-22)  | Shared semantic fill + geometry + neutral strength; Radix animation/placement remain modality-owned. Deleted `cardBorderClasses`, `sheetBodyVariants`, static overlay CVA, and warm `card-border` token/utility. Retained genuine content/layout resolvers. W15 architecture remains deferred.                                                                                                            | Med                                                                | 7        | W7          |
| 8   | Option-card shell (SelectionOptionCard, RadioCard)                              | Complete (2026-10-22)  | `RADIO_CARD_CLASS_SPECS` + ClassReference on RadioCard; `radio-card.variants` **simplified** (`radioCardGroupGapVariants`, `radioCardControlVariants` retained); `selection-option-card.lib` **simplified** (resolvers only); indicator/icon/details/leading geometry in `ui-radio-card.css`. `fixed-scores-assignment.variants` **deleted**. `AbilityScoreCard` **exception** (domain score tile).       | Med–High                                                           | 8        | After W2    |
| 9   | IdentityFrame / IdentityRow, then EntityCardFrame, EntityCard static/disclosure | Complete (2026-10-22)  | `ui-identity-frame.css` + size/shape/fit modifiers; `identity-row.variants` **simplified**; `entity-card-frame.variants` **deleted** → `entity-card-frame.lib`; disclosure/catalog washes on `dash-entity-card__body--*` (catalog **subtle**); `content-detail-layout.variants` **deleted**; hero `Card tone="strong"`. `catalog-card.variants` / `entity-card-disclosure-renderer.variants` **deleted**. | Med                                                                | 9        | After W2    |
| 10  | Tabs                                                                            | Ready (one fork)       | `spell-level-tabs` fork; migration stays in controls Phase 5                                                                                                                                                                                                                                                                                                                                              | Low–Med                                                            | 10       | Controls P5 |
| 11  | StatusIcon, Wizard, FilterBar / CatalogToolbar                                  | Ready                  | None                                                                                                                                                                                                                                                                                                                                                                                                      | Low–Med                                                            | 11       | Later       |
| 12  | DataTable row and header bands                                                  | Complete (2026-10-22)  | Native `tr`/`th`/`td` in `Table`; `data-table.css` bands + `--ui-data-table-row-bg`; `data-table.variants` **simplified**; unavailable helpers in `data-table-band.lib.ts`.                                                                                                                                                                                                                               | Med                                                                | 12       | W12         |
| 13  | FieldGroup chrome                                                               | Ready                  | Time with controls Phase 4                                                                                                                                                                                                                                                                                                                                                                                | Low–Med                                                            | 13       | Later       |
| 14  | MetadataList                                                                    | Ready                  | Adoption via the `dt`/`dd` classification                                                                                                                                                                                                                                                                                                                                                                 | Med (dashboard `dt`/`dd`)                                          | 14       | Later       |
| 15  | Sidebar, PreviewRail, master-detail panels                                      | Not ready (ownership)  | Ownership splits                                                                                                                                                                                                                                                                                                                                                                                          | Med                                                                | 15       | Backlog     |
| 16  | Avatar, Toast tone, AttentionFrame, SemanticText                                | Varies                 | Low leverage                                                                                                                                                                                                                                                                                                                                                                                              | Low                                                                | Optional | Backlog     |
| —   | Heading, Eyebrow, text-action, prose, InlineMetadata, layout orchestrators      | N/A                    | Already concise, or not styling owners                                                                                                                                                                                                                                                                                                                                                                    | —                                                                  | Skip     | —           |

## Feature-local classification

Classify every implementation before migrating it. Shared borders and rounding alone do not imply shared ownership.

For each migration group, record both:

- **Component ownership:** Which shared component or domain composition owns the UI.
- **Styling disposition:** What happens to the existing feature styling implementation.

| Classification                      | Action                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Duplicate of an established pattern | Migrate to the shared component                                                          |
| Variation of an established pattern | Extend the shared API when the variant criterion is met                                  |
| Domain-specific composition         | Keep the component; use the shared component or its semantic styling primitive inside it |
| Genuinely unique surface            | Keep the local implementation; note it as an intentional exception                       |
| Obsolete implementation             | Delete                                                                                   |

**Styling disposition** (per affected `*.variants.ts` or styling module):

| Disposition    | Meaning                                                   |
| -------------- | --------------------------------------------------------- |
| Retained       | Genuine variant resolver remains                          |
| Simplified     | Meaningful variants retained; unnecessary exports removed |
| Deleted        | Obsolete styling module eliminated                        |
| Not applicable | No styling module involved                                |
| Deferred       | Named follow-up with exact file and justification         |

A domain-specific exception to shared-component adoption is **not** automatically an exception to variant-file cleanup. An implementation may remain a domain component while its static class aliases are removed.

**Status lifecycle.** Each row moves through these statuses:

- **discovered:** inventoried and grouped by likely pattern.
- **classified:** examined and assigned one of the five classifications plus a reuse path and styling disposition.
- **ready:** the target owner exists and passes architecture readiness.
- **migrating:** work is in progress.
- **complete:** the migration completion gate has passed, or the row was deleted or recorded as an exception.

A row may move to **complete** only when:

- The semantic owner is established and adopted.
- The migration completion tests and inspector requirements pass.
- All obsolete styling paths for that responsibility are removed.
- Affected variant files have terminal styling dispositions.
- No unnecessary static class aliases remain within the migrated scope.

A **deferred** styling disposition requires a named future wave or follow-up and a precise unresolved responsibility.

An **exception** must justify why the existing implementation is architecturally appropriate. It cannot be used merely to preserve historical CSS organization.

Classification is iterative. A row only needs deep classification when its group is next. Seed rows below are **discovered**. The classification column is a starting hypothesis.

| Implementation                                                                                                                                                                                                                                                                                                                                                                                       | Likely pattern group     | Status    | Provisional classification                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| [`quick-npc-build-card`](../../../apps/dashboard/src/features/character/npc/components/quick-npc/quick-npc-build-card.tsx)                                                                                                                                                                                                                                                                           | Selection or info card   | complete  | Quiet `Panel` + `RadioCardField` — not `SelectionOptionCard` shell                                                                                                                                                                                 |
| [`builder-fact-summary.tsx`](../../../apps/dashboard/src/features/character/components/builder/steps/shared/fact-summary/builder-fact-summary.tsx)                                                                                                                                                                                                                                                   | Information panel        | complete  | Declarative `Card`; layout utilities colocated in `builder-fact-summary.tsx` (variants file **deleted**)                                                                                                                                           |
| [`detail-collection-panel.variants.ts`](../../../apps/dashboard/src/features/content/lib/detail/collection/panel/detail-collection-panel.variants.ts)                                                                                                                                                                                                                                                | Information panel        | complete  | `Panel` + header/body bands (`detail-collection-panel.tsx`); not generic Card                                                                                                                                                                      |
| [`media-manager.variants.ts`](../../../apps/dashboard/src/features/media/components/media-manager.variants.ts)                                                                                                                                                                                                                                                                                       | Domain layout            | exception | Media library table shell — domain layout, not Card/InsetPanel duplicate (`media-manager.variants.ts`)                                                                                                                                             |
| [`global-search-results-panel.tsx`](../../../apps/dashboard/src/features/global-search/components/global-search-results-panel.tsx)                                                                                                                                                                                                                                                                   | Results panel            | exception | `GlobalSearchResultsPanel` — shared `Panel tone="quiet"` + `bleed` for page and topbar preview; placement stays local; `global-search-surface.variants.ts` **deleted**                                                                             |
| [`character-builder-validation-alert.tsx`](../../../apps/dashboard/src/features/character/components/builder/chrome/character-builder-validation-alert.tsx)                                                                                                                                                                                                                                          | Warning surface          | complete  | `Alert variant="destructive"` (`character-builder-validation-alert.tsx`)                                                                                                                                                                           |     |
| [`campaign-character-eligibility-alert.tsx`](../../../apps/dashboard/src/features/campaign/components/onboarding/campaign-character-eligibility-alert.tsx)                                                                                                                                                                                                                                           | Warning surface          | complete  | `Alert variant="destructive"`; embedded `CampaignCharacterWarningReview` — no nested Alert (`campaign-character-eligibility-alert.test.tsx`)                                                                                                       |
| [`spell-level-tabs.variants.ts`](../../../apps/dashboard/src/features/character/components/builder/steps/spells/spell-level-tabs.variants.ts)                                                                                                                                                                                                                                                        | Tabs                     | deferred  | **W10** — migrate to shared Tabs (`spell-level-tabs.variants.ts`)                                                                                                                                                                                  |
| [`table-grid.tsx`](../../../apps/dashboard/src/features/content/components/tables/table-grid.tsx)                                                                                                                                                                                                                                                                                                    | Table                    | exception | Table-builder domain surface alongside shared `Table` (`table-grid.tsx`, `table-builder` groups)                                                                                                                                                   |
| `dt`/`dd` in [`admin-user-detail.tsx`](../../../apps/dashboard/src/features/admin/routes/admin-user-detail.tsx), `review-step-summary.tsx`, preview rail section bodies                                                                                                                                                                                                                              | Key/value metadata       | deferred  | **W14** — `MetadataList` adoption (`review-step-summary.tsx`, preview rail bodies)                                                                                                                                                                 |
| Card consumers ([`equipment-hub.tsx`](../../../apps/dashboard/src/features/content/equipment/routes/equipment-hub.tsx), [`dashboard-home-starter-cards.tsx`](../../../apps/dashboard/src/routes/dashboard-home-starter-cards.tsx), [`homebrew-hub-card.tsx`](../../../apps/dashboard/src/features/homebrew/components/homebrew-hub-card.tsx), [`form-card.tsx`](../src/components/ui/form-card.tsx)) | Navigation / form chrome | complete  | Declarative `Card` (`header`, `footer`, `stretch`); resolver defaults `tone="strong"` + `elevation="flat"` + `comfortable` density. `SelectionOptionCard` defaults `elevation="raised"`. Campaign filled lists use `elevation="subtle"` via shell. |
| Notification preview item and bell footer links                                                                                                                                                                                                                                                                                                                                                      | List row                 | complete  | `NotificationPreviewItem` composes `interactiveRowVariants` + `--emphasis-fill` for unread; footer `Link` + `standaloneTextActionClasses` (`notification-bell-menu-body.tsx`)                                                                      |
| `field-row-anatomy-prototype.variants.ts`                                                                                                                                                                                                                                                                                                                                                            | Row anatomy              | complete  | Deleted; parity stories use `field-row-anatomy.variants.ts` (`field-row-width-parity.stories.tsx`)                                                                                                                                                 |
| Remaining bordered shells (see W2 table)                                                                                                                                                                                                                                                                                                                                                             | Mixed                    | complete  | Each former group example has a terminal row in the W2 table                                                                                                                                                                                       |
| [`link-badge.tsx`](../../../apps/dashboard/src/lib/link-badge.tsx) (`LinkBadge`, `StaticBadge`)                                                                                                                                                                                                                                                                                                      | Compact label navigation | complete  | Canonical `Badge asChild` + router `Link`; replaces `content-link-badge.tsx`                                                                                                                                                                       |
| [`array-item-issue.client.tsx`](../src/form/renderers/array/array-item-issue.client.tsx) (`ArrayItemIssueButton`)                                                                                                                                                                                                                                                                                    | Compact label action     | complete  | `resolveCompactLabelClassName` on `button` — not `Badge asChild` (`array-item-issue.test.tsx`)                                                                                                                                                     |
| [`notification-unread-badge.tsx`](../src/components/ui/notification-unread-badge.tsx)                                                                                                                                                                                                                                                                                                                | Overlay count            | exception | `ui-notification-unread-badge` — trigger overlay geometry, not `ui-compact-label`                                                                                                                                                                  |

## Per-wave acceptance checklist

Before marking a migration wave **Complete**:

- [ ] All in-scope consumers are classified.
- [ ] Semantic ownership and public APIs are established.
- [ ] Affected `*.variants.ts` files and exports have been audited.
- [ ] Static aliases replaced by semantic components or simple local layout have been removed.
- [ ] Genuine variant resolvers are retained without obsolete branches.
- [ ] Files with no remaining purpose have been deleted.
- [ ] No equivalent styling indirection has been introduced elsewhere.
- [ ] DevTools exposes clear semantic classes for reusable appearance and anatomy.
- [ ] Tests, stories, and documentation reflect the new contract.
- [ ] Remaining styling exceptions or deferrals are explicitly recorded.

**The success metric is less unnecessary styling architecture, not merely more semantic CSS.**

## Compact-label consumers grouped in W3

**W3 close-out (2026-10-22):** 12 **complete**, 0 **remediated** (named), 1 **exception**, 0 **deferred**.

| Surface / file                                       | Status    | Owner / evidence                                                                                             |
| ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `Badge` / `Chip` / `ChipGroup`                       | complete  | `ui-compact-label` + `ClassReference` — `badge.stories.tsx`, `chip.stories.tsx`, `compact-label.variants.ts` |
| `TableBadgeCell`                                     | complete  | `Badge size="sm"` — `data-table.client.tsx`                                                                  |
| `ValidationIssueCountBadge`                          | complete  | `Badge` counter layout; redundant `gap-1` removed — `validation-issue-count-badge.test.tsx`                  |
| `CatalogFilterChips` / `ChipsField` / combobox chips | complete  | `Chip` + existing `ui-compact-label--*` tests                                                                |
| `PreviewRailDraftBadge`                              | complete  | `Badge` — `preview-rail.client.tsx`                                                                          |
| `AvailabilityBadge`                                  | complete  | `Badge` — `availability-badge.tsx`                                                                           |
| `ContentStatusNameBadge`                             | complete  | `TableBadgeCell` — `content-status-name-badge.tsx`                                                           |
| `ContentEditHeadingBadges`                           | complete  | `Badge` — `content-edit-heading-badges.tsx`                                                                  |
| `EntitySummaryStatusItemView`                        | complete  | `Badge` + `resolveEntityRowInlineBadgeSize` — `entity-summary-status.tsx`                                    |
| `LinkBadge` / `StaticBadge`                          | complete  | Dashboard navigation metadata — `link-badge.tsx`, `link-badge.test.tsx`                                      |
| `ArrayItemIssueButton`                               | complete  | Compact-label primitive on action `button` — `array-item-issue.test.tsx`                                     |
| `ArrayLegendIssueLink`                               | complete  | Text destructive control (not Badge) — `array-item-issue.client.tsx`                                         |
| `notification-unread-badge`                          | exception | `ui-notification-unread-badge.css` — bell trigger count                                                      |

## Card-like shells grouped in W2

**W2 close-out (2026-10-21):** 14 **complete**, 8 **deferred**, 5 **exception**.

| Surface / file                                                                          | Status    | Owner / evidence                                                                                                                                         |
| --------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `builder-fact-summary`                                                                  | complete  | `Card` — `builder-fact-summary.tsx`                                                                                                                      |
| `detail-collection-panel`                                                               | complete  | `Panel` compose — `detail-collection-panel.tsx`                                                                                                          |
| `choice-section` empty body                                                             | complete  | `EmptyPanel` — `choice-section-flat-body.tsx`                                                                                                            |
| `species-rules-tab`                                                                     | complete  | `InsetPanel` — `species-rules-tab.tsx`                                                                                                                   |
| Hub navigation cards (`equipment-hub`, `homebrew-hub-card`, starter cards, `form-card`) | complete  | Declarative `Card` — see feature-local row                                                                                                               |
| `character-list-card`                                                                   | complete  | Declarative `Card` — `character-list-card.tsx`                                                                                                           |
| Campaign home invites / recovery                                                        | complete  | `Card` — `campaign-invitation-card.tsx`, `campaign-recovery-promotion-card.tsx`                                                                          |
| `character-detail` actions                                                              | complete  | `Panel` — `character-detail-combat-row.tsx` (`CharacterDetailActionsPanel`)                                                                              |
| `card-recipes` stories                                                                  | complete  | Story catalog of `Card` primitives — `card-recipes.stories.tsx`                                                                                          |
| `character-builder-validation-alert`                                                    | complete  | `Alert`                                                                                                                                                  |
| `campaign-character-eligibility-alert`                                                  | complete  | `Alert` + embedded warning review                                                                                                                        |
| `campaign-character-warning-review` (standalone)                                        | complete  | `Card tone="subtle"` for eligible-character review; embedded section is structured copy only                                                             |
| `ability-recommendation-panel`                                                          | complete  | `Alert` — `ability-recommendation-panel.tsx`                                                                                                             |
| Action blocker flat references                                                          | complete  | Modal header owns status; flat list without hand-rolled destructive panel — `action-blocker-references.tsx`                                              |
| `quick-npc-build-card`                                                                  | complete  | `Panel` + `RadioCardField` — `quick-npc-build-card.tsx`                                                                                                  |
| `fixed-scores-assignment`                                                               | complete  | Layout inlined; pool uses `InsetPanel` — `fixed-scores-assignment.tsx`                                                                                   |
| `spell-level-tabs`                                                                      | deferred  | **W10** — `spell-level-tabs.variants.ts`                                                                                                                 |
| `entity-card-frame`                                                                     | complete  | `dash-entity-card` + `entitySurfaceVariants` — `entity-card-frame.lib.ts`                                                                                |
| `content-detail-layout` hero / portrait                                                 | complete  | `Card tone="strong"`; hero portrait chrome local — `content-detail-layout.tsx`                                                                           |
| `review-step-summary` bordered blocks                                                   | deferred  | **W14** — `MetadataList` / `dt`/`dd`                                                                                                                     |
| Notification preview rows and bell story chrome                                         | complete  | `notification-preview-item.client.tsx`, `notification.stories.tsx`                                                                                       |
| Master-detail / sidebar / preview rail shells and master-detail stories                 | deferred  | **W15** — preview rail uses `rounded-card` directly (`preview-rail.variants.ts`); dialog border ownership completed in **W7**                            |
| `media-manager`                                                                         | exception | Domain table shell — `media-manager.variants.ts`                                                                                                         |
| `table-builder` / `table-grid` (including modal preview stories)                        | exception | Domain table authoring surface — `table-grid.tsx`                                                                                                        |
| `global-search-results-panel`                                                           | exception | Shared quiet results panel — `global-search-results-panel.tsx`; surface variants file deleted                                                            |
| `equipment-inventory`                                                                   | exception | Inventory `Panel` plus entity rows — `equipment-inventory-summary.tsx`                                                                                   |
| `global-search-topbar`                                                                  | exception | Search field and preview panel — placement inlined in `global-search-topbar.tsx`; preview footer link keeps full-width accent hover (not `ui-menu-item`) |

Selection-card shells wait for the option-card owner (**W8**). Entity preview frames wait for **W9**.
