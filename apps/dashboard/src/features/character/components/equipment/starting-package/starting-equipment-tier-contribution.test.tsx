import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'

import { StartingEquipmentTierContribution } from './starting-equipment-tier-contribution'

const funding = {
  classOptionId: 'starting-gold',
  classOptionWealth: { cp: 0, sp: 0, gp: 75, pp: 0 },
  tierAdditionalWealth: { cp: 0, sp: 5, gp: 637, pp: 0 },
  tierLabel: 'Hero',
  bonusGold: {
    baseGp: 500,
    formula: {
      kind: 'dice',
      dice: { count: 1, faces: 10 },
      multiplier: 25,
      currency: 'gp',
    },
  },
  totalStartingWealth: { cp: 0, sp: 5, gp: 712, pp: 0 },
  classOptionPolicy: 'included',
} satisfies StartingEquipmentOptionSummary['funding']

describe('StartingEquipmentTierContribution', () => {
  it('renders muted base gold, a medium total, and a tier badge tooltip', async () => {
    const user = userEvent.setup()
    render(<StartingEquipmentTierContribution summary={{ funding }} />)

    expect(screen.getByText('75 GP base')).toHaveClass('font-normal', 'text-muted-foreground')
    expect(screen.getByText('712 GP 5 SP total')).toHaveClass('font-medium', 'text-foreground')
    expect(screen.getByText('75 GP base').closest('div')).toHaveClass('mt-1', 'text-xs')
    expect(screen.queryByText('+637 GP Hero tier')).not.toBeInTheDocument()

    await user.hover(screen.getByText('Hero tier'))

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Starting gold bonus')
    expect(tooltip).toHaveTextContent('+637 GP 5 SP')
    expect(tooltip).toHaveTextContent('Calculated from 500 GP + 1d10 × 25 GP')
    const summary = within(tooltip).getByText(/Starting gold bonus/)
    expect(summary).toHaveTextContent('Starting gold bonus · +637 GP 5 SP')
    expect(summary).toHaveClass('text-foreground')
    const formula = within(tooltip).getByText(/Calculated from/)
    expect(formula).toHaveTextContent('Calculated from 500 GP + 1d10 × 25 GP')
    expect(formula).toHaveClass('text-xs', 'text-muted-foreground')
  })

  it('renders a zero class amount beside the tier total', () => {
    render(
      <StartingEquipmentTierContribution
        summary={{
          funding: {
            ...funding,
            classOptionWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
            totalStartingWealth: { cp: 0, sp: 5, gp: 637, pp: 0 },
          },
        }}
      />,
    )

    expect(screen.getByText('0 GP base')).toBeInTheDocument()
    expect(screen.getByText('637 GP 5 SP total')).toBeInTheDocument()
  })

  it('renders nothing when the tier adds no gold', () => {
    const { container } = render(
      <StartingEquipmentTierContribution
        summary={{
          funding: {
            ...funding,
            tierAdditionalWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
          },
        }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
