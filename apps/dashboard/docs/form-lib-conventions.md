# Form lib conventions (dashboard features)

Part of feature layout — see [feature-structure.md](./feature-structure.md).

How to organize `lib/` modules that back schema-driven forms (`ContentFormDef`,
campaign settings, homebrew rules). UI layer detail lives in
[packages/ui/docs/forms.md](../../../packages/ui/docs/forms.md).

## File suffixes

| Suffix             | Responsibility                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `*-form-def.ts`    | **`ContentFormDef` + registry side-effect only** — one per content type (`class-form-def`, `species-form-def`) |
| `*-form-fields.ts` | Zod schemas, `FormItem[]`, field/section builders, list-row display helpers tied to form config                |
| `*-form-values.ts` | Entity ↔ form mapping, API input fragments, create/edit defaults                                               |
| `*-form-labels.ts` | Enum/display labels and UI copy strings (when not from `@rpg/contracts`)                                       |
| `*-form.ts`        | Thin compose layer (optional; re-exports + wiring)                                                             |
| `*-constants.ts`   | Field names, sentinels, mode tuples — not display text                                                         |

Campaign settings follow the same suffixes under `features/campaign/lib/` (e.g.
`campaign-profile-form-fields.ts`, `mechanics-form-values.ts`).

## Validation

Table-level domain rules (contiguous level ranges, cross-row overlap, campaign
cap coverage) belong in the **parent** schema's `superRefine` — e.g.
`configRulesSuperRefine` calling `refineLevelRangeTable` from `@rpg/contracts`.
Do not duplicate those checks on row schemas or in `FormItem` config.

Row schemas keep only field-local refines (bonus-gold operator, required
sub-fields).

### Draft form schemas and select fields

Dashboard draft form schemas (`*DraftFormSchema`, `draftSchema` on
`ContentFormDef`) run through the same RHF + Zod resolver as publish. **`select`**
and single **`chips`** controls seed unselected values as `''` (see
`fieldDefaultValue` in `@rpg/ui/form`). Plain `someVocabSchema.optional()` still
validates that sentinel against the enum and blocks Save Draft.

Use **`draftOptionalSelect(schema)`** from
[`lib/forms/draft-form-schema-helpers.ts`](../src/features/content/lib/forms/draft-form-schema-helpers.ts)
for every optional closed-vocab field on draft paths — including nested `unit`
keys inside optional `inputSelect` / `inputUnit` objects.

```ts
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'

export const armorEquipmentDraftFormSchema = z.object({
  armorCategory: draftOptionalSelect(armorCategorySchema),
  material: draftOptionalSelect(armorMaterialSchema),
})
```

Regression tests should parse realistic form payloads with `''` sentinels, not
only omit keys. Publish schemas keep required enums unchanged; strip empty values
in `*-form-values.ts` `toInput` when building API payloads.

See also [validation-messages.md § Draft vs publish](../../../packages/contracts/docs/validation-messages.md#draft-vs-publish-contract-families).

### Validation messages

Three tiers — see
[packages/contracts/docs/validation-messages.md](../../../packages/contracts/docs/validation-messages.md):

- **Global defaults** come for free: leave schemas message-free
  (`z.number().min(1)`) and the form resolver formats the issue with the
  field's `label` (`Level must be at least 1.`).
- **Shared domain rules** use contracts catalogs (`levelValidationMessages`,
  `xpProgressionValidationMessages`) so form and API copy stay aligned.
- **Form-specific rules** define a `<scope>ValidationMessages` catalog with
  `defineMessage` from `@rpg/contracts` next to the form schema (e.g.
  `startingWealthValidationMessages` in `starting-wealth-form-fields.ts`) —
  never inline message literals, and assert tests through the catalog.

### Validation verification (Phase 4)

Co-located `*-form-validation.test.ts` modules (or the shared
`content-form-validation.test.ts` sweep) import `@rpg/ui/form/test-utils` and
assert:

1. **Field paths registered** — `assertFieldPathsRegistered(fields)`
2. **Schema coverage** — `assertRegistryCoverage(schema, fields)` with
   `exemptPaths` for derived `slug`, slot-tab prefixes, and grant-union explosion
3. **No Zod defaults on invalid submit** —
   `assertInvalidSubmitUsesRefinedMessages(schema, fields, { invalidValue })`

Dashboard forms: `apps/dashboard/src/lib/form-validation/dashboard-form-validation.test.ts`.
Content catalog: `apps/dashboard/src/features/content/lib/forms/content-form-validation.test.ts`.
Public auth: `apps/public/src/features/auth/lib/auth-form-validation.test.ts`.

Out-of-scope deferrals (non-form schemas, future i18n/API seams)
→ [validation-messages.md](../../../../packages/contracts/docs/validation-messages.md#deferred-gap-list).

### TabbedForm header-only tabs

Header-only tabs (`fields: []` + `header` master-detail editors) must wire validation
for tab badges, footer summary, and tier-1 message copy:

- **`errorPaths`** — RHF root paths owned by the tab (tab badges + footer summary).
  See [forms.md § errorPaths](../../../packages/ui/docs/forms.md#errorpaths-for-header-only-tabs).
- **`resolverFields`** — matching `FormItem` configs with full RHF paths (not
  rendered). See
  [forms.md § resolverFields](../../../packages/ui/docs/forms.md#resolverfields-for-validation-message-copy).

**Pairing rule:** declare both on every header-only tab that edits embedded form
paths. `errorPaths` drives tab UX; `resolverFields` drives validation message copy.

**Dashboard helpers** (`tabbed-form-resolver-fields.ts`):

- `embeddedMasterDetailTabValidation({ path, legend, fields })` — returns paired
  `errorPaths` + `resolverFields` for a single embedded array (copy/paste onto the tab).
- `prefixFormItems(items, prefix)` — prefix scalar/nested resolver fields (e.g.
  `heritage.name`).
- `embeddedArrayResolverField(name, legend, itemFields)` — resolver-only array config.

**Reference implementations:** `buildSpeciesTabs` and `buildClassTabs` in
`species-form-fields.ts` / `class-form-fields.ts`. Non-form chrome tabs (e.g. class
subclasses management) set `skipHeaderOnlyValidationWiring: true`.

**Tests:** `assertHeaderOnlyTabsHaveValidationWiring(tabs)` in
`tabbed-form-validation-test-utils.ts` — used by `content-form-validation.test.ts`
and co-located form tests.

Level-range tier arrays use `buildLevelRangeTiersArrayField` with
`arrayPattern: { kind: 'levelRange' }`. Cross-row select filtering uses
`minLevelSelectable` / `maxLevelSelectable`; edits cascade via
`applyLevelRangeMaxChange` / `applyLevelRangeMinChange` in the `@rpg/ui`
level-range renderer when that pattern is set.

## Layout

**Flat prefixes** — default for content catalog subdomains:

```text
species/lib/species-trait-form-fields.ts
species/lib/species-trait-form-values.ts
species/lib/species-heritage-form-fields.ts
```

**Subfolders** — when a concern has **3+ related files**:

```text
classes/lib/character-creation/class-starting-equipment-form-*.ts
classes/lib/subclasses/subclass-form-*.ts
campaign/lib/rules/character-configuration/character-configuration-form-*.ts
```

## When to split

Split a module when it mixes **two or more** of: fields, values, labels.

| Signal                                                        | Action                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `-form-def.ts` > ~300 lines                                   | Extract `-form-fields.ts` + `-form-values.ts`; keep def thin |
| Submodule uses `-form-def` suffix but is not a registry entry | Rename to `-form-fields` / `-form-values`                    |
| Enum labels or button copy in a fields file                   | Move to `-form-labels.ts`                                    |
| Sparse feature (≤6 lib files)                                 | Stay flat; split files, not folders                          |

Defer subfolders until a concern outgrows flat prefixes.

## Worked examples

| Feature                  | Reference                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Content — classes        | [`content/classes/README.md`](../src/features/content/classes/README.md)                       |
| Content — species traits | `species-trait-form-fields.ts`, `species-trait-form-values.ts`, `species-trait-form-labels.ts` |
| Content — species hub    | `species-form-def.ts`, `species-form-fields.ts`, `species-form-values.ts`                      |
| Content — spells         | `spell-form-def.ts`, `spell-form-fields.ts`, `spell-form-values.ts`, `spell-form-labels.ts`    |
| Content — equipment hub  | `equipment-form-def.ts`, `equipment-form-fields.ts`, `equipment-form-values.ts`                |
| Campaign — mechanics     | `campaign/lib/rules/mechanics/mechanics-form-*.ts`                                             |

Route modules side-effect-import `*-form-def.ts` inside the route chunk — see
[code-splitting.md](./code-splitting.md).

## Content catalog inventory

Status of schema-driven form modules under `src/features/content/`. Refresh
this table when completing a form-lib alignment phase.

| Module / area            | Primary path                                                                                                                                                                                               | Status  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Classes (hub)            | `classes/lib/class-form-fields.ts` (schema + tabs); tab modules `class-basics-form-fields.ts`, `class-proficiencies-form-fields.ts`, `class-spellcasting-form-fields.ts`, `class-resources-form-fields.ts` | aligned |
| Class features           | `classes/lib/class-feature-form-fields.ts`                                                                                                                                                                 | aligned |
| Class starting equipment | `classes/lib/character-creation/class-starting-equipment-form-*.ts`                                                                                                                                        | aligned |
| Subclasses               | `classes/lib/subclasses/subclass-form-*.ts`                                                                                                                                                                | aligned |
| Species traits           | `species/lib/species-trait-form-*.ts`                                                                                                                                                                      | aligned |
| Species (hub)            | `species/lib/species-form-def.ts`, `species-form-fields.ts`, `species-form-values.ts`                                                                                                                      | aligned |
| Species heritage         | `species/lib/species-heritage-form-*.ts`                                                                                                                                                                   | aligned |
| Species rules            | `species/lib/species-rules-form-*.ts`                                                                                                                                                                      | aligned |
| Spells                   | `spells/lib/spell-form-*.ts`                                                                                                                                                                               | aligned |
| Spell resolution         | `spells/resolution/lib/form/*`, `resolution/docs/authoring.md` — see [effect-resolution base](../../../../packages/contracts/docs/effect-resolution/base.md)                                               | aligned |
| Equipment (hub)          | `equipment/lib/equipment-form-def.ts`, `equipment-form-fields.ts`, `equipment-form-values.ts`                                                                                                              | aligned |
| Equipment families       | `equipment/*/lib/*-form-fields.ts`, `*-form-values.ts`                                                                                                                                                     | aligned |
| Feats                    | `feats/lib/feat-form-def.ts`, `feat-form-fields.ts`, `feat-form-values.ts`                                                                                                                                 | aligned |
| Skill proficiencies      | `skill-proficiencies/lib/skill-proficiency-form-def.ts`, `*-form-fields.ts`, `*-form-values.ts`                                                                                                            | aligned |
| Campaign access          | `content/lib/campaign-access/campaign-access-form-fields.ts`, `campaign-access-form-visibility.ts`, `campaign-access-labels.ts`                                                                            | aligned |

**Legacy rename:** equipment formerly used `*-form-input.ts`; target suffix is
`*-form-values.ts` (completed).

### Shared infra (exceptions)

These modules support many content types but are **not** per-type form splits:

| Module                    | Path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity field builders   | `content/lib/forms/fields/content-identity-form-fields.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Economy field builders    | `content/lib/forms/fields/content-economy-form-fields.ts` (+ digit configs in `equipment/lib/`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Speed/mass field builders | `content/lib/forms/fields/content-speed-form-fields.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Grant row helpers         | `content/lib/forms/grants/grant-form-schema.ts` (`GRANT_TYPES` for consumer pickers, `GRANT_ROW_TYPES` / `GRANT_ROW_TYPE_LABELS` when equipment rows are representable, `GrantType`, `GRANT_TYPE_LABELS`), `grant-template-registry.ts` (authoring templates + `createDefault` for add-menu items), `grant-add-menu.lib.ts` (maps registry → `ArrayConfig.addActionMenu`), `grant-form-fields.ts`, `grant-form-values.ts`, `equipment-grant-form-fields.ts`, `equipment-grant-form-values.ts`, `equipment-grant-form-labels.ts`, `proficiency-grant-form-fields.ts`, `proficiency-grant-form-values.ts`, `proficiency-grant-form-labels.ts` |
| Campaign rules from ctx   | `content/lib/form-options/content-campaign-rules.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Level select builders     | `content/lib/form-options/level-field-options.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Content form registry     | `content/lib/forms/content-form-registry.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Create/edit shells        | `content/lib/forms/shells/` (create/edit shells, layout, load, authoring gate)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### Create vs edit action state

Top-level content shells share `ContentFormFooter` (`content-form-footer.tsx`) wired through
`ContentFormLayout` and `useContentFormActionState`:

| Mode       | Footer                               | Submit enabled when                                                          | Success                                                                                      |
| ---------- | ------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Create** | `[Cancel]` `[Create {type}]`         | Always (click validates) — disabled only while `pending` or read-only        | Navigate to `…/:id/edit` after POST; `TODO(toast)` for create copy                           |
| **Edit**   | `[Discard changes]` `[Save changes]` | `hasDirtyFields(dirtyFields)` — disabled when clean, `pending`, or read-only | Stay on edit route; reset baseline from `def.toFormValues(saved)`; inline `"Changes saved."` |

Create handoff URL: `resolveContentPostCreateEditHref` in `content-form-navigation.ts`.
Submit/error wiring: `useSubmitHandler` in create/edit shells. Nested subclass editor remains
separate until aligned in a follow-up.

**Why not `formState.isDirty`?** RHF `isDirty` compares current values to `defaultValues` and
can read `true` after hydration when value-sync, rich-text init, or conditional `shouldUnregister`
paths mutate values without user intent. `dirtyFields` records which registered fields the user
actually touched — the same signal as `FormUnsavedChangesGuard`. After a successful edit save,
always `form.reset(def.toFormValues(saved))` (not the pre-save client payload) so server
normalization does not immediately re-dirty the form.

Validation **display** stays progressive (`mode` default `onSubmit`) until the user submits or
touches a field. Invalid Create/Save clicks run RHF validation, show progressive errors, and
navigate/focus the first invalid field or tab. Optional `validateSilently` / `useSilentFormValidity`
may drive secondary UI (e.g. "Ready to create") — not the primary submit gate.

Feat- and species-specific helpers (not cross-type shared infra):

| Module             | Path                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement editor | `feats/lib/requirement-editor-form-schema.ts`, `-values.ts`, `-form.ts` (+ `-constants.ts`); UI in `feats/components/requirement-editor.client.tsx` |
| Creature type opts | `species/lib/creature-type-field-options.ts`                                                                                                        |
