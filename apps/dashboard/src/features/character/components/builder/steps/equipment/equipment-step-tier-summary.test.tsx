import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { EquipmentStepTierSummary } from './equipment-step-tier-summary'

const startingWealth = getStandardStartingWealthRules(DEFAULT_SYSTEM_RULESET_ID)

describe('EquipmentStepTierSummary', () => {
  it('shows Initiate as a quiet line with no benefits', () => {
    render(<EquipmentStepTierSummary startingWealth={startingWealth} startingLevel={1} />)

    const tierName = screen.getByText('Initiate tier')
    expect(tierName).toHaveClass('font-medium', 'text-foreground')
    expect(tierName.parentElement?.parentElement).toHaveClass('text-sm')
    expect(screen.getByText('Level 1')).toHaveClass('font-normal', 'text-muted-foreground')
    expect(screen.getByText('No benefits')).toHaveClass('text-xs')
    expect(tierName.closest('.bg-surface-faint')).toBeNull()
    expect(screen.queryByRole('button', { name: /Initiate tier/ })).not.toBeInTheDocument()
    expect(screen.queryByText('No additional starting resources')).not.toBeInTheDocument()
  })

  it('keeps an adventurer magic grant collapsed until opened', async () => {
    const user = userEvent.setup()
    render(<EquipmentStepTierSummary startingWealth={startingWealth} startingLevel={2} />)

    expect(screen.getByText('1 benefit')).toHaveClass('text-xs')
    expect(screen.queryByText('1 common choice')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Adventurer tier/ }))

    expect(screen.getByText('Magic item choices')).toBeInTheDocument()
    expect(screen.getByText('1 common choice')).toBeInTheDocument()
    expect(screen.queryByText('Starting gold bonus')).not.toBeInTheDocument()
  })

  it('opens hero gold and magic grants, with the bonus formula in a tooltip', async () => {
    const user = userEvent.setup()
    render(<EquipmentStepTierSummary startingWealth={startingWealth} startingLevel={5} />)

    const trigger = screen.getByRole('button', { name: /Hero tier/ })
    expect(trigger).toHaveClass('text-sm')
    expect(screen.getByText('Hero tier')).toHaveClass('font-medium', 'text-foreground')
    expect(screen.getByText('Levels 5–10')).toHaveClass('font-normal', 'text-muted-foreground')
    expect(trigger.closest('.bg-surface-faint')).toBeNull()
    expect(screen.getByText('2 benefits')).toHaveClass('text-xs')
    expect(screen.queryByText('+637 GP 5 SP')).not.toBeInTheDocument()

    await user.click(trigger)

    const panel = screen.getByText('Starting gold bonus').parentElement
    expect(panel).toHaveClass('border-border-faint', 'bg-surface-faint', 'gap-y-2', 'py-2.5')
    expect(panel).not.toHaveClass('text-muted-foreground')
    expect(screen.getByText('Starting gold bonus')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('+637 GP 5 SP')).toHaveClass('text-foreground')
    expect(screen.getByText('Magic item choices')).toHaveClass('text-muted-foreground')
    expect(screen.getByText('1 common · 1 uncommon')).toHaveClass('text-foreground')

    await user.tab()
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).not.toHaveTextContent('Starting gold bonus')
    expect(tooltip).not.toHaveTextContent('+637 GP 5 SP')
    expect(tooltip).toHaveTextContent('Calculated from 500 GP + 1d10 × 25 GP')
    const formula = within(tooltip).getByText(/Calculated from/)
    expect(formula).not.toHaveClass('text-xs')
    expect(formula).not.toHaveClass('text-muted-foreground')
  })

  it('lists several rarities in grant order', async () => {
    const user = userEvent.setup()
    render(<EquipmentStepTierSummary startingWealth={startingWealth} startingLevel={11} />)

    await user.click(screen.getByRole('button', { name: /Champion tier/ }))

    expect(screen.getByText('2 common · 3 uncommon · 1 rare')).toBeInTheDocument()
    expect(screen.getByText('+6,375 GP')).toBeInTheDocument()
  })

  it('renders nothing when no tier matches', () => {
    const { container } = render(
      <EquipmentStepTierSummary startingWealth={undefined} startingLevel={1} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentStepTierSummary startingWealth={startingWealth} startingLevel={5} defaultOpen />,
    )

    await expectNoAxeViolations(container)
  })
})
