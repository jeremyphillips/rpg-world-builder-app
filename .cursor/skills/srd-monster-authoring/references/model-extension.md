# Model extension assessment

Use this before recommending a schema or resolver change. Authoring approval, investigation approval, and implementation approval are separate. `assess` and `review` may recommend. They do not implement.

## Classify the hole first

| Kind | What it means |
| --- | --- |
| Missing authoring UI | The schema and resolver already support it |
| Missing runtime resolution | Contracts store it and nothing produces the result |
| Missing stat-block presentation | The value is derived and the formatter omits it |
| Missing structured capability | No shared field can store the rule |
| Incomplete source data | The payload or excerpt does not establish the rule. Not a schema gap |
| Supported but unverified | Expected to work, and this monster has no assertion |
| Existing mechanic used incorrectly | Change the seed, not the model |

Do not propose a new field when one of the first, fifth, sixth, or last rows is the real situation.

## Questions

**Benefit.** What rule becomes representable? Does it affect calculation, targeting, conditions, duration, or action economy? What is impossible today?

**Owner.** Can the current model already express it? Is the hole in authoring, validation, serialization, resolution, or presentation? The shared owner is `runtime/creature/`, spell resolution, equipment, or the action envelope. A monster-only path is not an owner.

**Other SRD monsters.** Which seeded and unseeded creatures use the same rule? Is there a smaller shared concept?

**Characters.** Could a spell, feat, species, class feature, or item use it? A monster-only shape that characters will need later is a parallel path. Prefer the creature or resolution layer.

**UX.** Which fields appear? Do ordinary monsters get more controls? Can an uncommon case stay on an existing optional control? Would character authoring need the same presentation?

**Risk.** Contract, runtime, normalization, existing seeds, validation, stat-block formatting, and tests. State the descriptive fallback and any smaller alternative.

Return the benefit and the UX cost. If the recommendation is to keep prose, say so and leave the registry id open.

## Registry

Stable ids live in [`srd-mechanical-coverage.md`](../../../../packages/contracts/docs/srd-mechanical-coverage.md). Reuse an id before proposing one. A proposed id in a report is not a registry edit. An approved descriptive fallback does not mark the gap implemented or verified. Keep the evidence when a gap is later verified.

Do not add a monster `modeling` field or a gap-code enum as part of monster authoring. That is its own implementation approval.
