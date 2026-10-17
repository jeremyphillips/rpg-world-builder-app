---
name: new-content-type
description: >-
  Playbook for adding or auditing a top-level catalog content type — contracts
  keys, @rpg/catalog seeds, API registration, dashboard wiring, integration
  manifest, and drift checks. Use when spinning up a new type or checking layer
  completeness. Policy depth → docs/content-types.md.
---

# New Content Type

End-to-end wiring for **top-level** catalog content types (`ContentTypeKey`).
**Inspect current project sources** — manifest, registries, and drift tests are
truth.

Full checklist and file matrix → [reference.md](./reference.md). Policy depth
(delete, draft/publish, duplication, traits, vocab) →
[`docs/content-types.md`](../../../docs/content-types.md).

---

## When to use

| Situation                                             | Use this skill  |
| ----------------------------------------------------- | --------------- |
| Add a new catalog type (list + detail + API registry) | **Create mode** |
| “Is `<type>` fully wired?” / audit layer completeness | **Audit mode**  |
| Verify manifest + drift after partial work            | **Audit mode**  |

## When not to use

| Situation                                                   | Instead                                                                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Nested resource under a parent (subclasses)                 | [`docs/content-types.md`](../../../docs/content-types.md) § Subclass ownership — **outside** integration manifest |
| Equipment union variants                                    | [`equipment/README.md`](../../../apps/dashboard/src/features/content/equipment/README.md)                         |
| Spell resolution / modeling                                 | [`spell-resolution`](../spell-resolution/SKILL.md)                                                                |
| Embedded field on parent (class features, spell components) | Nest schema on parent — not a content type                                                                        |
| Heritage choices on species                                 | Embed on parent body — see `content/species.ts`                                                                   |

---

## Fast path

### Create mode

1. **Contracts** — add `ContentTypeKey` to `CONTENT_TYPE_KEYS` and keep `API_CONTENT_TYPE_KEYS` aligned when the type registers in the API. Add `CONTENT_TYPE_TERMS`, `CONTENT_TYPE_CAPABILITIES`, `HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS` (when sidebar/hub), `CONTENT_ACCESS_CAPABILITIES`, and dashboard `CONTENT_TYPE_PRESENTATION` (source badge vs suppressed). Images: complete [Managed media slice](#managed-media-slice) **or** add `CONTENT_TYPE_NON_MEDIA_FALLBACK_SUBJECT` + `content-display-fallback.test.ts` coverage (class/species use `generic` on field/detail when no image; location/org/equipment keep domain keys).
2. **Integration manifest** — add entry in [`CONTENT_TYPE_INTEGRATION_MANIFEST`](../../../tools/content-types/src/content-type-integration-manifest.ts) (`satisfies Record<ContentTypeKey, …>` enforces completeness). Declare API and dashboard metadata only as those integrations are implemented.
3. **Contracts schema** — `packages/contracts/src/rpg/content/<type>.ts` + barrel export + co-located tests.
4. **Catalog capability** — set manifest `catalog.bundledContent`; only bundled types add `packages/catalog/src/<type>/` JSON, loaders, tests, and package exports. Do not create empty seed packages for campaign-authored types.
5. **API** — `*.config.ts` (import `@rpg/catalog/<type>` only when bundled) with optional `system` capability + one line in `content-types.ts`. Add `CONTENT_PROJECTORS` row for global search; register `defineContentUsage` in `content-usage-registrations.ts` (surface keys derive from `API_CONTENT_TYPE_KEYS` + subclasses).
6. **Dashboard** — sub-area folder: list/detail routes, `*-display.ts` view model, form def side-effect into `contentFormRegistry`, lazy routes, `CONTENT_ROUTES`, router tree. Authorable types: `content-form-navigation.ts` (`ROUTE_KEY_TO_CONTENT_ROUTE_SECTION`). Sidebar: `VISIBLE_SIDEBAR_CONTENT`, `CAMPAIGN_SIDEBAR_CONTENT_SECTION` (Game Library vs World), `sidebar-nav-icons.ts` via `contentIdentityIcon('…')`. Form tabs that _are_ a catalog role alias through `content-form-tab-icons.ts` when applicable. Global search: extend `globalSearchTargetSchema` + `resolve-global-search-href.ts` (exhaustive `never` default).
   - Before `*-overview-columns.tsx`: run [Overview table UX](#overview-table-ux) if the user did not specify columns or filters.
   - Optional `ContentFormDef.preview` (identity / sections / player detail). Class is the reference; omit the block to keep NarrowPage. Drift: `buildSections` keys must equal `buildTabs` ids.
7. **Manifest flags** — set implemented dashboard capabilities (`formDefinitionPath`, `visibleInSidebar`, `routeSection`) and `catalog.bundledContent`; add `catalog.packageName` only for bundled content.
8. **Form test registry** — side-effect import in [`content-form-test-registry.ts`](../../../apps/dashboard/src/features/content/lib/forms/content-form-test-registry.ts) (tests only — keep route-local production imports).
9. **Gates** — run [drift tests](#required-gates) for every touched layer.

Pick a [reference template](./reference.md#reference-implementations) closest to the new type's complexity.

### Audit mode

Default when the user names an existing `ContentTypeKey`.

```text
content-type: <ContentTypeKey>
mode: audit
constraints: report-only unless user asks to fix
```

1. Read manifest entry in `CONTENT_TYPE_INTEGRATION_MANIFEST`.
2. Compare contracts keys/terms/capabilities, catalog package, API registry, dashboard folder/routes/form/sidebar.
3. **Report missing integration points** before generating changes.
4. Run drift tests if the user asks to verify.

---

## Overview table UX

**Gate before `*-overview-columns.tsx`** (reference checklist step 10). Do **not**
invent middle columns or filters silently.

`buildContentColumns` always adds shared chrome (name link, source badge,
campaign access). You only choose **middle columns** (`TYPE_MIDDLE_COLUMNS`) and
**type-specific filters** via `buildContentFilterSchema` / `createEqualsFilter`.
Base filters (source, status, search) come from `ContentOverviewBaseFilterState`.

### When to prompt

Prompt the user (with recommendations) when **either** is unspecified:

- middle columns for the overview table
- type-specific filters

Skip the prompt only when the user already named specific columns, filters, or
said explicitly to use a named template (e.g. “same columns as feats”,
“name-only like species with no filters”).

### How to prompt

Use a structured multiple-choice question — present **recommended options
first**, derived from the contract schema and closest reference type. Include a
minimal default and at least one richer alternative when the schema supports it.

Example question shape:

```text
Overview table for <type> — which middle columns and filters?

Recommended (flat enum field):
- Columns: <field> (sortable)
- Filters: <field> equals

Recommended (minimal):
- Columns: none (name + shared chrome only)
- Filters: none (base filters only)

Alternative (if schema has booleans / derived summaries):
- Columns: …
- Filters: …
```

Wait for an answer before implementing `*-overview-columns.tsx` and wiring the
overview route.

### Recommendation heuristics

Inspect the contract body and seed records first. Prefer columns that help DMs
**scan and narrow** the catalog — not every field belongs in the table.

| Schema signal                             | Typical column                            | Typical filter                                |
| ----------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| Closed enum / vocab id                    | Label via `*_ENTRIES` or `get*Label`      | `createEqualsFilter` on that id               |
| Boolean flag                              | `BooleanCell`                             | Same boolean filter when useful for narrowing |
| Derived one-liner (prerequisite, summary) | `accessorFn` + formatter from display lib | Usually omit — hard to filter fairly          |
| Collection count (traits, features)       | `buildCollectionCountColumn`              | Usually omit                                  |
| Kind / family discriminant                | Kind label column                         | Equals filter on kind                         |
| No strong scan fields                     | **None** — name-only table                | **None** — base filters only                  |

Reference patterns → [reference.md § Overview columns](./reference.md#overview-columns-and-filters).

---

## Managed media slice

When the type opts into `ContentMedia` (not identity-fallback-only), wire the
full vertical slice — detail in
[`content-managed-media.md`](../../../apps/dashboard/docs/content-managed-media.md)
and [`docs/content-media.md`](../../../docs/content-media.md).

| Layer      | Deliverable |
| ---------- | ----------- |
| Contracts  | Row in `CONTENT_TYPE_MEDIA_DOMAIN` (`resolve-content-media-domain.ts`); body extends `mediaBearingAuthoredContentBodySchema`; new domain string → `CONTENT_MEDIA_POLICIES` |
| API        | Persistence follows `CONTENT_TYPE_MEDIA_ENABLED_KEYS` automatically once domain map is updated |
| Dashboard  | `withManagedContentMediaFormSchema` + `managedMediaFormDefFields`; header `ManagedMediaField` (not a form-tab field); `serializeContentFormInput` at mutations; detail via `ContentDetailLayout` + `getContentDisplayImage` / `build*ContentDisplayImageInput`; overview image column follows media map via `buildContentColumns` |
| Follow-up  | Content writes do not yet call `reconcileContentMedia` — see managed-media doc |

Non-media types: one row in `CONTENT_TYPE_NON_MEDIA_FALLBACK_SUBJECT` only.

---

## Trigger phrases

| User says                                                        | Recipe                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| “add content type”, “new catalog type”, “wire `<type>`”          | [Create mode](#create-mode)                                                          |
| “audit content type”, “layer completeness”, “is `<type>` wired?” | [Audit mode](#audit-mode)                                                            |
| “content type checklist”                                         | [reference.md § Checklist](./reference.md#full-checklist)                            |
| “which type is the template for …?”                              | [reference.md § Reference implementations](./reference.md#reference-implementations) |

**Ask when:** unclear whether the entity should be a content type vs embedded schema vs nested resource; URL/k naming conflicts with reserved words; union/discriminated variant needed; **overview middle columns or type-specific filters not specified** (see [Overview table UX](#overview-table-ux)).

**Do not** inline delete/draft-publish/duplication policy — link [`docs/content-types.md`](../../../docs/content-types.md).

---

## Read tiers

```text
Tier 0  CONTENT_TYPE_KEYS + CONTENT_TYPE_INTEGRATION_MANIFEST + drift test map
Tier 1  Closest reference type folder (dashboard + API + catalog)
Tier 2  docs/content-types.md — policy, vocab, delete, draft/publish
Tier 3  Domain annex (equipment README, spell-resolution skill, subclass docs)
```

Stop at the lowest tier that answers the question.

---

## Required verification

Run the drift tests that apply to the layers you touched (focused paths first):

| Layer             | Test (run paths for layers you touched)                          |
| ----------------- | ---------------------------------------------------------------- |
| Tooling           | `pnpm --filter @rpg/content-types test`                          |
| Contracts         | `content-type-term-coverage.test.ts`, `content-display-fallback.test.ts`, `content-type-presentation.test.ts`, `content-access-capabilities.test.ts`, `resolve-content-media-domain.test.ts` |
| Catalog           | `packages/catalog/src/content-type-integration-manifest.test.ts` |
| API               | `content-types.integration-manifest.test.ts`, `content-usage-registrations.test.ts`, `apply-content-keys.test.ts` (when duplication nested paths change) |
| Dashboard routes  | `content-routes.integration-manifest.test.ts`                    |
| Dashboard sidebar | `content-registry.test.ts`, `campaign-sidebar-content-section.test.ts`, `sidebar-nav-icons.test.ts`, `build-campaign-sidebar-sections.test.ts` |
| Dashboard forms   | `content-form-registry.test.ts`, `content-managed-media-form-schemas.test.ts`, `content-form-preview-coverage.test.ts`, `content-form-validation.test.ts` |
| Dashboard test factories | `content-test-factory-registry.test.ts` (`content-test-factory-semantics.test.ts` — pick/make only) |
| Entity / copy     | `entity-surface-config.guard.test.ts`, `content-type-copy-drift` baseline |
| Icon registry     | `icon-registry-identity-ban.test.ts`; expand `icon-registry-scope-ban.test.ts` when migrating action verbs in the new folder |

Pre-commit and pre-push hooks run only at user-requested checkpoints — see
[`AGENTS.md`](../../../AGENTS.md) and [docs/agent-validation.md](../../../docs/agent-validation.md).

---

## Common failure modes

| Symptom                               | Likely cause                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Form drift test fails                 | Forgot `content-form-test-registry.ts` import or manifest `formDefinitionPath` |
| Sidebar test fails                    | `visibleInSidebar: true` missing or `VISIBLE_SIDEBAR_CONTENT` entry omitted    |
| Manifest compile error                | New key in `CONTENT_TYPE_KEYS` without manifest entry                          |
| Empty catalog package with no records | Use `catalog.bundledContent: 'none'` and omit the API `system` capability      |
| Type silently skipped in form tests   | Duplicate side-effect imports removed but test registry not updated            |
| Production bundle bloat               | Imported `content-form-test-registry.ts` from runtime code — **never**         |
| Overview table feels wrong            | Built columns/filters without user input — should have prompted first          |
| Test factory parity fails             | New `ContentTypeKey` without `CONTENT_TEST_FACTORY_REGISTRY` entry             |
| Preview rail / sidebar icon drift     | Missing fallback map row or `sidebar-nav-icons` `contentIdentityIcon` entry |
| Media form drift                      | Domain map updated but not `managedMediaFormDefFields` / `withManagedContentMediaFormSchema` |
| Usage API 500 / missing Used By       | No `defineContentUsage` registration for new `API_CONTENT_TYPE_KEYS` entry |
| Wrong sidebar section                 | Missing `CAMPAIGN_SIDEBAR_CONTENT_SECTION` row — type defaults into Game Library |
| Non-bundled catalog test failure      | Update `contentTypeKeysWithoutBundledContent()` expectation in `@rpg/content-types` when adding another `bundledContent: 'none'` type |

**Rule:** Runtime registries are authoritative. The integration manifest is metadata for drift tests only — no schemas, loaders, or route functions in tooling.

---

## Do not

- Put repo paths in `@rpg/contracts` — integration metadata lives in `@rpg/content-types` tooling only
- Import the integration manifest from runtime apps
- Use the form test registry as the production registration mechanism
- Force nested resources (subclasses) into the top-level manifest
- Skip `CONTENT_TYPE_TERMS` or vocab audit for user-facing catalog nouns
- Guess overview middle columns or filters when the user did not specify them
- Hand-roll content entity shapes outside `test/fixtures/factories/` — use `makeX`; use `pickX` when the test needs an exact catalog record
- Add global named catalog inventories (`catalog.ts`-style) — feature `fixtures.ts` owns named `pickX` selections
- Use `tryPickX` or catalog fallback inside `makeX` factories
- Add entity literals in `scenarios/` — compose multi-entity graphs with `makeX` / `pickX` instead; do not store single-entity inventories in `scenarios/`
- Use `imageKey`, `getContentImageUrl`, or hand-built entity card props — use `getContentDisplayImage` and `build*EntityCardModel` ([content-entity-card.md](../../../apps/dashboard/docs/content-entity-card.md))
- Override spacing, typography, or borders on `EntityAnatomyHost`, `ContentEntityCard`, or `DisclosureEntityCard` — change shared surfaces / `*.variants.ts` instead
- Hardcode catalog collection nouns — use `getContentTypeTerm` / `content-type-labels.ts`
- Hand-roll middle-dot metadata — use `joinInlineMetadata` / `InlineMetadata`
- Put route screens in the feature sub-area `index.ts` barrel — hooks only; routes via `app/lazy-routes.ts`
- Use raw Lucide glyphs for catalog identity in sidebar or form tabs — `contentIdentityIcon` only
- Wire `media` as a form-tab `FormItem` — managed media lives on `ContentFormHeader` only
- Call `def.toInput` at create/update mutations — use `serializeContentFormInput`

---

## Reference links

| Topic                                | Doc                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Full 18-step checklist + file matrix | [reference.md](./reference.md)                                                                        |
| End-to-end guide (SSOT)              | [`docs/content-types.md`](../../../docs/content-types.md)                                             |
| Icon registry (identity vs actions)  | [`packages/ui/docs/icon-registry.md`](../../../packages/ui/docs/icon-registry.md)                     |
| Integration manifest                 | [`tools/content-types/README.md`](../../../tools/content-types/README.md)                             |
| Form conventions                     | [`apps/dashboard/docs/form-lib-conventions.md`](../../../apps/dashboard/docs/form-lib-conventions.md) |
| Content duplication                  | [`apps/api/docs/content-duplication.md`](../../../apps/api/docs/content-duplication.md)               |
| Dashboard test factories             | [`apps/dashboard/docs/testing.md`](../../../apps/dashboard/docs/testing.md#content-test-factories)   |
| Managed media (dashboard)            | [`apps/dashboard/docs/content-managed-media.md`](../../../apps/dashboard/docs/content-managed-media.md) |
| Entity card ownership                | [`apps/dashboard/docs/content-entity-card.md`](../../../apps/dashboard/docs/content-entity-card.md) |
| Content media (cross-app)            | [`docs/content-media.md`](../../../docs/content-media.md)                                           |
