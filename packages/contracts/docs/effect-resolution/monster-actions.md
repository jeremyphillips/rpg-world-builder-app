# Effect resolution — monster actions

**Status:** stat-block actions are modeled in `content/monster/action.ts` (`weapon`, `natural-weapon`, `special`). Structured effect resolution attachment remains future work.

## Expected attachment (TBD)

Per-action `resolution` on monster action blocks (see [monster-stat-blocks.md](../monster-stat-blocks.md) for derived attack lines today).

## Inherited from base

See [base.md](./base.md).

## Expected deltas

- Action economy (action, bonus action, reaction) lives outside the resolution
  envelope.
- Multiattack and legendary actions may compose multiple resolution envelopes.
