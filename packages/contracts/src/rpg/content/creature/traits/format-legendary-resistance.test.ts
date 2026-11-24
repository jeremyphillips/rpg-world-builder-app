import { describe, expect, it } from 'vitest'

import { LAIR_TERM } from '../../../vocab/mechanics/lair'
import { LEGENDARY_RESISTANCE_LABEL } from './legendary-resistance.constants'
import { formatLegendaryResistanceStatBlockTitle } from './format-legendary-resistance'

describe('formatLegendaryResistanceStatBlockTitle', () => {
  it('prints the canonical label with normal uses only', () => {
    expect(
      formatLegendaryResistanceStatBlockTitle({
        uses: { normal: 4 },
        lairEnabled: false,
      }),
    ).toBe(`${LEGENDARY_RESISTANCE_LABEL} (4/Day)`)
  })

  it('adds the in-lair clause when lair is enabled', () => {
    expect(
      formatLegendaryResistanceStatBlockTitle({
        uses: { normal: 4, inLair: 5 },
        lairEnabled: true,
      }),
    ).toBe(`${LEGENDARY_RESISTANCE_LABEL} (4/Day, or 5/Day in ${LAIR_TERM.label})`)
  })

  it('ignores in-lair uses when lair enhancements are off', () => {
    expect(
      formatLegendaryResistanceStatBlockTitle({
        uses: { normal: 4, inLair: 5 },
        lairEnabled: false,
      }),
    ).toBe(`${LEGENDARY_RESISTANCE_LABEL} (4/Day)`)
  })
})
