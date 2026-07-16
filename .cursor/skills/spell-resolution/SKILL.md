---
name: spell-resolution
description: >-
  Audit, prioritize, author, and review structured spell resolution, effects,
  progression, and modeling metadata. Use for spell blockers, promotions, SRD
  paste authoring, resolution UI work. Inspect project sources — not static snapshots.
---

# Spell Resolution & Effects

Structured spell resolution, effects, progression, modeling status, blockers,
residual gaps, and resolution authoring UI. **Inspect current project sources**
before answering — seeds, manifests, audit CLI, and generated reports are truth.

Canonical docs → [File index](#file-index). Planned but not written: `packages/catalog/docs/spell-authoring.md`.

---

## Fast path

1. **Tier 0** — run audit CLI or read generated inventory (do not reason from memory).
2. **Tier 1** — if a slug is named: seed JSON + manifest rows for that spell only.
3. **Tier 2** — policy docs when promotion, prose, or blocker semantics are disputed.
4. **Tier 3** — schemas / form modules only when authoring structure or UI features.

**Ask** only when slug is missing for spell-specific work, target promotion status is
ambiguous, or pasted rules text has multiple valid interpretations.

**Do not** read whole `spell-progression-modeling.md` — link §1 / §12.4 only when needed.

---

## Trigger phrases

| User says                                          | Recipe                                                |
| -------------------------------------------------- | ----------------------------------------------------- |
| "what blocks \<spell\>?"                           | Status · blocker · capability · gaps · next promotion |
| "low effort unblock", "what gap unlocks the most?" | [Prioritization](#prioritization)                     |
| "author this spell", pasted SRD text               | [Author spell](#author-spell)                         |
| "promote \<spell\>", "required for \<status\>?"    | [Promotion](#promotion-thresholds)                    |
| "what should remain prose?"                        | [Prose classification](#prose-classification)         |
| "review resolution UI", "add form support for …"   | [UI feature work](#ui-feature-work)                   |

---

## User prompt contract

Short prompts work when you include:

```text
spell: <slug>
mode: audit | prioritize | author | promote | prose-review | ui-feature
target: <status or feature name>
constraints: audit-first; tier-0 only unless blocked
```

| You provide      | Agent does first                                                      |
| ---------------- | --------------------------------------------------------------------- |
| slug only        | `pnpm catalog:spell-modeling-audit` filtered by slug or inventory row |
| pasted PDF prose | normalize → body fields; structure resolution separately              |
| target status    | Tier 1 + promotion gates for that rung                                |
| UI feature + AC  | Tier 3 form modules + round-trip tests                                |

---

## Read tiers

```text
Tier 0  audit CLI / docs/analysis/spell-modeling-inventory.generated.md
Tier 1  seed shard + spell-modeling-manifest + spell-seed-resolution + spell-seed-progression
Tier 2  spell-modeling.md, spell-mechanics-roadmap.md, effect-capability-roadmap.md, effect-resolution/spells.md
Tier 3  schemas, gap registries, resolution-form-*, spell-display.ts, fixtures
```

Stop at the lowest tier that answers the question. Do not open all level JSON files.

### File index

**Docs:** [`spell-modeling.md`](../../../packages/catalog/docs/spell-modeling.md),
[`spell-mechanics-roadmap.md`](../../../packages/contracts/docs/spell-mechanics-roadmap.md),
[`effect-capability-roadmap.md`](../../../packages/contracts/docs/effect-resolution/effect-capability-roadmap.md),
[`effect-resolution/spells.md`](../../../packages/contracts/docs/effect-resolution/spells.md),
[`authoring.md`](../../../apps/dashboard/src/features/content/spells/resolution/docs/authoring.md),
[`form-lib-conventions.md`](../../../apps/dashboard/docs/form-lib-conventions.md),
[`forms.md`](../../../packages/ui/docs/forms.md),
[`spell-modeling-inventory.generated.md`](../../../docs/analysis/spell-modeling-inventory.generated.md).

**Contracts:** `spell/body.ts`, `resolution/schema.ts`, `effects/schema.ts`,
`resolution/progression/schema.ts`, `primitives/modeling/schema.ts`, `modeling/status.ts`,
`modeling/validation.ts`, `modeling/spell-modeling-gap-codes.ts`,
`modeling/spell-modeling-capability-ids.ts`, `resolution/selection-method-compatibility.ts`,
`resolution/format-summary.ts`, `resolution/fixtures.ts` — under `packages/contracts/src/rpg/content/spell/`.

**Catalog:** `index.ts`, `spell-level-seed-files.ts`, `spell-modeling-manifest.ts`,
`spell-seed-resolution.ts`, `spell-seed-progression.ts`, `spell-modeling-audit.ts`,
seeds at `data/srd-cc-5.2.1/level-*.json` — under `packages/catalog/src/spells/`.

**Dashboard:** `spell-display.ts`, `spell-form-fields.ts`, `resolution/lib/form/resolution-form-fields.ts`,
`resolution-form-visibility.ts` — under `apps/dashboard/src/features/content/spells/`.

---

## SRD PDF paste rules

User SRD text is copy-pasted from PDF. Apply to `description`, `cantripScaling`,
`higherLevelSlotEffect` only — **not** to `resolution.*`.

### Paragraphs

One SRD paragraph → one `<p>...</p>`. Do not collapse multi-paragraph spells.
Follow precedent: `prestidigitation`, `arcane-hand`, `create-or-destroy-water`.

### Bold option labels

When a line starts a sentence and ends with a period as a discrete option header:

```html
<p><strong>Create Water.</strong> You create up to 10 gallons...</p>
```

Do **not** bold: short full sentences, mid-paragraph emphasis, or primary mechanics
that belong in resolution outcomes.

### Strip PDF artifacts

Remove before storing:

- Standalone page numbers on their own line
- `System Reference Document 5.2.1` (and variants) injected mid-flow
- Line breaks that split a sentence across a page boundary — rejoin into continuous prose

Example to fix:

```text
... soul returns to
146
System Reference Document 5.2.1
its body if the body is alive and ...
```

Read merged text aloud — no missing words across former page breaks.

### Spell name references

When prose cites another spell by name, wrap it in `<em>` (italics):

```html
<p>...until a strong wind (such as one created by <em>Gust of Wind</em>) disperses it.</p>
<p>...whether the <em>Hallow</em> spell is active there...</p>
```

Apply in `description`, `cantripScaling`, `higherLevelSlotEffect`, and outcome `note` riders.
Use the published spell name (title case). Do not italicize conditions, damage types, or
generic game terms — only named spells (and similar named spell-like effects when cited as spells).

---

## Resolution track boundaries

**Resolution is a separate experimental track.** Do not mix data from outside.

| Forbidden                                                | Why                                               |
| -------------------------------------------------------- | ------------------------------------------------- |
| Inject `description` HTML into `resolution`              | Body prose vs typed structure                     |
| Put primary damage/conditions in outcome `note`          | `note` is for supplemental riders                 |
| Infer resolution from prose at runtime/audit             | Derivation produces candidates; manifest promotes |
| Duplicate AoE when policy picks one authoritative source | See `effect-resolution/spells.md`                 |

**Allowed:** outcome `note` for supplemental riders (ignition, worn/carried); `modeling.gaps`
for prose residuals; parallel description prose below `sufficient-for-display`.

**Authoring split:** PDF → normalize body fields → build resolution from mechanic analysis
(not by parsing description into structure) → assign `modeling` via manifest.

---

## Modeling metadata

Status ladder: `prose-only` → `non-meaningful-partial` (derived) → `meaningful-partial` →
`sufficient-for-display` → `sufficient-for-character-sheet` → `mechanics-ready`.

```ts
modeling: {
  status?: ExplicitModelingStatus;
  blocker?: { code: ModelingGapCode; capabilityId?: ModelingCapabilityId; note?: string };
  gaps?: ModelingGapEntry[]; // residual only; never duplicate blocker.code; never []
}
```

### Blocker rules

- `blocker` = single causal limitation preventing the **next** meaningful promotion.
- Do not auto-pick the first listed gap. Do not duplicate blocker in `gaps`.
- `capabilityId` only when a registry entry clearly removes the blocker; omit otherwise.
- Editor-active spells: omit blocker unless a limitation blocks the next intended rung.
- Prose-only spells: persist `blocker` documenting why editor is inactive.

### Residual gaps

- Known limitations after the blocker is solved. Higher status may still carry gaps.
- Peripheral/environmental gaps do not automatically prevent promotion.
- Do not invent gap codes for isolated wording — check `spell-modeling-gap-codes.ts` first.

### Authoring requirements

Every new or materially changed spell **must** include a reviewed `modeling` manifest entry
(applied to the seed via `apply-spell-modeling-metadata.mjs`). Do not ship seed/resolution
work without it.

| Field     | Required when                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------- |
| `status`  | Always — honest rung for current structure (default `prose-only` when no `resolution`)         |
| `blocker` | **Always for `prose-only`**; for editor-active spells, when the next promotion rung is blocked |
| `gaps`    | Only when residual limitations remain after the blocker; **omit** when none — never `[]`       |

`blocker` documents the single causal limitation preventing the **next** meaningful
promotion. `gaps` document known residuals that remain after that blocker is solved — not
a substitute for `blocker`, and never duplicate `blocker.code`.

### New gap codes

Prefer an existing code from `spell-modeling-gap-codes.ts` (and split registries it
composes). Do not mint a code for isolated wording or a single spell without checking
the registry first.

When no existing code fits, **stop and return explicitly** with:

1. **Proposed code(s)** — kebab-case slug(s) to add to the appropriate registry file
2. **Justification** — why existing codes are insufficient; which mechanic family the code
   represents; whether it is expected to recur across spells (not spell-specific prose)
3. **Registry patch** — which file(s) under `packages/contracts/src/rpg/content/spell/modeling/`
   need updating

Do not use an unregistered code in a manifest/seed patch without including this proposal.
Do not add registry entries silently — the user must see the code and rationale first.

---

## Promotion thresholds

Summary — detail in [`spell-mechanics-roadmap.md`](../../../packages/contracts/docs/spell-mechanics-roadmap.md)
and [`spell-modeling.md`](../../../packages/catalog/docs/spell-modeling.md).

| Status                           | Minimum                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| `meaningful-partial`             | Valid `resolution`; schema round-trip; dashboard form round-trip       |
| `sufficient-for-display`         | Above + `formatResolutionSummarySections` produces useful output       |
| `sufficient-for-character-sheet` | Above + character-context values resolvable (see gates below)          |
| `mechanics-ready`                | Complete outcome graph for declared scope; documented residual gaps OK |

### `sufficient-for-character-sheet` gates (strict)

A spell **must not** enter this rung unless all hold:

**Level and modifiers resolved** — a 5th-level character sees _their_ numbers:

- Cantrip scaling via structured `resolution.progression` (character-level basis)
- Slot scaling via progression or deterministic rules
- Bonuses the sheet would aggregate must resolve from structure + character context
- Prose-only scaling (`cantripScaling` / `higherLevelSlotEffect`) without structured
  progression **blocks** this rung

**Conditions derivable** — sheet-visible conditions must come from resolution structure:

- Pass: save/attack outcome applies `paralyzed` (or equivalent) on a named branch
- Fail: condition only in `description` HTML
- Secondary riders (duration carve-outs, worn/carried) may stay in `gaps` or outcome `note`

**Damage and scaling schema required** — hard gate:

- Damage-dealing spells need structured damage effects + resolvable rolls
- Scaling spells need structured progression (or explicit non-scaling certification)
- Healing/temp-HP follow the same value + scaling rule for their effect kinds
- Pure utility with no numeric effect: honest lower status instead

Refs: [`resolve-spell-mechanics.ts`](../../../packages/contracts/src/rpg/runtime/character/resolve-spell-mechanics.ts),
[`validation.ts`](../../../packages/contracts/src/rpg/content/spell/modeling/validation.ts).

### Promotion answer template

When asked "what is required to promote X?":

1. Current effective status
2. Target status
3. Primary blocker
4. Minimum capability/schema work
5. Residual gaps that would remain
6. Exact minimum data required
7. Consumer/editor unlocked
8. Tests and audit checks required

Prefer the **smallest honest** promotion.

---

## Prose classification

Classify each rule (do not treat every sentence as a structure requirement):

| Class                           | When                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| **A. Core structured mechanic** | Deterministic, reusable, required for target promotion, schema-supported |
| **B. Structured + gap**         | Reusable family; schema cannot express safely; blocks next rung          |
| **C. Additional behavior**      | Valid but not required for primary mechanic or current promotion         |
| **D. Intentionally prose-only** | GM-adjudicated, one-off, ambiguous, outside automation scope             |
| **E. Non-mechanical**           | Flavor, examples, redundant restatements — no gaps                       |

Checklist: primary outcome? required for promotion? modeled family exists? deterministic
I/O? multiple catalog examples? would structure mislead? can Additional behavior preserve it?

### Examples that should not block promotion

- **Fog Cloud** — wind dispersal rider in description; environmental Additional behavior
- **Fireball** — ignition in description + failed-save `note`; `sufficient-for-character-sheet` with `flammability-rules` / `object-state-awareness` gaps
- **Fire Bolt** — hit `note` for ignition; `mechanics-ready` with flammability gaps
- **Burning Hands** — same ignition pattern as Fireball

Structured `resolution.progression` supersedes scaling prose on detail surfaces at `sufficient-for-display`+.

---

## Author spell

When given spell text:

1. Tier 0/1 context if slug exists.
2. Normalize PDF → `description` (+ scaling prose if needed) per [SRD paste rules](#srd-pdf-paste-rules); italicize cited spell names with `<em>`.
3. Identify selection (`self` | `targets` | `point` | `none`) and method (`attack` | `saving-throw` | `automatic`).
4. Validate selection × method compatibility.
5. Target count/kind, range, origin, area.
6. Reusable effects, outcome branches, application amounts.
7. Progression (character-level / slot-level).
8. Separate core mechanics from Additional behavior prose.
9. **Required** `modeling` manifest entry: `status`, `blocker` (per [Authoring requirements](#authoring-requirements)), and residual `gaps` when applicable.
10. If a new gap code is needed, return proposed code(s), justification, and registry patch plan per [New gap codes](#new-gap-codes) — do not proceed with an unregistered code.
11. Output: analysis, plan, seed/manifest patch, or schema/UI plan as requested — manifest patch is part of every spell authoring deliverable.

Never infer unsupported mechanics from prose at runtime. Flag ambiguities explicitly.
Do not inject description into resolution. Never omit `modeling` on a new spell seed.

---

## Prioritization

Use audit data — not intuition. Run default audit for blocker/capability frequency.

Rank by: spells unlocked → status lift → cross-content reuse → schema/form proximity →
effort → consumer value → residual complexity → misleading-output risk.

Distinguish: editor eligibility vs display vs character-sheet vs mechanics-ready.

| Capability | Items unlocked | Likely promotion | Effort | Reuse | Risk |
| ---------- | -------------: | ---------------- | ------ | ----- | ---- |

```bash
pnpm catalog:spell-modeling-audit [--status|--blocker|--residual-gap|--capability <val>]
pnpm catalog:spell-modeling-audit --blocked-from <status> [--editor-eligible|--display-ready|--undocumented-blocker|--json]
```

Args pass directly after script name — **no** `--` separator. Run `pnpm catalog:spell-modeling-audit --help` for full list.

### Generated report and apply

```bash
pnpm catalog:spell-modeling-report   # writes docs/analysis/spell-modeling-inventory.generated.md
pnpm exec tsx packages/catalog/scripts/apply-spell-modeling-metadata.mjs
pnpm exec tsx packages/catalog/scripts/apply-spell-seed-resolution.mjs   # before progression
pnpm exec tsx packages/catalog/scripts/apply-spell-seed-progression.mjs
```

Tests: `spell-modeling-audit.test.ts`, `spell-modeling-manifest.test.ts`, `spell-modeling.test.ts`,
`resolution-round-trip.test.ts`. Quality gates → [`AGENTS.md`](../../../AGENTS.md).

---

## UI feature work

**Ownership:** contracts own semantics, validation, formatters; `@rpg/ui/form` owns generic
chrome; dashboard `resolution/` owns spell-specific form config, visibility, copy.

When adding form capability:

1. Contracts schema + `selection-method-compatibility` first
2. Formatters if display-affecting
3. `resolution-form-*` + `resolution-form-visibility.ts`
4. Round-trip tests: `resolution-round-trip.test.ts`, fixture story
5. Modeling manifest only if editor eligibility changes

**Section order:** Selection → How it resolves → Effects & outcomes → Progression.

**Author-facing copy:** labels, hints, banners, and `inlineSentence` text are for spell authors —
not engineers. Do **not** surface internal schema or code terms (`selectionMode`, `effectId`,
`application-pattern`, `per-projectile`, `thresholds` track kind, gap codes, etc.) unless the
SRD itself uses that exact phrase. Prefer clear natural language; follow existing tone in
[`resolution-form-labels.ts`](../../../apps/dashboard/src/features/content/spells/resolution/lib/form/resolution-form-labels.ts)
(`How it resolves`, `Authored effects`, `Additional behavior`). Use judgement: SRD terms authors
already know (`Dexterity saving throw`, `Heavily Obscured`) are fine; implementation vocabulary is not.

**inlineSentence:** short grammatical target sentences (`resolution-target-form-fields.ts`,
[`field-types.md`](../../../packages/ui/docs/forms/field-types.md)). Not for many optional branches.

**Conditional visibility:** visible, required, default, preserve-vs-clear, confirm-on-destructive,
validation-while-hidden — in visibility module + schema, not ad hoc in components.

**Invalid combinations:** unavailable in controls, validated in contracts, never silently coerced.

Detail VM: structured resolution at `sufficient-for-display`+; prose scaling suppressed when
`resolution.progression` exists (`spell-display.ts`).

---

## Guardrails

Do not:

- promote migration residue automatically
- infer structure from prose at runtime
- confuse residual gaps with primary blockers
- use vague `capabilityId` values
- duplicate blocker codes in `gaps`
- invent gap codes without checking registry — when a new code is justified, return the proposed code(s), rationale, and registry file(s) per [New gap codes](#new-gap-codes)
- force intentionally prose-only behavior into schema
- expose structured data below its consumer threshold
- recommend UI controls for invalid combinations
- inject description prose into resolution
- over-generalize shared form APIs before a repeated pattern exists
- expose internal resolution/schema jargon in author-visible UI copy
- ship a new or updated spell seed without a reviewed `modeling` manifest entry (`status` + `blocker`/`gaps` per [Authoring requirements](#authoring-requirements))

Every recommendation states: what becomes possible · what stays prose · what stays blocked ·
why the status is honest · which consumer is unlocked · which sources support the conclusion.
