# Architecture SSOT policy

High-level ownership and prevention policy for this monorepo. This document is a
**navigation hub** — it does not replace domain playbooks.

| Topic                       | Canonical detail                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Vocabulary patterns (A/B/C) | [packages/contracts/docs/vocab-ssot.md](../packages/contracts/docs/vocab-ssot.md)                                   |
| Contracts package layers    | [packages/contracts/docs/structure.md](../packages/contracts/docs/structure.md)                                     |
| Catalog content types       | [content-types.md](./content-types.md)                                                                              |
| Monster acquisition recipes | [apps/dashboard/docs/monster-action-acquisition-ssot.md](../apps/dashboard/docs/monster-action-acquisition-ssot.md) |
| Dead-code / Fallow usage    | [tools/fallow/README.md](../tools/fallow/README.md)                                                                 |
| PR review lenses            | [.cursor/skills/pr-review/SKILL.md](../.cursor/skills/pr-review/SKILL.md)                                           |

## Three prevention problems

Tag every safeguard with the problem it solves — one tool does not fix all three.

| Problem                       | Definition                                                             | Primary mechanisms                                                          |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **A — Duplicate authority**   | Two places maintain the same identity, labels, or behavioral rule      | `*_ENTRIES`, derived types, `satisfies` subsets, single-module ownership    |
| **B — Missing integration**   | Admitted kind/type lacks authoring, facing, validation, or menu wiring | Exhaustive `Record` / `switch` + `never`, drift tests, integration manifest |
| **C — Orphaned declarations** | Export with no meaningful consumer                                     | `noUnusedLocals`, Fallow `dead-code` / `audit`, export lifecycle            |

**SSOT violation (A):** independently maintained copies of the same closed identifier
set, label map, eligibility rule, or policy — even when the code is not textually
identical.

**Not automatically a violation:** intentional subsets (`Partial<Record<…>>`,
`API_*` keys), dashboard acquisition recipes (Pattern C), or repeated string
literals that are not domain identity.

## Identity vs metadata vs policy vs presentation

| Layer            | Examples                                                  | Authority                                                                      |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Identity**     | `ContentTypeKey`, `MonsterActionKind`, `ClassFeatureKind` | `CONTENT_TYPE_KEYS`, `*_ENTRIES`, `keysFromEntries`                            |
| **Metadata**     | Labels, descriptions, terms                               | `*_ENTRIES`, `CONTENT_TYPE_TERMS` (exhaustive against keys, not admission)     |
| **Policy**       | Section eligibility, usage editors, singleton rules       | Contracts helpers (`monsterSectionAllowsKind`, `monsterActionUsageCapability`) |
| **Presentation** | Dashboard copy, form labels, facing prose                 | Feature label modules; derive nouns via `getContentTypeTerm` / vocab helpers   |

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
mature — see [tools/fallow/README.md](../tools/fallow/README.md).

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

1. Find the **authoritative owner** (grep + trace) — classify problem **A**, **B**, or **C**.
2. Prefer **derive** from existing `*_ENTRIES` or constrain with `satisfies`.
3. For **B**, list registration points (facing, fields, manifest, tests).
4. For new **exports**, name the consumer or public API role.
5. For monster actions, assume **section × kind × category** composition — not one
   composer per kind ([authoring coverage test](../apps/dashboard/src/features/content/monsters/lib/actions/detail-fields/section-composers-authoring-coverage.test.ts)).

---

Related implementation plan: [`.cursor/plans/ssot_drift_prevention_23ad855d.plan.md`](../.cursor/plans/ssot_drift_prevention_23ad855d.plan.md).
