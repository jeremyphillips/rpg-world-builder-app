import type { Meta, StoryObj } from '@storybook/react-vite'

import { FilterChromeProvider } from './filter-chrome.context'
import { FilterFieldCaption } from './filter-field-caption.client'

const meta = {
  title: 'Filters/FilterFieldCaption',
  component: FilterFieldCaption,
  args: {
    children: 'Equipment kind',
  },
} satisfies Meta<typeof FilterFieldCaption>

export default meta

type Story = StoryObj<typeof meta>

export const Span: Story = {}

export const Label: Story = {
  args: {
    as: 'label',
    htmlFor: 'equipment-kind',
    children: 'Equipment kind',
  },
}

export const Comfortable: Story = {
  render: (args) => (
    <FilterChromeProvider density="comfortable">
      <FilterFieldCaption {...args} />
    </FilterChromeProvider>
  ),
}
