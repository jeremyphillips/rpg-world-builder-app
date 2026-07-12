import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'

describe('EquipmentPickerItemHeader', () => {
  it('renders name, metadata, kind label, callout, and commerce actions', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('dagger'))

    render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{ label: 'Essential', emphasis: 'info' }}
        commerce={
          <EquipmentPickerCommerce
            priceLabel="2 GP"
            owned={false}
            stackable={false}
            ownedQuantity={0}
            onAdd={() => undefined}
          />
        }
      />,
    )

    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(screen.getByText('1d4 Piercing · Finesse · Light · Thrown')).toBeInTheDocument()
    expect(screen.getByText('Weapon')).toBeInTheDocument()
    expect(screen.getByText('Essential')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('longsword'))

    const { container } = render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{ label: 'Not proficient', emphasis: 'warning' }}
        commerce={
          <EquipmentPickerCommerce
            priceLabel="15 GP"
            owned={false}
            stackable={false}
            ownedQuantity={0}
            onAdd={() => undefined}
          />
        }
      />,
    )

    await expectNoAxeViolations(container)
  })
})
