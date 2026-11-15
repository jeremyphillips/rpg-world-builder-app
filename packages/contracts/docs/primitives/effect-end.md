# Effect end

Structured **when an effect ends**, shared across monster on-hit conditions and future spell, save, and trait consumers.

## Distinct from

| Model                                                                         | Role                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`onceUntilNextTurn`](../../src/rpg/content/monster/action/schema-helpers.ts) | Action cannot be taken again until the creature's next turn |
| [`limitedUse`](../../src/rpg/primitives/limited-use/)                         | Uses, recharge, rest recovery                               |
| [`spellDurationSchema`](../../src/rpg/vocab/spell/duration.ts)                | Spell concentration, up to, instantaneous                   |

## Persisted shape

Optional `end` on consumers (omitted = no explicit ending):

- `turn-bound`: `participant` (`source` \| `target`), `boundary` (`start` \| `end`), `which` (`next` \| `current`)
- `timed`: `value` + `unit` (`round` \| `minute` \| `hour` \| `day`)
- `custom`: `text` (full temporal qualification)

Authoring select ids live in [`effect-end.ts`](../../src/rpg/primitives/mechanics/effect-end.ts) and are **not** persisted.

## Formatting

[`formatEffectEnd`](../../src/rpg/primitives/mechanics/effect-end.ts) takes `EffectEndFormatContext` (`voice`, `sourceName`) so monster stat blocks use possessive source names and explicit target phrasing.

## Monster on-hit

[`attackOnHitSchema`](../../src/rpg/primitives/mechanics/attack-on-hit.ts) — condition rows may include `end`. `description` remains non-temporal qualification; `note` rows hold separate rules (e.g. Bearded Devil no-heal rider).

Deferred: repeat saves, concentration-linked expiry, linked effect lifetimes, play-time enforcement.
