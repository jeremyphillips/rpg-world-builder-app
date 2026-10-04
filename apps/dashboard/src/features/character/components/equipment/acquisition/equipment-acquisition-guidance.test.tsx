import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import type { MagicItemAllowance, MagicItemGrantProgress } from '@rpg/contracts'

import { equipmentPickerBudgetFixture } from '../picker/drawer/equipment-picker-drawer.fixtures'
import { EquipmentAcquisitionGuidance } from './equipment-acquisition-guidance'

const magicItemAllowances: MagicItemAllowance[] = [
  {
    id: 'allowance-common',
    source: { kind: 'startingWealthTier', sourceId: 'table', tierId: 'hero' },
    rarity: 'common',
    count: 2,
    requirement: 'exact',
  },
]

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
  it('renders currency and magic-item resources in one summary when both workflows are available', async () => {
    const onOpenPurchasePicker = vi.fn()
    const onOpenMagicItemsPicker = vi.fn()

    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        fundingState={{ kind: 'funded', budget: equipmentPickerBudgetFixture }}
        onOpenPurchasePicker={onOpenPurchasePicker}
        showMagicItemGrants
        magicItemAllowances={magicItemAllowances}
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={onOpenMagicItemsPicker}
      />,
    )

    expect(screen.getByRole('region', { name: 'Acquisition guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.getByText('100 GP budget · 15 GP spent')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    expect(screen.getByLabelText('Common · 1 remaining')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Choose magic items' })).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Browse equipment' }))

    expect(onOpenPurchasePicker).toHaveBeenCalledTimes(1)
    expect(onOpenMagicItemsPicker).not.toHaveBeenCalled()
  })

  it('renders a magic-only summary when purchase is unavailable', async () => {
    const onOpenMagicItemsPicker = vi.fn()

    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow={false}
        fundingState={{ kind: 'none' }}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants
        magicItemAllowances={magicItemAllowances}
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={onOpenMagicItemsPicker}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /GP remaining/ })).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Choose magic items' }))
    expect(onOpenMagicItemsPicker).toHaveBeenCalledTimes(1)
  })

  it('renders a currency summary when magic items are unavailable', () => {
    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        fundingState={{ kind: 'funded', budget: equipmentPickerBudgetFixture }}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants={false}
        magicItemAllowances={[]}
        magicItemProgress={[]}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Magic items' })).not.toBeInTheDocument()
  })

  it('stacks unresolved funding with a magic-only summary', () => {
    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow={false}
        fundingState={{ kind: 'unresolved', pendingCostCp: 50 }}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants
        magicItemAllowances={magicItemAllowances}
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Starting funds not set' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose magic items' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Browse equipment' })).not.toBeInTheDocument()
  })

  it('renders the unresolved funding card without remaining copy or Browse', () => {
    render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow={false}
        fundingState={{ kind: 'unresolved', pendingCostCp: 50 }}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants={false}
        magicItemAllowances={[]}
        magicItemProgress={[]}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Starting funds not set' })).toBeInTheDocument()
    expect(
      screen.getByText('Choose a starting equipment option to determine your available funds.'),
    ).toBeInTheDocument()
    expect(screen.getByText('5 SP selected')).toBeInTheDocument()
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Browse equipment' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentAcquisitionGuidance
        showPurchaseWorkflow
        fundingState={{ kind: 'funded', budget: equipmentPickerBudgetFixture }}
        onOpenPurchasePicker={vi.fn()}
        showMagicItemGrants
        magicItemAllowances={magicItemAllowances}
        magicItemProgress={magicItemProgress}
        onOpenMagicItemsPicker={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
