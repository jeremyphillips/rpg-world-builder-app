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
    hideLabel: true,
    prefix: 'Class can choose',
    suffix: 'packages from list',
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
    hideLabel: false,
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
