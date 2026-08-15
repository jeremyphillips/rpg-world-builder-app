import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineChooseCountField } from './inline-choose-count-field.client'

const meta = {
  title: 'UI/InlineChooseCountField',
  component: InlineChooseCountField,
  parameters: { layout: 'padded' },
  args: {
    id: 'package-choose',
    label: 'Packages to choose',
    labelVisibility: 'srOnly',
    prefix: 'Character can choose',
    suffix: 'package(s) from list',
    chooseMin: 1,
    value: 1,
    onChange: action('onChange'),
  },
} satisfies Meta<typeof InlineChooseCountField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithVisibleLabel: Story = {
  args: {
    labelVisibility: 'visible',
    label: 'Package selection',
    prefix: 'Choose',
    suffix: 'packages',
  },
}

export const WithHint: Story = {
  args: {
    hint: 'How many packages the player picks from this list.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Choose at least one package.',
  },
}

export const WithTrailingSelect: Story = {
  args: {
    labelVisibility: 'srOnly',
    prefix: 'Character chooses',
    suffix: 'item(s) from',
    selectId: 'pool-source',
    selectLabel: 'Pool source',
    selectValue: 'filtered',
    selectOptions: [
      { value: 'filtered', label: 'A category of equipment' },
      { value: 'explicit', label: 'A list of specific items' },
    ],
    onSelectChange: action('onSelectChange'),
  },
}

/** Walk speed authoring: label above, `[N] ft.` inline row. */
export const WalkSpeed: Story = {
  args: {
    id: 'walk-speed',
    label: 'Walk speed',
    labelVisibility: 'visible',
    prefix: '',
    suffix: 'ft.',
    chooseMin: 0,
    digits: 2,
    value: 30,
  },
}
