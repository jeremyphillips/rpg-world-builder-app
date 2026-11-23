# Facing invalid + guidance audit (Phase 9B)

Audit of **structured facing** workflow copy — `FacingResolution.guidance` and
`FacingInvalidCode` presentation. Out of scope: validation catalogs,
`defineMessage` transport, rules-document generators (`formatClassSpellcastingFeatureRules`,
stat-block prose).

**Related:** [validation-messages.md](../../../packages/contracts/docs/validation-messages.md)
(class 4 presentation copy), [architecture-ssot.md](../../../docs/architecture-ssot.md#identity-vs-metadata-vs-policy-vs-presentation).

## K13A — `FacingInvalidCode` ownership

### Decision

Panel and detail surfaces use **intentional context variants** — not duplicate authority:

| Surface    | Host noun | Preview clause                | Consumer                                                            |
| ---------- | --------- | ----------------------------- | ------------------------------------------------------------------- |
| **panel**  | row       | yes (`cannot show a preview`) | `@rpg/ui` `FacingHostInvalidPanel` via `facingInvalidMessage(code)` |
| **detail** | feature   | no                            | `FacingDetailBody` via `facingInvalidMessage(code, 'detail')`       |

**Single owner:** [`facing-invalid-messages.ts`](../../../packages/contracts/src/rpg/primitives/facing/facing-invalid-messages.ts)
exports `FACING_INVALID_PANEL_MESSAGES`, `FACING_INVALID_DETAIL_MESSAGES`, and
`facingInvalidMessage(code, surface)`. `@rpg/ui` re-exports panel aliases; dashboard
detail imports the same helper. There is **no** universal facing-message registry beyond
these two maps — by design.

**Prohibitions (unchanged):**

- Do not route facing invalid copy through validation catalogs.
- Do not import dashboard domain modules from `@rpg/ui`.
- Do not merge panel/detail wording without a product change — variants are host-context, not drift.

Regression: [`facing-invalid-messages.test.ts`](../../../packages/contracts/src/rpg/primitives/facing/facing-invalid-messages.test.ts).

---

## K13B — Vocabulary in guidance prose

Classify each candidate before changing copy:

| Class                           | Action                                                                     |
| ------------------------------- | -------------------------------------------------------------------------- |
| **True vocabulary duplication** | Closed-domain identity re-literalized → vocab helper when identity matches |
| **Legitimate prose**            | Grammar / workflow instructions — **no lookup**                            |
| **Missing vocab capability**    | Extend vocab layer (`getTermSentenceForm`, `getContentTypeTerm`, …)        |

Do **not** mechanically replace every domain noun in guidance strings.

### Inventory (seed set + extensions)

| Location                                                                                                                                                     | String / pattern                                                       | Class                            | Priority | Remediation                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `facing-invalid-messages.ts`                                                                                                                                 | panel vs detail invalid maps                                           | Legitimate context variants      | —        | **Done** — centralized in contracts                                          |
| [`resolve-trait-facing.ts`](../src/features/content/facing/domains/trait/resolve-trait-facing.ts)                                                            | `Complete trait configuration…` (×3)                                   | Legitimate prose                 | P3       | **Done** — module constants                                                  |
| [`resolve-trait-facing.ts`](../src/features/content/facing/domains/trait/resolve-trait-facing.ts)                                                            | `trait` in readiness guidance                                          | Legitimate prose                 | P4       | Retain — not a catalog content-type noun                                     |
| [`class-spellcasting-feature-rules.lib.ts`](../src/features/content/classes/lib/class-spellcasting-feature-rules.lib.ts)                                     | `CLASS_SPELLCASTING_RULES_*`                                           | Legitimate prose                 | P4       | Retain — references tabs/workflow, not `getContentTypeTerm('spells')`        |
| [`monster-form-labels.ts`](../src/features/content/monsters/lib/monster-form-labels.ts)                                                                      | `formatMonsterActionMultiattackPreviewConfigureHint`                   | Vocab duplication                | P2       | **Done** — `getTermSentenceForm(MONSTER_ACTION_KIND_ENTRIES.multiattack, 1)` |
| [`monster-form-labels.ts`](../src/features/content/monsters/lib/monster-form-labels.ts)                                                                      | `formatMonsterActionAttackPreviewConfigureHint` (`this attack`)        | Legitimate prose                 | P4       | Retain — generic attack, not kind label                                      |
| [`monster-form-labels.ts`](../src/features/content/monsters/lib/monster-form-labels.ts)                                                                      | `formatMonsterActionSpellPreviewConfigureHint` (`spellcasting action`) | Legitimate prose                 | P4       | Retain — compositional phrase, not spell kind label                          |
| [`resolve-action-stat-block-rules-facing-for-form.ts`](../src/features/content/monsters/lib/presentation/resolve-action-stat-block-rules-facing-for-form.ts) | `catalogUnavailableGuidance`, `reasonGuidance`                         | Legitimate prose + shared labels | P3       | Optional: dedupe catalog error strings with `monster-form-labels` constants  |
| Monster action preview summaries                                                                                                                             | delegated `guidance` from stat-block facing                            | Policy-owned                     | P4       | Retain — guidance originates in presentation layer                           |

### Backlog (not blocking Phase 10)

| Priority | Work                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| **P3**   | Co-locate trait-facing guidance constants in a small `trait-facing-copy.ts` if species/monster trait hosts diverge |
| **P3**   | Audit `derivedFieldReasonLabel` outputs for closed vocab reuse (monster derived fields)                            |
| **P4**   | Spell preview hint — only revisit if product standardizes on `getContentTypeTerm('spells')` mid-sentence           |
| **P4**   | Class spellcasting incomplete guidance — link to Spellcasting tab naming from form-copy if labels drift            |

---

## Agent checklist — new facing guidance

1. **Invalid state** — use `facingInvalidMessage(code, 'panel' \| 'detail')`; never add a third map.
2. **Readiness / incomplete** — class 4 presentation; plain strings in dashboard `lib/` or facing resolvers.
3. **Catalog nouns** — when the string **identifies** a closed vocab value (`MonsterActionKind`, `ContentTypeKey`, sense type, …), derive via contracts helpers.
4. **Do not** pass `defineMessage` transport into `FacingResolution.guidance` — decode is for validation/acquisition pipelines only.
5. Update this audit table when adding a new facing domain resolver with reusable guidance.
