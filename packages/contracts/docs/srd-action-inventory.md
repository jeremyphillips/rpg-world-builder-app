# SRD action pattern inventory

Scoped inventory for natural attack anatomy, Pounce, Swallow, and legendary saving-throw actions (SRD 5.2.1 / Open5e `srd-2024`). Linked from [action-architecture.md](./action-architecture.md) and [action-authoring.md](../../../apps/dashboard/src/features/content/monsters/docs/action-authoring.md).

**Coverage rule:** `full` only when an author can **acquire → configure → draft-save → publish → render** today. Formatter-only behavior does not count.

**Legendary save gate (Phase 1):** Approach **B** — allow `kind: 'save'` in Legendary Actions and reuse the shared Save editor and `formatMonsterSaveAction`. Approach A (legendary `action-reference` → Actions `save`) remains valid for sharing one definition under Actions, but the formatter prints “uses {Name}” without inlining the save body, so legendary-only placement needs B or duplicated prose. **Implemented:** B (eligibility + legendary acquisition `create:save`).

## Column reference

| Column                         | Meaning                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **Pattern id**                 | Stable slug                                                                           |
| **SRD examples**               | Creature + ability (+ Open5e key)                                                     |
| **Anatomical identity**        | Anatomy or ability class (not dice)                                                   |
| **Structured mechanics**       | Schema paths in use today                                                             |
| **Authoring path**             | Section, `kind`, preset/`form`, acquisition id                                        |
| **Unsupported mechanics**      | Must stay in rules text this phase                                                    |
| **Coverage**                   | `full` \| `partial` \| `prose-only`                                                   |
| **Disposition**                | `ShippedRecipe` \| `PresetCandidate` \| `KindExtension` \| `CustomOnly` \| `Deferred` |
| **Gap link**                   | Registry id in [srd-mechanical-coverage.md](./srd-mechanical-coverage.md)             |
| **Recommended representation** | Author recipe                                                                         |

---

## Natural attack forms

### Repeatability decision (Phase 1)

| Concern           | Policy                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Form identity** | Optional `form` on `natural-weapon`; new vocab ids only when anatomy acquisition benefits (Phase 2A gate).                                                                                                                     |
| **Acquisition**   | `acquisitionStateForItem` / preset disable when duplicate `form` or preset policy applies.                                                                                                                                     |
| **Publish**       | One row per `form` on published monsters (`MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE`). Rows **without** `form` may repeat. `breath-weapon` and `constrict` preset saves are repeatable; `constrict` natural form is a singleton. |

**Working hypothesis (confirmed):** One-row-per-`form` encodes one named anatomical strike per block; extra hits belong in Multiattack, not duplicate Bite rows. No SRD counterexample requiring two published `bite` forms on one block was found in the Phase 1 sample set.

### Beak (`natural-form-beak`)

| Field                      | Value                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| SRD examples               | Roc — Beak (`srd-2024_roc`); various avians                                                                                    |
| Anatomical identity        | Bill / beak — distinct from generic **Bite** (jaws) in display naming                                                          |
| Structured mechanics       | `natural-weapon`, optional `form`, damage, reach, `formatMonsterAttackAction`                                                  |
| Authoring path             | Actions → `natural` preset near anatomy or **Other natural** → name **Beak**; `form` unset or future `beak`                    |
| Unsupported mechanics      | None if named and damage typed correctly                                                                                       |
| Coverage                   | **partial** — SRD naming `full` with authored name; dedicated `form` id not shipped                                            |
| Disposition                | `PresetCandidate` (defer new `beak` form until frequency justifies vocab)                                                      |
| Gap link                   | —                                                                                                                              |
| Recommended representation | Preset **Bite** or **Talons** defaults with display name **Beak**, or Other natural + pierce defaults; document in multiattack |

### Pincer (`natural-form-pincer`)

| Field                      | Value                                                                  |
| -------------------------- | ---------------------------------------------------------------------- |
| SRD examples               | Glabrezu — Pincer (`srd-2024_glabrezu`)                                |
| Anatomical identity        | Chelae / pincer — not **Claw** (digits)                                |
| Structured mechanics       | Same as natural-weapon                                                 |
| Authoring path             | Other natural + name **Pincer**                                        |
| Unsupported mechanics      | —                                                                      |
| Coverage                   | **partial** (name); no `pincer` form                                   |
| Disposition                | `PresetCandidate`                                                      |
| Recommended representation | Other natural, bludgeoning/slashing per SRD, reach 10 ft when required |

### Hoof (`natural-form-hoof`)

| Field                      | Value                                                   |
| -------------------------- | ------------------------------------------------------- |
| SRD examples               | Centaur, horses (hoof attacks in SRD 5.2)               |
| Anatomical identity        | Hoof strike — overlaps **Ram** (head/body) semantically |
| Structured mechanics       | `natural-weapon`; existing **Ram** preset               |
| Authoring path             | Preset **Ram** or **Slam** + display name **Hoof**      |
| Unsupported mechanics      | —                                                       |
| Coverage                   | **partial**                                             |
| Disposition                | `ShippedRecipe` (use **Ram** / **Slam**, no new form)   |
| Recommended representation | Ram preset + name **Hoof**                              |

### Pseudopod (`natural-form-pseudopod`)

| Field                      | Value                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| SRD examples               | Ooze-adjacent creatures; often **Tentacle** stats in Open5e                       |
| Anatomical identity        | Pseudopod — do not alias to **Tentacle** on name alone                            |
| Structured mechanics       | `preset: tentacle` or Other natural                                               |
| Authoring path             | Natural → **Tentacle** if anatomy matches; else Other natural, name **Pseudopod** |
| Unsupported mechanics      | —                                                                                 |
| Coverage                   | **partial** when only naming differs from tentacle                                |
| Disposition                | `ShippedRecipe` unless audit finds distinct acquisition need                      |
| Recommended representation | Tentacle preset + display name **Pseudopod** when stats match                     |

---

## Pounce (`pounce-reference`)

| Field                      | Value                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| SRD examples               | Tiger (`srd-2024_tiger`), other pounce creatures — verify per stat block                                                                   |
| Anatomical identity        | Movement + reuse of a melee attack — not a separate anatomy                                                                                |
| Structured mechanics       | `action-reference`, `actionIds` → Actions attacks; optional `movement.allowance`; `onceUntilNextTurn` where SRD limits repeat              |
| Authoring path             | Legendary or Actions per placement → **Use existing action** or authored reference row (`legendary:reference` / reaction reference)        |
| Unsupported mechanics      | Prone/rider rules beyond movement + reference → `description` on reference row                                                             |
| Coverage                   | **full** when target attacks exist and movement matches SRD                                                                                |
| Disposition                | `ShippedRecipe`                                                                                                                            |
| Recommended representation | Legendary **Use existing action** → choose Bite (etc.); add movement half-speed / speed when SRD requires; turn limit when “once per turn” |

**Variant note:** Some creatures place Pounce under Actions only; same schema, different section (not legendary).

---

## Swallow (`swallow-prose`)

| Field                      | Value                                                          |
| -------------------------- | -------------------------------------------------------------- |
| SRD examples               | creatures with Swallow (e.g. large fish, frog variants in SRD) |
| Anatomical identity        | Whole-swallow narrative — state machine out of scope           |
| Structured mechanics       | `special` + `description` only                                 |
| Authoring path             | Actions → **Custom ability**                                   |
| Unsupported mechanics      | Compartments, ongoing damage inside, escape DC sequence        |
| Coverage                   | **prose-only** by design                                       |
| Disposition                | `CustomOnly`                                                   |
| Gap link                   | —                                                              |
| Recommended representation | Full SRD text in rules `description`; no new kind              |

---

## Legendary saving-throw actions

### Existing Save capabilities (appendix)

See plan Deliverable 3 — summarized: `kind: 'save'`, `effectResolutionSchema`, `dcSource`, optional `description`, `onceUntilNextTurn`, `formatMonsterSaveAction`, dashboard `lib/actions/save/`. Legendary section now accepts **`save`** (same editor). Reference rows still do not inline referenced save bodies.

### Approach A → B → C comparison

| Criterion                          | A — reference → Actions `save`                                             | B — `save` in Legendary                            | C — shared save improvements                          |
| ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Publish / picker                   | Allowed today for save id in `actionIds`                                   | **Shipped:** `MONSTER_SECTION_KINDS` + acquisition | Condition-primary, inlining, etc.                     |
| Stat block under legendary heading | **Partial** — “uses Disrupt Life.” unless description duplicates mechanics | **Full** for envelope-shaped saves                 | Targeted formatter/display fixes                      |
| Editor                             | Reference + separate Actions save row                                      | One row, shared Save fields                        | Same as B                                             |
| Duplicated schema                  | No                                                                         | No                                                 | No                                                    |
| **Recommendation**                 | Use when the save must also appear under Actions                           | **Primary for legendary-only saves**               | Follow `save-conditions` / inlining only if B blocked |

### Exemplar matrix

#### Lich — Disrupt Life (`legendary-save-disrupt-life`)

| Field                 | Value                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Structured            | `self` + emanation 20 ft, Con save, necrotic damage 9d6, half on success, `onceUntilNextTurn`          |
| Authoring path        | Legendary → **Saving throw** (`create:save`)                                                           |
| Unsupported mechanics | Emanation **origin** phrase (`originating from the lich`) — shared area-origin gap only                |
| Coverage              | **full** in seed (`srd-cc-5.2.1:lich`) for structured fields; PDF literal **partial** on origin phrase |
| Text fallback         | None required for Undead exclusion (`occupantRequirements`)                                            |
| Expected output       | SRD-style saving throw paragraph under **Legendary Actions** + Failure or Success lead-in              |

#### Solar — Blinding Gaze (`legendary-save-blinding-gaze`)

| Field                 | Value                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Structured            | Single-target save; condition on failure                                 |
| Unsupported mechanics | Condition-primary without damage envelope                                |
| Coverage              | **partial** — depends on [save-conditions](./srd-mechanical-coverage.md) |
| Text fallback         | Condition duration in `description` or outcome notes where supported     |
| Disposition           | `Deferred` until condition-primary path verified                         |

#### Solar — Radiant Teleport (`legendary-save-radiant-teleport`)

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| Structured            | Save portion only if split                                         |
| Unsupported mechanics | Teleport sequence — `description` or separate Bonus `teleport` row |
| Coverage              | **partial**                                                        |
| Disposition           | `ShippedRecipe` — two rows, no compound engine                     |

#### Kraken — Toxic Ink; Adult Black Dragon — Cloud of Insects; Sphinx — Weight of Years; Adult Gold Dragon — Banish

Same matrix: map envelope fields where possible; **partial** until area/target/condition gaps close; prose for remainder.

---

## Unsupported-mechanic text fallback contract

When coverage is **partial**:

1. Use structured fields for everything the Save (or attack/reference) model supports.
2. Prefer `description` on the action row (appended after mechanical body via `appendMonsterActionSupplementalText` for saves).
3. Legendary `action-reference`: supplemental text on the reference row after the “uses …” line.
4. `special`: use `description` and optional prose `savingThrow` only when structured `save` is not used — do not duplicate envelope fields.
5. Outcome `note` for qualifications the envelope already supports.

Do not add `unmodeledMechanics` or legendary-only prose-save platforms.

---

## Remaining gaps (plan-level)

| Gap                                    | Status                                                   |
| -------------------------------------- | -------------------------------------------------------- |
| `legendary-saves`                      | **partial** — B shipped; exemplars vary `full`/`partial` |
| `save-conditions`                      | Open — Blinding Gaze class                               |
| Swallow                                | **prose-only** by design                                 |
| Compound legendary (teleport + save)   | Text + separate rows                                     |
| Legendary reference inlining save body | Optional C; not required after B                         |
| Multiattack duplicate `form`           | Policy unchanged (Phase 1)                               |
| New natural forms (beak, pincer, …)    | Phase 2A not run — audit did not justify ids             |

---

## Capability log pointer

Implementation evidence: `action-section-eligibility.ts` (`save` in `legendaryActions`), `monster-legendary-actions.test.ts` (Disrupt Life-shaped publish), dashboard `legendaryActionAcquisitionItems` (`create:save`).
