import { describe, expect, it } from 'vitest'

import {
  extendedLevelRangeSummaryDisplay,
  standardLevelRangeSummaryDisplay,
} from './level-range-summary-display.lib'
import { resolveDisplayBlocks } from '@rpg/ui/form'

describe('level-range-summary-display', () => {
  it('formats standard range when extended progression is off', () => {
    const blocks = resolveDisplayBlocks(standardLevelRangeSummaryDisplay(), {
      maxCharacterLevel: 30,
      extendedProgressionEnabled: false,
    })
    expect(blocks[0]).toMatchObject({
      variant: 'text',
      text: 'Range: 1–30',
      live: 'polite',
    })
  })

  it('hides standard summary when extended progression is on', () => {
    expect(
      resolveDisplayBlocks(standardLevelRangeSummaryDisplay(), {
        maxCharacterLevel: 20,
        extendedProgressionEnabled: true,
      }),
    ).toEqual([])
  })

  it('formats extended range when enabled', () => {
    const blocks = resolveDisplayBlocks(extendedLevelRangeSummaryDisplay(), {
      maxCharacterLevel: 20,
      extendedProgressionEnabled: true,
      extendedTierName: 'Epic Destiny',
      extendedMaxLevel: 30,
    })
    expect(blocks[0]).toMatchObject({
      variant: 'text',
      text: 'Range: 1–20 standard · 21–30 Epic Destiny',
    })
  })
})
