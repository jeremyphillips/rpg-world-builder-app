import { copperToWealth, wealthToCopper, type CoinWealth } from '../../rpg/primitives/wealth'
import type { DndBeyondCurrencies } from './dnd-beyond-character.schema'

// ---------------------------------------------------------------------------
// D&D Beyond currencies → local character wealth (cp, sp, gp, pp).
// Electrum is folded into copper — the local ruleset omits ep as a denomination.
// ---------------------------------------------------------------------------

const ELECTRUM_TO_COPPER = 50

export function mapDndBeyondCurrenciesToWealth(currencies: DndBeyondCurrencies): CoinWealth {
  const wealth: CoinWealth = {
    cp: currencies.cp ?? 0,
    sp: currencies.sp ?? 0,
    gp: currencies.gp ?? 0,
    pp: currencies.pp ?? 0,
  }

  const electrumCopper = (currencies.ep ?? 0) * ELECTRUM_TO_COPPER
  if (electrumCopper === 0) {
    return wealth
  }

  return copperToWealth(wealthToCopper(wealth) + electrumCopper)
}
