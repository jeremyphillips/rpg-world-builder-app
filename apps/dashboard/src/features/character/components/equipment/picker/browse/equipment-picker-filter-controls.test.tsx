import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  createEquipmentPickerFilterSchema,
  resolveEquipmentPickerFilterLayout,
} from './equipment-picker-filter-schema'
import {
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  type EquipmentPickerRow,
} from '../drawer/equipment-picker-drawer.types'
import {
  EquipmentPickerFilterRowControls,
  EquipmentPickerPrimaryFilterControls,
} from './equipment-picker-filter-controls'

const items = [] as unknown as readonly EquipmentPickerRow[]

function controlsProps(flags: {
  showCategoryFilter: boolean
  showRarityFilter: boolean
  showAffordableFilter: boolean
}) {
  const schema = createEquipmentPickerFilterSchema<EquipmentPickerRow>({
    workflowMode: 'purchase',
    items,
    kindOptions: ['weapon'],
    ...flags,
  })

  return {
    schema,
    layout: resolveEquipmentPickerFilterLayout(schema),
    filterState: {},
    items,
    onFilterStateChange: () => undefined,
  }
}

describe('EquipmentPickerFilterControls', () => {
  it('does not warn when the schema has no filter fields', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const props = controlsProps({
      showCategoryFilter: false,
      showRarityFilter: false,
      showAffordableFilter: false,
    })

    const { container } = render(
      <>
        <EquipmentPickerPrimaryFilterControls {...props} />
        <EquipmentPickerFilterRowControls {...props} />
      </>,
    )

    expect(container).toBeEmptyDOMElement()
    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('renders only the active schema fields for purchase filters', () => {
    render(
      <EquipmentPickerPrimaryFilterControls
        {...controlsProps({
          showCategoryFilter: true,
          showRarityFilter: false,
          showAffordableFilter: false,
        })}
      />,
    )

    expect(screen.getByText(EQUIPMENT_PICKER_CATEGORY_LABEL)).toBeInTheDocument()
    expect(screen.queryByText('Rarity')).not.toBeInTheDocument()
  })
})
