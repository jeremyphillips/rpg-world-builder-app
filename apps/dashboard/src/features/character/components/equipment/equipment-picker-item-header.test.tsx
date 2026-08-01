import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { pickEquipment } from '@/features/content/lib/fixtures/pick'

import { EquipmentPickerItemHeader } from './equipment-picker-item-header.client'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
} from './equipment-picker-drawer.types'

describe('EquipmentPickerItemHeader', () => {
  it('renders name, metadata, kind label, callout, and purchase actions', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('dagger'))

    render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{
          label: EQUIPMENT_PICKER_ESSENTIAL_LABEL,
          intent: 'recommended',
          importance: 'high',
        }}
        summaryTrailingLabel="2 GP"
        action={{ kind: 'add', disabled: false }}
        onAdd={() => undefined}
      />,
    )

    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(screen.getByText('Dagger')).toHaveClass('text-base')
    expect(screen.getByText('1d4 Piercing')).toBeInTheDocument()
    expect(screen.getByText('Finesse · Light · Thrown')).toBeInTheDocument()
    expect(screen.getByText('Weapon')).toBeInTheDocument()
    expect(screen.getByText('2 GP')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_ESSENTIAL_LABEL)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass('border-interactive-outline')
  })

  it('renders owned quantity badge and Add in the title row', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('rope'))

    render(
      <EquipmentPickerItemHeader
        item={item}
        summaryTrailingLabel="1 GP"
        action={{ kind: 'add', disabled: false }}
        ownedQuantity={2}
        onAdd={() => undefined}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton.parentElement).toHaveTextContent('2')
    expect(screen.getByText('1 GP')).toBeInTheDocument()
  })

  it('renders owned badge without add for manage-only rows', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('bracers-of-defense'))

    const { container } = render(
      <EquipmentPickerItemHeader
        item={item}
        summaryTrailingLabel="No Rare choices"
        summaryTrailingTone="blocked"
        action={{ kind: 'manage_only' }}
        ownedQuantity={1}
      />,
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    expect(container.firstChild).not.toHaveClass('opacity-60')
  })

  it('renders warning icon for caution callouts', () => {
    const item = buildEquipmentPickerRowViewModel(pickEquipment('plate-armor'))

    const { container } = render(
      <EquipmentPickerItemHeader
        item={item}
        callout={{
          label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
          intent: 'warning',
          importance: 'medium',
        }}
        summaryTrailingLabel="1,500 GP"
        action={{ kind: 'add', disabled: false }}
        onAdd={() => undefined}
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
        summaryTrailingLabel="15 GP"
        action={{ kind: 'add', disabled: true }}
        onAdd={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
