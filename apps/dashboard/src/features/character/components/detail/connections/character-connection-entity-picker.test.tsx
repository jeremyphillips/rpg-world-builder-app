import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import {
  ConnectionEntityPicker,
  type ConnectionEntityPickerItem,
} from './character-connection-entity-picker'

function legacyIncludes(text: string, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return text.toLowerCase().includes(normalized)
}

function pickerItem(key: string, searchText: string): ConnectionEntityPickerItem<string> {
  return {
    item: key,
    key,
    searchText,
    surface: {
      identity: { heading: searchText, fallback: 'location' },
      inlineAction: { label: 'Select', onClick: () => undefined },
    },
  }
}

const items = [
  pickerItem('obrien', "O'Brien's Watch"),
  pickerItem('portal', 'Yawning Portal'),
  pickerItem('harbor', 'Harborford · Settlement'),
  pickerItem('hyphen', 'Well-known Tavern'),
  pickerItem('cross', 'Lantern Guild Occupational'),
  pickerItem('council', 'City Council Government'),
]

const queries = [
  '',
  '  YAWNING  ',
  'GOVERNMENT',
  "o'brien",
  'harborford ·',
  'well-known',
  'lantern occupational',
]

describe('ConnectionEntityPicker', () => {
  it('keeps every legacy includes match', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ConnectionEntityPicker
        items={items}
        searchPlaceholder="Search locations"
        noResultsMessage="No matches found."
        noItemsMessage="No items are available."
        onSelect={vi.fn()}
      />,
    )

    const search = screen.getByRole('searchbox', { name: 'Search locations' })

    for (const query of queries) {
      await user.clear(search)
      if (query.length > 0) {
        await user.type(search, query)
      }

      for (const item of items) {
        if (!legacyIncludes(item.searchText, query)) continue
        expect(
          screen.getByText(item.searchText),
          `${item.key} / ${JSON.stringify(query)}`,
        ).toBeInTheDocument()
      }
    }
  })

  it('hides rows the query does not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ConnectionEntityPicker
        items={items}
        searchPlaceholder="Search locations"
        noResultsMessage="No matches found."
        noItemsMessage="No items are available."
        onSelect={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search locations' }), 'zzzz-absent')

    expect(screen.getByText('No matches found.')).toBeInTheDocument()
    expect(screen.queryByText('Yawning Portal')).not.toBeInTheDocument()
  })
})
