# Contracts vocabulary SSOT

How closed identifier sets in `@rpg/contracts` should be owned, derived, and tested.
Complements [structure.md](structure.md) (`GameTermEntry` / `*_TERM` / `*_ENTRIES`) and
[docs/vocabulary.md](../../../docs/vocabulary.md) (campaign option sets).

**Principle:** one authoritative owner per concept — not “derive every schema from the
nearest object that has labels.”

---

## Pattern A — Identity from `*_ENTRIES`

Use when the entries map defines **persisted or API identity** plus required metadata
(label, description, …).

```text
*_ENTRIES (authoritative)
  → type Kind = keyof typeof *_ENTRIES
  → *_IDS | *_KINDS = keysFromEntries(*_ENTRIES)   // rpg/vocab/enum-schema.ts
  → vocabEnumFromEntries / z.enum
  → contract tests: every id has label + description; schema accepts/rejects same ids
```

**Exemplars in this repo:**

| Area                          | Module                                                                   |
| ----------------------------- | ------------------------------------------------------------------------ |
| Class feature kinds           | `rpg/content/classes/class.ts`                                           |
| Location kinds                | `rpg/vocab/location/region/kind.ts`                                      |
| Equipment kinds               | `rpg/vocab/equipment/kind.ts`                                            |
| Table kinds                   | `rpg/content/tables/progression-table.ts`, `general-table.ts`            |
| Creature damage-defense lists | `rpg/content/creature.ts` (`CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES`)       |
| Slot progression kinds        | `rpg/vocab/spell/slot-progression-kind.ts`                               |
| REST kinds                    | `rpg/vocab/rest.ts` (ordered rank: entry insertion order = `REST_KINDS`) |

**Do not** maintain a parallel tuple or hand-written id array when entries already list
every member. **Do not** add secondary helpers (`keysFromRecord`, …) unless
`GameTermEntry` constraints genuinely block `keysFromEntries` — prefer extending entry
metadata instead.

**Avoid** anchoring types on derived label maps (`EquipmentKind = keyof LABELS`). Derive
display maps from entries when apps need a `Record<Kind, string>`.

---

## Pattern B — Intentional policy subsets (`Partial<Record<…>>`)

Use when **only some keys** participate in behavior — not incomplete SSOT.

| Example                                                       | Responsibility                               |
| ------------------------------------------------------------- | -------------------------------------------- |
| `MONSTER_SINGLETON_KINDS`                                     | Per-section singleton occurrence policy      |
| `CONTENT_TYPE_MEDIA_DOMAIN`, display fallbacks                | Opt-in media/fallback per content type       |
| `API_CONTENT_TYPE_KEYS`, `HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS` | Explicit subsets of `ContentTypeKey`         |
| Builder readiness maps                                        | Partial until every choice type has messages |

Keep these **typed** with `satisfies readonly DomainKind[]` or
`satisfies Partial<Record<…>>`. Do not merge into the full vocabulary tuple. Prefer
renaming or documenting as `*_POLICY` when the name implies “all kinds.”

Exhaustive maps (`Record<ContentTypeKey, …>` on capabilities, terms, manifest) are the
compile-time gate when **every admitted key** must have support — see below.

---

## Pattern C — Dashboard acquisition recipes (out of contracts)

Authoring add-menus may use **composition subsets** and recipe ids that overlap editor
taxonomy without being `MonsterActionKind` (e.g. legendary `legendary:*` categories,
reaction recipes in one module). These are **not** closed `*_ENTRIES` vocabularies.

Detail: [apps/dashboard/docs/monster-action-acquisition-ssot.md](../../../apps/dashboard/docs/monster-action-acquisition-ssot.md).

Do not introduce universal acquisition registries or mirror reaction/legendary categories
into contracts for symmetry.

---

## PC / NPC character identity

Builder `characterKind` and persisted `characterType` share one closed vocabulary (`pc`, `npc`).

**Canonical module:** [`pc-npc-identity.ts`](../src/rpg/runtime/character/pc-npc-identity.ts)

- Tuple: `CHARACTER_PC_NPC_IDS`
- Zod: `characterPcNpcSchema` (aliases: `characterKindSchema`, `characterTypeSchema`)
- Types: `CharacterPcNpc`; semantic aliases `CharacterKind`, `CharacterType`
- Labels: `CHARACTER_TYPE_ENTRIES` in `character-type-display.ts` (`satisfies Record<CharacterKind, GameTermEntry>`)
- Builder policies: `CHARACTER_KIND_POLICIES` keyed on `CharacterKind`

`character-acquisition/kind.ts` and `sheet/core.ts` re-export compatibility names; do not define a second tuple or `z.enum(['pc', 'npc'])`. Location connection `characterKinds` (resides_at, owns, …) is unrelated — do not merge.

---

## Catalog content types — domain-first admission

**Identity:** [`CONTENT_TYPE_KEYS`](../src/rpg/primitives/content/content-type-keys.ts)  
**Presentation:** [`CONTENT_TYPE_TERMS`](../src/rpg/primitives/content/content-type-terms.ts)
(`satisfies Record<ContentTypeKey, VocabularyTerm>`)

Terms do **not** admit new catalog types. Adding a term row without a key does not
expand `contentTypeKeySchema`. Admission checklist:

1. `CONTENT_TYPE_KEYS` + body schema under `rpg/content/`
2. `CONTENT_TYPE_TERMS` + `CONTENT_TYPE_CAPABILITIES` (exhaustive maps)
3. Integration manifest, API registry when wired, dashboard routes

See [docs/content-types.md](../../../docs/content-types.md).

---

## Ordering semantics

When deriving id arrays from object keys, **insertion order** becomes part of the
contract if code iterates that array.

| Class                       | Treatment                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Semantically meaningful** | Exact-order tests (e.g. damage-defense lists vuln → resist → immune; `REST_KINDS` least → most complete) |
| **Presentation-only**       | Document if UI depends on order; test when product-critical                                              |
| **Irrelevant**              | Membership tests (`sort()` equality) acceptable                                                          |

Do not add a second vocabulary only to preserve display order — encode order in entries
or an explicit ordered export plus invariant tests.

---

## Verification habits

- **Vocab module test:** derived ids match entries; metadata non-empty (see
  `rpg/content/classes/class.test.ts`, `table-kind-vocabulary.test.ts`,
  `slot-progression-kind.test.ts`).
- **Cross-registry:** `content-type-term-coverage.test.ts` aligns keys, terms, capabilities.
- **Schema:** `safeParse` unknown id fails; known ids still parse after refactors.
- **Export surface:** removing dead exports updates `export-surface.snapshot.json`.

Cosmetic `Object.keys(ENTRIES) as […]` → `keysFromEntries(ENTRIES)` without a duplicate
tuple is optional churn — defer unless it removes a second authority.

---

## Related

- Repo-wide SSOT policy hub: [docs/architecture-ssot.md](../../../docs/architecture-ssot.md)
- Contracts vocab plan: `.cursor/plans/contracts_vocab_ssot_5a89b856.plan.md`
- Monster acquisition SSOT: `.cursor/plans/ssot_acquisition_audit_806f6d29.plan.md`
