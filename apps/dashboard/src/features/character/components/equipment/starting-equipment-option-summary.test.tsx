import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
} from '../../lib/equipment-step.lib'
import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary.client'

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
    render(<StartingEquipmentOptionSummaryCard summary={summary} onChangePackage={vi.fn()} />)

    expect(screen.getByText(EQUIPMENT_SELECTED_PACKAGE_EYEBROW)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Starting Gold' })).toBeInTheDocument()
    expect(screen.getByText(summary.description!)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL })).toBeInTheDocument()
  })

  it('calls onChangePackage when the action is clicked', async () => {
    const user = userEvent.setup()
    const onChangePackage = vi.fn()

    render(
      <StartingEquipmentOptionSummaryCard summary={summary} onChangePackage={onChangePackage} />,
    )

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))

    expect(onChangePackage).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <StartingEquipmentOptionSummaryCard summary={summary} onChangePackage={vi.fn()} />,
    )

    await expectNoAxeViolations(container)
  })
})
