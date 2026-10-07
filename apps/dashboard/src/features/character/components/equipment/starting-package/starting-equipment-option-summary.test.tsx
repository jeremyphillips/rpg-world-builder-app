import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
} from '../../../lib/equipment/equipment-step.lib'
import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary'

const summary = {
  optionId: 'starting-gold',
  label: 'Starting Gold',
  description: 'Take 90 GP instead of standard equipment.',
  orderedItems: [],
  itemsByGroup: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  missingItemSlugs: [],
  unselectableReasons: [],
  isSelectable: true,
  funding: {
    classOptionId: 'starting-gold',
    classOptionWealth: { cp: 0, sp: 0, gp: 90, pp: 0 },
    tierAdditionalWealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
    totalStartingWealth: { cp: 0, sp: 0, gp: 90, pp: 0 },
    classOptionPolicy: 'included',
  },
} satisfies StartingEquipmentOptionSummary

describe('StartingEquipmentOptionSummaryCard', () => {
  it('renders the selected package summary and change action', () => {
    render(
      <StartingEquipmentOptionSummaryCard
        summary={summary}
        density="default"
        onChangePackage={vi.fn()}
      />,
    )

    expect(screen.getByText(EQUIPMENT_SELECTED_PACKAGE_EYEBROW)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Starting Gold' })).toBeInTheDocument()
    expect(screen.getByText(summary.description!)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL })).toBeInTheDocument()
  })

  it('calls onChangePackage when the action is clicked', async () => {
    const user = userEvent.setup()
    const onChangePackage = vi.fn()

    render(
      <StartingEquipmentOptionSummaryCard
        summary={summary}
        density="default"
        onChangePackage={onChangePackage}
      />,
    )

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))

    expect(onChangePackage).toHaveBeenCalledTimes(1)
  })

  it('replaces the change action and description when the caller supplies them', () => {
    render(
      <StartingEquipmentOptionSummaryCard
        summary={summary}
        density="compact"
        onChangePackage={vi.fn()}
        description="Chain Mail and 4 GP."
        headerEndSlot={<button type="button">Package actions</button>}
        titleAdornment={<span>Customized</span>}
        embedded={<p>Customize Starting Gold</p>}
      />,
    )

    expect(screen.getByText('Chain Mail and 4 GP.')).toBeInTheDocument()
    expect(screen.getByText('Customized')).toBeInTheDocument()
    expect(screen.getByText('Customize Starting Gold')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Package actions' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('omits the change action when showChangePackage is false', () => {
    render(
      <StartingEquipmentOptionSummaryCard
        summary={summary}
        density="default"
        onChangePackage={vi.fn()}
        showChangePackage={false}
      />,
    )

    expect(
      screen.queryByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('shows muted base gold and a tier badge instead of the total line', () => {
    render(
      <StartingEquipmentOptionSummaryCard
        summary={{
          ...summary,
          description: 'Take 75 GP instead of standard equipment.',
          tierAdjustment: {
            label: 'Hero tier adds 637 GP',
            additionalWealthLabel: '637 GP',
          },
          totalStartingWealthLabel: 'Total: 712 GP',
          funding: {
            ...summary.funding,
            classOptionWealth: { cp: 0, sp: 0, gp: 75, pp: 0 },
            tierAdditionalWealth: { cp: 0, sp: 0, gp: 637, pp: 0 },
            tierLabel: 'Hero',
            totalStartingWealth: { cp: 0, sp: 0, gp: 712, pp: 0 },
          },
        }}
        density="default"
        onChangePackage={vi.fn()}
        advisoryLabels={['Shield proficiency is missing.']}
      />,
    )

    const base = screen.getByText('75 GP base')
    expect(base).toHaveClass('text-muted-foreground')
    const badge = screen.getByText('+637 GP Hero tier')
    expect(badge).toHaveClass('h-[31px]', 'text-sm-meta')
    expect(screen.getByText('Shield proficiency is missing.')).toBeInTheDocument()
    expect(screen.queryByText('Hero tier adds 637 GP')).not.toBeInTheDocument()
    expect(screen.queryByText('Total: 712 GP')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <StartingEquipmentOptionSummaryCard
        summary={summary}
        density="default"
        onChangePackage={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
