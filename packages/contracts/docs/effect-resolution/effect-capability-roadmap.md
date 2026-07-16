# Effect capability roadmap

Staged build order for extending the effect-resolution framework beyond today's atomic
effects. Normative envelope rules live in [base.md](./base.md) and [spells.md](./spells.md).

## Supported today

Spell resolution atomic effects ([`effects/schema.ts`](../../src/rpg/content/spell/effects/schema.ts)):

| Kind                   | Role                             |
| ---------------------- | -------------------------------- |
| `damage`               | Roll-based hit point loss        |
| `healing`              | Roll-based hit point restoration |
| `temporary-hit-points` | Roll-based THP grant             |

[`deriveResolutionFromSpell`](../../../../catalog/src/spells/lib/derive-resolution-from-spell.ts)
auto-builds resolution envelopes only from those primaries. Spells whose **primary**
mechanic falls outside this set remain `prose-only` until the relevant capability ships.

## Capability links

When a spell is blocked on **`effect-schema-missing`**, catalog manifest notes include a
**capability link** — a roadmap grouping, not a persisted gap code:

| Capability link   | Primary mechanic                                 | Example spells (level 1)                                                      |
| ----------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| **stat-modifier** | AC, speed, roll bonuses                          | Bless, Shield of Faith, Mage Armor, Shield, Longstrider                       |
| **condition**     | Apply/remove conditions, save-or-suffer control  | Hideous Laughter, Sleep, Faerie Fire, Sanctuary                               |
| **movement**      | Jump distance, forced push/pull, fall mitigation | Jump, Thunderwave (push), Feather Fall                                        |
| **action-grant**  | Bonus or special action economy                  | Expeditious Retreat                                                           |
| **detection**     | Sensing, identification, information reveal      | Detect Magic, Identify                                                        |
| **illusion**      | Visual/textual illusion authoring                | Silent Image, Illusory Script                                                 |
| **utility**       | Zones, obscurement, creation, object interaction | Fog Cloud, Purify Food and Drink, Create or Destroy Water, Speak with Animals |

These families unlock content **across** spells, class features, feats, species traits,
and monster actions — not only one spell level.

## Build priority

Recommended schema tranches (each unblocks editor promotion for spells **and** parallel
content types):

1. **Stat / roll modifiers** — AC, speed, attack/save bonuses, ward values
2. **Conditions** — apply, remove, save-or-suffer, repeating saves
3. **Movement and forced movement** — push, pull, jump grants, fall mitigation
4. **Action grants** — bonus actions, special action types
5. **Detection and utility families** — sensing, obscurement, creation, communication

Within spells, **explicit deferrals** (e.g. Hex, Hunter's Mark — `extra-damage-rider` in
[`spell-seed-resolution.ts`](../../../../catalog/src/spells/spell-seed-resolution.ts))
resolve on a parallel track once condition and mark semantics exist.

## Promotion vs residual gaps

| Field                 | Meaning                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Promotion blocker** | Missing capability or seed row — prevents `meaningful-partial`                                |
| **Residual gaps**     | Known gap codes on editor-active spells for prose riders (e.g. flammability on Burning Hands) |

Prose-only spells may carry **`gaps`** on `modeling` without `status` — documentation for
audit inventory only; effective status stays derived `prose-only`.

## Future gap codes (document only)

Add to the gap registry when multiple spells share the pattern:

| Proposed code                                                  | Use when                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ordered-area-allocation` / `resource-distributed-across-area` | Finite resource applied across creatures in an area by HP order or similar — not caster-chosen subset (e.g. Sleep) |
| `environmental-dispersal`                                      | Zone ends from environmental interaction such as strong wind (e.g. Fog Cloud)                                      |

**Not** `chosen-within-area` for Sleep — allocation follows spell rules, not subset choice.

## Related docs

- Gap code registry: [`spell-modeling-gap-codes.ts`](../../src/rpg/content/spell/modeling/spell-modeling-gap-codes.ts)
- Catalog workflow: [`spell-modeling.md`](../../../../catalog/docs/spell-modeling.md)
- Level-1 audit (2026-07): catalog modeling manifest + generated inventory
