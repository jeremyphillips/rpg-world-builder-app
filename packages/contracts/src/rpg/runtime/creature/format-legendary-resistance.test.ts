import { describe, expect, it } from 'vitest'

import { LEGENDARY_RESISTANCE_LABEL } from '../../content/creature/traits/legendary-resistance.constants'
import { LAIR_TERM } from '../../vocab/mechanics/lair'
import {
  formatLegendaryResistanceName,
  formatLegendaryResistanceStatBlockTitle,
} from './format-legendary-resistance'

describe('formatLegendaryResistanceName', () => {
  it('prints the canonical label with normal uses only', () => {
    expect(formatLegendaryResistanceName({ uses: { normal: 4 } })).toBe(
      `${LEGENDARY_RESISTANCE_LABEL} (4/Day)`,
    )
  })

  it('adds the in-lair clause when lair is enabled', () => {
    expect(
      formatLegendaryResistanceName({
        uses: { normal: 4, inLair: 5 },
        lairEnabled: true,
      }),
    ).toBe(`${LEGENDARY_RESISTANCE_LABEL} (4/Day, or 5/Day in ${LAIR_TERM.label})`)
  })

  it('delegates from the stat-block wrapper', () => {
    expect(
      formatLegendaryResistanceStatBlockTitle({
        uses: { normal: 3 },
        lairEnabled: false,
      }),
    ).toBe(formatLegendaryResistanceName({ uses: { normal: 3 } }))
  })
})
