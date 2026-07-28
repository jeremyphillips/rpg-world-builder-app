import type { Meta, StoryObj } from '@storybook/react-vite'

import { CatalogPickerResultsState } from './catalog-picker-results-state.client'

const meta = {
  title: 'Character Builder/Picker/CatalogPickerResultsState',
  component: CatalogPickerResultsState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogPickerResultsState>

export default meta

type Story = StoryObj<typeof meta>

export const NoOptions: Story = {
  args: {
    message: 'No spells are available for this choice right now.',
  },
}

export const SelectionFull: Story = {
  args: {
    message: 'You have selected the maximum number of proficiencies for this choice.',
  },
}
