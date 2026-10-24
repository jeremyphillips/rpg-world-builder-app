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

**Complete** means the semantic owner landed and that wave's ownership gate passed. The indirection baseline is remaining debt. It is not proof that a file has no empty `cva()`, and leftover empty `cva()` does not by itself reopen a Complete wave.

**Styling-indirection audit (per wave):** remove static aliases and empty `cva()` / zero-argument class wrappers; inline fixed classes at the owning element; keep conditional resolvers; do not apply foreign element classes without a recorded contract; update ClassReference; record Deleted / Simplified / Retained / Deferred. Finishing semantic CSS does not close the separate Tailwind static-CVA backlog (form array helpers). Residual catalog pass: `data-table.variants` **simplified** (filter `type`, advanced `cols`, cell `role`, and destructive row actions retained); `data-table-filter-region.variants` and `data-table-utility-bar.variants` **deleted**; `content-card.variants` **simplified**; `entity-row-list.variants` **deleted**; `media-crop-editor.variants` and `media-emblem-editor.variants` **deleted**. Permanent policy: [ui-architecture.md](./ui-architecture.md). Regression guard: `semantic-styling-indirection.test.ts` walks production `*.ts` / `*.tsx` under `packages/ui/src`, `apps/dashboard/src`, `apps/bench/src`, `apps/public/src`, and `packages/campaign-invite/src` (stories and tests excluded). Hits are keyed by file, symbol, and violation type in `semantic-styling-indirection.baseline.json`. Shrink that baseline when a hit is removed. Do not replace a removed key with a different symbol or violation type in the same file. `panelSectionInsetClasses` is the permanent allowlist exception.

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

| #   | Target                                                                          | Architecture readiness | Blockers / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Drift eliminated                                                   | Priority | Wave     |
| --- | ------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------- | -------- |
| 1   | InteractiveRow / InteractiveList                                                | Complete (2026-10-22)  | Shared `--ui-surface-*` ladder on rows; `interactive-row.variants` **simplified**; `notification-preview-item.variants` / `notification-menu-row.variants` **deleted**; footer links → `standaloneTextActionClasses`.                                                                                                                                                                                                                                                                                                                                              | High: combobox, listbox, DataTable body rows, notification preview | 1        | W1       |
| 2   | Card / InsetPanel ownership                                                     | Complete (2026-10-22)  | Residual pass: `empty-panel.variants` **deleted** (specs only); `inset-panel.variants` **simplified**; `card.variants` **simplified** (resolver retained); `detail-collection-panel` and global-search topbar/preview static files **deleted**. `builder-fact-summary.variants.ts` remains a const-only module (decision required, not deleted). `table-builder` / `table-grid` is a domain **exception**.                                                                                                                                                         | High: most hand-rolled feature surfaces                            | 2        | W2       |
| 3   | CompactLabel / Badge / Chip                                                     | Complete (2026-10-22)  | Residual: `compact-label.variants` **simplified**; `badge.variants` **retained** (`badgeLayoutVariants`); `notification-unread-badge.variants` **deleted**. `ui-notification-unread-badge` exception unchanged.                                                                                                                                                                                                                                                                                                                                                    | High: many Badge consumers and domain badge wrappers               | 3        | W3       |
| 4   | Popover / DropdownMenu / Tooltip content                                        | Complete (2026-10-22)  | Residual: `popover-content.variants` **simplified**; `dropdown-menu-choice.variants` **simplified**; `entity-action-choice-menu.variants` **deleted**; `tooltip-trigger.variants` **retained**. Rich choice geometry stays on `dropdownMenuChoiceItemVariants`, not base `ui-menu-item`.                                                                                                                                                                                                                                                                           | High: every overlay host                                           | 4        | W4       |
| 5   | Typography roles (Text, field label/legend/hint/error)                          | Complete (composites)  | `textVariants` **retained**. Follow-up: bare `text-xs` in legacy `*.variants.ts` (not in W2–W6 residual scope).                                                                                                                                                                                                                                                                                                                                                                                                                                                    | High in volume, low per site                                       | 5        | W5       |
| 6   | Alert                                                                           | Complete (2026-10-22)  | Residual: `alert.variants` **simplified** (`alertVariants` retained; static title/description CVAs removed).                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Med                                                                | 6        | W6       |
| 7   | DialogPanel panel chrome (Modal, Sheet)                                         | Complete (2026-10-22)  | Shared semantic fill + geometry + neutral strength; Radix animation/placement remain modality-owned. Deleted `cardBorderClasses`, `sheetBodyVariants`, static overlay CVA, and warm `card-border` token/utility. Body clip shells live on `DialogPanelBody` (utility `cn()` order). Section inset, scroll, header, and footer tokens **retained**. W15 shells closed in W15A–C.                                                                                                                                                                                    | Med                                                                | 7        | W7       |
| 8   | Option-card shell (SelectionOptionCard, RadioCard)                              | Complete (2026-10-22)  | `RADIO_CARD_CLASS_SPECS` + ClassReference on RadioCard; `radio-card.variants` **simplified** (`radioCardGroupGapVariants`, `radioCardControlVariants` retained); `selection-option-card.lib` **simplified** (resolvers only); indicator/icon/details/leading geometry in `ui-radio-card.css`. `fixed-scores-assignment.variants` **deleted**. `AbilityScoreCard` **exception** (domain score tile).                                                                                                                                                                | Med–High                                                           | 8        | After W2 |
| 9   | IdentityFrame / IdentityRow, then EntityCardFrame, EntityCard static/disclosure | Complete (2026-10-22)  | `ui-identity-frame.css` + size/shape/fit modifiers; `identity-row.variants` **simplified**; `entity-card-frame.variants` **deleted** → `entity-card-frame.lib`; disclosure/catalog washes on `dash-entity-card__body--*` (catalog **subtle**); `content-detail-layout.variants` **deleted**; hero `Card tone="strong"`. `catalog-card.variants` / `entity-card-disclosure-renderer.variants` **deleted**. `content-card.variants` **simplified** (density and chrome retained). `entity-row-list.variants` **deleted**; group separator is `dash-entity-row-list`. | Med                                                                | 9        | After W2 |
| 10  | Tabs                                                                            | Complete (2026-10-22)  | `tabs.css` + `line` / `pill` / `none`; `tabs.variants` **simplified**; `ui-compact-control--tabs-pill` **deleted**; `spell-level-tabs` domain composition on `none` + `spell-level-tabs.css`; `spell-level-tabs.variants` **deleted**                                                                                                                                                                                                                                                                                                                              | Low–Med                                                            | 10       | W10      |
| 11  | StatusIcon, Wizard, FilterBar / CatalogToolbar                                  | Complete (2026-10-22)  | `status-icon.variants` **simplified**; `wizard.variants` **simplified**; `filter-bar.variants` **simplified**; `catalog-toolbar.variants` **deleted**; `catalog-filter-controls.variants` **deleted**; `combobox-filter-toolbar.variants` **deleted**; `catalog-picker-filter-toolbar.variants` **deleted**. DataTable filter-region shell is `ui-data-table__filter-region`.                                                                                                                                                                                      | Low–Med                                                            | 11       | W11      |
| 12  | DataTable row and header bands                                                  | Complete (2026-10-22)  | Native `tr`/`th`/`td` in `Table`; `data-table.css` bands, table wrap, thumbnail, filter region, and utility bands. `data-table.variants` **simplified** (`type`, `cols`, cell `role`, destructive row actions **retained**). `data-table-filter-region.variants` and `data-table-utility-bar.variants` **deleted**. Columns panel uses `popoverContentVariants`. Unavailable helpers in `data-table-band.lib.ts`.                                                                                                                                                  | Med                                                                | 12       | W12      |
| 13  | FieldGroup chrome                                                               | Complete (2026-10-22)  | `field-group-chrome.css` + `field-rail.css`; `field-group-chrome.variants` **simplified**; `field-rail.variants` **simplified**; lift realignment (`popover` menu, sheet fill, preview rail, media manager) → `--surface-lift`; `portalDropdownSurfaceClasses` **deleted**; `field-container` dialog fill removed; form field shells keep `--field-container` alias.                                                                                                                                                                                               | Low–Med                                                            | 13       | W13      |
| 14  | MetadataList                                                                    | Complete (2026-10-22)  | `metadata-list.css`; `metadata-list.variants` **simplified** (conditional modifiers only). Adopters: preview-rail facts, media file metadata, campaign create review, card-recipe meta, admin user detail. Purpose-built `dt`/`dd` stay exceptions (see W14 close-out). `content-stat-row.variants` **retained** for the hero grid.                                                                                                                                                                                                                                | Med (aligned readouts)                                             | 14       | W14      |
| 15A | PreviewRail                                                                     | Complete (2026-10-22)  | `preview-rail.variants` **simplified** (chrome inset and layout). Card chrome is `Panel` quiet bleed. Plain chrome defers the perimeter to `Sheet`. Width stays on the placement column. Identity row uses `ui-identity-row--comfortable`. See W15 close-out.                                                                                                                                                                                                                                                                                                      | Low                                                                | 15A      | W15A     |
| 15B | Master-detail shells                                                            | Complete (2026-10-22)  | List and editor stay `Panel` quiet bleed. Perimeter override dropped. Rows stay quiet interactive `Card`. Availability dot stays 6px. Viewport cap stays. `master-detail-rail`, `grid`, `editor-panel`, and availability-header variants **deleted**. List-row variants **retained**.                                                                                                                                                                                                                                                                              | Low                                                                | 15B      | W15B     |
| 15C | App navigation sidebar                                                          | Complete (2026-10-22)  | Dashboard and bench sidebars stay separate. `sidebar.variants` **simplified** (`open` retained). `sidebar-nav-item.variants` **retained**. Disclosure variants **simplified** (caret `expanded` retained). Primary nav composes `boundedScrollRegionClasses`.                                                                                                                                                                                                                                                                                                      | Low                                                                | 15C      | W15C     |
| 16  | Avatar, Toast tone, AttentionFrame, SemanticText                                | Complete (2026-10-22)  | `avatar.variants` **simplified**. `toast.variants` **simplified** (tone only; default is `ui-border--default`; six static CVAs deleted). `attention-frame.variants` **deleted**. `semantic-text.variants` **simplified** (tone and emphasis). Leading-frame avatar keeps `size-full rounded-none`. `text-sm` on SemanticText stays a utility override. See W16 close-out.                                                                                                                                                                                          | Low                                                                | 16       | W16      |
| —   | Heading, Eyebrow, text-action, prose, InlineMetadata, layout orchestrators      | N/A                    | Already concise, or not styling owners                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                                                                  | Skip     | —        |

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
- Remaining empty `cva()` calls are baseline debt. They do not block **complete** once the semantic owner has landed.

A **deferred** styling disposition requires a named future wave or follow-up and a precise unresolved responsibility.

An **exception** must justify why the existing implementation is architecturally appropriate. It cannot be used merely to preserve historical CSS organization.

Classification is iterative. A row only needs deep classification when its group is next. Seed rows below are **discovered**. The classification column is a starting hypothesis.

| Implementation                                                                                                                                                                                                                                                                                                                                                                                       | Likely pattern group     | Status    | Provisional classification                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| [`quick-npc-build-card`](../../../apps/dashboard/src/features/character/npc/components/quick-npc/quick-npc-build-card.tsx)                                                                                                                                                                                                                                                                           | Selection or info card   | complete  | Quiet `Panel` + `RadioCardField` — not `SelectionOptionCard` shell                                                                                                                                                                                 |
| [`builder-fact-summary.tsx`](../../../apps/dashboard/src/features/character/components/builder/steps/shared/fact-summary/builder-fact-summary.tsx)                                                                                                                                                                                                                                                   | Information panel        | complete  | Declarative `Card`. `builder-fact-summary.variants.ts` remains a const-only module (decision required, not deleted)                                                                                                                                |
| [`detail-collection-panel.variants.ts`](../../../apps/dashboard/src/features/content/lib/detail/collection/panel/detail-collection-panel.variants.ts)                                                                                                                                                                                                                                                | Information panel        | complete  | `Panel` + header/body bands (`detail-collection-panel.tsx`); not generic Card                                                                                                                                                                      |
| [`media-manager.css`](../../../apps/dashboard/src/features/media/components/media-manager/media-manager.css)                                                                                                                                                                                                                                                                                         | Domain layout            | exception | Retained exception: media-library composition, not Card, InsetPanel, or an option card. `media-manager.variants.ts` **deleted**; scroll contract commented in `media-manager.css`                                                                  |
| [`global-search-results-panel.tsx`](../../../apps/dashboard/src/features/global-search/components/global-search-results-panel.tsx)                                                                                                                                                                                                                                                                   | Results panel            | exception | `GlobalSearchResultsPanel` — shared `Panel tone="quiet"` + `bleed` for page and topbar preview; placement stays local; `global-search-surface.variants.ts` **deleted**                                                                             |
| [`character-builder-validation-alert.tsx`](../../../apps/dashboard/src/features/character/components/builder/chrome/character-builder-validation-alert.tsx)                                                                                                                                                                                                                                          | Warning surface          | complete  | `Alert variant="destructive"` (`character-builder-validation-alert.tsx`)                                                                                                                                                                           |     |
| [`campaign-character-eligibility-alert.tsx`](../../../apps/dashboard/src/features/campaign/components/onboarding/campaign-character-eligibility-alert.tsx)                                                                                                                                                                                                                                           | Warning surface          | complete  | `Alert variant="destructive"`; embedded `CampaignCharacterWarningReview` — no nested Alert (`campaign-character-eligibility-alert.test.tsx`)                                                                                                       |
| [`spell-level-tabs.tsx`](../../../apps/dashboard/src/features/character/components/builder/steps/spells/spell-level-tabs.tsx)                                                                                                                                                                                                                                                                        | Tabs                     | complete  | `Tabs variant="none"` + feature `spell-level-tabs.css`; variants file **deleted**                                                                                                                                                                  |
| [`table-grid.tsx`](../../../apps/dashboard/src/features/content/components/tables/table-grid.tsx)                                                                                                                                                                                                                                                                                                    | Table                    | exception | Table-builder domain surface alongside shared `Table` (`table-grid.tsx`, `table-builder` groups)                                                                                                                                                   |
| `dt`/`dd` readouts: [`admin-user-detail.tsx`](../../../apps/dashboard/src/features/admin/routes/admin-user-detail.tsx), preview rail facts, media file metadata, campaign create review, card-recipe meta                                                                                                                                                                                            | Key/value metadata       | complete  | **W14** — `MetadataList`. Admin and review lists drop stacked or fixed-width geometry on purpose. Review tiles, stat tiles, narrative, proficiencies, selection summary, field derived meta, and hero groups stay exceptions.                      |
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
| `builder-fact-summary`                                                                  | complete  | `Card` — `builder-fact-summary.tsx`. Variants module remains (decision required)                                                                         |
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
| `spell-level-tabs`                                                                      | complete  | `Tabs variant="none"` + `spell-level-tabs.css` — `spell-level-tabs.tsx`                                                                                  |
| `entity-card-frame`                                                                     | complete  | `dash-entity-card` + `entitySurfaceVariants` — `entity-card-frame.lib.ts`                                                                                |
| `content-detail-layout` hero / portrait                                                 | complete  | `Card tone="strong"`; hero portrait chrome local — `content-detail-layout.tsx`                                                                           |
| `review-step-summary` bordered blocks                                                   | exception | Stat tiles and a 2-column stack of bordered pairs — not an aligned `MetadataList` (`review-step-summary.tsx`)                                            |
| Notification preview rows and bell story chrome                                         | complete  | `notification-preview-item.client.tsx`, `notification.stories.tsx`                                                                                       |
| Master-detail / sidebar / preview rail shells                                           | complete  | **W15A–C** — see the W15 close-out. Viewport cap stays `master-detail-list-scroll.utilities.css`.                                                        |
| `media-manager`                                                                         | exception | Media-library composition — `media-manager.tsx`; variants file **deleted**; scroll contract in `media-manager.css`                                       |
| `table-builder` / `table-grid` (including modal preview stories)                        | exception | Domain table authoring surface — `table-grid.tsx`                                                                                                        |
| `global-search-results-panel`                                                           | exception | Shared quiet results panel — `global-search-results-panel.tsx`; surface variants file deleted                                                            |
| `equipment-inventory`                                                                   | exception | Inventory `Panel` plus entity rows — `equipment-inventory-summary.tsx`                                                                                   |
| `global-search-topbar`                                                                  | exception | Search field and preview panel — placement inlined in `global-search-topbar.tsx`; preview footer link keeps full-width accent hover (not `ui-menu-item`) |

Selection-card shells landed with the option-card owner (W8). Entity preview frames landed with W9.

## Metadata lists grouped in W14

**W14 close-out (2026-10-22):** aligned read-only lists use `MetadataList`. Remaining `dt`/`dd` are purpose-built exceptions. Rechecked 2026-10-22.

| Surface                                                                              | Status    | Decision                                                                                                              |
| ------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `ContentStatList`, `BuilderOptionDetailsSheet`                                       | complete  | Unchanged defaults: ruled, label emphasis, content track                                                              |
| Preview rail facts                                                                   | complete  | Dropped the 50/50 split. `fill`, value emphasis, `sm` gap; comfortable uses `rowGap` md; compact is `xs`              |
| Media file metadata                                                                  | complete  | Caption grid becomes `xs`, `sm` gap, value emphasis, `fill`. `aria-labelledby` stays on the `dl`                      |
| Campaign create review                                                               | complete  | `sm`, value emphasis, no rule; dropped the fixed 10rem label column                                                   |
| Card recipe meta                                                                     | complete  | `xs`, `fill`, no rule. Values use the shared muted value color                                                        |
| Admin user detail                                                                    | complete  | Both lists leave the stacked caption-over-value layout. `sm`, value emphasis, `fill`. Links sit inside the value `dd` |
| Character review tiles and stat tiles                                                | exception | Bordered stacks in a 2- or 3-column wrap (`review-step-summary.tsx`, preview combat and ability grids)                |
| Narrative and class proficiencies                                                    | exception | Label above value, including rich text and choice links                                                               |
| Wizard and entity-disclosure stories                                                 | exception | Story fixtures (colons, or a 2-column stack)                                                                          |
| `SelectionSummaryCard`, `FieldDerivedMeta`, hero stat rows                           | exception | Other owners: action column, per-row field meta, measured multi-group hero grid                                       |
| Fact-summary icon rows, equipment tier summary, quick NPC choices, spell progression | exception | Leading icon, end-aligned numbers, interactive subgrid, or per-row form grids                                         |

## Avatar, toast, attention, and semantic text grouped in W16

**W16 close-out (2026-10-22):** each primitive owns its appearance. CVA maps props to modifiers.

| Surface                     | Status     | Decision                                                                                            |
| --------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `avatar.variants`           | simplified | `ui-avatar--{sm,md,lg}` own size and initials type                                                  |
| Detail-row leading avatar   | exception  | `size-full rounded-none` stays; IdentityFrame owns the slot                                         |
| `toast.variants`            | simplified | Quiet fill. Default is `ui-border--default`. Status tones own border color. Six static CVAs deleted |
| Toast motion                | exception  | `toastMotionClasses` stays utilities (Radix swipe variables)                                        |
| `attention-frame.variants`  | deleted    | `ui-attention-frame` plus conditional `--active` on the element                                     |
| `semantic-text.variants`    | simplified | Tone and emphasis only. Xs type and `--icon-inline` live on the block                               |
| SemanticText `text-sm`      | exception  | Utility override on the element, including character-import previews                                |
| Preview-rail status         | exception  | `shrink-0` stays local layout, not a size                                                           |
| `inlineIconFlexSlotClasses` | deleted    | Icon slot is `ui-semantic-text__icon`                                                               |

## Preview rail, master-detail, and app sidebars grouped in W15

**W15 close-out (2026-10-22):** each shell keeps its existing owner. No shared rail.

| Surface                     | Status     | Decision                                                                |
| --------------------------- | ---------- | ----------------------------------------------------------------------- |
| `preview-rail.variants`     | simplified | Chrome inset and layout only. Bands live in `preview-rail.css`          |
| PreviewRail card chrome     | complete   | `Panel` quiet bleed. Radius and perimeter follow Panel                  |
| PreviewRail plain chrome    | exception  | Sheet owns the perimeter                                                |
| Preview column width        | exception  | Placement owns 280px / 21rem. Rail max-width exports deleted            |
| Identity row density        | complete   | `ui-identity-row--comfortable` replaces `ui-card--comfortable`          |
| Master-detail shells        | complete   | Quiet bleed Panel. Subtle perimeter override removed                    |
| Master-detail rows          | retained   | Quiet interactive Card. Not `InteractiveList`                           |
| Availability dot            | exception  | 6px span. Not `StatusDot`                                               |
| Viewport cap                | retained   | `master-detail-list-scroll.utilities.css`                               |
| Editor title                | deferred   | `text-lg font-medium` stays with the W5 residual                        |
| `sidebar.variants`          | simplified | `open` on the aside and overlay. Brand, host, and scroll inlined        |
| `sidebar-nav-item.variants` | retained   | Shared by dashboard and bench                                           |
| Disclosure variants         | simplified | Caret `expanded` only. Campaign sections stay off `NavSection`          |
| Bench sidebar               | exception  | Separate static column. No overlay and no `w-sidebar` in this close-out |
| Sidebar scroll              | deferred   | Ad hoc `scrollbar-slim`. Bounded scroll adds `pe-2.5`                   |

## Shell ownership (frozen at P0)

Frozen 2026-10-23. Do not reopen a **(settled)** boundary or a B1 block split without new evidence. Dispositions below are the contract for later waves. B1 block classes are applied. B4 master-detail defaults are applied. Shell and form one-token alias inlines stay deferred.

Precedence used for every later relocation: within the established cascade layers, utility declarations override component declarations when targeting the same property on the same element. Custom-property inheritance, element scope, inline styles, and specificity within a layer remain relevant. Moving a declaration from `@layer utilities` into `@layer components` lowers its precedence on that element. A custom property is inherited from the element's DOM ancestors. A portal inherits from the node it is mounted under. Radix `Sheet`, `Dialog`, and popovers in this repo use the default container, `document.body`, so page-level variables do not reach them. A portal given another container inherits from that container instead.

### Ownership matrix

| Owner                                                   | What it owns                                                                                                                                                                                                                                                                                                                                                  | Disposition                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AppShell** (`app-shell.variants.ts`, `app-shell.tsx`) | Frame, content column, sticky chrome, `<main>`, breadcrumb rail. Document scroll by default; `<main>` is never a scrollport **(settled, feature-conventions)**. `sm` gutter. `:has([data-viewport-fill=workspace])` height lock. Publishes `--app-sticky-chrome-block-size`. The list utility resolves `--rpg-content-top-inset`; `<main>` does not alias it. | `dash-app-shell` block                                                                                                                                                                  |
| **PageShell and page spacing**                          | Width, inset, and rhythm prop resolvers **(settled, feature-conventions; ui-architecture)**.                                                                                                                                                                                                                                                                  | Retained. No block. Delete only the unused `page-top` inset key.                                                                                                                        |
| **ViewportWorkspace**                                   | Anonymous flex fill plus the `data-viewport-fill` marker.                                                                                                                                                                                                                                                                                                     | Retained. No block. Delete the dead `APP_STICKY_CHROME_BLOCK_SIZE_VAR`.                                                                                                                 |
| **ContentFormPageShell**                                | `PageShell` root stays `PageShell`. The styled element this shell owns is the wide-only body `<div>` (React decides when it renders). That body owns one contract: `--rpg-page-heading-inset: 4rem`.                                                                                                                                                          | Minimal `dash-content-form-page` block on that existing body. Block CSS carries only the contract. Anonymous `flex min-h-0 flex-1 flex-col` stays inline. No new elements or modifiers. |
| **Form chrome** (`@rpg/ui/form`)                        | Four blocks, frozen below.                                                                                                                                                                                                                                                                                                                                    | See B1 boundaries.                                                                                                                                                                      |
| **CharacterBuilderPageShell**                           | Route host. Owns `ViewportWorkspace` plus `PageShell` exactly once **(settled, character README; ownership test)**.                                                                                                                                                                                                                                           | No block. Inline its one class at the owner and delete the variants file.                                                                                                               |
| **CharacterBuilderShell**                               | 3-column grid, header, `--character-builder-header-rail-gap` (consumed only inside this shell), and the step-rail accent, which stays host-owned **(settled, semantic-style-layers)**.                                                                                                                                                                        | `dash-character-builder` block, separate from the page shell.                                                                                                                           |
| **Master-detail**                                       | Panel quiet bleed, the viewport cap in `master-detail-list-scroll.utilities.css`, and retained rows **(settled, W15B)**.                                                                                                                                                                                                                                      | No block. Static defaults move into the existing utilities CSS.                                                                                                                         |
| **Out of scope**                                        | Messages workspace, DrawerShell **(settled, drawer-shell.md)**, DetailPageHeader, in-page section nav (reads variables only).                                                                                                                                                                                                                                 | Deletions only, where the deletion inventory names them.                                                                                                                                |

`contentFormPageShellHeadingClasses` is unused. It is not the page heading's styling owner.

`formViewportScrollBodyTopInsetClasses` is `pt-8`. Dashboard `pageShellInsetTopClasses` is `pt-6`. The viewport-bound form scroller is `ScrollBoundaryRegion` plus `formStickyScrollBodyScrollViewportClasses`. `formStickyScrollBodyScrollerClasses` is a legacy alias the runtime does not apply.

### B1 block boundaries

**1. `ui-tabbed-form`.** Renders from `TabbedForm` only when `aside && !externalFooter`. Grid → `ui-tabbed-form`. Form column → `__body`. Aside slot → `__aside`. Owns the two-column composition (`xl` / `2xl` tracks, aside hidden until `xl`, aside insets). Publishes and consumes no variables. No nesting observed; dashboard content forms render the aside. Separate because this is layout beside a rail, not scrolling or the footer. In docked mode, `__body` also carries `ui-form-docked-shell`. Both rules sit in `@layer components`. Their only overlap is `display: flex; flex-direction: column`, with identical values. Keep that overlap identical.

**2. `ui-form-docked-shell`.** One shared contract. The same class constant, `formStickyScrollShellWithDockedFooterClasses`, is applied at three owners: `TabbedForm` (one column wrapper — `ui-tabbed-form__body` plus the shell when `aside` is set, shell only otherwise), `FormShellChildren` (the `Form` docked path), and `CharacterBuilderFormColumn` (dashboard). Owns the flex column (scroll body above, docked bar below) and publishes:

- `--rpg-form-docked-actions-bar-block-size: 69px`
- `--rpg-content-floor-gap: 1rem`
- `--rpg-form-viewport-scroll-body-top-inset: 2rem`
- `--rpg-form-identity-header-block-size: 8rem`
- `--rpg-form-sticky-tabs-block-size: 3rem`
- `--rpg-form-docked-scroll-top-chrome-inset` (the sum of the three above)
- `--rpg-content-bottom-inset`

Consumers: `master-detail-list-scroll.utilities.css` (bottom inset, floor gap, and docked top-chrome inset; the list resolves the viewport top total itself); `master-detail-list-panel.layout.ts` (`top-[var(--rpg-form-sticky-tabs-block-size,0px)]`); the docked actions bar's `min-height`. The tabs block size lives on this shell because master-detail lists render inside panels that are siblings of the tab row. One CSS rule; the three owners are consumers. `TabbedForm` shares one `formColumnContent` fragment for aside and non-aside layouts. `CharacterBuilderFormColumn` applying a `ui-*` block from the dashboard is a documented cross-owner contract. No wrapper component. A nested docked shell re-declares the same absolute values, including form scroll chrome, so the list's viewport total counts that chrome once. Forms inside `Sheet` / `Dialog` are portaled, so they do not inherit page contracts (`--rpg-content-*` falls back to `0px`). P0 did not find a docked shell inside a portal. The content-form drawer story renders a dialog and does not apply the docked-shell contract (`externalFooter`). Player-character create applies the docked shell in the page tree, outside `AppShell`. The local bench had no tickets, so the portaled ticket sheet was not captured.

**3. `ui-form-sticky-tabs`.** Renders from `TabbedFormPanels`, on the tab-row `<div>` when `stickyChrome` is set. Anonymous nav-overflow and with-trailing layout stay inlined on that element. `stickyTabsClassName` is the consumer override; the bench ticket sheet passes the transparent preset, which becomes the `--transparent` modifier. Owns sticky `top-0`, `z-20`, the backdrop fill, and the transparent variant. Publishes and consumes no variables. Sticky positioning resolves against the nearest scrollport (the docked scroll viewport in docked mode, otherwise the document). Separate because a different component renders it and it has its own variant. It does not depend on docked mode.

**4. `ui-form-actions-bar`.** Renders from `FormActionsBar`, on its `<div role="toolbar">`. `placement` selects `--sticky` or `--docked`. The existing `className` passthrough stays. Owns border, fill, padding, and sticky versus docked behavior. `--docked` reads `min-height: var(--rpg-form-docked-actions-bar-block-size)`. Today the bar also re-declares the 69px value on itself. To keep one value, declare it once in a selector list: `.ui-form-docked-shell, .ui-form-actions-bar--docked { --rpg-form-docked-actions-bar-block-size: 69px }`. The docked bar is a direct child of a docked shell at every mount, including `CharacterBuilderFooter`. Separate because `FormActionsBar` renders it in both sticky and docked modes.

**Not a block.** The scroll clip and viewport stay `FormStickyScrollBody` plus `ScrollBoundaryRegion`. `form-scroll-body-container` stays a `@utility` because master-detail's `@container form-scroll-body` depends on it. The non-docked `formStickyScrollShellClasses` is anonymous layout and is inlined.

### B4 master-detail defaults (complete)

Static contract defaults moved into `master-detail-list-scroll.utilities.css`:

- `--master-detail-list-chrome-block-size: 5.5rem` on `@utility master-detail-list-shell-viewport-cap` (same element as before: the list `nav` shell).
- `--master-detail-list-max-block-size: 28rem` on `@utility master-detail-grid`, applied by `MasterDetailGrid`.

Inventory: production declares `28rem` only on `MasterDetailGrid`. Story wrappers set `12rem` on an ancestor, but the grid's self-declaration shadows that ancestor, so stories still resolve `28rem` until hosts stop using the grid default. A utility fallback (`var(--master-detail-list-max-block-size, 28rem)` on the viewport cap only) would let ancestor overrides win and would change story parity; the grid-scoped utility preserves observed behavior.

Deleted: Tailwind arbitrary-property strings for those defaults, `masterDetailListLayoutClasses` (tests import the shell and scroll constants directly). The temporary ratchet bucket is empty after B4.

### Content top inset (resolved)

Owners publish contributions. The master-detail list utility is the only declaration of `--rpg-content-top-inset`. That value is the layout-viewport total a `100dvh` cap subtracts: `--app-sticky-chrome-block-size` + `--rpg-page-heading-inset` + `--rpg-form-docked-scroll-top-chrome-inset`, each falling back to `0px`. It is not a coordinate inside a nested scrollport.

| Contribution       | Variable                                    | Where it is published                                        |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------ |
| App chrome         | `--app-sticky-chrome-block-size`            | `.dash-app-shell` (`calc(3rem + 2rem)`)                      |
| Page heading       | `--rpg-page-heading-inset`                  | `.dash-content-form-page` (`4rem`), wide viewport forms only |
| Form scroll chrome | `--rpg-form-docked-scroll-top-chrome-inset` | `.ui-form-docked-shell` (`2rem + 8rem + 3rem`)               |

`--rpg-content-bottom-inset` stays on the docked shell. Outside `form-scroll-body`, list `max-height` is `min(content cap, 100dvh - top total - bottom inset)`. Inside the container, used `max-height` is `min(content cap, 100cqh - form scroll chrome - floor gap)` and does not subtract the viewport total or the bottom inset. The clip is already below app chrome and above the docked bar. Min-height floors still read `--master-detail-shell-max-block-size`.

**Before the fix** (2026-10-23, after B2, `xl` 1280×900, Kobold Warrior edit). `<main>` computed `calc(3rem + 2rem)`. The wide body and docked shell each declared `--rpg-content-top-inset` in terms of itself, so the property was guaranteed-invalid there and on the traits list. The dvh term used `0px` for the top inset. Bottom inset and form scroll chrome still resolved. Inside the form scroll container, used `max-height` was the container path (526px at 900px viewport height, 106px at 480px). Outside the container at 480px, the dvh branch beat the 536px content cap (395px) while still ignoring form chrome.

A source scan rejects any declaration of `--rpg-content-top-inset` whose value reads `var(--rpg-content-top-inset`. Geometry is covered by `master-detail-content-top-inset.contract.test.ts` (Playwright Chromium via `@rpg/ui/test-utils` `launchHeadlessChromium`).

### Tailwind custom-property utility ratchet (G)

Occurrence-level guard for Tailwind arbitrary-property declarations (`[--name:value]`) in `packages/ui/src`, `apps/dashboard/src`, and `apps/bench/src` (excluding `*.test.*`, `*.stories.*`, and CSS). `var(--x)` reads and inline `style` objects are out of scope.

Regression: `tailwind-custom-property-declaration.test.ts` with `tailwind-custom-property-declaration.baseline.json`.

| Bucket        | Policy                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **temporary** | Shell migration utilities (B1–B4). Counts may shrink as waves land; update the baseline when they do. Must be empty after B4. |
| **approved**  | Frozen exceptions (owner file, category, reason, count). Counts must not grow; new entries require an explicit baseline edit. |

**Approved exceptions:**

| File                                | Variable(s)                                                 | Category         |
| ----------------------------------- | ----------------------------------------------------------- | ---------------- |
| `surface-current.lib.ts`            | `--surface-current`                                         | variant-resolver |
| `field-control-surface.variants.ts` | `--field-control-bg`                                        | variant-resolver |
| `rich-text-content.variants.ts`     | `--tw-prose-body`, `--tw-prose-headings`, `--tw-prose-bold` | plugin-api       |
| `ticket-card.variants.ts` (bench)   | `--icon-size`                                               | local-layout     |

### Parity baseline

Capture script, surface list, and JSON baselines live in `.tmp/shell-parity/` and are not committed. Rendering: light theme, `prefers-reduced-motion: reduce`, DPR 1, viewport height 900px, sidebar default. Viewports 390, 768, 1280, and 1536. Each capture is at scrollTop 0 and at the active scrollport's maximum.

- **`p0-baseline.json`** — frozen pre-BEM / pre-F1 snapshot (historical).
- **`post-f1-baseline.json`** — current gate after F1 inset resolution (2026-10-24 re-capture). Compare fresh captures with `node regress.mjs post-f1-baseline.json regression-capture.json`.
- **`regress.mjs`** third argument: `strict` (computed + variables + rects + behavior) or `geometry` (presence, tag, rects, docked-shell counts, behavior). Expect **strict** and **geometry** to fail vs `p0-baseline.json` on inset contract fields; **0** rect diffs is the layout bar. Post-F1 summary: `post-f1-parity-summary.json`.

Captured: fighter edit (preview rail), Kobold Warrior traits and actions, PC create, NPC create, campaign settings, messages, nested-resource master-detail story, Character builder shell story, and the content-form drawer story. At `xl` and `2xl` the preview rail is visible (280px, then 336px) and the compact Preview control is `display: none`. Below `xl` the rail box is 0×0 and the compact control is visible. Not captured: campaign onboarding (the agent campaign's `viewerState.kind` is `ready`) and the bench ticket sheet (no local tickets). PC create is mounted outside `AppShell`.
