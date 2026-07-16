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

When a spell is blocked on **`effect-schema-missing`**, persist the roadmap grouping on
`modeling.blocker.capabilityId` (spell-domain registry) — not as a separate gap code:

| Capability ID          | Primary mechanic                                | Example spells                              |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- |
| **stat-modifier**      | AC, speed, roll bonuses, HP max                 | Bless, Shield of Faith, Mage Armor, Aid     |
| **condition**          | Apply/remove conditions, save-or-suffer control | Hideous Laughter, Sleep, Lesser Restoration |
| **movement**           | Jump distance, forced push/pull, teleport       | Jump, Thunderwave, Misty Step               |
| **action-grant**       | Bonus or delegated action economy               | Expeditious Retreat, Dragon's Breath        |
| **detection**          | Sensing, identification                         | Detect Magic, Identify                      |
| **illusion**           | Visual/textual illusion authoring               | Silent Image, Illusory Script               |
| **spell-negation**     | Counter, dispel, interrupt ongoing spells       | Counterspell, Dispel Magic                  |
| **persistent-zone**    | Darkness, fog, glyph traps, ongoing auras       | Darkness, Glyph of Warding                  |
| **information-reveal** | Object or creature facts on touch               | Identify                                    |

Prefer specific capability IDs over generic catch-alls. Omit `capabilityId` when no
family is defined yet.

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

## Promotion blocker vs residual gaps

| Field                 | Persisted as       | Meaning                                                                                 |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| **Promotion blocker** | `modeling.blocker` | Single limitation preventing the next status rung (`meaningful-partial` for prose-only) |
| **Residual gaps**     | `modeling.gaps`    | Secondary limitations and prose riders on promoted content                              |
| **Blocked from**      | _(derived)_        | Next status rung — audit/report field only                                              |

Prose-only spells should persist **`blocker`**; residual codes live in **`gaps`** only.

## Future gap codes (document only)

Add to the gap registry when multiple spells share the pattern:

| Code                                                           | Definition                                                                                               | Shared by              |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| `resurrection-model-missing`                                   | Death-state restoration (timing, body, eligibility, return state)                                        | revivify, reincarnate  |
| `transformation-model-missing`                                 | Statistic replacement or override for a duration                                                         | polymorph, reincarnate |
| `independent-effect-object-model-missing`                      | Spell-created entity with own AC/HP/duration — or controllable construct (e.g. Dancing Lights)           |
| `concurrent-effect-limit`                                      | Repeated casts leave multiple simultaneous non-instantaneous instances active                            |
| `weapon-attack-modification-model-missing`                     | Weapon attack overlay — alternate ability, damage replacement, smite-like riders (document until shared) |
| `ordered-area-allocation` / `resource-distributed-across-area` | Finite resource applied across creatures in an area by HP order — legacy 5e Sleep pattern; not SRD 5.2.1 |
| `environmental-dispersal`                                      | Zone ends from environmental interaction such as strong wind (e.g. Fog Cloud)                            |

SRD 5.2.1 **Sleep** uses `chosen-within-area` — caster picks creatures in the sphere; each chosen creature makes an independent save.

## Future capability IDs (document only)

| Capability ID                  | Primary mechanic                                                                     | Example spells |
| ------------------------------ | ------------------------------------------------------------------------------------ | -------------- |
| **controllable-effect-entity** | Persistent caster-controlled construct without conventional AC/HP (move, manipulate) | Mage Hand      |

## Related docs

- Gap code registry: [`spell-modeling-gap-codes.ts`](../../src/rpg/content/spell/modeling/spell-modeling-gap-codes.ts)
- Catalog workflow: [`spell-modeling.md`](../../../../catalog/docs/spell-modeling.md)
- Level-1 audit (2026-07): catalog modeling manifest + generated inventory
