# Domain-rule message inventory (Phase 9A)

Actionable inventory for **reusable domain-rule** copy shared across validation,
acquisition, or other pipelines. Presentation-only strings, tier-1 field defaults,
form placeholders (`form-copy`), and facing rules prose are **out of scope** —
see [validation-messages.md](./validation-messages.md).

**Shape legend**

| Shape            | Meaning                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| **catalog**      | `defineMessage` in a `*ValidationMessages` map                           |
| **legacy plain** | Exported string constant shared by refine and/or acquisition             |
| **inline**       | Literal passed to `addCustomRefinementIssue` without a named export      |
| **presentation** | Dashboard or UI instruction copy — not a cross-pipeline domain invariant |

**Disposition** (what to do next)

| Disposition              | Meaning                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| **keep catalog**         | Canonical — extend the catalog only                                               |
| **migrate (convention)** | SSOT-correct plain today; move to `defineMessage` for ids + transport consistency |
| **retain legacy**        | Class 2 plain — no new plain rule constants; migrate when scheduled               |
| **presentation**         | Keep outside contracts catalogs (readiness / host UX)                             |
| **migrate (backlog)**    | Inline or scattered literals — module-scoped PRs                                  |
| **investigate**          | Deferred surface or unclear API exposure                                          |

**Display adapters** (after Phase 8): form → `resolveFieldErrorMessage`; acquisition →
`toAcquisitionDropdownItem`; character builder chrome → `formatFieldMessage` at render.
See [validation-messages.md § Display boundaries](./validation-messages.md#display-boundaries).

---

## High-priority families (cross-pipeline / acquisition)

| Family                                              | Shape        | Policy owner                            | Validation                     | Acquisition                    | Disposition       | Phase                |
| --------------------------------------------------- | ------------ | --------------------------------------- | ------------------------------ | ------------------------------ | ----------------- | -------------------- |
| Class subclass-choice duplicate                     | catalog      | `class.ts` (`refineClassFeatures`)      | Publish/draft class body       | `class-feature-add-menu`       | **keep catalog**  | 8 fixes display only |
| Class spellcasting config/grant coupling            | catalog      | `class.ts` + spellcasting schemas       | Class publish                  | —                              | **keep catalog**  | —                    |
| Class grant unlock vs feature level                 | catalog      | `class-feature-form-fields`             | Form refine                    | —                              | **keep catalog**  | Tier 3               |
| Primary spellcasting profile duplicate              | catalog      | `monster-action-occurrence-messages.ts` | `primary-spellcasting-profile` | `monster-action-acquisition`   | **keep catalog**  | Phase 10 pilot       |
| Monster singleton action kinds                      | catalog      | `monster-action-occurrence-messages.ts` | Repeatability refine           | `acquisitionStateForItem`      | **keep catalog**  | Phase 10 pilot       |
| Monster weapon / natural form duplicate             | catalog      | `monster-action-occurrence-messages.ts` | Repeatability refine           | Monster action menus           | **keep catalog**  | Phase 10 pilot       |
| Monster Constrict preset duplicate                  | catalog      | `monster-action-occurrence-messages.ts` | Repeatability refine           | Acquisition                    | **keep catalog**  | Phase 10 pilot       |
| Species sense occurrence duplicate                  | legacy plain | `sense-occurrence.ts`                   | Species trait publish          | `species-trait-acquisition`    | **retain legacy** | 12 if scheduled      |
| Legendary reference / spellcasting / cast readiness | presentation | Dashboard `monster-form-labels`         | —                              | Legendary + action acquisition | **presentation**  | Retain dashboard     |
| Species sense vocabulary readiness                  | presentation | `species-trait-acquisition.ts`          | —                              | Species trait menu             | **presentation**  | Retain dashboard     |

---

## Contracts tier-2 catalogs (canonical — extend in place)

Each row is a `*ValidationMessages` module using `defineMessage`. **Disposition: keep catalog**
unless a dedicated migration row exists above.

| Module                                                   | Scope prefix                                    | Primary consumers                      |
| -------------------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| `fieldValidationMessages`                                | `validation.field.*`                            | Tier-1 form error map (`@rpg/ui/form`) |
| `levelValidationMessages`                                | `validation.level.*`                            | Level primitives, campaign max         |
| `multiattackValidationMessages`                          | `validation.multiattack.*`                      | Multiattack publish refine             |
| `classValidationMessages`                                | `validation.class.*`                            | Class body publish                     |
| `spellcastingValidationMessages`                         | `validation.spellcasting.*`                     | Class spellcasting shapes              |
| `featValidationMessages`                                 | `validation.feat.*`                             | Feat publish                           |
| `characterValidationMessages`                            | `validation.character.*`                        | Character persist rules                |
| `speciesCharacterCreationValidationMessages`             | `validation.speciesCharacterCreation.*`         | Species creation domain                |
| `spellResolutionValidationMessages`                      | `validation.spellResolution.*`                  | Spell resolution editor                |
| `grantValidationMessages`                                | `validation.grant.*`                            | Grant graphs                           |
| `equipmentVariantValidationMessages`                     | `validation.equipmentVariant.*`                 | Equipment variants                     |
| `xpProgressionValidationMessages`                        | `validation.xpProgression.*`                    | XP tables                              |
| `characterBuilderValidationMessages`                     | `validation.characterBuilder.*`                 | Builder workflow                       |
| `characterBuilderAdvisoryMessages`                       | `validation.characterBuilderAdvisory.*`         | Non-blocking advisories                |
| `characterBuilderDependentChoiceMessages`                | `validation.characterBuilder.dependentChoice.*` | Heritage / subclass steps              |
| Remaining `*-messages.ts` under `packages/contracts/src` | per scope                                       | Co-located refine / runtime            |

New domain rules in these areas **must** use `defineMessage` — do not add parallel plain exports.

---

## Legacy plain constants (publish-heavy, acquisition-selected)

| Export / module                                     | Validation use                          | Acquisition use             | Disposition                                          |
| --------------------------------------------------- | --------------------------------------- | --------------------------- | ---------------------------------------------------- |
| `monsterActionOccurrenceMessages`                   | `monster-action-occurrence-messages.ts` | Repeatability + acquisition | **keep catalog** — Phase 10 pilot complete           |
| `DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE`             | Species trait refine                    | Species traits menu         | **retain legacy**                                    |
| `DUPLICATE_MONSTER_SENSE_MESSAGE`                   | Monster senses                          | —                           | **retain legacy**                                    |
| `reference-messages.ts` (action / multiattack refs) | Action graph refine                     | —                           | **retain legacy** until module migration             |
| Creature / form `*_MESSAGE` exports                 | Trait, form, movement refine            | —                           | **retain legacy** / **migrate (backlog)** per module |

---

## Inline refine literals (backlog — Phase 6 / 12)

Phase **6** exit for this workstream: inventory and dispositions below — **not** a single bulk PR.
Phase **12** executes module-scoped migrations when a file is already under change.

Representative modules with `addCustomRefinementIssue(ctx, '…literal…')` and **no** catalog id:

| Module area                                   | Example rules             | Disposition                               |
| --------------------------------------------- | ------------------------- | ----------------------------------------- |
| `monster/action/shape-refinements.ts`         | Range, reach, preset      | **migrate (backlog)**                     |
| `monster/action/spell-refinements.ts`         | Spellcasting row coupling | **migrate (backlog)**                     |
| `monster/action/portable-kind-schemas.ts`     | Portable action shape     | **migrate (backlog)**                     |
| `monster/forms.ts`                            | Form name uniqueness      | **migrate (backlog)**                     |
| `rpg/content/lib/multiclassing-validation.ts` | Multiclass eligibility    | **investigate** — builder surface         |
| Broader `monster` refine graph                | Long-tail publish rules   | **migrate (backlog)** — one module per PR |

Do **not** bulk-convert inline literals for cosmetic id coverage. Migrate when a module is
already touched or when acquisition needs shared transport with validation.

---

## Duplication and authority notes

| Pattern                                                                       | SSOT problem                  | Action                                                                      |
| ----------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| Same English via **one plain constant** in refine + acquisition               | **Not A** — shared plain SSOT | Optional **migrate (convention)** for ids (Phase 10+)                       |
| Same rule with **catalog transport** + acquisition **without** adapter decode | **D** — display leak          | Fixed Phase 8 (`toAcquisitionDropdownItem`)                                 |
| Second export or inline literal for an existing rule                          | **A** or class 3 ad hoc       | **Forbidden** — catalog or delete duplicate                                 |
| Readiness line (“catalog not ready”, “add spellcasting row”)                  | Presentation                  | Dashboard / feature copy — **do not** move to contracts unless policy moves |

**Policy owners** must stay separate from message catalogs: occurrence limits live in
`monster-action-repeatability`, class milestone rules in `class.ts`, acquisition only
**references** catalog invocations or plain SSOT strings.

---

## Maintenance

1. When adding a **new cross-pipeline rule**, follow the [agent checklist](./validation-messages.md#agent-checklist-new-domain-rule-message).
2. When migrating plain → catalog, update refine tests for **transport** and UI/acquisition tests for **`formatFieldMessage` display**.
3. Refresh this inventory when a Phase 10/12 migration lands or when a new acquisition menu adopts `defineMessage` transport.

Related plan: [SSOT drift prevention — message phases](../../../.cursor/plans/ssot_drift_prevention_23ad855d.plan.md).
