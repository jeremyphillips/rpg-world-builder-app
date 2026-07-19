import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from './button.client'
import { CatalogToolbar } from './catalog-toolbar.client'
import { CatalogFilterChips } from './catalog-filter-chips.client'

const meta = {
  title: 'Primitives/CatalogToolbar',
  component: CatalogToolbar,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const WithSearchAndTabs: Story = {
  args: {},
  render: function Render() {
    const [query, setQuery] = useState('')
    const [activeId, setActiveId] = useState('featured')

    return (
      <CatalogToolbar
        search={{ query, onQueryChange: setQuery, placeholder: 'Search catalog' }}
        tabs={{
          items: [
            { id: 'featured', label: 'Featured', count: 3 },
            { id: 'all', label: 'All', count: 12 },
          ],
          activeId,
          onActiveIdChange: setActiveId,
          ariaLabel: 'Catalog views',
        }}
        actions={
          <Button type="button" variant="ghost" size="sm">
            Reset view
          </Button>
        }
      />
    )
  },
}

export const FiltersWithoutTabs: Story = {
  args: {},
  render: function Render() {
    const [category, setCategory] = useState('all')

    return (
      <CatalogToolbar
        search={{ query: '', onQueryChange: () => undefined, placeholder: 'Search equipment' }}
        primaryControls={
          <CatalogFilterChips
            id="equipment-category"
            label="Category"
            selectionMode="single-required"
            value={category}
            onValueChange={setCategory}
            options={[
              { value: 'all', label: 'All' },
              { value: 'weapon', label: 'Weapon' },
              { value: 'armor', label: 'Armor' },
            ]}
          />
        }
        filterRow={{
          actions: <span className="text-sm text-muted-foreground">Sort: Best match</span>,
        }}
        actions={
          <Button type="button" variant="ghost" size="sm">
            Reset view
          </Button>
        }
      />
    )
  },
}

export const WithoutSearch: Story = {
  args: {
    primaryControls: <span className="text-sm text-muted-foreground">Detail tab filters only</span>,
    actions: (
      <Button type="button" variant="ghost" size="sm">
        Reset
      </Button>
    ),
  },
}
