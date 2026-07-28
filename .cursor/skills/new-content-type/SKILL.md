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

1. **Contracts** — add `ContentTypeKey` to `CONTENT_TYPE_KEYS`, `CONTENT_TYPE_TERMS`, and `CONTENT_TYPE_CAPABILITIES` when duplication applies.
2. **Integration manifest** — add entry in [`CONTENT_TYPE_INTEGRATION_MANIFEST`](../../../tools/content-types/src/content-type-integration-manifest.ts) (`satisfies Record<ContentTypeKey, …>` enforces completeness).
3. **Contracts schema** — `packages/contracts/src/rpg/content/<type>.ts` + barrel export + co-located tests.
4. **Catalog seed** — `packages/catalog/src/<type>/` JSON + `loadSeed*` exports + `index.test.ts`; register in `packages/catalog/package.json` exports.
5. **API** — `*.config.ts` importing `@rpg/catalog/<type>` + one line in `content-types.ts`.
6. **Dashboard** — sub-area folder: list/detail routes, `*-display.ts` view model, form def (if authoring), lazy routes, `CONTENT_ROUTES`, router tree.
7. **Manifest flags** — set `dashboard.formDefinitionPath`, `visibleInSidebar`, `routeSection`, `catalog.packageName` as applicable.
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

## Trigger phrases

| User says                                                        | Recipe                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| “add content type”, “new catalog type”, “wire `<type>`”          | [Create mode](#create-mode)                                                          |
| “audit content type”, “layer completeness”, “is `<type>` wired?” | [Audit mode](#audit-mode)                                                            |
| “content type checklist”                                         | [reference.md § Checklist](./reference.md#full-checklist)                            |
| “which type is the template for …?”                              | [reference.md § Reference implementations](./reference.md#reference-implementations) |

**Ask when:** unclear whether the entity should be a content type vs embedded schema vs nested resource; URL/k naming conflicts with reserved words; union/discriminated variant needed.

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

## Required gates

Work is not done until affected drift tests pass:

| Layer             | Test                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Tooling           | `pnpm --filter @rpg/content-types test`                          |
| Contracts         | `content-type-term-coverage.test.ts`                             |
| Catalog           | `packages/catalog/src/content-type-integration-manifest.test.ts` |
| API               | `content-types.integration-manifest.test.ts`                     |
| Dashboard routes  | `content-routes.integration-manifest.test.ts`                    |
| Dashboard sidebar | `content-registry.test.ts`                                       |
| Dashboard forms   | `content-form-registry.test.ts`                                  |

Plus pre-commit affected scope per [`AGENTS.md`](../../../AGENTS.md).

---

## Common failure modes

| Symptom                             | Likely cause                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Form drift test fails               | Forgot `content-form-test-registry.ts` import or manifest `formDefinitionPath` |
| Sidebar test fails                  | `visibleInSidebar: true` missing or `VISIBLE_SIDEBAR_CONTENT` entry omitted    |
| Manifest compile error              | New key in `CONTENT_TYPE_KEYS` without manifest entry                          |
| Type silently skipped in form tests | Duplicate side-effect imports removed but test registry not updated            |
| Production bundle bloat             | Imported `content-form-test-registry.ts` from runtime code — **never**         |

**Rule:** Runtime registries are authoritative. The integration manifest is metadata for drift tests only — no schemas, loaders, or route functions in tooling.

---

## Do not

- Put repo paths in `@rpg/contracts` — integration metadata lives in `@rpg/content-types` tooling only
- Import the integration manifest from runtime apps
- Use the form test registry as the production registration mechanism
- Force nested resources (subclasses) into the top-level manifest
- Skip `CONTENT_TYPE_TERMS` or vocab audit for user-facing catalog nouns

---

## Reference links

| Topic                                | Doc                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Full 18-step checklist + file matrix | [reference.md](./reference.md)                                                                        |
| End-to-end guide (SSOT)              | [`docs/content-types.md`](../../../docs/content-types.md)                                             |
| Integration manifest                 | [`tools/content-types/README.md`](../../../tools/content-types/README.md)                             |
| Form conventions                     | [`apps/dashboard/docs/form-lib-conventions.md`](../../../apps/dashboard/docs/form-lib-conventions.md) |
| Content duplication                  | [`apps/api/docs/content-duplication.md`](../../../apps/api/docs/content-duplication.md)               |
