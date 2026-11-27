# Architecture SSOT policy

High-level ownership and prevention policy for this monorepo. This document is a
**navigation hub** — it does not replace domain playbooks.

| Topic                           | Canonical detail                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vocabulary patterns (A/B/C)     | [packages/contracts/docs/vocab-ssot.md](../packages/contracts/docs/vocab-ssot.md)                                                                                                                                                          |
| Contracts package layers        | [packages/contracts/docs/structure.md](../packages/contracts/docs/structure.md)                                                                                                                                                            |
| Catalog content types           | [content-types.md](./content-types.md)                                                                                                                                                                                                     |
| Validation / domain messages    | [validation-messages.md](../packages/contracts/docs/validation-messages.md), [domain-message-inventory.md](../packages/contracts/docs/domain-message-inventory.md)                                                                         |
| Facing invalid / guidance       | [facing-guidance-audit.md](../apps/dashboard/docs/facing-guidance-audit.md), [`facing-invalid-messages.ts`](../packages/contracts/src/rpg/primitives/facing/facing-invalid-messages.ts)                                                    |
| Monster acquisition recipes     | [apps/dashboard/docs/monster-action-acquisition-ssot.md](../apps/dashboard/docs/monster-action-acquisition-ssot.md)                                                                                                                        |
| System ruleset identity & scope | [packages/contracts/docs/structure.md § System ruleset identity](../packages/contracts/docs/structure.md#system-ruleset-identity-primitivesrulesetts), plan [default_ruleset_ssot](../.cursor/plans/default_ruleset_ssot_c13d26cc.plan.md) |
| Dead-code / Fallow usage        | [tools/fallow/README.md](../tools/fallow/README.md)                                                                                                                                                                                        |
| Complexity remediation          | [complexity-remediation.md](./complexity-remediation.md) (investigation: [analysis/complexity-threshold-investigation.md](./analysis/complexity-threshold-investigation.md))                                                             |
| PR review lenses                | [.cursor/skills/pr-review/SKILL.md](../.cursor/skills/pr-review/SKILL.md)                                                                                                                                                                  |

## Four prevention problems

Tag every safeguard with the problem it solves — one tool does not fix all four.

| Problem                              | Definition                                                                                                   | Primary mechanisms                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Duplicate authority**          | Two places maintain the same identity, labels, or behavioral rule                                            | `*_ENTRIES`, derived types, `satisfies` subsets, single-module ownership                                                                                          |
| **B — Missing integration**          | Admitted kind/type lacks authoring, facing, validation, or menu wiring                                       | Exhaustive `Record` / `switch` + `never`, drift tests, integration manifest                                                                                       |
| **C — Orphaned declarations**        | Export with no meaningful consumer                                                                           | `noUnusedLocals`, Fallow `dead-code` / `audit`, export lifecycle                                                                                                  |
| **D — Inconsistent domain messages** | Same rule class mixes catalog transport, plain SSOT, or inline literals; transport reaches UI without decode | `defineMessage` catalogs, policy-owned eligibility, one display adapter per pipeline, [validation-messages.md](../packages/contracts/docs/validation-messages.md) |

**SSOT violation (A):** independently maintained copies of the same closed identifier
set, label map, eligibility rule, or policy — even when the code is not textually
identical.

**Not automatically a violation:** intentional subsets (`Partial<Record<…>>`,
`API_*` keys), dashboard acquisition recipes (Pattern C), or repeated string
literals that are not domain identity.

**D is not A** when a single plain constant is the shared SSOT for refine and acquisition (e.g.
occurrence duplicate English today). **D is A or leakage** when a second literal defines the same
rule, or catalog transport is passed to UI without `formatFieldMessage` at the pipeline edge.

### Domain-message lifecycle

```text
Domain policy          → when disabled / invalid
Message definition     → catalog or deliberate plain export (legacy class 2)
Transport              → string on option/issue (may be encoded)
Display adapter        → formatFieldMessage / resolveFieldErrorMessage (once)
UI primitive           → plain string only
```

New reusable domain-rule copy: [validation-messages.md § Agent checklist](../packages/contracts/docs/validation-messages.md#agent-checklist-new-domain-rule-message). Family disposition: [domain-message-inventory.md](../packages/contracts/docs/domain-message-inventory.md).

### Domain-message enforcement (Phases 8–11)

| Mechanism                                                             | Where                                                                                     | Prevents                                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Acquisition adapter decode                                            | `to-acquisition-dropdown-item.ts` + `to-acquisition-dropdown-item.test.ts`                | Transport leak to dropdown copy                                      |
| `expectPlainDisplayCopy` / `expectAcquisitionDropdownItemDisplayCopy` | `apps/dashboard/src/test/expect-plain-display-copy.ts`; class + monster acquisition tests | `\x00` prefix on UI-facing acquisition strings                       |
| Agent checklist + pr-review skill                                     | `validation-messages.md`, `.cursor/skills/pr-review`                                      | New ad hoc cross-pipeline rule literals                              |
| Pilot display asserts                                                 | `monster-action-repeatability.test.ts`, `monster-action-occurrence-messages.test.ts`      | `formatFieldMessage` wording for occurrence family                   |
| Per-catalog id uniqueness + collision inventory                       | `validation-message-catalog-ids.test.ts`                                                  | Duplicate ids inside a catalog; ratchet on known cross-catalog reuse |

Inline refine literals and legacy plain exports are tracked in [domain-message-inventory.md § Inline refine literals](../packages/contracts/docs/domain-message-inventory.md#inline-refine-literals-backlog--phase-12) — migrate module-by-module, not bulk.

## Identity vs metadata vs policy vs presentation

| Layer            | Examples                                                  | Authority                                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**     | `ContentTypeKey`, `MonsterActionKind`, `ClassFeatureKind` | `CONTENT_TYPE_KEYS`, `*_ENTRIES`, `keysFromEntries`                                                                                                                                                      |
| **Metadata**     | Labels, descriptions, terms                               | `*_ENTRIES`, `CONTENT_TYPE_TERMS` (exhaustive against keys, not admission)                                                                                                                               |
| **Policy**       | Section eligibility, usage editors, singleton rules       | Contracts helpers (`monsterSectionAllowsKind`, `monsterActionUsageCapability`)                                                                                                                           |
| **Presentation** | Dashboard copy, form labels, facing prose                 | Feature label modules; derive nouns via `getContentTypeTerm` / vocab helpers; invalid codes → [`facing-invalid-messages.ts`](../packages/contracts/src/rpg/primitives/facing/facing-invalid-messages.ts) |

Admission for catalog types is **domain-first** (`CONTENT_TYPE_KEYS`), not terms-first.
See [vocab-ssot.md](../packages/contracts/docs/vocab-ssot.md).

## Derived unions and registries

Prefer:

```text
*_ENTRIES (authoritative) → keyof typeof → keysFromEntries → Zod enum
```

Use `satisfies Record<DomainKey, …>` when **every** admitted key must have
behavior. Use `Partial<Record<…>>` or Pattern C subsets when only some keys
participate — document as policy, not incomplete SSOT.

Do **not** introduce a universal kind registry. Add exhaustion only where product
requires completeness (capabilities, facing `never`, class feature field maps).

## Fallbacks and forward compatibility

| Class                     | Example                                       | Treatment                                                                                    |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Reject**                | Unknown acquisition preset → silent `special` | Throw or `never`                                                                             |
| **User/draft incomplete** | `reaction:custom` without trigger             | Intentional partial draft                                                                    |
| **Forward compat**        | Unknown `kind` string on persisted/dev data   | Documented default at contracts boundary — must not hide missing **known** kind registration |
| **Parse failure**         | Unknown menu id                               | `undefined` / no activation — no silent draft                                                |

Acquisition paths and authoring menus are stricter than forward-compat policy
functions on parsed catalog rows.

## System ruleset identity and runtime scope

**Problem classes:** primarily **A** (duplicate `srd-cc-5.2.1` literals, parallel
`DEFAULT_RULESET_ID`) and silent **forward-compat-style** fallbacks that treat missing
campaign context as default-system behavior — which is **not** the same as documented
forward compat on unknown persisted kinds.

Two responsibilities must stay separate:

| Responsibility                | Owner                                                                                                     | Symbol / API                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **System default identity**   | [`packages/contracts/src/rpg/primitives/ruleset.ts`](../packages/contracts/src/rpg/primitives/ruleset.ts) | `DEFAULT_SYSTEM_RULESET_ID`, `SystemRulesetId`                               |
| **Runtime ruleset selection** | Host context (campaign record, entity, `ContentFormCtx`, `CharacterRulesScope`)                           | `lookupCampaignRulesetId` → resolved \| unresolved — no `WithDefault` helper |

**Invariant:** absent or loading campaign context does **not** authorize
`DEFAULT_SYSTEM_RULESET_ID` for campaign-scoped operations (builder, detail sheets,
content forms, equipment reference resolution).

**Catalog scope:** `EquipmentCatalogScope` and similar boundaries are passed **in** from
hosts (`equipmentReferenceScopeFromContentFormCtx`, character detail
`equipmentReferenceScope`). Resolvers must not sample catalog rows, row order, or inline
literals to invent `rulesetId` / `campaignId`. Player preview and list hooks use
[`contentAuthoringScopeFromCtx`](../apps/dashboard/src/features/content/lib/authoring/content-authoring-scope.lib.ts)
— **not** the equipment scope helper — so `campaignId: ''` stays equipment-only.

**Content authoring:** `ContentFormCtx.rulesetId` is the **campaign catalog** ruleset;
`entityRulesetId` (edit) is entity artwork/identity only. Do not merge them for catalog or
equipment resolution.

**Effective rules:** campaign patches (`RulesetPatchRead`, `ResolvedCampaignRules`) are
mechanics overlays on the same `rulesetId` key — not a second ruleset identity type.

| Mechanism                  | Where                                                                                                                                                                                               | Prevents                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Campaign lookup            | [`apps/dashboard/src/lib/campaign-ruleset.lib.ts`](../apps/dashboard/src/lib/campaign-ruleset.lib.ts), [`use-campaign-ruleset-lookup.ts`](../apps/dashboard/src/lib/use-campaign-ruleset-lookup.ts) | Defaulting while campaigns load or fail |
| Content form gate          | [`useContentFormOptions`](../apps/dashboard/src/features/content/lib/form-options/content-form-options.ts)                                                                                          | `classes[0]?.rulesetId` sampling        |
| Grant / sheet scope helper | [`content-form-equipment-reference-scope.lib.ts`](../apps/dashboard/src/lib/content-form-equipment-reference-scope.lib.ts)                                                                          | Empty `rulesetId` during unresolved ctx |
| ESLint                     | [`dashboardSystemRulesetLiteralGuard`](../apps/dashboard/eslint.config.js) (`Literal[value='srd-cc-5.2.1']` in production)                                                                          | Reintroduced inline default literal     |

Explicit **permitted** uses of `DEFAULT_SYSTEM_RULESET_ID`: seed campaign settings UI
before patch load, disabled builder sentinel, standalone `CharacterRulesScope`, tests and
fixtures, and content ids of the form `srd-cc-5.2.1:slug` (identity in the id string, not
scope policy).

Implementation history and acceptance matrix:
[`.cursor/plans/default_ruleset_ssot_c13d26cc.plan.md`](../.cursor/plans/default_ruleset_ssot_c13d26cc.plan.md).

## Export and dead-code lifecycle

**Before creating an export:** named production consumer or documented public API
(contracts export surface, feature barrel); narrowest visibility.

**After migration:** audit superseded symbols; update `export-surface.snapshot.json`
when root/contracts public API changes.

| Signal                          | Usually legitimate?                           |
| ------------------------------- | --------------------------------------------- |
| Feature `index.ts` re-export    | Yes — public feature API (Fallow entry graph) |
| Contracts export-surface symbol | Yes                                           |
| Test-only helper                | Yes — outside `--production` Fallow           |
| Leaf const never imported       | Often **C** — triage before delete            |

Barrel re-exports and test imports do not alone prove a production consumer.

Repo-wide unused-export counts are **diagnostic** until Fallow regression gates
mature — see [tools/fallow/README.md](../tools/fallow/README.md). **Phase 7** leaf
cleanups use importer verification (ripgrep) and recorded manifests — not baseline diffs alone.

## Module boundaries

- **Contracts:** default-deny layer imports — [packages/contracts/eslint.config.js](../packages/contracts/eslint.config.js).
- **Dashboard:** cross-feature imports only through feature `index.ts`.
- **Acquisition eligibility:** use `monsterSectionAllowsKind` — do not read
  `MONSTER_SECTION_KINDS` from dashboard acquisition code (ESLint guard).

## Mandatory registration expectations (summary)

| Change                      | Minimum wiring                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content type**            | Keys, terms, capabilities, manifest, API when wired, dashboard routes — [new-content-type skill](../.cursor/skills/new-content-type/SKILL.md) |
| **Class feature kind**      | `CLASS_FEATURE_KIND_ENTRIES`, field sections `Record`, facing resolvers `Record`                                                              |
| **Monster action kind**     | Vocab entry, section tuple, stat-block facing branch, authoring-route coverage (section × kind)                                               |
| **Creature trait template** | `CREATURE_TRAIT_TEMPLATE_ENTRIES`, host policy, config schema                                                                                 |
| **Facing domain**           | Register in `resolveFacing` + domain resolver                                                                                                 |

## Pre-abstraction checklist (agents and reviewers)

Before adding a string union, registry, exported helper, resolver, or kind:

1. Find the **authoritative owner** (grep + trace) — classify problem **A**, **B**, **C**, or **D**.
2. Prefer **derive** from existing `*_ENTRIES` or constrain with `satisfies`.
3. For **B**, list registration points (facing, fields, manifest, tests).
4. For new **exports**, name the consumer or public API role.
5. For monster actions, assume **section × kind × category** composition — not one
   composer per kind ([authoring coverage test](../apps/dashboard/src/features/content/monsters/lib/actions/detail-fields/section-composers-authoring-coverage.test.ts)).
6. On a Fallow complexity finding, follow [complexity-remediation.md](./complexity-remediation.md)
   (includes challenge/removal of unjustified abstractions, not only new ones).

---

Related implementation plan: [`.cursor/plans/ssot_drift_prevention_23ad855d.plan.md`](../.cursor/plans/ssot_drift_prevention_23ad855d.plan.md).
