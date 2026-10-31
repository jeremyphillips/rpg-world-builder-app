# Effect resolution — monster actions

**Status:** stat-block actions are modeled in `content/monster/action.ts` (`weapon`, `natural-weapon`, `special`, `spell`). Limited use and activation triggers are authored on the entry. Structured effect resolution attachment remains future work. See [activation-and-limited-use.md](../activation-and-limited-use.md).

## Expected attachment (TBD)

Per-action `resolution` on monster action blocks (see [monster-stat-blocks.md](../monster-stat-blocks.md) for derived attack lines today).

## Inherited from base

See [base.md](./base.md).

## Expected deltas

- Action economy is the section (`actions`, `bonusActions`, `reactions`), not a field on the entry.
- A `spell` entry keeps each referenced spell's casting time. An incompatible time blocks publish.
- An authored reaction trigger never replaces a referenced spell's own trigger.
- Multiattack and legendary actions may compose multiple resolution envelopes.
