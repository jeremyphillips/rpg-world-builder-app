import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  type EquipmentPickerRow,
} from '../drawer/equipment-picker-drawer.types'
import {
  EquipmentPickerFilterRowControls,
  EquipmentPickerPrimaryFilterControls,
} from './equipment-picker-filter-controls'

const items = [] as unknown as readonly EquipmentPickerRow[]

describe('EquipmentPickerFilterControls', () => {
  it('does not warn when the schema has no filter fields', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const { container } = render(
      <>
        <EquipmentPickerPrimaryFilterControls
          schemaArgs={{
            workflowMode: 'purchase',
            items,
            kindOptions: ['weapon'],
            showCategoryFilter: false,
            showRarityFilter: false,
            showAffordableFilter: false,
            filterOutUnaffordable: false,
            searchQuery: '',
          }}
          filterState={{}}
          onFilterStateChange={() => undefined}
        />
        <EquipmentPickerFilterRowControls
          schemaArgs={{
            workflowMode: 'purchase',
            items,
            kindOptions: ['weapon'],
            showCategoryFilter: false,
            showRarityFilter: false,
            showAffordableFilter: false,
            filterOutUnaffordable: false,
            searchQuery: '',
          }}
          filterState={{}}
          onFilterStateChange={() => undefined}
        />
      </>,
    )

    expect(container).toBeEmptyDOMElement()
    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('renders only the active schema fields for purchase filters', () => {
    render(
      <EquipmentPickerPrimaryFilterControls
        schemaArgs={{
          workflowMode: 'purchase',
          items,
          kindOptions: ['weapon'],
          showCategoryFilter: true,
          showRarityFilter: false,
          showAffordableFilter: false,
          filterOutUnaffordable: false,
          searchQuery: '',
        }}
        filterState={{}}
        onFilterStateChange={() => undefined}
      />,
    )

    expect(screen.getByText(EQUIPMENT_PICKER_CATEGORY_LABEL)).toBeInTheDocument()
    expect(screen.queryByText('Rarity')).not.toBeInTheDocument()
  })
})
