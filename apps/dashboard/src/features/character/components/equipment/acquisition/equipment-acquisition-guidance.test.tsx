import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { MagicItemGrantProgress } from '@rpg/contracts'

import { equipmentPickerBudgetFixture } from '../picker/drawer/equipment-picker-drawer.fixtures'
import { EquipmentAcquisitionGuidance } from './equipment-acquisition-guidance.client'

const magicItemProgress: MagicItemGrantProgress[] = [
  {
    allowanceId: 'allowance-common',
    rarity: 'common',
    capacity: 2,
    selected: 1,
    remainingCapacity: 1,
    isFilled: false,
  },
]

describe('EquipmentAcquisitionGuidance', () => {
  it('renders purchase and magic-item guidance cards when both workflows are available', async () => {
    const onOpenPurchasePicker = vi.fn()
    const onOpenMagicItemsPicker = vi.fn()

    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        budget={equipmentPickerBudgetFixture}
        onOpenPurchasePicker={onOpenPurchasePicker}
        showMagicItemGrants
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={onOpenMagicItemsPicker}
      />,
    )

    expect(screen.getByRole('region', { name: 'Acquisition guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.getByText('100 GP starting · 15 GP spent')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Magic item choices' })).toBeInTheDocument()
    expect(screen.getByText('1/2 Common')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Browse equipment' }))
    await user.click(screen.getByRole('button', { name: 'Choose magic items' }))

    expect(onOpenPurchasePicker).toHaveBeenCalledTimes(1)
    expect(onOpenMagicItemsPicker).toHaveBeenCalledTimes(1)
  })

  it('renders a single full-width magic-item card when purchase is unavailable', () => {
    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow={false}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Magic item choices' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /GP remaining/ })).not.toBeInTheDocument()
  })

  it('renders a single full-width purchase card when magic items are unavailable', () => {
    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        budget={equipmentPickerBudgetFixture}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants={false}
        magicItemProgress={[]}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Magic item choices' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        budget={equipmentPickerBudgetFixture}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
