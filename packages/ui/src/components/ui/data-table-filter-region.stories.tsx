import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DataTableFilterRegion } from './data-table-filter-region.client'
import { Input } from './input.client'

const meta = {
  title: 'Components/DataTableFilterRegion',
  component: DataTableFilterRegion,
} satisfies Meta<typeof DataTableFilterRegion>

export default meta

type Story = StoryObj<typeof meta>

export const PrimaryOnly: Story = {
  args: {
    primaryFilters: <Input aria-label="Search" placeholder="Search…" size="sm" />,
    additionalFiltersOpen: false,
    onAdditionalFiltersOpenChange: () => undefined,
  },
}

function WithAdditionalFiltersDemo() {
  const [open, setOpen] = useState(false)
  return (
    <DataTableFilterRegion
      primaryFilters={<Input aria-label="Search" placeholder="Search…" size="sm" />}
      additionalFilterFields={
        <Input aria-label="Advanced field" placeholder="Advanced…" size="sm" />
      }
      additionalFiltersOpen={open}
      onAdditionalFiltersOpenChange={setOpen}
      activeAdditionalFilterCount={2}
    />
  )
}

export const WithAdditionalFilters: Story = {
  render: () => <WithAdditionalFiltersDemo />,
  args: {
    primaryFilters: null,
    additionalFiltersOpen: false,
    onAdditionalFiltersOpenChange: () => undefined,
  },
}
