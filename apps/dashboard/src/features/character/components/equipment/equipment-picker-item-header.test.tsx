import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
} from './equipment-picker-drawer.types'

describe('EquipmentPickerItemHeader', () => {
  it('renders name, metadata, kind label, callout, and commerce actions', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('dagger'))

    render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{
          label: EQUIPMENT_PICKER_ESSENTIAL_LABEL,
          intent: 'recommended',
          importance: 'high',
        }}
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
    expect(screen.getByText(EQUIPMENT_PICKER_ESSENTIAL_LABEL)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('renders warning icon for caution callouts', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('plate-armor'))

    const { container } = render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{
          label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
          intent: 'caution',
          importance: 'medium',
        }}
        commerce={
          <EquipmentPickerCommerce
            priceLabel="1,500 GP"
            owned={false}
            stackable={false}
            ownedQuantity={0}
            onAdd={() => undefined}
          />
        }
      />,
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('longsword'))

    const { container } = render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{
          label: EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
          intent: 'blocking',
          importance: 'high',
        }}
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
