import type { TierBonusGold } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StartingGoldBonusTooltipBody } from './starting-gold-bonus-tooltip'

const heroBonusGold = {
  baseGp: 500,
  formula: {
    kind: 'dice',
    dice: { count: 1, faces: 10 },
    multiplier: 25,
    currency: 'gp',
  },
} satisfies TierBonusGold

describe('StartingGoldBonusTooltipBody', () => {
  it('pairs the bonus with a calculated-from sentence', () => {
    render(
      <StartingGoldBonusTooltipBody
        bonusWealth={{ cp: 0, sp: 5, gp: 637, pp: 0 }}
        bonusGold={heroBonusGold}
      />,
    )

    const summary = screen.getByText(/Starting gold bonus/)
    expect(summary.tagName).toBe('P')
    expect(summary).toHaveTextContent('Starting gold bonus · +637 GP 5 SP')
    expect(summary).toHaveClass('text-foreground')
    expect(summary).not.toHaveClass('text-muted-foreground')

    const sentence = screen.getByText(/Calculated from/)
    expect(sentence.tagName).toBe('P')
    expect(sentence).toHaveTextContent('Calculated from 500 GP + 1d10 × 25 GP')
    expect(sentence).toHaveClass('text-xs', 'text-muted-foreground')
  })
})
