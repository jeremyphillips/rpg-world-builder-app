/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CATALOG_PICKER_ADD_LABEL } from '@rpg/ui'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL } from '../drawer/equipment-picker-drawer.types'

import { EquipmentPickerRowAcquisitionControl } from './equipment-picker-row-acquisition-control'
import type { EquipmentPickerHeaderControl } from './equipment-picker-item-header.lib'

function renderControl(
  control: EquipmentPickerHeaderControl,
  overrides: Partial<Parameters<typeof EquipmentPickerRowAcquisitionControl>[0]> = {},
) {
  const handlers = {
    onAdd: vi.fn(),
    onSetPurchasedQuantity: vi.fn(),
    onRelease: vi.fn(),
    onRemovePurchase: vi.fn(),
  }

  const result = render(
    <EquipmentPickerRowAcquisitionControl
      control={control}
      equipmentName="Rope"
      addLabel={CATALOG_PICKER_ADD_LABEL}
      {...handlers}
      {...overrides}
    />,
  )

  return { ...handlers, ...result }
}

describe('EquipmentPickerRowAcquisitionControl', () => {
  it('renders nothing when the row has no affordance', () => {
    const { container } = renderControl({ kind: 'none' })

    expect(container).toBeEmptyDOMElement()
  })

  it('explains filled choices from the disabled action', async () => {
    const user = userEvent.setup()
    renderControl({
      kind: 'disabled',
      label: 'No common choices',
      tooltip: 'Common choices are already used.',
    })

    const button = screen.getByRole('button', { name: 'No common choices' })
    expect(button).toBeDisabled()
    await user.hover(button.parentElement ?? button)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Common choices are already used.')
  })

  it('renders a disabled Not for sale action that does not commit', async () => {
    const user = userEvent.setup()
    const { onAdd } = renderControl({
      kind: 'disabled',
      label: EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
    })

    const button = screen.getByRole('button', { name: EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('commits one copy from Add', async () => {
    const user = userEvent.setup()
    const { onAdd } = renderControl({ kind: 'add', disabled: false })

    await user.click(screen.getByRole('button', { name: CATALOG_PICKER_ADD_LABEL }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('reports the aggregate total, not a delta, from the stepper', async () => {
    const user = userEvent.setup()
    const { onSetPurchasedQuantity } = renderControl({ kind: 'stepper', value: 2, max: 4 })

    await user.click(screen.getByRole('button', { name: 'Increase Purchased quantity of Rope' }))
    expect(onSetPurchasedQuantity).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Decrease Purchased quantity of Rope' }))
    expect(onSetPurchasedQuantity).toHaveBeenCalledWith(1)
  })

  it('drops the aggregate to zero from the remove affordance at the floor', async () => {
    const user = userEvent.setup()
    const { onSetPurchasedQuantity } = renderControl({ kind: 'stepper', value: 1, max: 4 })

    await user.click(screen.getByRole('button', { name: 'Remove purchased Rope' }))
    expect(onSetPurchasedQuantity).toHaveBeenCalledWith(0)
  })

  it('releases the capped choice by allowance id', async () => {
    const user = userEvent.setup()
    const { onRelease } = renderControl({ kind: 'release', allowanceId: 'allowance-1' })

    await user.click(screen.getByRole('button', { name: 'Release' }))
    expect(onRelease).toHaveBeenCalledWith('allowance-1')
  })

  it('removes the capped purchase by purchase id', async () => {
    const user = userEvent.setup()
    const { onRemovePurchase } = renderControl({ kind: 'remove', purchaseId: 'purchase-1' })

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemovePurchase).toHaveBeenCalledWith('purchase-1')
  })

  it('announces a failed add in a live region', () => {
    renderControl({ kind: 'add', disabled: false }, { commitFailed: true })

    expect(screen.getByRole('status')).toHaveTextContent('Could not add this item.')
  })

  itAxe('has no axe violations for a disabled choice action', async () => {
    const { container } = renderControl({
      kind: 'disabled',
      label: 'No common choices',
      tooltip: 'Common choices are already used.',
    })

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations for the stepper state', async () => {
    const { container } = renderControl({ kind: 'stepper', value: 2, max: 4 })

    await expectNoAxeViolations(container)
  })
})
